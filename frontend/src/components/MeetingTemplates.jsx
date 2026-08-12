import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const templates = [
  {
    id: 'general',
    name: 'General Meeting',
    description: 'Standard meeting with transcription and AI summary',
    icon: '📋',
    questions: ['What was discussed?', 'What are the next steps?'],
  },
  {
    id: 'standup',
    name: 'Daily Standup',
    description: 'Quick sync on progress, blockers, and plans',
    icon: '⚡',
    questions: ['What did you complete yesterday?', 'What will you work on today?', 'Any blockers?'],
  },
  {
    id: 'interview',
    name: 'Interview',
    description: 'Candidate evaluation and feedback capture',
    icon: '🎤',
    questions: ['Key strengths observed', 'Areas for improvement', 'Overall assessment'],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming',
    description: 'Creative idea generation and evaluation',
    icon: '💡',
    questions: ['Ideas generated', 'Top 3 concepts', 'Action items and owners'],
  },
  {
    id: 'review',
    name: 'Code Review',
    description: 'Technical review and feedback session',
    icon: '💻',
    questions: ['Changes reviewed', 'Bugs found', 'Approval status'],
  },
  {
    id: '1on1',
    name: '1:1 Meeting',
    description: 'Manager and direct report check-in',
    icon: '🤝',
    questions: ['Career growth discussion', 'Feedback given', 'Action items'],
  },
];

export default function MeetingTemplates({ onSelect, onClose }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (template) => {
    setSelected(template.id);
    setTimeout(() => {
      onSelect?.(template);
      onClose?.();
      toast.success(`Started ${template.name} template`);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card max-w-4xl w-full mx-4 rounded-3xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Choose a Meeting Template</h2>
          <p className="mt-2 text-sm text-dark-400">Select a template to get started with a pre-configured meeting structure</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(template)}
              className={`rounded-2xl border p-6 text-left transition-all duration-300 ${
                selected === template.id
                  ? 'border-brand-500/50 bg-brand-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div className="mb-3 text-3xl">{template.icon}</div>
              <h3 className="mb-1 font-semibold text-white">{template.name}</h3>
              <p className="mb-3 text-xs text-dark-400">{template.description}</p>
              <div className="space-y-1">
                {template.questions.slice(0, 2).map((q, i) => (
                  <p key={i} className="text-xs text-dark-500">
                    • {q}
                  </p>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-dark-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
