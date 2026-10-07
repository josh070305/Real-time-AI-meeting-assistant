import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICIPANTS = [
  { name: 'Emery George', role: 'Host', isSpeaking: false, avatarBg: 'from-purple-500 to-indigo-600', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Angel Herwitz', role: 'Participant', isSpeaking: true, avatarBg: 'from-pink-500 to-rose-600', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { name: 'Craig Siphron', role: 'Participant', isSpeaking: false, avatarBg: 'from-blue-500 to-cyan-600', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { name: 'Jordyn Press', role: 'Participant', isSpeaking: false, avatarBg: 'from-emerald-500 to-teal-600', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'Erfan Amade', role: 'Participant', isSpeaking: false, avatarBg: 'from-amber-500 to-orange-600', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
];

export default function VideoStage({
  isListening,
  onToggleMic,
  duration,
  interimText,
  latestTranscriptText,
  onCopyLink,
  meetingTitle = 'Weekly Product & AI Design Review',
}) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  const [activeCaptions, setActiveCaptions] = useState('');

  useEffect(() => {
    if (interimText) {
      setActiveCaptions(interimText);
    } else if (latestTranscriptText) {
      setActiveCaptions(latestTranscriptText);
    }
  }, [interimText, latestTranscriptText]);

  return (
    <div className="relative flex flex-col flex-1 gap-4 overflow-hidden rounded-3xl border border-white/10 bg-dark-900/80 p-4 shadow-2xl backdrop-blur-2xl">
      {/* Top Header / Bar inside Stage */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            Recording {duration}
          </div>
          <h2 className="text-base font-semibold text-white truncate max-w-md">
            {meetingTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-dark-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ping 8ms
          </span>
          <button
            onClick={onCopyLink}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-dark-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012-2v-8a2 2 0 01-2-2h-8a2 2 0 01-2 2v8a2 2 0 012 2z" />
            </svg>
            Copy Link
          </button>
        </div>
      </div>

      {/* Grid of Top Participant Video Cards */}
      <div className="grid grid-cols-4 gap-3">
        {PARTICIPANTS.slice(1).map((p, idx) => (
          <div
            key={p.name || idx}
            className="group relative flex h-24 overflow-hidden rounded-2xl border border-white/10 bg-dark-800 shadow-md transition hover:border-brand-500/40"
          >
            <img
              src={p.img}
              alt={p.name}
              className="h-full w-full object-cover transition transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            
            {/* Top Status */}
            <div className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white backdrop-blur-md">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>

            {/* Bottom Label */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                {p.name}
              </span>
              {p.isSpeaking && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Speaker Video Stage */}
      <div className="relative flex-1 min-h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-dark-950 shadow-2xl">
        {isVideoOn ? (
          <div className="relative h-full w-full">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80"
              alt="Main Speaker"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-black/30" />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-dark-900 to-dark-950 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-600 text-3xl font-bold text-white shadow-xl shadow-brand-500/20">
              EG
            </div>
            <p className="mt-4 font-medium text-dark-300">Emery George (Camera off)</p>
          </div>
        )}

        {/* Closed Captioning Overlay floating over video */}
        {activeCaptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-xl rounded-2xl border border-white/20 bg-black/75 px-6 py-3 text-center text-sm font-medium text-white shadow-2xl backdrop-blur-xl"
          >
            <span className="mr-2 rounded bg-brand-500/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-brand-300">
              CC / Speaker
            </span>
            "{activeCaptions}"
          </motion.div>
        )}

        {/* Floating Join Request Notification Card */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="absolute top-4 right-4 w-64 rounded-2xl border border-white/10 bg-dark-900/90 p-4 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
                  Pending Join
                </span>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-dark-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="Ruben Dias"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Ruben Dias</p>
                  <p className="text-xs text-dark-400">Wants to join room</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowNotification(false)}
                  className="flex-1 rounded-xl bg-brand-500 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-brand-600"
                >
                  Admit
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className="flex-1 rounded-xl bg-rose-500/20 py-1.5 text-xs font-semibold text-rose-300 border border-rose-500/30 transition hover:bg-rose-500/30"
                >
                  Deny
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Stage Controls Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-dark-950/90 px-4 py-3 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {/* Mute Mic Button */}
          <button
            onClick={onToggleMic}
            className={`flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600'
                : 'border border-white/10 bg-white/5 text-dark-200 hover:bg-white/10'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {isListening ? 'Mute' : 'Unmute'}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOn((v) => !v)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
              isVideoOn
                ? 'border border-white/10 bg-white/5 text-dark-200 hover:bg-white/10'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* CC Captions */}
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-dark-200 transition hover:bg-white/10">
            <span className="font-bold text-xs">CC</span>
          </button>

          {/* Share Screen */}
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-dark-200 transition hover:bg-white/10">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Right Info Dock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            {PARTICIPANTS.map((p, idx) => (
              <img
                key={idx}
                src={p.img}
                alt={p.name}
                className="h-8 w-8 rounded-full border-2 border-dark-950 object-cover"
              />
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dark-950 bg-brand-500 text-xs font-semibold text-white">
              +36
            </div>
          </div>

          <span className="text-xs font-medium text-dark-400">
            Participants (41)
          </span>
        </div>
      </div>
    </div>
  );
}
