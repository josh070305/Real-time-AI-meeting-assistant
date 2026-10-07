import { motion } from 'framer-motion';
import { useState } from 'react';

const InsightItem = ({ children, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:border-brand-500/20 hover:bg-white/[0.04]"
  >
    {children}
  </motion.div>
);

const SentimentBadge = ({ sentiment }) => {
  const styles = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    mixed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    neutral: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const label = sentiment ? sentiment.toUpperCase() : 'NEUTRAL';
  const style = styles[sentiment] || styles.neutral;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
};

export default function InsightsPanel({ insights = {}, isLoading, onSeekSegment }) {
  const [checkedItems, setCheckedItems] = useState([]);

  const keyPoints = insights.key_points || insights.keyPoints || [];
  const actionItems = insights.action_items || insights.actionItems || [];
  const decisions = insights.decisions || [];
  const openQuestions = insights.open_questions || insights.openQuestions || [];
  const sentiment = insights.sentiment || 'neutral';
  const aiStatus = insights.aiStatus || 'completed';

  const toggleItem = (itemKey) => {
    setCheckedItems((current) =>
      current.includes(itemKey) ? current.filter((val) => val !== itemKey) : [...current, itemKey]
    );
  };

  return (
    <div className="flex h-[560px] flex-col rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/5 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Insights</h3>
              <SentimentBadge sentiment={sentiment} />
            </div>
            <p className="mt-0.5 text-sm text-dark-400">AI-powered structured meeting intelligence</p>
          </div>
          <div className="flex items-center gap-2">
            {aiStatus === 'unavailable' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
                ⚠️ AI Degrading
              </span>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-brand-300">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Thinking…
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Summary Overview */}
        {insights.summary && (
          <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              Executive Summary
            </h4>
            <p className="text-sm leading-relaxed text-dark-200">{insights.summary}</p>
          </div>
        )}

        {/* Action Items */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-400">
            <span className="text-sm">✅</span>
            Action Items ({actionItems.length})
          </h4>
          {actionItems.length === 0 ? (
            <p className="text-sm text-dark-400">No action items extracted yet.</p>
          ) : (
            <ul className="space-y-2">
              {actionItems.map((item, index) => {
                const taskText = typeof item === 'string' ? item : item.task || '';
                const owner = typeof item === 'object' ? item.owner || item.assignee : null;
                const due = typeof item === 'object' ? item.due : null;
                const segId = typeof item === 'object' ? item.sourceSegmentId : null;
                const itemKey = `${taskText}-${index}`;
                const checked = checkedItems.includes(itemKey);

                return (
                  <InsightItem key={itemKey} delay={index * 0.05}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(itemKey)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-dark-800 text-brand-500 transition-colors focus:ring-2 focus:ring-brand-500/20"
                      />
                      <div className="flex-1">
                        <p className={`text-sm transition-colors ${checked ? 'text-dark-500 line-through' : 'text-dark-200'}`}>
                          {taskText}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {owner && (
                            <span className="inline-flex items-center rounded bg-white/5 px-2 py-0.5 text-xs text-dark-300">
                              👤 {owner}
                            </span>
                          )}
                          {due && (
                            <span className="inline-flex items-center rounded bg-white/5 px-2 py-0.5 text-xs text-amber-300">
                              📅 {due}
                            </span>
                          )}
                          {segId && (
                            <button
                              type="button"
                              onClick={() => onSeekSegment && onSeekSegment(segId)}
                              className="inline-flex items-center rounded bg-brand-500/10 px-2 py-0.5 text-xs text-brand-300 transition-colors hover:bg-brand-500/20 hover:text-brand-200"
                            >
                              📍 Seek [{segId}]
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </InsightItem>
                );
              })}
            </ul>
          )}
        </div>

        {/* Key Points */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-400">
            <span className="text-sm">✨</span>
            Key Points ({keyPoints.length})
          </h4>
          {keyPoints.length === 0 ? (
            <p className="text-sm text-dark-400">No key points captured yet.</p>
          ) : (
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <InsightItem key={`${point}-${index}`} delay={index * 0.05}>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <span className="text-sm text-dark-200">{point}</span>
                  </div>
                </InsightItem>
              ))}
            </ul>
          )}
        </div>

        {/* Decisions */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-400">
            <span className="text-sm">🎯</span>
            Decisions ({decisions.length})
          </h4>
          {decisions.length === 0 ? (
            <p className="text-sm text-dark-400">No decisions captured yet.</p>
          ) : (
            <ul className="space-y-2">
              {decisions.map((decision, index) => (
                <InsightItem key={`${decision}-${index}`} delay={index * 0.05}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-success-500/20 text-xs text-success-300">✓</span>
                    <span className="text-sm text-dark-200">{decision}</span>
                  </div>
                </InsightItem>
              ))}
            </ul>
          )}
        </div>

        {/* Open Questions */}
        {openQuestions.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-400">
              <span className="text-sm">❓</span>
              Open Questions ({openQuestions.length})
            </h4>
            <ul className="space-y-2">
              {openQuestions.map((question, index) => (
                <InsightItem key={`${question}-${index}`} delay={index * 0.05}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-xs text-amber-400">❓</span>
                    <span className="text-sm text-dark-200">{question}</span>
                  </div>
                </InsightItem>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
