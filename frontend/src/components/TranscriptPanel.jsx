import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const TranscriptEntry = ({ entry, isHighlighted }) => (
  <motion.div
    id={`segment-${entry.id}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-xl border p-4 transition-all duration-300 ${
      isHighlighted
        ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
        : 'border-white/5 bg-white/[0.02] hover:border-brand-500/20 hover:bg-white/[0.04]'
    }`}
  >
    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-dark-500">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-blue-500/20 text-xs font-semibold text-brand-300">
          {entry.speaker?.charAt(0) || '?'}
        </span>
        <span className="font-medium text-dark-400">{entry.speaker || 'Participant'}</span>
        {entry.id && (
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-dark-400">
            {entry.id}
          </span>
        )}
      </div>
      <span className="font-mono text-dark-500">
        {entry.timestamp || (entry.startMs ? `${Math.floor(entry.startMs / 1000)}s` : '')}
      </span>
    </div>
    <p className="text-sm leading-relaxed text-dark-200">{entry.text}</p>
  </motion.div>
);

const InterimBubble = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-xl border-2 border-dashed border-brand-500/30 bg-brand-500/5 p-4"
  >
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-400">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
      </span>
      Listening
    </div>
    <p className="mt-2 text-sm italic text-dark-300">{text}</p>
  </motion.div>
);

export default function TranscriptPanel({
  transcript = [],
  interimText = '',
  isListening = false,
  highlightedSegmentId = null,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (highlightedSegmentId) {
      const el = document.getElementById(`segment-${highlightedSegmentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedSegmentId]);

  return (
    <div className="flex h-[560px] flex-col rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-white">Live Transcript</h3>
          <p className="mt-0.5 text-sm text-dark-400">Real-time speech capture and segment streaming</p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
            isListening
              ? 'border border-brand-500/30 bg-brand-500/10 text-brand-300'
              : 'border border-white/10 bg-white/5 text-dark-400'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isListening ? 'animate-pulse bg-brand-500' : 'bg-dark-500'}`} />
          {isListening ? 'Listening…' : 'Idle'}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {transcript.length === 0 && !interimText ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 text-3xl">
              🎤
            </div>
            <p className="max-w-sm text-sm text-dark-300">
              Start speaking to see your meeting transcribed live.
            </p>
          </motion.div>
        ) : (
          <>
            {transcript.map((entry, idx) => {
              const entryObj = typeof entry === 'string' ? { id: `seg-${idx + 1}`, text: entry, speaker: 'Speaker' } : entry;
              const isMatch = highlightedSegmentId && entryObj.id === highlightedSegmentId;
              return (
                <TranscriptEntry
                  key={entryObj.id || idx}
                  entry={entryObj}
                  isHighlighted={isMatch}
                />
              );
            })}
            {interimText ? <InterimBubble text={interimText} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
