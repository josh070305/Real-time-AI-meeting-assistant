import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success('Account deleted');
      logout();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-dark-950 to-dark-950" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-gradient-to-br from-brand-600/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 shadow-2xl"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="mt-2 text-sm text-dark-400">Manage your account settings and preferences</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="mb-8 space-y-6">
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-dark-400">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-dark-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40 disabled:opacity-50"
            >
              Update Profile
            </motion.button>
          </form>

          <form onSubmit={handleChangePassword} className="mb-8 space-y-6">
            <h2 className="text-lg font-semibold text-white">Change Password</h2>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-dark-400">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-dark-400">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40 disabled:opacity-50"
            >
              Change Password
            </motion.button>
          </form>

          <div className="border-t border-white/10 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-error-300">Danger Zone</h2>
            <button
              onClick={handleDeleteAccount}
              className="rounded-xl border border-error-500/30 bg-error-500/10 px-6 py-3 font-semibold text-error-300 transition-all duration-300 hover:bg-error-500/20"
            >
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
