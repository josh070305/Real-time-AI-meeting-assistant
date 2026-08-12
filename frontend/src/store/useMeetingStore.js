import { create } from 'zustand';

const initialInsights = {
  key_points: [],
  action_items: [],
  decisions: [],
};

const useMeetingStore = create((set, get) => ({
  isLive: false,
  transcript: [],
  interimText: '',
  insights: initialInsights,
  summary: null,
  meetings: [],
  meetingDuration: 0,
  isListening: false,
  insightsLoading: false,
  error: '',
  theme: 'dark',
  loadingMeetings: false,
  searchQuery: '',
  selectedMeeting: null,
  currentMeetingId: null,
  currentTemplate: null,

  setMeetings: (meetings) => set({ meetings }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedMeeting: (selectedMeeting) => set({ selectedMeeting }),
  setError: (error) => set({ error }),

  fetchMeetings: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ loadingMeetings: true, error: '' });

    try {
      const res = await fetch('http://localhost:4000/api/meetings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await res.json();
      const formattedMeetings = data.meetings.map((m) => ({
        id: m._id,
        title: m.title,
        date: new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        duration: m.duration || '0 min',
        status: m.status || 'completed',
        transcript: m.transcript,
        summary: m.summary,
        wordCount: m.wordCount || 0,
      }));

      set({ meetings: formattedMeetings });
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
      set({ error: err.message });
    } finally {
      set({ loadingMeetings: false });
    }
  },

  createMeeting: async (title) => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const res = await fetch('http://localhost:4000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, status: 'live' }),
      });

      if (!res.ok) {
        throw new Error('Failed to create meeting');
      }

      const meeting = await res.json();
      return meeting;
    } catch (err) {
      console.error('Failed to create meeting:', err);
      set({ error: err.message });
      return null;
    }
  },

  deleteMeeting: async (meetingId) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const res = await fetch(`http://localhost:4000/api/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete meeting');
      }

      set((state) => ({
        meetings: state.meetings.filter((m) => m.id !== meetingId),
      }));

      return true;
    } catch (err) {
      console.error('Failed to delete meeting:', err);
      set({ error: err.message });
      return false;
    }
  },

  startMeeting: async (template) => {
    const title = template ? `${template.name} - ${new Date().toLocaleDateString()}` : 'New Meeting';
    const meeting = await get().createMeeting(title);

    if (meeting) {
      set({
        isLive: true,
        transcript: [],
        interimText: '',
        insights: initialInsights,
        summary: null,
        meetingDuration: 0,
        insightsLoading: false,
        error: '',
        currentMeetingId: meeting._id,
        currentTemplate: template,
      });
      return meeting;
    }
    return null;
  },

  stopMeeting: () => set({ isLive: false }),
  appendTranscript: (entry) =>
    set((state) => ({
      transcript: [...state.transcript, entry],
    })),
  setTranscript: (transcript) => set({ transcript }),
  setInterimText: (text) => set({ interimText: text }),
  updateInsights: (insights) => set({ insights, insightsLoading: false }),
  setInsightsLoading: (value) => set({ insightsLoading: value }),
  setSummary: (summary) => set({ summary }),
  setMeetingDuration: (value) => set({ meetingDuration: value }),
  tickMeetingDuration: () =>
    set((state) => ({ meetingDuration: state.meetingDuration + 1 })),
  setIsListening: (value) => set({ isListening: value }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  reset: () =>
    set({
      isLive: false,
      transcript: [],
      interimText: '',
      insights: initialInsights,
      summary: null,
      meetingDuration: 0,
      isListening: false,
      insightsLoading: false,
      error: '',
      currentMeetingId: null,
      currentTemplate: null,
    }),
}));

export default useMeetingStore;
