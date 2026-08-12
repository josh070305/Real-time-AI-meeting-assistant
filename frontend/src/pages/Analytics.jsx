import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import useMeetingStore from '../store/useMeetingStore';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ label, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="rounded-2xl bg-gradient-to-br p-6 shadow-lg"
  >
    <p className="text-sm font-medium text-white/80">{label}</p>
    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    <div className="mt-2 text-2xl opacity-50">{icon}</div>
  </motion.div>
);

export default function Analytics() {
  const { meetings } = useMeetingStore();

  const stats = useMemo(() => {
    const total = meetings.length;
    const totalWords = meetings.reduce((acc, m) => acc + (m.wordCount || 0), 0);
    const totalMinutes = meetings.reduce((acc, m) => acc + (parseInt(m.duration) || 0), 0);
    const avgDuration = total > 0 ? Math.round(totalMinutes / total) : 0;

    const statusCounts = meetings.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});

    const recentMeetings = meetings.slice(0, 7);
    const maxWords = Math.max(...recentMeetings.map((m) => m.wordCount || 0), 1);

    return { total, totalWords, totalMinutes, avgDuration, statusCounts, recentMeetings, maxWords };
  }, [meetings]);

  const addToCalendar = (meeting) => {
    const date = new Date(meeting.createdAt);
    const start = date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(date.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', meeting.title);
    url.searchParams.set('dates', `${start}/${end}`);
    url.searchParams.set('details', `Meeting duration: ${meeting.duration}\nWord count: ${meeting.wordCount || 0}`);

    window.open(url.toString(), '_blank');
    toast.success('Opening Google Calendar');
  };

  const barData = useMemo(() => {
    const labels = stats.recentMeetings.map((m) => m.title).reverse();
    const data = stats.recentMeetings.map((m) => m.wordCount || 0).reverse();

    return {
      labels,
      datasets: [
        {
          label: 'Words',
          data,
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [stats.recentMeetings]);

  const doughnutData = useMemo(() => {
    const labels = Object.keys(stats.statusCounts);
    const data = Object.values(stats.statusCounts);
    const colors = [
      'rgba(139, 92, 246, 0.8)',
      'rgba(96, 165, 250, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, data.length),
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2,
        },
      ],
    };
  }, [stats.statusCounts]);

  const lineData = useMemo(() => {
    const labels = stats.recentMeetings.map((m) => m.date).reverse();
    const data = stats.recentMeetings.map((m) => parseInt(m.duration) || 0).reverse();

    return {
      labels,
      datasets: [
        {
          label: 'Minutes',
          data,
          borderColor: 'rgba(96, 165, 250, 1)',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(96, 165, 250, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    };
  }, [stats.recentMeetings]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-dark-950 to-dark-950" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-gradient-to-br from-brand-600/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="mt-2 text-sm text-dark-400"> insights and meeting statistics</p>
        </motion.div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Meetings" value={stats.total} icon="📊" color="from-brand-600 to-brand-700" delay={0.1} />
          <StatCard label="Total Words" value={stats.totalWords.toLocaleString()} icon="📝" color="from-blue-600 to-brand-600" delay={0.2} />
          <StatCard label="Total Minutes" value={stats.totalMinutes} icon="⏱️" color="from-success-600 to-success-700" delay={0.3} />
          <StatCard label="Avg Duration" value={`${stats.avgDuration} min`} icon="📈" color="from-warning-600 to-warning-700" delay={0.4} />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-3xl p-6 shadow-2xl"
          >
            <h2 className="mb-4 text-lg font-bold text-white">Word Count by Meeting</h2>
            <div className="h-72">
              <Bar data={barData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-3xl p-6 shadow-2xl"
          >
            <h2 className="mb-4 text-lg font-bold text-white">Meeting Status</h2>
            <div className="h-72">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card rounded-3xl p-6 shadow-2xl"
          >
            <h2 className="mb-4 text-lg font-bold text-white">Duration Trend</h2>
            <div className="h-72">
              <Line data={lineData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card rounded-3xl p-6 shadow-2xl"
          >
            <h2 className="mb-6 text-xl font-bold text-white">Recent Activity</h2>
            <div className="space-y-4">
              {stats.recentMeetings.map((meeting, index) => (
                <div key={meeting.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div>
                    <p className="font-medium text-white">{meeting.title}</p>
                    <p className="text-xs text-dark-400">{meeting.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-brand-400">{meeting.wordCount || 0} words</p>
                      <p className="text-xs text-dark-400">{meeting.duration}</p>
                    </div>
                    <button
                      onClick={() => addToCalendar(meeting)}
                      className="rounded-lg p-2 text-dark-400 transition-colors hover:text-brand-300"
                      title="Add to Google Calendar"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
