import nodemailer from 'nodemailer';

function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendMeetingSummaryEmail({ to, subject, text, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email not configured. Would send:', { to, subject });
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
    console.error('Email send error:', error.message);
    return { ok: false, error: error.message };
  }
}
