import { z } from 'zod';

export const ActionItemSchema = z.object({
  task: z.string().default(''),
  owner: z.string().nullable().optional().default(null),
  due: z.string().nullable().optional().default(null),
  sourceSegmentId: z.string().nullable().optional().default(null),
});

export const InsightSchema = z.object({
  summary: z.string().default(''),
  key_points: z.array(z.string()).default([]),
  decisions: z.array(z.string()).default([]),
  action_items: z.array(ActionItemSchema).default([]),
  open_questions: z.array(z.string()).default([]),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']).default('neutral'),
});

export const DEFAULT_INSIGHTS = {
  summary: '',
  key_points: [],
  decisions: [],
  action_items: [],
  open_questions: [],
  sentiment: 'neutral',
};

/**
 * Safely parses raw JSON or objects into validated Insight objects.
 * Never throws — falls back gracefully to DEFAULT_INSIGHTS or partial valid fields.
 */
export function parseInsights(rawInput) {
  if (!rawInput) return { ...DEFAULT_INSIGHTS };

  let jsonObject = rawInput;
  if (typeof rawInput === 'string') {
    try {
      jsonObject = JSON.parse(rawInput);
    } catch {
      return { ...DEFAULT_INSIGHTS };
    }
  }

  const result = InsightSchema.safeParse(jsonObject);
  if (result.success) {
    return result.data;
  }

  // Graceful fallback for partially valid structures
  return {
    summary: typeof jsonObject?.summary === 'string' ? jsonObject.summary : '',
    key_points: Array.isArray(jsonObject?.key_points)
      ? jsonObject.key_points.filter((x) => typeof x === 'string')
      : [],
    decisions: Array.isArray(jsonObject?.decisions)
      ? jsonObject.decisions.filter((x) => typeof x === 'string')
      : [],
    action_items: Array.isArray(jsonObject?.action_items)
      ? jsonObject.action_items
          .map((item) => {
            if (typeof item === 'string') {
              return { task: item, owner: null, due: null, sourceSegmentId: null };
            }
            return {
              task: typeof item?.task === 'string' ? item.task : String(item?.task || item?.description || ''),
              owner: item?.owner || item?.assignee || null,
              due: item?.due || item?.dueDate || null,
              sourceSegmentId: item?.sourceSegmentId || item?.segmentId || null,
            };
          })
          .filter((item) => item.task.trim().length > 0)
      : [],
    open_questions: Array.isArray(jsonObject?.open_questions)
      ? jsonObject.open_questions.filter((x) => typeof x === 'string')
      : [],
    sentiment: ['positive', 'neutral', 'negative', 'mixed'].includes(jsonObject?.sentiment)
      ? jsonObject.sentiment
      : 'neutral',
  };
}
