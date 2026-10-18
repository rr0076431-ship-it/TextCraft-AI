import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Download,
  Star,
  ArrowLeft,
  Brain,
  AlertCircle,
  FileText,
  Clock,
  Trash2,
  Share2,
} from 'lucide-react';
import { getToolBySlug, TOOLS } from '../lib/toolsConfig';
import { countWords, countCharacters, estimateReadingTime } from '../utils/textMetrics';
import { ThinkingModeToggle } from '../components/tools/ThinkingModeToggle';
import { useGenerate } from '../hooks/useGenerate';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { copyToClipboard } from '../utils/clipboard';

export const ToolPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = getToolBySlug(slug || '');

  const [input, setInput] = useState<string>('');
  const [tone, setTone] = useState<string>('Professional');
  const [language, setLanguage] = useState<string>('English');
  const [thinkingMode, setThinkingMode] = useState<boolean>(true);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const {
    generate,
    isLoading,
    isThinking,
    progressNotice,
    result,
    error,
    remainingTodayCount,
    isLimitReached,
  } = useGenerate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Reset state when switching tools
  useEffect(() => {
    if (tool) {
      setInput(tool.sampleInput || '');
      setHasCopied(false);
      setIsSaved(false);
      setThinkingMode(tool.supportsHighThinking);
    }
  }, [slug]);

  if (!tool) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Tool Not Found</h2>
        <p className="text-slate-600 mt-2">The requested AI tool does not exist.</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Tools
        </Link>
      </div>
    );
  }

  const handleGenerate = async () => {
    const res = await generate(tool, input, tone, language, thinkingMode);
    if (res) {
      setHasCopied(false);
      setIsSaved(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    await copyToClipboard(result.text);
    setHasCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.slug}-output.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded markdown file!', 'success');
  };

  const inputWordCount = countWords(input);
  const inputCharCount = countCharacters(input);
  const outputWordCount = result ? countWords(result.text) : 0;
  const readingTime = estimateReadingTime(outputWordCount);

  const toneOptions = [
    'Professional',
    'Casual & Friendly',
    'Formal & Academic',
    'Persuasive',
    'Punchy & Concise',
    'Humorous',
  ];

  const languageOptions = [
    'English',
    'Urdu',
    'Arabic',
    'Spanish',
    'French',
    'German',
    'Hindi',
    'Turkish',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Tools
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Daily Quota:</span>
            <span className="font-semibold text-slate-900">
              {remainingTodayCount} left today
            </span>
          </div>
        </div>

        {/* Tool Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shadow-xs shrink-0">
                {tool.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900">{tool.name}</h1>
                  <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-full capitalize">
                    {tool.category}
                  </span>
                  {tool.supportsHighThinking && (
                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-full font-medium">
                      <Brain className="w-3.5 h-3.5" /> High Thinking
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>

            {/* Quick other tools selector */}
            <div className="hidden lg:flex items-center gap-1">
              {TOOLS.slice(0, 4).map((t) => (
                <Link
                  key={t.slug}
                  to={`/tools/${t.slug}`}
                  className={`p-2 rounded-lg text-lg border transition-all ${
                    t.slug === tool.slug
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={t.name}
                >
                  {t.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Workspace Split Layout: 50% Input / 50% Output on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT PANEL: Input Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <label htmlFor="tool-input" className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>{tool.inputLabel}</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInput(tool.sampleInput)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                >
                  Use Sample
                </button>
                {input && (
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    className="text-xs text-slate-400 hover:text-rose-500 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                id="tool-input"
                rows={7}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={tool.inputPlaceholder}
                className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all leading-relaxed font-sans"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{inputWordCount} words · {inputCharCount} characters</span>
                <span>Max: 3000 chars</span>
              </div>
            </div>

            {/* Selectors: Tone and Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {tool.toneSelectorEnabled && (
                <div>
                  <label htmlFor="tone-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Writing Tone
                  </label>
                  <select
                    id="tone-select"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    {toneOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {tool.languageSelectorEnabled && (
                <div>
                  <label htmlFor="lang-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Language
                  </label>
                  <select
                    id="lang-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* High Thinking Toggle (Gemini 4 Argon) */}
            {tool.supportsHighThinking && (
              <ThinkingModeToggle
                enabled={thinkingMode}
                onChange={setThinkingMode}
                disabled={isLoading}
              />
            )}

            {/* Generate Action Button */}
            <div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !input.trim() || isLimitReached}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isLoading || !input.trim() || isLimitReached
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-md cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {isThinking ? 'Thinking with Gemini 4 Argon...' : 'AI is Writing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Content</span>
                  </>
                )}
              </button>

              {/* Limit Warning banner if limit reached */}
              {isLimitReached && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Daily limit reached.</span>{' '}
                    {user.role === 'guest' ? (
                      <span>
                        You have used your 5 free guest generations. Please{' '}
                        <Link to="/register" className="font-bold underline text-amber-900">
                          Sign Up for 20/day
                        </Link>
                        !
                      </span>
                    ) : (
                      <span>You have reached your 20 daily generations. Quota resets tomorrow.</span>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Output Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full min-h-[500px]">
            {/* Output Header */}
            <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/60 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Generated Output
                </span>
                {result && (
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                    {result.modelUsed}
                  </span>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Download as Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setIsSaved(!isSaved);
                      showToast(isSaved ? 'Removed from favorites' : 'Saved to favorites!', 'info');
                    }}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-amber-50 border-amber-300 text-amber-500'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                    }`}
                    title="Bookmark / Favorite"
                  >
                    <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Output Content Area */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                    {isThinking && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {isThinking
                        ? 'Gemini 4 Argon is deeply analyzing & formulating...'
                        : 'AI is composing your text...'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {isThinking
                        ? 'Evaluating multifaceted concepts, structuring arguments, and polishing flow.'
                        : 'Synthesizing topic guidelines and tone preferences.'}
                    </p>
                    {progressNotice && (
                      <div className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800 animate-pulse">
                        {progressNotice}
                      </div>
                    )}
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 font-mono text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
                    {result.text}
                  </div>

                  {/* Output Footer Metrics & Regenerate */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>{outputWordCount} words</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {readingTime}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Your output will appear here
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter your topic or text on the left and click "Generate Content".
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
