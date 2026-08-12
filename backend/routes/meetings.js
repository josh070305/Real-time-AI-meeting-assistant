import express from 'express';
import Meeting from '../models/Meeting.js';
import { authMiddleware } from './auth.js';
import { sendMeetingSummaryEmail } from '../services/emailService.js';

const router = express.Router();

router.use(authMiddleware);

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

router.post('/', async (req, res) => {
  try {
    const meeting = await Meeting.create({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
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

    const summary = meeting.summary || {};
    const summaryText = summary.overview
      ? `Overview: ${summary.overview || 'N/A'}\n\nKey Points:\n${(summary.keyPoints || []).map((p) => `• ${p}`).join('\n') || 'None'}\n\nAction Items:\n${(summary.actionItems || []).map((a) => `• ${a.task || a}`).join('\n') || 'None'}\n\nDecisions:\n${(summary.decisions || []).map((d) => `• ${d}`).join('\n') || 'None'}`
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
