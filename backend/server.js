import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import meetingsRouter from './routes/meetings.js';
import authRouter from './routes/auth.js';
import { registerMeetingSocket } from './socket/meetingSocket.js';
import { sendMeetingSummaryEmail } from './services/emailService.js';

dotenv.config({ path: new URL('.env', import.meta.url) });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/meetings', meetingsRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'Meeting assistant backend is running.' });
});

registerMeetingSocket(io);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meeting-assistant';
const HAS_GROQ_KEY = Boolean(process.env.GROQ_API_KEY);

console.log(`Backend env loaded. MongoDB URI configured: ${Boolean(process.env.MONGODB_URI)}`);
console.log(`Groq API key configured: ${HAS_GROQ_KEY}`);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT} without MongoDB`);
    });
  });
