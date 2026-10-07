/**
 * auth.js — Express middleware that validates the Bearer JWT.
 *
 * Moved out of routes/auth.js so it can be shared without circular imports.
 * JWT_SECRET is sourced from the validated config, so there is no insecure
 * fallback.
 */

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

/**
 * Attaches `req.userId` (string) when a valid Bearer token is present.
 * Returns 401 otherwise.
 */
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
