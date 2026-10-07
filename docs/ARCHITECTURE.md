# Architecture & Design Blueprint

## 1. System Overview

The **Real-Time AI Meeting Assistant** is a full-stack platform providing live speech transcription, structured rolling AI insight extraction, and persistent meeting intelligence.

```
┌─────────────────────────────────────────────────────────────┐
│                   Browser Client (React/Vite)               │
│  Web Speech API / Mic Audio ──> Socket.io Client (Real-time)│
└──────────────────────────────┬──────────────────────────────┘
                               │ WS / Socket.io (Auth Header)
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js / Express Server                 │
│  - Socket.io Server (Authenticated Handshake via JWT)        │
│  - Rolling Segment Buffer & Concurrency Lock                │
│  - Groq AI Service (Zod schema validation, retries, fallback)│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  MongoDB Persistence & Groq API             │
│  - Meetings collection ({ transcriptSegments, summary, ...})│
│  - Groq API (llama-3.3-70b-versatile -> llama-3.1-8b fallback)│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 2 — Smarter AI Layer

### 2.1 Structured Zod Insights
All LLM outputs are validated against strict Zod schemas (`backend/schemas/insightSchema.js`):
- `summary`: Executive overview string.
- `key_points`: Array of key meeting takeaways.
- `decisions`: Array of captured decisions.
- `action_items`: Objects containing `{ task, owner, due, sourceSegmentId }`.
- `open_questions`: Array of unresolved questions.
- `sentiment`: Enforced enum `['positive', 'neutral', 'negative', 'mixed']`.

Soft recovery handles malformed or legacy strings gracefully without throwing exceptions.

### 2.2 Rolling Summarisation Strategy
To maintain **bounded token consumption and flat latency** on multi-hour meetings:
1. Transcript text is split into immutable segment objects: `{ id, text, startMs, speaker }`.
2. Every ~45 seconds (or 3 new segments), only the **new transcript segments** are combined with the **previous running summary**.
3. Bounded context prompts prevent the payload from growing proportionally to meeting duration, verified by the 2-hour benchmark test (`longTranscript.test.js`).

### 2.3 AI Resilience & Model Fallback
- **Concurrency Control**: Max 2 concurrent Groq API requests with an in-memory queue.
- **Exponential Backoff**: Up to 2 retries per model with backoff delays.
- **Model Fallback**: Primary model `llama-3.3-70b-versatile` falls back to `llama-3.1-8b-instant` if primary fails.
- **Graceful Failure**: Emits `aiStatus: 'unavailable'` on total failure, keeping the UI intact.

### 2.4 Prompt Versioning
Prompts are versioned in `backend/services/prompts/insightPrompts.js` (`PROMPT_VERSION = 'v1.0.0'`). Each saved meeting record in MongoDB stores its `promptVersion`, `aiModel`, and `aiStatus`.

### 2.5 Click-to-Seek UI
`InsightsPanel` renders clickable `sourceSegmentId` timestamp badges for action items. Clicking a badge triggers `onSeekSegment`, which highlights and scrolls directly to that segment in `TranscriptPanel`.
