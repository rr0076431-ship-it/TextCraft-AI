import React from 'react';
import { Brain, Sparkles, HelpCircle } from 'lucide-react';

interface ThinkingModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const ThinkingModeToggle: React.FC<ThinkingModeToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        enabled
          ? 'bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border-indigo-200 shadow-xs'
          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
      } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              enabled ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                High Thinking Mode
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                gemini-4-argon
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Activates deep reasoning &amp; multi-step analysis for complex queries and nuanced writing.
            </p>
          </div>
        </div>

        {/* Switch Control */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle High Thinking Mode"
          onClick={() => onChange(!enabled)}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
            enabled ? 'bg-indigo-600' : 'bg-slate-300'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-2.5 pt-2 border-t border-indigo-100/80 flex items-center gap-1.5 text-[11px] text-indigo-800 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>Thinking Level: HIGH active. Model analyzes nuances before composing the response.</span>
        </div>
      )}
    </div>
  );
};
