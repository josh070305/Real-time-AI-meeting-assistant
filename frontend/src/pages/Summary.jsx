import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useMeetingStore from '../store/useMeetingStore';
import toast from 'react-hot-toast';
import { API_URL } from '../lib/api';

const SectionCard = ({ title, children, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card rounded-2xl p-6"
  >
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 text-xl">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    {children}
  </motion.div>
);

export default function Summary() {
  const navigate = useNavigate();
  const { summary, transcript, insights, setView, theme } = useMeetingStore();

  const shareViaEmail = async () => {
    const email = prompt('Enter email address to share this summary:');
    if (!email) return;

    const token = localStorage.getItem('token');
    const meetingId = useMeetingStore.getState().currentMeetingId;

    if (!meetingId) {
      toast.error('No meeting to share');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/meetings/${meetingId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || data.error || 'Failed to share meeting');
      }

      toast.success('Meeting shared successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const summaryText = useMemo(() => {
    const overview = summary?.overview || 'No overview available.';
    const keyPoints = (summary?.keyPoints || insights.key_points || []).map((point) => `• ${point}`).join('\n');
    const actionItems = (summary?.actionItems || insights.action_items || []).map((item) => `• ${item.task || item}`).join('\n');
    const decisions = (summary?.decisions || insights.decisions || []).map((decision) => `• ${decision}`).join('\n');
    const transcriptText = transcript.map((entry) => `${entry.timestamp} — ${entry.text}`).join('\n');

    return `Meeting recap\n\nOverview:\n${overview}\n\nKey points:\n${keyPoints || 'None'}\n\nAction items:\n${actionItems || 'None'}\n\nDecisions:\n${decisions || 'None'}\n\nTranscript:\n${transcriptText || 'None'}`;
  }, [insights, summary, transcript]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summaryText);
    toast.success('Summary copied to clipboard');
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
            <button onClick={shareViaEmail} className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-dark-300 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share
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
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Post-meeting summary</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Meeting recap</h1>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionCard title="Overview" icon="📝" delay={0.2}>
              <p className="text-sm leading-relaxed text-dark-300">
                {summary?.overview || 'Your completed meeting summary will appear here.'}
              </p>
            </SectionCard>

            <SectionCard title="Key Points" icon="✨" delay={0.3}>
              <ul className="space-y-3">
                {(summary?.keyPoints || insights.key_points || []).map((point, index) => (
                  <motion.li
                    key={`${point}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <span className="text-sm text-dark-200">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Action Items" icon="✅" delay={0.4}>
              <ul className="space-y-3">
                {(summary?.actionItems || insights.action_items || []).map((item, index) => (
                  <motion.li
                    key={`${item.task || item}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-lg border-2 border-brand-500/50" />
                    <div>
                      <p className="text-sm text-dark-200">{item.task || item}</p>
                      {item.assignee && (
                        <p className="mt-1 text-xs text-dark-500">Assigned to {item.assignee}</p>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Decisions" icon="🎯" delay={0.5}>
              <ul className="space-y-3">
                {(summary?.decisions || insights.decisions || []).map((decision, index) => (
                  <motion.li
                    key={`${decision}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-start gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4"
                  >
                    <span className="mt-0.5 text-brand-400">✓</span>
                    <span className="text-sm text-dark-200">{decision}</span>
                  </motion.li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Transcript" icon="🎙️" delay={0.6}>
              <div className="space-y-3">
                {transcript.length === 0 ? (
                  <p className="text-sm text-dark-400">No transcript captured.</p>
                ) : (
                  transcript.slice(-6).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-brand-400">{entry.timestamp}</p>
                      <p className="mt-2 text-sm text-dark-200">{entry.text}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
