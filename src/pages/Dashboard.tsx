import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Star,
  Copy,
  Trash2,
  Check,
  Search,
  Zap,
  Brain,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TOOLS } from '../lib/toolsConfig';
import { copyToClipboard } from '../utils/clipboard';

export const Dashboard: React.FC = () => {
  const {
    user,
    history,
    usedTodayCount,
    remainingTodayCount,
    dailyLimit,
    toggleFavorite,
    deleteGeneration,
    clearHistory,
  } = useAuth() as any;

  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter((item: any) => {
    const matchesTab = activeTab === 'all' || item.isFavorite;
    const matchesSearch =
      item.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inputText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.outputText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalWordsGenerated = history.reduce((acc: number, item: any) => acc + (item.wordCount || 0), 0);
  const favoriteCount = history.filter((item: any) => item.isFavorite).length;

  const usagePercent = Math.min(100, Math.round((usedTodayCount / (dailyLimit || 5)) * 100));

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome back, {user.fullName}!
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                {user.role} Plan
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Review your past AI generations, copy saved outputs, and monitor daily limits.
            </p>
          </div>

          {/* Quick CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/tools/article-writer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch a Tool</span>
            </Link>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Daily Usage Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Daily Usage
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{usedTodayCount}</span>
                <span className="text-sm text-slate-500">/ {user.role === 'admin' ? '∞' : dailyLimit || 5} used</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${user.role === 'admin' ? 10 : usagePercent}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              {remainingTodayCount} generations remaining today
            </p>
          </div>

          {/* Total Generations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Generations
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">{history.length}</span>
              <p className="text-xs text-slate-500 mt-1">Generations logged in history</p>
            </div>
          </div>

          {/* Starred / Saved */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Favorites
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">{favoriteCount}</span>
              <p className="text-xs text-slate-500 mt-1">Saved for quick access</p>
            </div>
          </div>

          {/* Words Generated */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Words Generated
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">
                {totalWordsGenerated.toLocaleString()}
              </span>
              <p className="text-xs text-slate-500 mt-1">Across all session tasks</p>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Generations ({history.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Favorites ({favoriteCount})</span>
              </button>
            </div>

            {/* Search and Clear */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search outputs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your generation history?')) {
                      clearHistory();
                      showToast('History cleared', 'info');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  title="Clear history"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* History List */}
          <div className="divide-y divide-slate-100">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item: any) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div key={item.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl p-2 bg-slate-100 rounded-lg">
                          {TOOLS.find((t) => t.slug === item.toolSlug)?.icon || '📝'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">{item.toolName}</h3>
                            {item.thinkingMode && (
                              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                <Brain className="w-3 h-3" /> High Thinking
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
                            Prompt: "{item.inputText}"
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => handleCopy(item.id, item.outputText)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer"
                          title="Copy output"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            item.isFavorite
                              ? 'bg-amber-50 border-amber-300 text-amber-500'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                          }`}
                          title="Toggle favorite"
                        >
                          <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>

                        <button
                          onClick={() => deleteGeneration(item.id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 ml-1 cursor-pointer"
                        >
                          {isExpanded ? 'Collapse' : 'View Full'}
                        </button>
                      </div>
                    </div>

                    {/* Output Text Snippet / Expanded */}
                    <div className="mt-3.5 pl-11">
                      <div
                        className={`font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 whitespace-pre-wrap leading-relaxed ${
                          isExpanded ? '' : 'max-h-24 overflow-hidden relative'
                        }`}
                      >
                        {item.outputText}
                        {!isExpanded && (
                          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <History className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No generations found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No matching results found for your search query.'
                    : 'Your generated texts will be saved here automatically for quick re-use.'}
                </p>
                <Link
                  to="/tools/article-writer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  <span>Try a Tool Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
