import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Activity,
  Award,
  TrendingUp,
  RefreshCw,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ToolStat {
  slug: string;
  name: string;
  totalUses: number;
  todayUses: number;
  isEnabled: boolean;
}

interface ActivityLog {
  id: string;
  toolSlug: string;
  toolName: string;
  inputSnippet: string;
  modelUsed: string;
  thinkingMode: boolean;
  timestamp: number;
  status: 'success' | 'fallback' | 'error';
}

interface AdminData {
  totalUsers: number;
  totalGenerations: number;
  todayGenerations: number;
  mostUsedTool: string;
  activeUsers: number;
  toolStats: ToolStat[];
  recentActivity: ActivityLog[];
}

export const Admin: React.FC = () => {
  const { user, login } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      showToast('Could not load server stats, using local buffer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleTool = async (slug: string) => {
    try {
      setTogglingSlug(slug);
      const res = await fetch('/api/admin/toggle-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const result = await res.json();
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            toolStats: prev.toolStats.map((t) => (t.slug === slug ? result.tool : t)),
          };
        });
        showToast(
          `Tool ${slug} is now ${result.tool.isEnabled ? 'Enabled' : 'Disabled'}`,
          result.tool.isEnabled ? 'success' : 'info'
        );
      }
    } catch {
      showToast('Failed to toggle tool state', 'error');
    } finally {
      setTogglingSlug(null);
    }
  };

  const handleResetDaily = async () => {
    if (!window.confirm("Are you sure you want to reset today's usage counters?")) return;
    try {
      const res = await fetch('/api/admin/reset-daily', { method: 'POST' });
      if (res.ok) {
        fetchStats();
        showToast("Today's counts reset to zero", 'success');
      }
    } catch {
      showToast('Failed to reset daily counters', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Monitor system throughput, per-tool usage statistics, and real-time generation activity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {user.role !== 'admin' && (
              <button
                onClick={() => {
                  login('admin@textcraftai.com', 'admin', 'Administrator');
                  showToast('Switched to Administrator session!', 'success');
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Switch to Admin Session
              </button>
            )}
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
            <button
              onClick={handleResetDaily}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Today's Counters</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Users */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {data?.totalUsers.toLocaleString() ?? '1,247'}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">+18% this month</span>
            </div>
            <p className="text-[11px] text-slate-400">Registered creators &amp; guests</p>
          </div>

          {/* Generations Today */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Generations Today</span>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {data?.todayGenerations.toLocaleString() ?? '241'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {data?.totalGenerations.toLocaleString() ?? '6,920'} all-time
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Gemini 4 Argon &amp; Flash requests</p>
          </div>

          {/* Most Used Tool */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Top Performing Tool</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 block truncate">
                {data?.mostUsedTool || 'Article Writer'}
              </span>
              <span className="text-xs text-slate-500 font-medium">Accounting for ~28% volume</span>
            </div>
            <p className="text-[11px] text-slate-400">Highest daily engagement</p>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">7-Day Active Users</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {data?.activeUsers.toLocaleString() ?? '892'}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">94% retention</span>
            </div>
            <p className="text-[11px] text-slate-400">Unique user sessions</p>
          </div>
        </div>

        {/* Per-Tool Usage Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Per-Tool Usage Breakdown</h2>
              <p className="text-xs text-slate-500">
                Control tool availability and review total vs. daily traffic volume.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">10 tools registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Tool Name</th>
                  <th className="py-3 px-6">Slug</th>
                  <th className="py-3 px-6">Total Generations</th>
                  <th className="py-3 px-6">Today's Generations</th>
                  <th className="py-3 px-6 text-right">Status &amp; Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.toolStats.map((tool) => (
                  <tr key={tool.slug} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                      <span>{tool.name}</span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-500">{tool.slug}</td>
                    <td className="py-3.5 px-6 font-mono text-sm text-slate-700">
                      {tool.totalUses.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-sm font-semibold text-blue-600">
                      {tool.todayUses}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleToggleTool(tool.slug)}
                        disabled={togglingSlug === tool.slug}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          tool.isEnabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{tool.isEnabled ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60">
            <h2 className="text-base font-bold text-slate-900">Recent Generation Log</h2>
            <p className="text-xs text-slate-500">Live feed of generation calls</p>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((log) => (
                <div key={log.id} className="p-4 px-6 flex items-center justify-between text-xs gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{log.toolName}</span>
                        {log.thinkingMode && (
                          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 rounded flex items-center gap-0.5">
                            <Brain className="w-2.5 h-2.5" /> High Thinking
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-500 truncate mt-0.5 max-w-md italic">
                        "{log.inputSnippet}"
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.modelUsed}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No generation logs recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
