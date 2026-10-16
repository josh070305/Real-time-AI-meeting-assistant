import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import useMeetingStore from '../store/useMeetingStore';
import toast from 'react-hot-toast';
import { API_URL } from '../lib/api';

const StatCard = ({ label, value, icon, color }) => (
  <div className={`rounded-2xl bg-gradient-to-br ${color} p-6 shadow-lg`}>
    <p className="text-sm font-medium text-white/80">{label}</p>
    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    <div className="mt-2 text-2xl opacity-50">{icon}</div>
  </div>
);

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings } = useMeetingStore();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = meetings.find((m) => m.id === id);
    if (found) {
      setMeeting(found);
      setLoading(false);
    } else {
      fetch(`${API_URL}/api/meetings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Meeting not found');
          return res.json();
        })
        .then((data) => {
          setMeeting({
            id: data._id,
            title: data.title,
            date: new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            duration: data.duration || '0 min',
            status: data.status || 'completed',
            transcript: data.transcript,
            summary: data.summary,
            wordCount: data.wordCount || 0,
          });
        })
        .catch(() => {
          toast.error('Meeting not found');
          navigate('/');
        })
        .finally(() => setLoading(false));
    }
  }, [id, meetings, navigate]);

  const copyToClipboard = async () => {
    if (!meeting?.summary) return;
    const text = `Meeting: ${meeting.title}\n\nOverview: ${meeting.summary.overview || 'N/A'}\n\nKey Points:\n${(meeting.summary.keyPoints || []).map((p) => `• ${p}`).join('\n') || 'None'}\n\nAction Items:\n${(meeting.summary.actionItems || []).map((a) => `• ${a.task || a}`).join('\n') || 'None'}\n\nDecisions:\n${(meeting.summary.decisions || []).map((d) => `• ${d}`).join('\n') || 'None'}`;
    await navigator.clipboard.writeText(text);
    toast.success('Summary copied to clipboard');
  };

  const exportPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-dark-950 to-dark-950" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
        >
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-dark-300 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button onClick={copyToClipboard} className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-dark-300 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button onClick={exportPdf} className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Meeting Details</p>
          <h1 className="mt-2 text-4xl font-bold text-white">{meeting.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-dark-400">
            <span>📅 {meeting.date}</span>
            <span>⏱️ {meeting.duration}</span>
            <span>📊 {meeting.wordCount} words</span>
            <span className="rounded-full border border-success-500/30 bg-success-500/10 px-3 py-1 text-xs font-medium text-success-300">
              {meeting.status}
            </span>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard label="Duration" value={meeting.duration} icon="⏱️" color="from-brand-600 to-brand-700" />
          <StatCard label="Word Count" value={meeting.wordCount} icon="📝" color="from-blue-600 to-brand-600" />
          <StatCard label="Status" value={meeting.status} icon="✅" color="from-success-600 to-success-700" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="mb-6 text-xl font-bold text-white">Summary</h2>
            {meeting.summary ? (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-400">Overview</h3>
                  <p className="text-sm leading-relaxed text-dark-300">{meeting.summary.overview || 'No overview available.'}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-400">Key Points</h3>
                  <ul className="space-y-2">
                    {(meeting.summary.keyPoints || []).map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-400">Action Items</h3>
                  <ul className="space-y-2">
                    {(meeting.summary.actionItems || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-warning-500" />
                        {item.task || item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-400">Decisions</h3>
                  <ul className="space-y-2">
                    {(meeting.summary.decisions || []).map((decision, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dark-200">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-success-500" />
                        {decision}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-dark-400">No summary available for this meeting.</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="mb-6 text-xl font-bold text-white">Transcript</h2>
            {meeting.transcript ? (
              <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
                {meeting.transcript.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-sm text-dark-300">{line}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-400">No transcript available for this meeting.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
