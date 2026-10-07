import { appendToBuffer, buildTranscriptBufferKey } from '../services/transcriptProcessor.js';
import { summarizeTranscript, rollingSummarize, generateFinalSummary } from '../services/groqService.js';
import Meeting from '../models/Meeting.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * In-memory state maps for active real-time socket connections.
 */
const transcriptBuffers = new Map(); // socketId → accumulated text string
const segmentBuffers = new Map();    // socketId → Array<{ id, text, startMs, speaker }>
const latestInsights = new Map();    // socketId → structured insights object
const insightLocks = new Set();      // socketId → boolean debounce flag

function getUserIdFromSocket(socket, jwtSecret) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded.id;
  } catch {
    return null;
  }
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

export function registerMeetingSocket(io, jwtSecret) {
  io.use((socket, next) => {
    const userId = getUserIdFromSocket(socket, jwtSecret);
    if (!userId) {
      return next(new Error('Authentication required'));
    }
    socket.userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    socket.on('join-meeting', ({ meetingId }) => {
      const safeMeetingId = meetingId || socket.id;
      socket.join(safeMeetingId);
      socket.emit('joined-meeting', { meetingId: safeMeetingId });
    });

    socket.on('echo-test', ({ message }) => {
      socket.emit('echo-test', { message: `Echo received: ${message}` });
    });

    // ── Phase 2: Structured Segment Chunk Receiver ────────────────────────────
    socket.on('transcript-segment', async ({ segment }) => {
      if (!segment || !segment.text) return;

      const socketSegments = segmentBuffers.get(socket.id) || [];
      const newSeg = {
        id: segment.id || `seg-${socketSegments.length + 1}`,
        text: segment.text.trim(),
        startMs: segment.startMs || Date.now(),
        speaker: segment.speaker || 'Participant',
      };

      socketSegments.push(newSeg);
      segmentBuffers.set(socket.id, socketSegments);

      // Keep string buffer in sync
      const bufferKey = buildTranscriptBufferKey(socket.id);
      const existingText = transcriptBuffers.get(bufferKey) || '';
      const updatedText = appendToBuffer(existingText, newSeg.text);
      transcriptBuffers.set(bufferKey, updatedText);

      socket.emit('transcript-buffer-update', {
        transcript: updatedText,
        segments: socketSegments,
      });

      // Trigger rolling summarization every 3 new segments (~45s or N words)
      const unsummarizedCount = socketSegments.length % 3;
      if (unsummarizedCount === 0 && !insightLocks.has(socket.id)) {
        insightLocks.add(socket.id);
        try {
          const prevSummary = latestInsights.get(socket.id) || null;
          const recentSegments = socketSegments.slice(-3);

          const result = await rollingSummarize({
            previousSummary: prevSummary,
            newSegments: recentSegments,
          });

          if (result.insights) {
            latestInsights.set(socket.id, result.insights);
            socket.emit('insights-update', {
              ...result.insights,
              aiStatus: result.aiStatus,
              model: result.model,
            });
          }
        } catch (error) {
          console.error('[Socket] Rolling summary error:', error.message);
          socket.emit('insights-update', { aiStatus: 'unavailable' });
        } finally {
          insightLocks.delete(socket.id);
        }
      }
    });

    // ── Legacy Chunk Receiver (backwards compatibility) ──────────────────────
    socket.on('transcript-chunk', async ({ text }) => {
      if (!text) return;

      const bufferKey = buildTranscriptBufferKey(socket.id);
      const existing = transcriptBuffers.get(bufferKey) || '';
      const next = appendToBuffer(existing, text);
      transcriptBuffers.set(bufferKey, next);

      // Create a segment for backward compatibility
      const socketSegments = segmentBuffers.get(socket.id) || [];
      const segId = `seg-${socketSegments.length + 1}`;
      socketSegments.push({
        id: segId,
        text: text.trim(),
        startMs: Date.now(),
        speaker: 'Speaker',
      });
      segmentBuffers.set(socket.id, socketSegments);

      socket.emit('transcript-buffer-update', { transcript: next, segments: socketSegments });

      const wordCount = next.split(/\s+/).filter(Boolean).length;
      if (wordCount >= 20 && wordCount % 20 === 0 && !insightLocks.has(socket.id)) {
        insightLocks.add(socket.id);
        try {
          const insights = await summarizeTranscript(next);
          latestInsights.set(socket.id, insights);
          socket.emit('insights-update', {
            key_points: insights.key_points || [],
            action_items: insights.action_items || [],
            decisions: insights.decisions || [],
            summary: insights.summary || '',
            open_questions: insights.open_questions || [],
            sentiment: insights.sentiment || 'neutral',
            aiStatus: 'completed',
          });
        } catch (error) {
          console.error('Insight update error:', error.message);
        } finally {
          insightLocks.delete(socket.id);
        }
      }
    });

    // ── Phase 2: Stop Meeting & Final Pass ───────────────────────────────────
    socket.on('stop-meeting', async ({ meetingId, transcript, duration }) => {
      const bufferKey = buildTranscriptBufferKey(socket.id);
      const finalSegments = segmentBuffers.get(socket.id) || [];
      const rawText = transcript || transcriptBuffers.get(bufferKey) || '';

      // Perform final comprehensive AI summary pass
      let finalAiResult = null;
      try {
        finalAiResult = await generateFinalSummary(
          finalSegments.length > 0
            ? finalSegments
            : [{ id: 'seg-1', text: rawText, startMs: 0, speaker: 'Participant' }]
        );
      } catch (err) {
        console.error('[Socket] Final summary pass failed:', err.message);
      }

      // Cleanup memory buffers
      transcriptBuffers.delete(bufferKey);
      segmentBuffers.delete(socket.id);
      latestInsights.delete(socket.id);
      insightLocks.delete(socket.id);

      const insightsData = finalAiResult?.insights || {
        summary: rawText.slice(0, 200),
        key_points: [],
        decisions: [],
        action_items: [],
        open_questions: [],
        sentiment: 'neutral',
      };

      try {
        const updateData = {
          transcript: rawText,
          transcriptSegments: finalSegments,
          summary: {
            overview: insightsData.summary || '',
            keyPoints: insightsData.key_points || [],
            actionItems: (insightsData.action_items || []).map((item) => ({
              task: item.task || String(item),
              owner: item.owner || null,
              due: item.due || null,
              sourceSegmentId: item.sourceSegmentId || null,
            })),
            decisions: insightsData.decisions || [],
            openQuestions: insightsData.open_questions || [],
            sentiment: insightsData.sentiment || 'neutral',
          },
          duration:
            typeof duration === 'number'
              ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
              : duration || '0 min',
          status: 'completed',
          wordCount: rawText.split(/\s+/).filter(Boolean).length,
          sentiment: insightsData.sentiment || 'neutral',
          promptVersion: finalAiResult?.promptVersion || 'v1.0.0',
          aiModel: finalAiResult?.model || 'llama-3.3-70b-versatile',
          aiStatus: finalAiResult?.aiStatus || 'completed',
        };

        let meeting = null;
        if (isValidObjectId(meetingId)) {
          meeting = await Meeting.findByIdAndUpdate(meetingId, updateData, { new: true });
        }

        if (!meeting) {
          meeting = await Meeting.create({
            title: 'Untitled Meeting',
            ...updateData,
            userId: socket.userId,
          });
        }

        socket.emit('meeting-saved', { ok: true, meetingId: meeting._id, summary: updateData.summary });
      } catch (error) {
        console.error('Could not save meeting:', error.message);
        socket.emit('meeting-saved', { ok: false, error: error.message });
      }
    });

    socket.on('disconnect', () => {
      const bufferKey = buildTranscriptBufferKey(socket.id);
      transcriptBuffers.delete(bufferKey);
      segmentBuffers.delete(socket.id);
      latestInsights.delete(socket.id);
      insightLocks.delete(socket.id);
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
