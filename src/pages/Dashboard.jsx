import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { PhoneCall, Clock, Users, BarChart3, LogOut, CreditCard, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

// Parser utility
function parseRawLogs(rawInput) {
  const entries = [];
  const splitEntries = rawInput.trim().split(/\n+/);
  const entryPattern =/^\+?(\d{10,20})\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)(?:,\s*(\d{2}:\d{2}:\d{2}))?$/;



  splitEntries.forEach((entry) => {
    const trimmed = entry.trim();
    const match = entryPattern.exec(trimmed);
    if (match) {
      const number = match[1];
      const timestamp = match[2];
      const durationStr = match[3];
      let durationSeconds = 0;
      if (durationStr) {
        const [h, m, s] = durationStr.split(":").map(Number);
        durationSeconds = h * 3600 + m * 60 + s;
      }
      entries.push({ number, timestamp, durationSeconds, durationFormatted: durationStr || "00:00:00" });
    }
  });
  return entries;
}

function formatSecondsToTime(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Dashboard() {
  const [rawInput, setRawInput] = useState('');
  const [calls, setCalls] = useState([]);
  const { currentUser, subscription } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAnalyze = () => {
    const parsed = parseRawLogs(rawInput);
    setCalls(parsed);
  };

  const stats = useMemo(() => {
    if (calls.length === 0) return null;

    const totalCalls = calls.length;
    const connected = calls.filter(c => c.durationSeconds > 0);
    const missed = totalCalls - connected.length;
    const totalDuration = calls.reduce((sum, c) => sum + c.durationSeconds, 0);
    const avgDuration = connected.length > 0 ? totalDuration / connected.length : 0;

    // Group by number
    const numberStats = {};
    calls.forEach(c => {
      if (!numberStats[c.number]) {
        numberStats[c.number] = { count: 0, duration: 0 };
      }
      numberStats[c.number].count++;
      numberStats[c.number].duration += c.durationSeconds;
    });

    const topNumbers = Object.entries(numberStats)
      .map(([number, stats]) => ({ number, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCalls,
      connected: connected.length,
      missed,
      totalDuration: formatSecondsToTime(totalDuration),
      avgDuration: formatSecondsToTime(Math.round(avgDuration)),
      topNumbers
    };
  }, [calls]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Connected', value: stats.connected, color: '#10b981' },
      { name: 'Missed', value: stats.missed, color: '#ef4444' }
    ];
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Call Analyzer Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {currentUser?.displayName || currentUser?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {subscription ? (
                <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium">
                  {subscription.planName} Plan Active
                </div>
              ) : (
                <button
                  onClick={() => navigate('/pricing')}
                  className="btn-primary flex items-center gap-2"
                >
                  <CreditCard size={18} />
                  Upgrade Plan
                </button>
              )}
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="text-primary-600 dark:text-primary-400" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Upload Call Logs
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Paste your call logs below in the format: Number, Date Time, Duration
          </p>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Example:
+919876543210  1/15/2024 9:30 AM, 00:05:30
+919876543211  1/15/2024 10:15 AM
+919876543210  1/15/2024 11:00 AM, 00:10:20"
            className="input-field min-h-[200px] font-mono text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={!rawInput.trim()}
            className="btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Calls
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Calls</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {stats.totalCalls}
                    </p>
                  </div>
                  <PhoneCall className="text-primary-600 dark:text-primary-400" size={40} />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                      {stats.connected}
                    </p>
                  </div>
                  <Users className="text-green-600 dark:text-green-400" size={40} />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {stats.totalDuration}
                    </p>
                  </div>
                  <Clock className="text-blue-600 dark:text-blue-400" size={40} />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {stats.avgDuration}
                    </p>
                  </div>
                  <BarChart3 className="text-purple-600 dark:text-purple-400" size={40} />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Call Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Top 5 Most Called Numbers
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topNumbers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="number" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Call Details Table */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Call Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {calls.map((call, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {call.number}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {call.timestamp}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {call.durationFormatted}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              call.durationSeconds > 0
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {call.durationSeconds > 0 ? 'Connected' : 'Missed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
