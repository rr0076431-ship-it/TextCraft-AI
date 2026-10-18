import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, Zap, Brain } from 'lucide-react';
import { TOOLS } from '../../lib/toolsConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                TextCraft <span className="text-blue-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Professional, free AI-powered text writing, rewriting, and enhancement tools. Built for students, freelancers, bloggers, and businesses worldwide.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700">
                <Brain className="w-3 h-3" /> Gemini 4 Argon
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
                <Zap className="w-3 h-3 text-amber-400" /> Free Tier
              </span>
            </div>
          </div>

          {/* AI Writing Tools */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Writing &amp; Content
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/tools/article-writer" className="hover:text-white transition-colors">
                  📝 Article Writer
                </Link>
              </li>
              <li>
                <Link to="/tools/paraphraser" className="hover:text-white transition-colors">
                  ✍️ Paraphraser &amp; Rewriter
                </Link>
              </li>
              <li>
                <Link to="/tools/summarizer" className="hover:text-white transition-colors">
                  📋 Smart Summarizer
                </Link>
              </li>
              <li>
                <Link to="/tools/grammar-checker" className="hover:text-white transition-colors">
                  ✅ Grammar &amp; Spell Checker
                </Link>
              </li>
              <li>
                <Link to="/tools/story-writer" className="hover:text-white transition-colors">
                  📖 Creative Story Writer
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Marketing Tools */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Business &amp; Marketing
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/tools/email-writer" className="hover:text-white transition-colors">
                  📧 Professional Email Writer
                </Link>
              </li>
              <li>
                <Link to="/tools/caption-writer" className="hover:text-white transition-colors">
                  📸 Social Media Captions
                </Link>
              </li>
              <li>
                <Link to="/tools/product-description" className="hover:text-white transition-colors">
                  🛍️ Product Descriptions
                </Link>
              </li>
              <li>
                <Link to="/tools/translator" className="hover:text-white transition-colors">
                  🌐 Multilingual Translator
                </Link>
              </li>
              <li>
                <Link to="/tools/seo-meta-writer" className="hover:text-white transition-colors">
                  🔍 SEO Title &amp; Meta Writer
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Info */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About TextCraft AI
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin Console
                </Link>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy &amp; Terms
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TextCraft AI. All rights reserved. Powered by Google Gemini AI.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for global creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
