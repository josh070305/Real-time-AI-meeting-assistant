import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

// Validated env — will crash fast if any required var is missing
// dotenv is loaded inside config/env.js before any vars are read
import { PORT, MONGODB_URI, CORS_ORIGIN, JWT_SECRET } from './config/env.js';

import meetingsRouter from './routes/meetings.js';
import authRouter from './routes/auth.js';
import { registerMeetingSocket } from './socket/meetingSocket.js';

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  ...new Set(
    [...(CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean), 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  ),
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
};

// ── CORS ──────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pre-flight

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
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
