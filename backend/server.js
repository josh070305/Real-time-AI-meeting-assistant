import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

// Load .env before importing config/env.js so that process.env is populated
dotenv.config({ path: new URL('../.env', import.meta.url) });

// Validated env — will crash fast if any required var is missing
import { PORT, MONGODB_URI, CORS_ORIGIN, JWT_SECRET } from './config/env.js';

import meetingsRouter from './routes/meetings.js';
import authRouter from './routes/auth.js';
import { registerMeetingSocket } from './socket/meetingSocket.js';

const app = express();
const server = http.createServer(app);

// ── CORS ──────────────────────────────────────────────────────────────────────
// Only allow the explicitly configured origin; '*' is never used.
const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pre-flight

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/meetings', meetingsRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'Meeting assistant backend is running.' });
});

// Pass the validated JWT_SECRET so the socket layer never uses a fallback
registerMeetingSocket(io, JWT_SECRET);

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // Fail fast — running without a DB causes confusing runtime errors later.
    console.error('MongoDB connection failed. Shutting down.', error.message);
    process.exit(1);
  });
