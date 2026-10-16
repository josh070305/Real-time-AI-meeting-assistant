/**
 * env.js — centralised environment-variable validation.
 *
 * Crashes the process at startup if any required variable is missing.
 * All other modules must import their values from here instead of reading
 * process.env directly, so there is one canonical place to add / document vars.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In local dev, load .env from the backend/ directory.
// In Docker / Render production, env vars are injected by the platform — no .env file.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

function require_env(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`[env] FATAL: required environment variable "${name}" is not set.`);
    process.exit(1);
  }
  return value;
}

function optional_env(name, fallback = '') {
  return process.env[name] ?? fallback;
}

export const PORT = Number(optional_env('PORT', '4000'));
export const MONGODB_URI = require_env('MONGODB_URI');
export const GROQ_API_KEY = require_env('GROQ_API_KEY');
export const JWT_SECRET = require_env('JWT_SECRET');

// CORS — must be set explicitly in production; defaults to localhost for local dev only
export const CORS_ORIGIN = optional_env('CORS_ORIGIN', 'http://localhost:5173');

// Email — optional; features degrade gracefully when absent
export const SMTP_HOST = optional_env('SMTP_HOST', 'smtp.gmail.com');
export const SMTP_PORT = Number(optional_env('SMTP_PORT', '587'));
export const SMTP_USER = optional_env('SMTP_USER', '');
export const SMTP_PASS = optional_env('SMTP_PASS', '');
