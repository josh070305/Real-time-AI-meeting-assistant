import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function SidebarNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Live Meeting', path: '/live', icon: '📹', badge: 'Live' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-white/10 bg-dark-900/90 p-5 backdrop-blur-2xl">
      {/* Brand Header */}
      <div>
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-brand-500 to-indigo-600 text-xl font-black text-white shadow-lg shadow-brand-500/30">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">VirtuAI</h1>
            <p className="text-[11px] font-medium text-dark-400">Meeting Intelligence</p>
          </div>
        </div>

        {/* Start Meeting Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/live')}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:shadow-xl hover:shadow-teal-500/35"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Start Video Call
        </motion.button>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-md'
                    : 'text-dark-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300 animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile Footer Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User Avatar"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-500/40"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-dark-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {user?.fullName || 'Emery George'}
            </p>
            <p className="truncate text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span>✓ Admin</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
