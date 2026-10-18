import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-xs font-semibold text-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Mission &amp; Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About TextCraft AI
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Free, accessible, high-performance AI text utilities designed to empower writers, students, freelancers, and businesses worldwide.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 text-slate-700 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-slate-900">Why TextCraft AI was built</h2>
          <p>
            Writing should not be held back by complicated software, expensive paywalls, or clunky prompts. TextCraft AI brings together 10 of the most frequently needed text tools—ranging from deep analytical articles and executive summaries to social captions and multilingual translation—into one streamlined workspace.
          </p>
          <p>
            Whether you are a student writing an academic essay, an e-commerce entrepreneur drafting high-converting product pages, or a freelancer crafting client emails, TextCraft AI delivers clean, structured output in seconds.
          </p>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <Brain className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Gemini 4 Argon Thinking</h3>
              <p className="text-xs text-slate-500 mt-1">
                Deep multi-step reasoning capabilities for nuanced queries, essays, and analysis.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <Zap className="w-6 h-6 text-amber-500 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Fast 2-Second Drafts</h3>
              <p className="text-xs text-slate-500 mt-1">
                Optimized endpoints for instant paraphrasing, grammar checks, and social copy.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <Shield className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Privacy &amp; Transparency</h3>
              <p className="text-xs text-slate-500 mt-1">
                Client privacy first with no unauthorized data harvesting or intrusive ads.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/tools/article-writer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <span>Explore the AI Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
