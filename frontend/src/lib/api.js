/**
 * lib/api.js — single source of truth for backend URLs.
 *
 * All fetch calls and Socket.io connections import from here so that
 * swapping the backend URL only requires changing .env (or .env.production).
 */

export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, '') || 'http://localhost:4000';
