import { appendToBuffer, buildTranscriptBufferKey } from '../services/transcriptProcessor.js';
import { summarizeTranscript } from '../services/groqService.js';
import Meeting from '../models/Meeting.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const transcriptBuffers = new Map();
const userBuffers = new Map();

function getUserIdFromSocket(socket) {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export function registerMeetingSocket(io) {
  io.use((socket, next) => {
    const userId = getUserIdFromSocket(socket);

    if (!userId) {
      return next(new Error('Authentication required'));
    }

    socket.userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id, 'user:', socket.userId);

    socket.on('join-meeting', ({ meetingId }) => {
      const safeMeetingId = meetingId || socket.id;
      socket.join(safeMeetingId);
      socket.emit('joined-meeting', { meetingId: safeMeetingId });
    });

    socket.on('echo-test', ({ message }) => {
      socket.emit('echo-test', { message: `Echo received: ${message}` });
    });

    socket.on('transcript-chunk', async ({ text }) => {
      if (!text) {
        return;
      }

      const bufferKey = buildTranscriptBufferKey(socket.id);
      const existing = transcriptBuffers.get(bufferKey) || '';
      const next = appendToBuffer(existing, text);
      transcriptBuffers.set(bufferKey, next);

      const userKey = socket.userId;
      if (!userBuffers.has(userKey)) {
        userBuffers.set(userKey, new Map());
      }
      userBuffers.get(userKey).set(socket.id, next);

      socket.emit('transcript-buffer-update', { transcript: next });

      const wordCount = next.split(/\s+/).filter(Boolean).length;
      if (wordCount > 20 && wordCount % 20 < 5) {
        try {
          const insights = await summarizeTranscript(next);
          socket.emit('insights-update', {
            key_points: insights.key_points || [],
            action_items: insights.action_items || [],
            decisions: insights.decisions || [],
          });
        } catch (error) {
          console.error('Insight update error:', error.message);
        }
      }
    });

    socket.on('stop-meeting', async ({ meetingId, transcript, summary, duration }) => {
      const finalTranscript = transcript || transcriptBuffers.get(buildTranscriptBufferKey(socket.id)) || '';

      try {
        const userKey = socket.userId;
        const allUserTranscripts = userBuffers.get(userKey);
        let combinedTranscript = finalTranscript;

        if (allUserTranscripts && allUserTranscripts.size > 1) {
          const allTexts = Array.from(allUserTranscripts.values()).filter(Boolean);
          combinedTranscript = allTexts.join('\n');
        }

        const updateData = {
          transcript: combinedTranscript,
          summary,
          duration: typeof duration === 'number' ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : duration || '0 min',
          status: 'completed',
          wordCount: combinedTranscript.split(/\s+/).filter(Boolean).length,
        };

        let meeting = await Meeting.findById(meetingId);

        if (!meeting) {
          meeting = await Meeting.create({
            title: 'Untitled Meeting',
            ...updateData,
            userId: socket.userId,
          });
        } else {
          meeting = await Meeting.findByIdAndUpdate(meetingId, updateData, { new: true });
        }

        socket.emit('meeting-saved', { ok: true, meetingId: meeting._id });
      } catch (error) {
        console.error('Could not save meeting:', error.message);
        socket.emit('meeting-saved', { ok: false, error: error.message });
      }
    });

    socket.on('disconnect', () => {
      transcriptBuffers.delete(buildTranscriptBufferKey(socket.id));
      console.log('Socket disconnected', socket.id);
    });
  });
}
