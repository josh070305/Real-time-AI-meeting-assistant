# Real-Time AI Meeting Assistant

## 1. Problem Statement
The goal of this project is to build a portfolio-grade meeting assistant that captures live speech, transcribes it in real time, and uses an LLM to extract key discussion points, decisions, and action items as the conversation progresses. The application should feel like a polished SaaS product rather than a basic prototype, with a modern dashboard, smooth animations, and real-time updates.

The system must support:
- Live speech-to-text transcription
- Real-time AI summarization
- A dashboard for key points, action items, and decisions
- Persistent storage of meeting sessions and summaries
- A clean post-meeting recap experience

## 2. Architecture Design
The system is divided into three main layers:

### Frontend
- Built with React + Vite
- Uses Tailwind CSS for styling
- Uses Framer Motion for animated UI transitions
- Uses Zustand for client state management
- Uses Socket.io client for real-time communication
- Uses the browser Web Speech API for speech capture

### Backend
- Built with Node.js + Express
- Uses Socket.io for real-time meeting events
- Uses Mongoose to interact with MongoDB
- Uses a Groq SDK integration for AI summarization
- Maintains a transcript buffer per session and sends it to the LLM at intervals

### Data Flow
1. The browser captures speech using the Web Speech API.
2. Transcript chunks are streamed to the backend using Socket.io.
3. The backend maintains an in-memory transcript buffer for each live session.
4. The backend periodically sends the accumulated transcript to Groq.
5. The AI returns a structured JSON payload containing key points, action items, and decisions.
6. The frontend updates the live dashboard immediately using the returned insights.
7. When the meeting ends, the final transcript and summary are saved to MongoDB.

### High-Level Component View
```text
Browser (React App)
  ├─ Speech Recognition Hook
  ├─ Socket Client
  ├─ Zustand Store
  └─ Live Dashboard UI

Backend (Express + Socket.io)
  ├─ Meeting Socket Handlers
  ├─ Transcript Processor
  ├─ Groq Service
  └─ MongoDB Models / Routes
```

## 3. Workflow Management
The meeting workflow is designed around five stages:

### 1. Home / Landing
- User sees a polished landing page with product messaging.
- User can start a new meeting or view previous sessions.

### 2. Live Meeting Session
- User starts a meeting from the home screen.
- The app switches to the live dashboard.
- The microphone is activated and speech is captured.
- Transcript lines appear in real time.
- AI insights update periodically.

### 3. Insight Processing
- The backend receives transcript chunks.
- The transcript buffer grows over time.
- AI summarization is triggered periodically based on transcript size or timing.
- The frontend renders key points, action items, and decisions live.

### 4. Post-Meeting Summary
- When the user stops the meeting, the final content is assembled.
- The summary page displays the overview, key points, action items, decisions, and transcript.
- Users can copy the summary or print/export it.

### 5. Persistence
- The finalized meeting is saved to MongoDB.
- Future sessions can be fetched and displayed on the home page.

## 4. Tech Stack
### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- Socket.io Client

### Backend
- Node.js
- Express.js
- Socket.io
- Mongoose
- dotenv
- cors
- Groq SDK

### Data & Services
- MongoDB
- Groq LLM API
- Web Speech API

## 5. Input and Output Validation
### Input Validation
- Transcript chunks must be non-empty strings.
- Meeting start/stop events must contain valid payloads.
- Socket events should handle missing or malformed payloads gracefully.
- Speech recognition must check for browser support before activation.

### Output Validation
- AI responses must be parsed as JSON.
- The parsed payload should contain:
  - key_points: array of strings
  - action_items: array of objects with task and optional assignee
  - decisions: array of strings
- If the AI response is malformed, the app falls back to empty arrays instead of crashing.

### Validation Strategy
- Client-side: simple checks for empty transcript and missing state
- Backend: schema validation for meeting persistence and response normalization
- AI layer: fallback handling if the model returns invalid JSON

## 6. Database Design
### Collection: meetings
Each meeting document stores:
- title: string
- transcript: string
- summary: object
  - overview: string
  - keyPoints: array of strings
  - actionItems: array of objects
  - decisions: array of strings
- duration: string
- createdAt: date
- updatedAt: date

### Example Schema
```js
{
  title: "Weekly Sync",
  transcript: "...",
  summary: {
    overview: "Discussed release readiness and QA blockers.",
    keyPoints: ["Release date remains on track."],
    actionItems: [{ "task": "Share QA report", "assignee": "Alex" }],
    decisions: ["Move review meeting to Friday"]
  },
  duration: "18 min",
  createdAt: Date,
  updatedAt: Date
}
```

## 7. Error Handling and Validation
The application is designed to fail gracefully.

### Common Error Cases
- Browser does not support Web Speech API
- Microphone permission is denied
- Socket connection drops mid-meeting
- Groq API returns malformed JSON
- Groq API rate limits or temporary failures
- MongoDB is unavailable or unreachable

### Handling Strategy
- Show clear user-facing error messages rather than silent failures
- Skip a summarization cycle when the AI request fails and retry later
- Keep the transcript buffer locally so no data is lost if the backend restarts
- Save meetings only when the stop action is completed
- Log errors to the console for debugging

## 8. Logging for the Project
Logging is important for debugging real-time events and AI failures.

### Logging Levels
- info: server startup, socket connections, meeting start/stop
- warn: fallback modes such as missing Groq key or missing MongoDB connection
- error: speech errors, socket errors, AI parsing failures, database save failures

### Recommended Logging Points
- Backend startup with env config status
- Socket connect/disconnect events
- Transcript chunk receipt
- Groq summarization success/failure
- Meeting save success/failure
- Browser-side speech recognition errors

### Example Log Messages
- Backend env loaded. MongoDB URI configured: true
- Socket connected: abc123
- Groq summarization error: timeout
- Meeting saved successfully

## 9. Deployment
### Local Development
- Start the backend:
  - cd backend
  - npm install
  - npm run dev
- Start the frontend:
  - cd frontend
  - npm install
  - npm run dev

### Production Deployment Options
- Frontend: Vercel or Netlify
- Backend: Render, Railway, or a VPS
- Database: MongoDB Atlas
- Environment variables:
  - PORT
  - MONGODB_URI
  - GROQ_API_KEY

### Recommended Production Setup
- Host the React app on Vercel
- Host the Express server on Render or Railway
- Use MongoDB Atlas for database persistence
- Use HTTPS for secure browser microphone access where required

## Summary
This project combines speech recognition, real-time networking, AI summarization, and persistent storage into a cohesive meeting assistant experience. The architecture is modular, the workflow is straightforward, and the implementation is designed for both portfolio presentation and future scaling.
