import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, fullName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-dark-950 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-900/40 via-dark-950 to-dark-950" />
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 h-96 w-96 animate-float rounded-full bg-accent-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-float rounded-full bg-brand-600/20 blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-brand-600 shadow-xl shadow-accent-500/30">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">MeetingAI</h2>
                <p className="text-sm text-dark-400">Smart meetings, simplified</p>
              </div>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-white">
              Start your{' '}
              <span className="gradient-text">meeting revolution</span>
            </h1>
            <p className="mb-10 max-w-lg text-lg text-dark-300 text-balance">
              Join thousands of teams who have already transformed how they capture, share, and act on meeting insights.
            </p>

            <div className="space-y-4">
              {[
                { icon: '🚀', title: 'Get started in seconds', desc: 'No credit card required. Free forever plan available.' },
                { icon: '🔒', title: 'Enterprise-grade security', desc: 'Your data is encrypted and protected at all times.' },
                { icon: '💬', title: '24/7 expert support', desc: 'Our team is here to help you succeed anytime.' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.15 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm text-dark-400">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-16 right-16">
          <div className="flex items-center gap-6 text-sm text-dark-500">
            <span>Trusted by 10,000+ teams</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="h-4 w-4 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-dark-950 lg:w-1/2">
        <div className="absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -top-40 -left-40 h-80 w-80 animate-float rounded-full bg-accent-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-float rounded-full bg-brand-600/20 blur-3xl" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md px-6 py-12 lg:px-8"
        >
          <div className="mb-10 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-brand-600 shadow-xl shadow-accent-500/30">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">MeetingAI</h1>
            <p className="mt-2 text-sm text-dark-400">Smart meetings, simplified</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Create account</h2>
            <p className="mt-2 text-sm text-dark-400">Get started with your free account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-error-500/30 bg-error-500/10 p-4 text-sm text-error-300"
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-dark-400">
                Full name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-white/30 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="John Doe"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-dark-400">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 00-9-9m0 0a9 9 0 00-9 9v.5" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-white/30 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-dark-400">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-12 text-white placeholder-white/30 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-dark-400 hover:text-white"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-2"
            >
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
              <span className="text-sm text-dark-300">
                I agree to the{' '}
                <button type="button" className="font-medium text-brand-400 underline transition-colors duration-200 hover:text-brand-300">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="font-medium text-brand-400 underline transition-colors duration-200 hover:text-brand-300">
                  Privacy Policy
                </button>
              </span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-accent-600 to-brand-600 py-3.5 font-semibold text-white shadow-lg shadow-accent-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/40 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 space-y-4"
          >
            <button
              onClick={() => navigate('/login')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-brand-500/30 hover:bg-white/10"
            >
              Already have an account? Sign in
            </button>
            <p className="text-center text-xs text-dark-500">
              Free forever plan available. No credit card required.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
