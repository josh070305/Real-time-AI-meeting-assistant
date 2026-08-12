# Real-Time AI Meeting Assistant

A production-ready, portfolio-grade meeting transcription and AI-powered insights platform with real-time speech recognition, live dashboard, analytics, and professional authentication.

## ✨ Features

### Core
- Live speech transcription using Web Speech API
- AI-powered insights with Groq LLM
- Real-time transcript and insights streaming via Socket.io
- Meeting summaries with copy, PDF export, and email sharing
- Complete meeting lifecycle: create → live → save → summary

### Auth & Security
- User registration and login
- JWT token-based authentication
- Password hashing with bcryptjs
- Protected routes and session management
- Profile settings and account deletion

### Dashboard & Analytics
- Meeting statistics and history
- Search and filter meetings
- Interactive charts: word count, status, duration trends (Chart.js)
- Recent activity with calendar integration

### UI/UX
- Modern dark theme with glassmorphism
- Smooth animations with Framer Motion
- Responsive design for all devices
- Toast notifications and error boundaries
- Loading skeletons and onboarding tour
- Meeting templates and keyboard shortcuts

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Framer Motion, Zustand, React Router, Socket.io Client, Chart.js, React Hot Toast

**Backend:** Node.js, Express, Socket.io, MongoDB, Mongoose, Groq SDK, JWT, bcryptjs, Nodemailer

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+ or MongoDB Atlas
- Groq API key from [console.groq.com](https://console.groq.com)
- Chrome/Edge browser

### Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Environment

**backend/.env**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/meeting-assistant
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

### Run

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/        # Login, Register, Dashboard, LiveMeeting, Summary, Analytics, Profile
│   ├── components/   # TopBar, TranscriptPanel, InsightsPanel, Templates, Tour, ErrorBoundary
│   ├── hooks/        # useSpeechRecognition, useSocket, useKeyboardShortcuts
│   ├── context/      # AuthContext
│   └── store/        # useMeetingStore (Zustand)

backend/
├── models/           # User, Meeting
├── routes/           # auth, meetings
├── socket/           # meetingSocket
├── services/         # groqService, transcriptProcessor, emailService
├── middleware/       # auth
└── server.js
```

## 🔐 Auth Flow

1. Register/Login → backend returns JWT
2. Token stored in localStorage
3. All API requests include `Authorization: Bearer <token>`
4. Protected routes redirect to login if token is invalid

## 🎯 Meeting Flow

1. Start meeting → choose template
2. Join socket room
3. Enable mic → real-time transcription
4. AI extracts insights automatically
5. Stop meeting → saved to MongoDB
6. View summary → copy/share/export

## 📊 Analytics

- Bar chart: word count per meeting
- Doughnut chart: meeting status distribution
- Line chart: duration trends
- Recent activity list with Google Calendar integration

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/
```

### Backend (Render/Railway)
- Use provided Dockerfile or `node server.js`
- Set environment variables
- Connect to MongoDB Atlas

### Docker
```bash
docker-compose up --build
```

## 📝 License

MIT

## 🙏 Acknowledgments

- [Groq](https://groq.com) - LLM API
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://framer.com/motion) - Animations
- [Socket.io](https://socket.io) - Real-time communication
- [MongoDB](https://mongodb.com) - Database
- [Chart.js](https://chartjs.org) - Analytics
