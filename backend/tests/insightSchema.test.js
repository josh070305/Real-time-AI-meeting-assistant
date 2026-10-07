import { describe, it, expect } from 'vitest';
import { parseInsights, DEFAULT_INSIGHTS } from '../schemas/insightSchema.js';

describe('parseInsights Zod Schema & Recovery', () => {
  it('returns default insights when input is null, undefined, or empty', () => {
    expect(parseInsights(null)).toEqual(DEFAULT_INSIGHTS);
    expect(parseInsights(undefined)).toEqual(DEFAULT_INSIGHTS);
    expect(parseInsights('')).toEqual(DEFAULT_INSIGHTS);
  });

  it('parses valid JSON string with complete schema structure', () => {
    const validJson = JSON.stringify({
      summary: 'Project alignment meeting completed.',
      key_points: ['Agreed on Q3 goals', 'Approved budget'],
      decisions: ['Deploy to staging next week'],
      action_items: [
        { task: 'Set up CI pipeline', owner: 'Alice', due: 'Friday', sourceSegmentId: 'seg-2' },
      ],
      open_questions: ['Who will run load testing?'],
      sentiment: 'positive',
    });

    const parsed = parseInsights(validJson);
    expect(parsed.summary).toBe('Project alignment meeting completed.');
    expect(parsed.key_points).toEqual(['Agreed on Q3 goals', 'Approved budget']);
    expect(parsed.action_items[0]).toEqual({
      task: 'Set up CI pipeline',
      owner: 'Alice',
      due: 'Friday',
      sourceSegmentId: 'seg-2',
    });
    expect(parsed.sentiment).toBe('positive');
  });

  it('performs soft recovery on malformed or string action items', () => {
    const malformed = {
      summary: 12345, // invalid type
      key_points: 'not an array',
      action_items: ['Just a string task', { description: 'Legacy item', assignee: 'Bob' }],
      sentiment: 'invalid_sentiment_value',
    };

    const parsed = parseInsights(malformed);
    expect(parsed.summary).toBe('');
    expect(parsed.key_points).toEqual([]);
    expect(parsed.action_items).toHaveLength(2);
    expect(parsed.action_items[0].task).toBe('Just a string task');
    expect(parsed.action_items[1].task).toBe('Legacy item');
    expect(parsed.action_items[1].owner).toBe('Bob');
    expect(parsed.sentiment).toBe('neutral');
  });
});
