import { motion } from 'framer-motion';

export default function TopBar({ connected, duration, isListening, onStop, onToggleMic, onToggleTheme, onBackToDashboard, theme, saving }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {onBackToDashboard && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToDashboard}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-dark-300 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
        )}
        <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${connected ? 'border border-success-500/30 bg-success-500/10 text-success-300' : 'border border-error-500/30 bg-error-500/10 text-error-300'}`}>
          <span className={`relative flex h-2.5 w-2.5`}>
            {connected && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${connected ? 'bg-success-500' : 'bg-error-500'}`} />
          </span>
          {connected ? 'Connected' : 'Offline'}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
          <svg className="h-4 w-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-dark-300">{duration}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <div className="flex -space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-600 text-xs font-semibold text-white ring-2 ring-dark-900">
              Y
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-brand-600 text-xs font-semibold text-white ring-2 ring-dark-900">
              A
            </div>
          </div>
          <span className="ml-1 text-xs text-dark-400">2 online</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleMic}
          data-mute-btn
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
            isListening
              ? 'border border-brand-500/30 bg-brand-500/20 text-brand-300'
              : 'border border-white/10 bg-white/5 text-dark-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {isListening ? 'Mute Mic' : 'Unmute Mic'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleTheme}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-dark-300 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          data-stop-btn
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-error-600 to-error-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-error-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-error-500/40 disabled:opacity-50"
        >
          {saving ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          )}
          {saving ? 'Saving...' : 'Stop Meeting'}
        </motion.button>
      </div>
    </div>
  );
}
