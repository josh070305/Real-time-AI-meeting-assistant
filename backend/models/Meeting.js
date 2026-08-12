import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Meeting' },
    description: { type: String, default: '' },
    transcript: { type: String, default: '' },
    summary: {
      overview: { type: String, default: '' },
      keyPoints: [{ type: String }],
      actionItems: [{ type: Object }],
      decisions: [{ type: String }],
    },
    duration: { type: String, default: '0 min' },
    durationSeconds: { type: Number, default: 0 },
    status: { type: String, enum: ['scheduled', 'live', 'completed'], default: 'completed' },
    tags: [{ type: String }],
    participants: { type: Number, default: 1 },
    wordCount: { type: Number, default: 0 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  },
  { timestamps: true }
);

export default mongoose.model('Meeting', meetingSchema);
