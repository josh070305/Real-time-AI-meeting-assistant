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

export default function InsightsPanel({ insights, isLoading }) {
  const [checkedItems, setCheckedItems] = useState([]);

  const toggleItem = (item) => {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );
  };

  return (
    <div className="flex h-[560px] flex-col rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/5 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Insights</h3>
            <p className="mt-0.5 text-sm text-dark-400">AI-powered meeting analysis</p>
          </div>
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

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-400">
            <span className="text-sm">✨</span>
            Key Points
          </h4>
          {insights.key_points.length === 0 ? (
            <p className="text-sm text-dark-400">No insights yet. Keep speaking and the assistant will update them.</p>
          ) : (
            <ul className="space-y-2">
              {insights.key_points.map((point, index) => (
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

        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-400">
            <span className="text-sm">✅</span>
            Action Items
          </h4>
          {insights.action_items.length === 0 ? (
            <p className="text-sm text-dark-400">No action items extracted yet.</p>
          ) : (
            <ul className="space-y-2">
              {insights.action_items.map((item, index) => {
                const label = item.task || item;
                const checked = checkedItems.includes(label);
                return (
                  <InsightItem key={`${label}-${index}`} delay={index * 0.05}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(label)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-dark-800 text-brand-500 transition-colors duration-200 focus:ring-2 focus:ring-brand-500/20"
                      />
                      <div className="flex-1">
                        <p className={`text-sm transition-colors duration-300 ${checked ? 'text-dark-500 line-through' : 'text-dark-200'}`}>
                          {label}
                        </p>
                        {item.assignee && (
                          <p className="mt-1 text-xs text-dark-500">Assigned to {item.assignee}</p>
                        )}
                      </div>
                    </div>
                  </InsightItem>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-400">
            <span className="text-sm">🎯</span>
            Decisions
          </h4>
          {insights.decisions.length === 0 ? (
            <p className="text-sm text-dark-400">No decisions captured yet.</p>
          ) : (
            <ul className="space-y-2">
              {insights.decisions.map((decision, index) => (
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
      </div>
    </div>
  );
}
