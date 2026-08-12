import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function summarizeTranscript(transcript) {
  if (!process.env.GROQ_API_KEY) {
    return {
      key_points: [],
      action_items: [],
      decisions: [],
    };
  }

  const prompt = `
You are analyzing a meeting transcript and must return JSON only.
Extract key points, action items, and decisions in this format:
{
  "key_points": ["..."],
  "action_items": [{"task": "...", "assignee": "..." or null}],
  "decisions": ["..."]
}

Keep the output concise and useful for a real-time meeting assistant.
Transcript:
${transcript}
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq summarization error:', error.message);
    return {
      key_points: [],
      action_items: [],
      decisions: [],
    };
  }
}
