import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '../config/env.js';
import { parseInsights, DEFAULT_INSIGHTS } from '../schemas/insightSchema.js';
import {
  buildRollingPrompt,
  buildFinalSummaryPrompt,
  PROMPT_VERSION,
  PRIMARY_MODEL,
  FALLBACK_MODEL,
} from './prompts/insightPrompts.js';

let groqInstance = null;
function getGroqClient() {
  if (!groqInstance) {
    groqInstance = new Groq({ apiKey: GROQ_API_KEY });
  }
  return groqInstance;
}

// ── Simple In-Memory Queue & Concurrency Control ─────────────────────────────
const MAX_CONCURRENT = 2;
let activeRequests = 0;
const requestQueue = [];

async function enqueueRequest(fn) {
  if (activeRequests >= MAX_CONCURRENT) {
    await new Promise((resolve) => requestQueue.push(resolve));
  }
  activeRequests++;
  try {
    return await fn();
  } finally {
    activeRequests--;
    if (requestQueue.length > 0) {
      const next = requestQueue.shift();
      next();
    }
  }
}

// ── Resilience: Retry with Exponential Backoff & Model Fallback ──────────────
async function callGroqWithRetry(promptContent, options = {}) {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  const maxRetries = options.maxRetries ?? 2;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const groq = getGroqClient();
        const response = await enqueueRequest(() =>
          groq.chat.completions.create({
            model,
            temperature: 0.2,
            messages: [{ role: 'user', content: promptContent }],
            response_format: { type: 'json_object' },
          })
        );

        const rawContent = response.choices?.[0]?.message?.content || '{}';
        const parsed = parseInsights(rawContent);
        return {
          success: true,
          insights: parsed,
          model,
          promptVersion: PROMPT_VERSION,
          aiStatus: 'completed',
        };
      } catch (error) {
        console.warn(
          `[Groq] Attempt ${attempt + 1} with model ${model} failed: ${error.message}`
        );
        if (attempt < maxRetries) {
          // Exponential backoff: 200ms, 400ms...
          const delay = Math.pow(2, attempt) * 200;
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
  }

  console.error('[Groq] All models and retries failed. Returning fallback unavailable state.');
  return {
    success: false,
    insights: { ...DEFAULT_INSIGHTS },
    model: PRIMARY_MODEL,
    promptVersion: PROMPT_VERSION,
    aiStatus: 'unavailable',
  };
}

/**
 * Legacy single-transcript summarization (backwards compatibility).
 */
export async function summarizeTranscript(transcript) {
  if (!transcript || !transcript.trim()) {
    return { ...DEFAULT_INSIGHTS };
  }

  const prompt = buildRollingPrompt({
    previousSummary: null,
    newSegments: [{ id: 'seg-1', text: transcript, startMs: 0, speaker: 'Speaker' }],
  });

  const res = await callGroqWithRetry(prompt);
  return res.insights;
}

/**
 * Phase 2: Rolling summarisation combining running context with new segments.
 */
export async function rollingSummarize({ previousSummary, newSegments }, options = {}) {
  if (!newSegments || newSegments.length === 0) {
    return {
      success: true,
      insights: previousSummary || { ...DEFAULT_INSIGHTS },
      model: PRIMARY_MODEL,
      promptVersion: PROMPT_VERSION,
      aiStatus: 'completed',
    };
  }

  const prompt = buildRollingPrompt({ previousSummary, newSegments });
  return await callGroqWithRetry(prompt, options);
}

/**
 * Phase 2: Final comprehensive summary pass on meeting completion.
 */
export async function generateFinalSummary(allSegments, options = {}) {
  if (!allSegments || allSegments.length === 0) {
    return {
      success: true,
      insights: { ...DEFAULT_INSIGHTS },
      model: PRIMARY_MODEL,
      promptVersion: PROMPT_VERSION,
      aiStatus: 'completed',
    };
  }

  const prompt = buildFinalSummaryPrompt(allSegments);
  return await callGroqWithRetry(prompt, options);
}
