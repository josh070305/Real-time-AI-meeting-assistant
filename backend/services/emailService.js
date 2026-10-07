import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '../config/env.js';

function createTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendMeetingSummaryEmail({ to, subject, text, html }) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.log('[emailService] SMTP not configured. Skipping send to:', to);
    return { ok: false, message: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();

    if (!transporter) {
      return { ok: false, message: 'Email transporter not configured' };
    }

    await transporter.sendMail({
      from: '"MeetingAI" <noreply@meetingai.com>',
      to,
      subject,
      text,
      html,
    });

    return { ok: true };
  } catch (error) {
    console.error('[emailService] Send error:', error.message);
    return { ok: false, error: error.message };
  }
}
