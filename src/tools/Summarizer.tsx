import React, { useState } from 'react';
import { runAiTool } from '../lib/ai';
import { copyToClipboard } from '../utils/clipboard';

const SYSTEM_PROMPT =
  'You are a summarization expert. Summarize the user\'s text into 3-5 concise bullet points capturing the key ideas.';

export default function Summarizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');

    const result = await runAiTool(SYSTEM_PROMPT, input);

    if (result.error) setError(result.error);
    else setOutput(result.text);

    setLoading(false);
  }

  const handleCopy = async () => {
    if (!output) return;
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📋</span>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Summarizer</h2>
          <p className="text-sm text-slate-600">
            Summarize lengthy articles or notes into 3-5 concise, impactful bullet points.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="summarize-input" className="block text-sm font-semibold text-slate-800">
          Paste text to summarize:
        </label>
        <textarea
          id="summarize-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste long text, article paragraphs, or meeting notes..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-sm"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? 'Summarizing with AI Gateway...' : 'Summarize Content'}
      </button>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>}

      {output && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Key Takeaways</h3>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              {copied ? '✓ Copied' : '📋 Copy Summary'}
            </button>
          </div>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
