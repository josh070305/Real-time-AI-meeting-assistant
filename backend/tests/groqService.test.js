import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('groq-sdk', () => {
  return {
    default: class MockGroq {
      constructor() {
        this.chat = { completions: { create: mockCreate } };
      }
    },
  };
});

vi.mock('../config/env.js', () => ({
  GROQ_API_KEY: 'test-key',
}));

const { summarizeTranscript, rollingSummarize, generateFinalSummary } = await import(
  '../services/groqService.js'
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('groqService Phase 2 (Structured AI Layer)', () => {
  it('returns default structured insights when transcript is empty', async () => {
    const result = await summarizeTranscript('');
    expect(result.key_points).toEqual([]);
    expect(result.action_items).toEqual([]);
    expect(result.sentiment).toBe('neutral');
  });

  it('performs rolling summarization with mocked Groq response', async () => {
    const mockPayload = {
      summary: 'Discussed design tokens and colors.',
      key_points: ['Use primary brand color'],
      decisions: ['Approved design system'],
      action_items: [
        { task: 'Export SVGs', owner: 'Designer', due: 'Tomorrow', sourceSegmentId: 'seg-1' },
      ],
      open_questions: [],
      sentiment: 'positive',
    };

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(mockPayload) } }],
    });

    const res = await rollingSummarize({
      previousSummary: null,
      newSegments: [{ id: 'seg-1', text: 'Let us use brand color and export SVGs.', startMs: 1000, speaker: 'Alice' }],
    });

    expect(res.success).toBe(true);
    expect(res.insights.summary).toBe('Discussed design tokens and colors.');
    expect(res.insights.action_items[0].sourceSegmentId).toBe('seg-1');
    expect(res.aiStatus).toBe('completed');
  });

  it('falls back gracefully to aiStatus = "unavailable" when Groq throws error', async () => {
    mockCreate.mockRejectedValue(new Error('Groq rate limit exceeded'));

    const res = await rollingSummarize(
      {
        previousSummary: null,
        newSegments: [{ id: 'seg-1', text: 'Hello team', startMs: 0, speaker: 'Bob' }],
      },
      { maxRetries: 0 }
    );

    expect(res.success).toBe(false);
    expect(res.aiStatus).toBe('unavailable');
    expect(res.insights.sentiment).toBe('neutral');
  });

  it('runs final summary pass on meeting completion', async () => {
    const mockFinalPayload = {
      summary: 'Final meeting summary across all topics.',
      key_points: ['Final point 1', 'Final point 2'],
      decisions: ['Final decision'],
      action_items: [
        { task: 'Deploy app', owner: 'DevOps', due: 'EOD', sourceSegmentId: 'seg-2' },
      ],
      open_questions: [],
      sentiment: 'positive',
    };

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(mockFinalPayload) } }],
    });

    const res = await generateFinalSummary([
      { id: 'seg-1', text: 'Welcome team.', startMs: 0, speaker: 'Host' },
      { id: 'seg-2', text: 'DevOps will deploy app by EOD.', startMs: 5000, speaker: 'Dev' },
    ]);

    expect(res.success).toBe(true);
    expect(res.insights.summary).toBe('Final meeting summary across all topics.');
    expect(res.insights.action_items[0].task).toBe('Deploy app');
  });
});
