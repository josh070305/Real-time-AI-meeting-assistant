import express from 'express';
import Meeting from '../models/Meeting.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendMeetingSummaryEmail } from '../services/emailService.js';

const router = express.Router();

// All meeting routes require authentication
router.use(authMiddleware);

/**
 * Fields a client is allowed to set via PATCH.
 * Explicitly whitelisted to prevent mass-assignment (e.g. overwriting userId).
 */
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'description',
  'transcript',
  'summary',
  'duration',
  'durationSeconds',
  'status',
  'tags',
  'participants',
  'wordCount',
  'sentiment',
];

function pickAllowedFields(body) {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_UPDATE_FIELDS.includes(key))
  );
}

// ── GET /api/meetings ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;
    const query = { userId: req.userId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/meetings/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.userId });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/meetings ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const data = pickAllowedFields(req.body);
    const meeting = await Meeting.create({ ...data, userId: req.userId });
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/meetings/:id ───────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const updates = pickAllowedFields(req.body);

    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/meetings/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/meetings/:id/share ──────────────────────────────────────────────
router.post('/:id/share', async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.userId });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const { email } = req.body;

    if (!email) {
      return res.json({ shareable: true, meetingId: meeting._id, message: 'No email provided' });
    }

    const s = meeting.summary || {};
    const summaryText = s.overview
      ? [
          `Overview: ${s.overview || 'N/A'}`,
          '',
          `Key Points:\n${(s.keyPoints || []).map((p) => `• ${p}`).join('\n') || 'None'}`,
          '',
          `Action Items:\n${(s.actionItems || []).map((a) => `• ${a.task || a}`).join('\n') || 'None'}`,
          '',
          `Decisions:\n${(s.decisions || []).map((d) => `• ${d}`).join('\n') || 'None'}`,
        ].join('\n')
      : 'No summary available';

    const result = await sendMeetingSummaryEmail({
      to: email,
      subject: `Meeting Summary: ${meeting.title}`,
      text: summaryText,
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${summaryText}</pre>`,
    });

    if (result.ok) {
      return res.json({ ok: true, message: 'Meeting shared successfully' });
    }

    return res.json({
      ok: false,
      message: result.message || result.error || 'Failed to share meeting',
      shareable: true,
      meetingId: meeting._id,
      summaryText,
    });
  } catch (error) {
    console.error('Share meeting error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
