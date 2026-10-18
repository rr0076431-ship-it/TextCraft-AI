import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Zap } from 'lucide-react';
import { ToolConfig } from '../../types/index';

interface ToolCardProps {
  tool: ToolConfig;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top bar with icon and badges */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:scale-105 group-hover:bg-blue-50 transition-all">
            {tool.icon}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {tool.supportsHighThinking && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                <Brain className="w-3 h-3 text-indigo-600" />
                Thinking Mode
              </span>
            )}
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
              {tool.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Footer CTA */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">Free AI Generation</span>
        <Link
          to={`/tools/${tool.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Use Tool</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
