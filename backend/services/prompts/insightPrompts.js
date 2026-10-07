export const PROMPT_VERSION = 'v1.0.0';
export const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
export const FALLBACK_MODEL = 'llama-3.1-8b-instant';

/**
 * Builds the rolling summarisation prompt.
 * Keeps token consumption bounded by combining the existing running summary with only new segments.
 */
export function buildRollingPrompt({ previousSummary, newSegments }) {
  const segmentText = (newSegments || [])
    .map(
      (s) =>
        `[Segment ${s.id || 'seg-0'} | Speaker: ${s.speaker || 'Participant'} | Time: ${
          s.startMs ? Math.floor(s.startMs / 1000) + 's' : '0s'
        }] ${s.text}`
    )
    .join('\n');

  const prevSummaryText = previousSummary?.summary || 'No summary yet.';
  const prevKeyPoints = JSON.stringify(previousSummary?.key_points || []);
  const prevDecisions = JSON.stringify(previousSummary?.decisions || []);

  return `You are a real-time AI meeting assistant.
Update the meeting intelligence by merging the existing running summary context with the NEW transcript segments provided below.

RULES:
1. Output MUST be a single raw JSON object matching the schema below.
2. "action_items": array of objects { "task": string, "owner": string or null, "due": string or null, "sourceSegmentId": string or null }.
   - "sourceSegmentId" MUST be set to the Segment ID (e.g. "seg-1") from the transcript where the task was assigned or discussed.
3. "sentiment": MUST be one of ["positive", "neutral", "negative", "mixed"].
4. Keep "summary" concise (2-4 sentences max).

=== PREVIOUS SUMMARY CONTEXT ===
Summary: ${prevSummaryText}
Key Points: ${prevKeyPoints}
Decisions: ${prevDecisions}

=== NEW TRANSCRIPT SEGMENTS ===
${segmentText || 'No new segments.'}

=== REQUIRED JSON SCHEME ===
{
  "summary": "Updated executive summary incorporating new insights",
  "key_points": ["Merged key point 1", "Merged key point 2"],
  "decisions": ["Decision 1"],
  "action_items": [
    {
      "task": "Task description",
      "owner": "Owner name or null",
      "due": "Due date or null",
      "sourceSegmentId": "seg-1"
    }
  ],
  "open_questions": ["Unresolved question 1"],
  "sentiment": "neutral"
}`;
}

/**
 * Builds the final comprehensive summary prompt executed when a meeting stops.
 */
export function buildFinalSummaryPrompt(allSegments) {
  const segmentText = (allSegments || [])
    .map(
      (s) =>
        `[Segment ${s.id || 'seg-0'} | Speaker: ${s.speaker || 'Participant'} | Time: ${
          s.startMs ? Math.floor(s.startMs / 1000) + 's' : '0s'
        }] ${s.text}`
    )
    .join('\n');

  return `You are creating the final definitive summary for a completed meeting.
Analyze all transcript segments below and generate high-precision meeting intelligence.

RULES:
1. Output MUST be valid JSON.
2. "action_items" MUST contain task, owner (or null), due (or null), and sourceSegmentId (the Segment ID where discussed).
3. "sentiment" MUST be one of ["positive", "neutral", "negative", "mixed"].

=== FULL MEETING TRANSCRIPT ===
${segmentText}

=== REQUIRED JSON FORMAT ===
{
  "summary": "Comprehensive executive summary of the entire meeting",
  "key_points": ["Key takeaway 1", "Key takeaway 2"],
  "decisions": ["Final decision 1"],
  "action_items": [
    {
      "task": "Task description",
      "owner": "Owner name or null",
      "due": "Due date or null",
      "sourceSegmentId": "seg-1"
    }
  ],
  "open_questions": ["Unresolved question"],
  "sentiment": "neutral"
}`;
}
