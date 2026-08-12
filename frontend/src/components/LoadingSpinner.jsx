import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`rounded-full border-brand-500 border-t-transparent ${sizeClasses[size]}`}
      />
      {text && <p className="text-sm text-dark-400">{text}</p>}
    </div>
  );
}
