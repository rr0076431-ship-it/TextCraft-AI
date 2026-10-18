import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  MousePointer,
  Type,
  Zap,
  Star,
  Brain,
  CheckCircle2,
  Copy,
  Layers,
  ShieldCheck,
  Globe2,
} from 'lucide-react';
import { TOOLS } from '../lib/toolsConfig';
import { ToolCard } from '../components/tools/ToolCard';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/clipboard';
import { AdsterraBanner } from '../components/ads/AdsterraBanner';

const HERO_VIDEO_ID = 'Hgg7M3kSqyE';

const DEMO_PREVIEWS = [
  {
    tool: 'Article Writer',
    icon: '📝',
    input: 'The Impact of Quantum Computing on Cybersecurity in 2026',
    output: 'Quantum computing is poised to fundamentally disrupt conventional cryptography. While RSA and ECC algorithms face unprecedented vulnerability to Shor\'s algorithm, next-generation post-quantum lattice cryptography offers resilient mathematical shields...',
    model: 'Gemini 4 Argon (High Thinking)',
  },
  {
    tool: 'Paraphraser',
    icon: '✍️',
    input: 'Our team is striving to improve the overall speed and efficiency of customer operations.',
    output: 'Our team is actively streamlining customer operations to deliver faster, higher-impact service with minimal turnaround friction.',
    model: 'Gemini 3.8 Flash',
  },
  {
    tool: 'Smart Summarizer',
    icon: '📋',
    input: 'Long report on global supply chain logistics and shipping cost dynamics...',
    output: '• Key Finding: Port congestion dropped 34% year-over-year\n• Strategic Driver: AI predictive routing optimized container utilization\n• Forecast: Global freight rates stabilize through Q4 2026',
    model: 'Gemini 4 Argon (High Thinking)',
  },
];

export const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [demoIndex, setDemoIndex] = useState<number>(0);
  const [displayedOutput, setDisplayedOutput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const { showToast } = useToast();

  // Typewriter effect cycle for hero demo
  useEffect(() => {
    const currentDemo = DEMO_PREVIEWS[demoIndex];
    let charIndex = 0;
    setDisplayedOutput('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (charIndex < currentDemo.output.length) {
        setDisplayedOutput(currentDemo.output.slice(0, charIndex + 1));
        charIndex += 2;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        // Wait before switching to next demo
        const nextTimeout = setTimeout(() => {
          setDemoIndex((prev) => (prev + 1) % DEMO_PREVIEWS.length);
        }, 3500);
        return () => clearTimeout(nextTimeout);
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, [demoIndex]);

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Tools (10)' },
    { id: 'writing', label: 'Writing' },
    { id: 'editing', label: 'Editing & Polish' },
    { id: 'business', label: 'Business' },
    { id: 'marketing', label: 'Marketing & SEO' },
    { id: 'creative', label: 'Creative' },
  ];

  const handleCopyDemo = async () => {
    await copyToClipboard(displayedOutput);
    showToast('Demo output copied to clipboard!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative isolate overflow-hidden bg-slate-950 pt-12 pb-16 md:pt-20 md:pb-16">
        {/* Muted YouTube video background: the playlist parameter is required for single-video looping. */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <iframe
            title="Decorative looping hero background video"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
            src={`https://www.youtube-nocookie.com/embed/${HERO_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${HERO_VIDEO_ID}&playsinline=1&rel=0&iv_load_policy=3`}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-indigo-950/65" aria-hidden="true" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-blue-100 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Next-Gen Gemini 4 High Thinking &amp; Writing Suite</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                Write Smarter <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  with Advanced AI
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                10 powerful AI writing, rewriting, and enhancement tools, completely free. No signup required for quick generations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/tools/article-writer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all"
                >
                  <span>Try Article Writer Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#tools-grid"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-xs transition-colors"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>See All 10 Tools</span>
                </a>
              </div>

              {/* Trust highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-200 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No credit card needed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fast 2-second responses
                </span>
                <span className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" /> High Thinking mode included
                </span>
              </div>
            </div>

            {/* Right Column: Live Interactive Typewriter Demo Box */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
                {/* Window header */}
                <div className="bg-[#0F172A] px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{DEMO_PREVIEWS[demoIndex].icon}</span>
                    <span className="text-sm font-semibold">{DEMO_PREVIEWS[demoIndex].tool}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                      <Brain className="w-3 h-3 text-blue-400" />
                      {DEMO_PREVIEWS[demoIndex].model}
                    </span>
                  </div>
                </div>

                {/* Prompt context */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Input Topic / Prompt
                  </span>
                  <p className="text-xs text-slate-700 font-medium italic">
                    "{DEMO_PREVIEWS[demoIndex].input}"
                  </p>
                </div>

                {/* Generation Output preview */}
                <div className="p-5 font-mono text-xs sm:text-[13px] text-slate-800 bg-white min-h-[170px] relative leading-relaxed">
                  <div className="whitespace-pre-wrap">{displayedOutput}</div>
                  {isTyping && (
                    <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse align-middle" />
                  )}
                </div>

                {/* Demo Action Bar */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Live AI Engine
                  </span>
                  <button
                    onClick={handleCopyDemo}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="rounded-xl bg-slate-950/35 p-2 ring-1 ring-white/15 backdrop-blur-sm">
              <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">Advertisement</p>
              <AdsterraBanner
                adKey="df29f56582a733cb7843dfebdb035c7f"
                width={160}
                height={300}
                title="Adsterra 160 by 300 banner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HIGH THINKING SPOTLIGHT BANNER */}
      <section className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#1E1B4B] text-white py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Equipped with High Thinking Mode (Gemini 4 Argon)
                  </h3>
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    NEW
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl">
                  Tackle your most complex assignments, technical articles, and nuanced business memos. When enabled, the model performs in-depth multi-step reasoning before outputting answers.
                </p>
              </div>
            </div>
            <Link
              to="/tools/article-writer"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Test Thinking Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. TOOLS GRID SECTION */}
      <section id="tools-grid" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_160px] items-start gap-8">
          <div className="min-w-0">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            All AI Writing Tools
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Pick any tool below to instantly draft, rewrite, translate, or polish your content.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Cards Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
          </div>
          <aside className="flex justify-center xl:sticky xl:top-24">
            <div className="space-y-2">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Advertisement</p>
              <AdsterraBanner
                adKey="08c730bb1aad07713969bdaf0ab0f0a3"
                width={160}
                height={600}
                title="Adsterra 160 by 600 skyscraper banner"
              />
            </div>
          </aside>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 steps) */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="mt-1 text-3xl font-bold text-[#0F172A] tracking-tight">
              How It Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              No complicated prompt engineering required. Simply select, type, and generate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MousePointer className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-600 font-mono">STEP 01</span>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">1. Choose a Tool</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Select from our 10 specialized AI text tools tailored for articles, summaries, emails, or translations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Type className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-indigo-600 font-mono">STEP 02</span>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">2. Enter Your Text</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Type your topic, paste your draft, or pick your desired tone and target language with optional High Thinking mode.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 font-mono">STEP 03</span>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">3. Get Instant Output</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Receive polished, ready-to-use content in seconds. Copy to clipboard with one click or regenerate anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            User Feedback
          </span>
          <h2 className="mt-1 text-3xl font-bold text-[#0F172A] tracking-tight">
            Loved by Writers, Sellers &amp; Students
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "TextCraft AI ne meri article writing speed 3x kar di. Har roz client proposals aur blog outlines ke liye use karta hun. Bohat fast aur reliable hai!"
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                AH
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Ali Hassan</h4>
                <p className="text-xs text-slate-500">Freelance Content Writer</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "Product descriptions likhna ab 2 minute ka kaam hai. Shopify store ke liye compelling bullet points aur benefits generate karta hai effortlessly."
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                SM
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Sana Mehmood</h4>
                <p className="text-xs text-slate-500">E-commerce Brand Owner</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "Assignments ke research papers samajhne ke liye smart summarizer aur grammar checker best hain. Bilkul free aur clean interface!"
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                UT
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Usman Tariq</h4>
                <p className="text-xs text-slate-500">Computer Science Student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="bg-[#2563EB] text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Writing for Free Today
          </h2>
          <p className="text-blue-100 text-base max-w-xl mx-auto">
            Experience the difference of specialized AI text tools combined with Gemini 4 Argon deep reasoning.
          </p>
          <div>
            <Link
              to="/tools/article-writer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-bold text-base shadow-lg transition-colors"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
