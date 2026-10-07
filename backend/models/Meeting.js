import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    startMs: { type: Number, default: 0 },
    speaker: { type: String, default: 'Participant' },
  },
  { _id: false }
);

const actionItemSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    owner: { type: String, default: null },
    due: { type: String, default: null },
    sourceSegmentId: { type: String, default: null },
  },
  { _id: false }
);

const meetingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Meeting' },
    description: { type: String, default: '' },
    transcript: { type: String, default: '' },
    transcriptSegments: [segmentSchema],
    summary: {
      overview: { type: String, default: '' },
      keyPoints: [{ type: String }],
      actionItems: [actionItemSchema],
      decisions: [{ type: String }],
      openQuestions: [{ type: String }],
      sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed'], default: 'neutral' },
    },
    duration: { type: String, default: '0 min' },
    durationSeconds: { type: Number, default: 0 },
    status: { type: String, enum: ['scheduled', 'live', 'completed'], default: 'completed' },
    tags: [{ type: String }],
    participants: { type: Number, default: 1 },
    wordCount: { type: Number, default: 0 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed'], default: 'neutral' },
    promptVersion: { type: String, default: 'v1.0.0' },
    aiModel: { type: String, default: 'llama-3.3-70b-versatile' },
    aiStatus: {
      type: String,
      enum: ['idle', 'processing', 'completed', 'failed', 'unavailable'],
      default: 'idle',
    },
  },
  { timestamps: true }
);

// Index for the most common query pattern: fetch all meetings for a user, sorted by date
meetingSchema.index({ userId: 1, createdAt: -1 });

// Index for title search (used by the search filter in GET /api/meetings)
meetingSchema.index({ title: 1 });

export default mongoose.model('Meeting', meetingSchema);
