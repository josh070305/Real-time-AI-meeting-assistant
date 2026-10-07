import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';
import VideoStage from '../components/VideoStage';
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
    setSummary,
    stopMeeting,
    tickMeetingDuration,
    setInsightsLoading,
    currentMeetingId,
  } = useMeetingStore();

  const timerRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'transcript'
  const [highlightedSegmentId, setHighlightedSegmentId] = useState(null);

  useEffect(() => {
    if (!isLive) return;

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

  const handleTranscriptChunk = useCallback(
    (text) => {
      if (!text) return;
      setInsightsLoading(true);
      sendTranscriptChunk?.(text);
    },
    [sendTranscriptChunk, setInsightsLoading]
  );

  const { supported, startListening, stopListening } = useSpeechRecognition(handleTranscriptChunk);

  const onStop = async () => {
    const summaryPayload = {
      overview: 'Live meeting captured and summarized by the assistant.',
      keyPoints: insights.key_points || [],
      actionItems: insights.action_items || [],
      decisions: insights.decisions || [],
    };

    const meetingId = currentMeetingId || 'demo-meeting';
    const transcriptText = transcript.map((entry) => `${entry.timestamp || ''} — ${entry.text || entry}`).join('\n');

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

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Meeting link copied to clipboard!');
  };

  const latestTranscriptText = useMemo(() => {
    if (transcript.length === 0) return '';
    const last = transcript[transcript.length - 1];
    return typeof last === 'string' ? last : last.text || '';
  }, [transcript]);

  const handleSeekSegment = (segmentId) => {
    setActiveTab('transcript');
    setHighlightedSegmentId(segmentId);
    toast.success(`Seeking to segment ${segmentId}`);
  };

  return (
    <div className="flex min-h-screen bg-dark-950 text-white font-sans antialiased overflow-x-hidden">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Studio Stage & Right Sidebar Grid */}
      <main className="flex flex-1 gap-6 p-6 overflow-hidden">
        {/* Central Realistic Video Stage */}
        <VideoStage
          isListening={isListening}
          onToggleMic={() => (isListening ? stopListening() : startListening())}
          duration={durationLabel}
          interimText={interimText}
          latestTranscriptText={latestTranscriptText}
          onCopyLink={handleCopyLink}
          meetingTitle="Weekly Product & AI Design Review"
        />

        {/* Right Intelligence & Transcript Panel */}
        <div className="flex w-96 flex-col gap-4">
          {/* Header Bar with Action Buttons */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-dark-900/90 p-2.5 backdrop-blur-xl">
            <div className="flex gap-1 rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setActiveTab('insights')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'insights'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                ✨ AI Insights
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'transcript'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                📜 Transcript
              </button>
            </div>

            {/* End Call Button */}
            <button
              onClick={onStop}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-700 disabled:opacity-50"
            >
              {saving ? (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'End Meeting'
              )}
            </button>
          </div>

          {!supported && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              Browser speech recognition unavailable. Switch to Chrome for live mic input.
            </div>
          )}

          {/* Active Panel View */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'insights' ? (
              <InsightsPanel
                insights={insights}
                isLoading={insightsLoading}
                onSeekSegment={handleSeekSegment}
              />
            ) : (
              <TranscriptPanel
                transcript={transcript}
                interimText={interimText}
                isListening={isListening}
                highlightedSegmentId={highlightedSegmentId}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
