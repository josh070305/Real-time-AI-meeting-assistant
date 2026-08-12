import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useMeetingStore from '../store/useMeetingStore';
import toast from 'react-hot-toast';
import MeetingTemplates from '../components/MeetingTemplates';
import OnboardingTour from '../components/OnboardingTour';
import LoadingSpinner from '../components/LoadingSpinner';
import { MeetingCardSkeleton, StatCardSkeleton } from '../components/Skeletons';

const StatCard = ({ label, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl`}
  >
    <div className="relative z-10">
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
    <div className="absolute -right-2 -top-2 text-5xl opacity-20">{icon}</div>
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
  </motion.div>
);

const MeetingItem = ({ meeting, index, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    const success = await onDelete(meeting.id);
    if (success) {
      toast.success('Meeting deleted');
    }
    setShowDelete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300"
    >
      <div className="flex flex-1 cursor-pointer items-center gap-4" onClick={() => navigate(`/meetings/${meeting.id}`)}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 text-2xl">
          📋
        </div>
        <div>
          <p className="font-semibold text-white transition-colors group-hover:text-brand-300">{meeting.title}</p>
          <p className="mt-1 text-sm text-dark-400">{meeting.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-dark-400">{meeting.duration}</span>
        <span className="rounded-full border border-success-500/30 bg-success-500/10 px-3 py-1 text-xs font-medium text-success-300">
          {meeting.status}
        </span>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(!showDelete); }}
            className="rounded-lg p-2 text-dark-400 transition-colors hover:text-error-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          {showDelete && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-white/10 bg-dark-800 p-2 shadow-xl">
              <button
                onClick={handleDelete}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-error-300 transition-colors hover:bg-error-500/10"
              >
                Delete meeting
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { startMeeting, meetings, loadingMeetings, searchQuery, setSearchQuery, deleteMeeting, fetchMeetings } = useMeetingStore();
  const [stats, setStats] = useState({ total: 0, totalMinutes: 0, averageDuration: '0 min', lastMeeting: 'Never' });
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    const total = meetings.length;
    const totalMinutes = meetings.reduce((acc, m) => {
      const mins = parseInt(m.duration) || 0;
      return acc + mins;
    }, 0);
    const avg = total > 0 ? Math.round(totalMinutes / total) : 0;
    const lastMeeting = meetings.length > 0 ? meetings[0].date : 'Never';

    setStats({
      total,
      totalMinutes,
      averageDuration: `${avg} min`,
      lastMeeting,
    });
  }, [meetings]);

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-dark-950 to-dark-950" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-gradient-to-br from-brand-600/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/5" data-tour-dashboard>
          <div className="mx-auto max-w-7xl px-6 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-blue-600 text-2xl font-bold text-white shadow-lg shadow-brand-500/30">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="mt-1 text-sm text-dark-400">
                      Welcome back, <span className="font-medium text-brand-400">{user?.fullName}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTemplates(true)}
                  data-tour-start
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Start New Meeting
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </motion.button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/analytics')}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-dark-300 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-dark-300 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-xl border border-error-500/30 bg-error-500/10 px-4 py-2 text-sm font-medium text-error-300 transition-all duration-300 hover:bg-error-500/20"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {loadingMeetings ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard label="Total Meetings" value={stats.total} icon="📊" color="from-brand-600 to-brand-700" delay={0.1} />
                <StatCard label="Total Minutes" value={stats.totalMinutes} icon="⏱️" color="from-blue-600 to-brand-600" delay={0.2} />
                <StatCard label="Avg Duration" value={stats.averageDuration} icon="📈" color="from-success-600 to-success-700" delay={0.3} />
                <StatCard label="Last Meeting" value={stats.lastMeeting} icon="🕐" color="from-warning-600 to-warning-700" delay={0.4} />
              </>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Recent Meetings</h2>
                <p className="mt-1 text-sm text-dark-400">Your meeting history and summaries</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:flex-none">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meetings..."
                    data-tour-search
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <button
                  onClick={fetchMeetings}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-dark-300 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden md:inline">Refresh</span>
                </button>
              </div>
            </div>

            {loadingMeetings ? (
              <div className="space-y-3">
                <MeetingCardSkeleton />
                <MeetingCardSkeleton />
                <MeetingCardSkeleton />
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                  📭
                </div>
                <p className="text-dark-400">
                  {searchQuery ? 'No meetings match your search.' : 'No meetings yet. Start your first meeting!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMeetings.map((meeting, index) => (
                  <MeetingItem key={meeting.id} meeting={meeting} index={index} onDelete={deleteMeeting} />
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {showTemplates && (
        <MeetingTemplates
          onSelect={async (template) => {
            setShowTemplates(false);
            await startMeeting(template);
            navigate('/live');
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}
      <OnboardingTour onComplete={() => toast.success('Welcome to MeetingAI!')} />
    </div>
  );
}
