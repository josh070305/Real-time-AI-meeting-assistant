import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    target: '[data-tour-dashboard]',
    title: 'Dashboard',
    content: 'View your meeting history, stats, and start new meetings from here.',
  },
  {
    target: '[data-tour-search]',
    title: 'Search',
    content: 'Quickly find past meetings by searching titles and dates.',
  },
  {
    target: '[data-tour-start]',
    title: 'Start Meeting',
    content: 'Click here to begin a new live meeting with AI transcription.',
  },
];

export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card max-w-md rounded-3xl p-8 shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'bg-brand-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
            <p className="mb-6 text-sm text-dark-300">{step.content}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleComplete}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-dark-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl"
              >
                {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
