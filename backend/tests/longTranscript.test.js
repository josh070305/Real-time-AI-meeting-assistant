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

const { rollingSummarize } = await import('../services/groqService.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('2-Hour Long Transcript Rolling Summarization Benchmark', () => {
  it('processes a 2-hour simulated transcript (50 segments, 15,000 words) without growing prompt context', async () => {
    // Generate 50 segments representing a 2-hour meeting
    const segments = Array.from({ length: 50 }, (_, i) => ({
      id: `seg-${i + 1}`,
      text: `This is paragraph number ${i + 1} of a very detailed 2-hour architectural review discussion with extensive details about databases, scaling, caching, microservices, load balancing, unit tests, security headers, and deployment pipelines. `.repeat(15),
      startMs: i * 144000, // spaced every ~2.4 minutes across 2 hours
      speaker: i % 2 === 0 ? 'Alice (Lead)' : 'Bob (Architect)',
    }));

    const totalWords = segments.reduce((acc, s) => acc + s.text.split(/\s+/).length, 0);
    expect(totalWords).toBeGreaterThan(10000);

    let runningSummary = null;
    const promptPayloadSizes = [];

    // Simulate rolling summarization every 3 segments
    for (let i = 0; i < segments.length; i += 3) {
      const windowSegments = segments.slice(i, i + 3);

      mockCreate.mockImplementationOnce((params) => {
        const promptLength = params.messages[0].content.length;
        promptPayloadSizes.push(promptLength);

        return Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: `Running summary updated up to segment ${i + 3}`,
                  key_points: [`Key architecture point at step ${i + 1}`],
                  decisions: [`Decision approved at step ${i + 1}`],
                  action_items: [
                    {
                      task: `Task from step ${i + 1}`,
                      owner: 'Alice',
                      due: 'Next Sprint',
                      sourceSegmentId: `seg-${i + 1}`,
                    },
                  ],
                  open_questions: [],
                  sentiment: 'positive',
                }),
              },
            },
          ],
        });
      });

      const res = await rollingSummarize({
        previousSummary: runningSummary,
        newSegments: windowSegments,
      });

      expect(res.success).toBe(true);
      runningSummary = res.insights;
    }

    // Verify token safety: maximum prompt payload size stays bounded and flat!
    const maxPayload = Math.max(...promptPayloadSizes);
    const minPayload = Math.min(...promptPayloadSizes);

    // Bounded check: payload size should remain within a tight bound regardless of total meeting length
    expect(maxPayload).toBeLessThan(15000);
    expect(maxPayload - minPayload).toBeLessThan(4000);
  });
});
