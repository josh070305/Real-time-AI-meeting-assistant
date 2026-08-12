import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import TranscriptPanel from '../components/TranscriptPanel';
import InsightsPanel from '../components/InsightsPanel';
import useMeetingStore from '../store/useMeetingStore';
import { useSocket } from '../hooks/useSocket';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import toast from 'react-hot-toast';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function LiveMeeting() {
  useKeyboardShortcuts();
  const navigate = useNavigate();
  const { connected, sendTranscriptChunk, stopMeetingSession, joinMeeting } = useSocket();
  const {
    isLive,
    transcript,
    interimText,
    insights,
    insightsLoading,
    isListening,
    meetingDuration,
    theme,
    error,
    setSummary,
    setView,
    stopMeeting,
    tickMeetingDuration,
    toggleTheme,
    setInsightsLoading,
    currentMeetingId,
  } = useMeetingStore();

  const timerRef = useRef(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      tickMeetingDuration();
    }, 1000);

    return () => {
      window.clearInterval(timerRef.current);
    };
  }, [isLive, tickMeetingDuration]);

  useEffect(() => {
    if (isLive && currentMeetingId) {
      joinMeeting?.(currentMeetingId);
    }
  }, [isLive, currentMeetingId, joinMeeting]);

  const handleTranscriptChunk = useCallback((text) => {
    if (!text) {
      return;
    }

    setInsightsLoading(true);
    sendTranscriptChunk?.(text);
  }, [sendTranscriptChunk, setInsightsLoading]);

  const { supported, startListening, stopListening } = useSpeechRecognition(handleTranscriptChunk);

  const onStop = async () => {
    const summaryPayload = {
      overview: 'Live meeting captured and summarized by the assistant.',
      keyPoints: insights.key_points,
      actionItems: insights.action_items,
      decisions: insights.decisions,
    };

    const meetingId = currentMeetingId || 'demo-meeting';
    const transcriptText = transcript.map((entry) => `${entry.timestamp} — ${entry.text}`).join('\n');

    stopListening();

    if (!connected) {
      toast.error('Not connected to server. Meeting not saved.');
      stopMeeting();
      navigate('/summary');
      return;
    }

    try {
      setSaving(true);
      toast.loading('Saving meeting...', { id: 'saving-meeting' });
      const savedMeetingId = await stopMeetingSession?.(meetingId, transcriptText, summaryPayload, meetingDuration);
      
      if (savedMeetingId) {
        toast.success('Meeting saved successfully', { id: 'saving-meeting' });
        setSummary(summaryPayload);
        stopMeeting();
        navigate('/summary');
      } else {
        toast.error('Failed to save meeting', { id: 'saving-meeting' });
      }
    } catch (err) {
      toast.error('Error saving meeting', { id: 'saving-meeting' });
    } finally {
      setSaving(false);
    }
  };

  const durationLabel = useMemo(() => formatDuration(meetingDuration), [meetingDuration]);

  const handleBackToDashboard = () => {
    stopListening();
    stopMeeting();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 right-20 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TopBar
            connected={connected}
            duration={durationLabel}
            isListening={isListening}
            onStop={onStop}
            onToggleMic={() => (isListening ? stopListening() : startListening())}
            onToggleTheme={toggleTheme}
            onBackToDashboard={handleBackToDashboard}
            theme={theme}
            saving={saving}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-500/10 to-blue-500/10 p-4 backdrop-blur-sm sm:p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/20">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <p className="font-semibold text-brand-200">Live meeting tips</p>
              <ul className="mt-2 space-y-1 text-sm text-dark-300">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                  Click the mic button to start listening.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                  Allow microphone access in your browser prompt.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                  Speak clearly once the status says Listening…
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {!supported ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-warning-500/30 bg-warning-500/10 p-4 text-sm text-warning-200"
          >
            Your browser does not support live speech recognition. Please use Chrome for the full experience.
          </motion.div>
        ) : null}
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-error-500/30 bg-error-500/10 p-4 text-sm text-error-200"
          >
            {error}
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]"
        >
          <TranscriptPanel transcript={transcript} interimText={interimText} isListening={isListening} />
          <InsightsPanel insights={insights} isLoading={insightsLoading} />
        </motion.div>
      </main>
    </div>
  );
}
