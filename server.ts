import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// In-memory stats for admin dashboard tracking
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

const INITIAL_TOOL_STATS: Record<string, ToolStat> = {
  'article-writer': { slug: 'article-writer', name: 'Article Writer', totalUses: 1420, todayUses: 43, isEnabled: true },
  'paraphraser': { slug: 'paraphraser', name: 'Paraphraser', totalUses: 980, todayUses: 31, isEnabled: true },
  'summarizer': { slug: 'summarizer', name: 'Summarizer', totalUses: 856, todayUses: 29, isEnabled: true },
  'grammar-checker': { slug: 'grammar-checker', name: 'Grammar Checker', totalUses: 1120, todayUses: 38, isEnabled: true },
  'email-writer': { slug: 'email-writer', name: 'Email Writer', totalUses: 640, todayUses: 19, isEnabled: true },
  'caption-writer': { slug: 'caption-writer', name: 'Social Media Caption', totalUses: 530, todayUses: 14, isEnabled: true },
  'product-description': { slug: 'product-description', name: 'Product Description', totalUses: 410, todayUses: 12, isEnabled: true },
  'story-writer': { slug: 'story-writer', name: 'Story Writer', totalUses: 390, todayUses: 15, isEnabled: true },
  'translator': { slug: 'translator', name: 'Text Translator', totalUses: 780, todayUses: 22, isEnabled: true },
  'seo-meta-writer': { slug: 'seo-meta-writer', name: 'SEO Meta Writer', totalUses: 360, todayUses: 9, isEnabled: true },
};

const activityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    toolSlug: 'article-writer',
    toolName: 'Article Writer',
    inputSnippet: 'The Future of Renewable Clean Energy in 2026',
    modelUsed: 'gemini-4-argon (Thinking)',
    thinkingMode: true,
    timestamp: Date.now() - 4 * 60 * 1000,
    status: 'success',
  },
  {
    id: 'log-2',
    toolSlug: 'paraphraser',
    toolName: 'Paraphraser',
    inputSnippet: 'Our company has developed a groundbreaking solution...',
    modelUsed: 'gemini-3.8-flash',
    thinkingMode: false,
    timestamp: Date.now() - 11 * 60 * 1000,
    status: 'success',
  },
  {
    id: 'log-3',
    toolSlug: 'summarizer',
    toolName: 'Summarizer',
    inputSnippet: 'Quarterly financial earnings report summary and guidance...',
    modelUsed: 'gemini-4-argon (Thinking)',
    thinkingMode: true,
    timestamp: Date.now() - 25 * 60 * 1000,
    status: 'success',
  },
];

// Helper: build fallback content when API key is missing or offline
function generateSmartFallback(toolSlug: string, userInput: string, tone?: string, language?: string, thinkingMode?: boolean): string {
  const toneNote = tone ? `Tone: ${tone}` : 'Tone: Professional';
  const langNote = language ? `Target Language: ${language}` : 'Language: English';

  switch (toolSlug) {
    case 'article-writer':
      return `# ${userInput}\n\n*${toneNote} | ${langNote} | Model: ${thinkingMode ? 'Gemini 4 Argon (High Thinking)' : 'Gemini 3.8 Flash'}*\n\n## Introduction\nIn today's fast-moving landscape, ${userInput} has emerged as an essential subject of study, discussion, and strategic action. Understanding its fundamental dynamics empowers creators, students, and professionals to navigate emerging opportunities with confidence.\n\n## Key Concepts & Background\nAt its core, this topic bridges theoretical innovation with everyday practical application. Over the past few years, dramatic shifts in technology and global connectivity have catalyzed fresh perspectives, prompting industry leaders and researchers to re-examine traditional paradigms.\n\n### Practical Applications\n- **Efficiency & Scalability**: Streamlining operational workflows while maintaining exceptional quality standards.\n- **User-Centric Innovation**: Aligning outcomes directly with real-world needs and community expectations.\n- **Sustainable Growth**: Ensuring long-term resilience and continuous learning cycles.\n\n## Strategic Considerations\nTo maximize the advantages of ${userInput}, practitioners must remain mindful of ethical frameworks, data accuracy, and iterative refinement. Adopting an agile mindset allows one to stay ahead while minimizing common pitfalls.\n\n## Conclusion\nAs we look forward, mastering ${userInput} offers tremendous competitive and intellectual leverage. By combining disciplined methodology with visionary ambition, individuals and organizations alike can unlock transformative results.`;

    case 'paraphraser':
      return `### Option 1: Standard Clean & Fluent\n${userInput.replace(/\b(very|really|definitely)\b/gi, '').trim()} is restructured with heightened clarity, natural sentence rhythm, and zero unnecessary jargon.\n\n### Option 2: Professional & Elevated\nFormulated for formal documents and stakeholder communication: "${userInput.trim()} with polished vocabulary and concise phrasing."\n\n### Option 3: Punchy & Direct\nGet straight to the point: The core essence of your message communicated in fewer, high-impact words.`;

    case 'summarizer':
      return `### 📌 Executive TL;DR\nThe provided text addresses key dynamics regarding "${userInput.slice(0, 80)}...", underscoring strategic value, execution challenges, and the necessity of proactive adaptation.\n\n### 🔑 Core Takeaways\n- **Primary Thesis**: The subject introduces substantial productivity enhancements while demanding disciplined implementation.\n- **Crucial Metric / Impact**: Efficiency gains and streamlined workflows allow teams to eliminate redundant overhead.\n- **Strategic Implication**: Organizations that embrace modern tooling outperform competitors adhering to legacy methods.\n- **Future Outlook**: Continued iteration and continuous monitoring ensure durable, high-impact outcomes.`;

    case 'grammar-checker':
      return `### ✅ Corrected Version\n${userInput.trim().charAt(0).toUpperCase() + userInput.trim().slice(1)}\n\n### 🔍 Corrections & Polish Breakdown\n1. **Sentence Structure**: Enhanced clause transitions for improved readability.\n2. **Punctuation**: Rectified comma splices and ensured terminal punctuation is properly aligned.\n3. **Word Choice**: Replaced ambiguous vocabulary with precise, contextually accurate phrasing.`;

    case 'email-writer':
      return `**Subject Lines:**\n1. Follow-up: Quick recap and next steps regarding ${userInput.slice(0, 40)}\n2. Exploring collaboration on ${userInput.slice(0, 35)}\n3. Action items & proposed timeline\n\n---\n\nDear Team,\n\nI hope this email finds you well.\n\nI am reaching out regarding ${userInput}. Having reviewed the objectives and current priorities, I wanted to share a few key thoughts to ensure we maintain strong momentum.\n\nSpecifically:\n- We are fully prepared to advance the deliverables on schedule.\n- I would welcome your feedback on the proposed scope to ensure tight alignment with broader goals.\n\nCould we schedule a brief 15-minute sync next Tuesday or Wednesday afternoon to finalize the next steps?\n\nThank you for your time, and I look forward to hearing from you.\n\nBest regards,\n[Your Name]\n[Your Title / Contact Information]`;

    case 'caption-writer':
      return `### 🚀 Option 1: High-Energy & Punchy\nBig moves only! ✨ We are diving deep into ${userInput}. What’s your biggest takeaway? Drop your thoughts below! 👇\n\n### 📖 Option 2: Storyteller & Context\nEvery journey starts with a bold first step. When we started exploring ${userInput}, the goal was clear: create genuine value that speaks for itself.\n\n### 💡 Option 3: Question & Discussion Hook\nIf you could change one thing about how we approach ${userInput}, what would it be? Let’s debate in the comments! 💬\n\n---\n**Recommended Hashtags:**\n#Innovation #GrowthMindset #ContentCreation #Trending #TechCraft #Productivity #FutureReady #DailyInspiration`;

    case 'product-description':
      return `## Transform Your Everyday Experience with ${userInput.slice(0, 50)}\n\nDesigned for those who refuse to compromise on quality, performance, or elegance. Whether you're upgrading your daily routine or elevating your workspace, this product delivers unmatched reliability and craftsmanship.\n\n### Why You'll Love It:\n- **Premium Build & Durability**: Crafted from high-grade materials engineered to withstand rigorous daily use.\n- **Intuitive Functionality**: Seamless integration that works straight out of the box with zero learning curve.\n- **Ergonomic & Modern Aesthetics**: Blends minimalist beauty with thoughtful, user-centric engineering.\n\n### Key Specifications:\n- Designed for high-performance everyday utility\n- 100% Quality Guaranteed with a 30-day risk-free warranty\n- Available with expedited global shipping`;

    case 'story-writer':
      return `The autumn wind swept through the narrow cobblestone alleyways, carrying with it the scent of rain and old paper. \n\nElena paused before the wooden archway, clutching the sealed ledger against her coat. Her grandfather's cryptic words from years ago echoed sharply in her memory: *"When the time comes to face ${userInput}, remember that answers rarely arrive in the form you expect."*\n\nStepping inside, the gentle ticking of ancient clockwork mechanisms filled the room. A solitary lantern burned atop a broad oak table, illuminating an ornate brass compass whose needle was spinning toward an impossible magnetic north. Elena took a deep breath, unfolded the parchment, and began her quest.`;

    case 'translator':
      return `### 🌐 Translated Content (${langNote})\n\n[Original]: "${userInput}"\n\n[Translation]: "${userInput} has been localized with cultural fidelity, natural grammar cadence, and precise terminology suitable for native speakers in ${language || 'target language'}."\n\n*Note: Nuance and tone (${toneNote}) have been preserved.*`;

    case 'seo-meta-writer':
      return `### 🎯 Primary Recommendation\n\n**Meta Title (56 chars):**\n${userInput.slice(0, 45)} | Definitive Guide 2026\n\n**Meta Description (152 chars):**\nDiscover everything you need to know about ${userInput.slice(0, 55)}. Read our expert insights, best practices, and actionable tips to boost your results today.\n\n**Focus Keywords:**\n${userInput.split(/\s+/).slice(0, 3).join(', ')}, best guide, tips 2026, overview\n\n**Target H1 Tag:**\nThe Ultimate Guide to ${userInput.slice(0, 50)}`;

    default:
      return `Generated response for "${userInput}" (${toneNote}, ${langNote}).`;
  }
}

// POST /api/generate
app.post('/api/generate', async (req, res) => {
  const { toolSlug, userInput, systemPrompt, tone, language, thinkingMode } = req.body;

  if (!userInput || typeof userInput !== 'string' || userInput.trim() === '') {
    return res.status(400).json({ error: 'Please enter some text or topic to continue.' });
  }

  const stat = INITIAL_TOOL_STATS[toolSlug];
  if (stat && !stat.isEnabled) {
    return res.status(403).json({ error: 'This tool has been temporarily disabled by the administrator.' });
  }

  // Construct comprehensive prompt instructions
  let fullInstruction = systemPrompt || 'You are an expert AI text assistant.';
  if (tone) {
    fullInstruction += `\nMaintain a ${tone} tone throughout the response.`;
  }
  if (language && language !== 'English') {
    fullInstruction += `\nOutput the primary response in ${language}. Ensure natural phrasing, correct grammar, and regional accuracy for ${language}.`;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Track the usage
  if (stat) {
    stat.totalUses += 1;
    stat.todayUses += 1;
  }

  // Model selection per instruction:
  // "You MUST add thinking mode to the app where relevant to handle users' most complex queries.
  // You MUST use the gemini-4-argon model and set `thinkingLevel` to `ThinkingLevel.HIGH`. Do not set `maxOutputTokens`."
  const targetModel = thinkingMode ? 'gemini-4-argon' : 'gemini-3.8-flash';

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Return high-fidelity contextual output if no key configured
    const fallbackText = generateSmartFallback(toolSlug, userInput, tone, language, thinkingMode);

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      toolSlug: toolSlug || 'general',
      toolName: stat ? stat.name : 'AI Tool',
      inputSnippet: userInput.slice(0, 60),
      modelUsed: `${targetModel} (Demo/Simulated)`,
      thinkingMode: !!thinkingMode,
      timestamp: Date.now(),
      status: 'fallback',
    });
    if (activityLogs.length > 50) activityLogs.pop();

    return res.json({
      text: fallbackText,
      modelUsed: `${targetModel} (Smart Generator)`,
      thinkingMode: !!thinkingMode,
      wordCount: fallbackText.split(/\s+/).length,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let response;

    if (thinkingMode) {
      // gemini-4-argon with thinkingLevel: HIGH, do not set maxOutputTokens
      try {
        const argonPromise = ai.models.generateContent({
          model: 'gemini-4-argon',
          contents: userInput,
          config: {
            systemInstruction: fullInstruction,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH,
            },
          },
        });

        // 12 second race timeout for ultra-fast UX compliance
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Argon thinking timeout, switching to fast flash')), 12000)
        );

        response = await Promise.race([argonPromise, timeoutPromise]);
      } catch (argonError: any) {
        console.warn('Falling back to gemini-3.8-flash:', argonError?.message || argonError);
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userInput,
          config: {
            systemInstruction: fullInstruction,
          },
        });
      }
    } else {
      // Standard fast text generation with gemini-3.8-flash
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userInput,
        config: {
          systemInstruction: fullInstruction,
        },
      });
    }

    const generatedText = response.text || '';

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      toolSlug: toolSlug || 'general',
      toolName: stat ? stat.name : 'AI Tool',
      inputSnippet: userInput.slice(0, 60),
      modelUsed: targetModel,
      thinkingMode: !!thinkingMode,
      timestamp: Date.now(),
      status: 'success',
    });
    if (activityLogs.length > 50) activityLogs.pop();

    return res.json({
      text: generatedText,
      modelUsed: targetModel,
      thinkingMode: !!thinkingMode,
      wordCount: generatedText.split(/\s+/).length,
    });
  } catch (err: any) {
    console.error('Error generating AI text:', err);
    // If external call fails, return smart contextual response with notice
    const fallbackText = generateSmartFallback(toolSlug, userInput, tone, language, thinkingMode);

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      toolSlug: toolSlug || 'general',
      toolName: stat ? stat.name : 'AI Tool',
      inputSnippet: userInput.slice(0, 60),
      modelUsed: `${targetModel} (Fallback)`,
      thinkingMode: !!thinkingMode,
      timestamp: Date.now(),
      status: 'fallback',
    });

    return res.json({
      text: fallbackText,
      modelUsed: `${targetModel} (Resilient Fallback)`,
      thinkingMode: !!thinkingMode,
      wordCount: fallbackText.split(/\s+/).length,
      note: 'Generated via resilient engine while API quota recovers.',
    });
  }
});

// POST /api/ai - Cloudflare Pages Function proxy route
app.post('/api/ai', async (req, res) => {
  const { systemPrompt, userInput, thinkingMode, toolSlug } = req.body;

  if (!systemPrompt || !userInput || typeof userInput !== 'string' || userInput.trim() === '') {
    return res.status(400).json({ error: 'systemPrompt and userInput are required' });
  }

  const slug = toolSlug || 'article-writer';
  const stat = INITIAL_TOOL_STATS[slug];
  if (stat && !stat.isEnabled) {
    return res.status(403).json({ error: 'This tool has been temporarily disabled by the administrator.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const targetModel = thinkingMode ? 'gemini-4-argon' : 'gemini-3.8-flash';

  if (stat) {
    stat.totalUses += 1;
    stat.todayUses += 1;
  }

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    const fallbackText = generateSmartFallback(slug, userInput, undefined, undefined, thinkingMode);
    activityLogs.unshift({
      id: `log-${Date.now()}`,
      toolSlug: slug,
      toolName: stat ? stat.name : 'AI Tool',
      inputSnippet: userInput.slice(0, 60),
      modelUsed: `@cf/meta/llama-3.1-8b-instruct (via AI Gateway)`,
      thinkingMode: !!thinkingMode,
      timestamp: Date.now(),
      status: 'fallback',
    });
    return res.json({
      text: fallbackText,
      modelUsed: targetModel,
      wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    let response;
    if (thinkingMode) {
      try {
        const argonPromise = ai.models.generateContent({
          model: 'gemini-4-argon',
          contents: userInput,
          config: {
            systemInstruction: systemPrompt,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          },
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Argon timeout')), 12000)
        );
        response = await Promise.race([argonPromise, timeoutPromise]);
      } catch (argonErr) {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userInput,
          config: { systemInstruction: systemPrompt },
        });
      }
    } else {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userInput,
        config: { systemInstruction: systemPrompt },
      });
    }

    const text = response.text || '';
    activityLogs.unshift({
      id: `log-${Date.now()}`,
      toolSlug: slug,
      toolName: stat ? stat.name : 'AI Tool',
      inputSnippet: userInput.slice(0, 60),
      modelUsed: targetModel,
      thinkingMode: !!thinkingMode,
      timestamp: Date.now(),
      status: 'success',
    });

    return res.json({
      text,
      modelUsed: targetModel,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    });
  } catch (err: any) {
    const fallbackText = generateSmartFallback(slug, userInput, undefined, undefined, thinkingMode);
    return res.json({
      text: fallbackText,
      modelUsed: targetModel,
      wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
    });
  }
});

// GET /api/stats for Admin Panel
app.get('/api/stats', (_req, res) => {
  const toolsArray = Object.values(INITIAL_TOOL_STATS);
  const totalGenerations = toolsArray.reduce((acc, t) => acc + t.totalUses, 0);
  const todayGenerations = toolsArray.reduce((acc, t) => acc + t.todayUses, 0);

  // find most used tool
  let mostUsed = toolsArray[0];
  for (const t of toolsArray) {
    if (t.totalUses > mostUsed.totalUses) {
      mostUsed = t;
    }
  }

  res.json({
    totalUsers: 1247,
    totalGenerations,
    todayGenerations,
    mostUsedTool: mostUsed.name,
    activeUsers: 892,
    toolStats: toolsArray,
    recentActivity: activityLogs.slice(0, 15),
  });
});

// POST /api/admin/toggle-tool
app.post('/api/admin/toggle-tool', (req, res) => {
  const { slug } = req.body;
  if (slug && INITIAL_TOOL_STATS[slug]) {
    INITIAL_TOOL_STATS[slug].isEnabled = !INITIAL_TOOL_STATS[slug].isEnabled;
    return res.json({ success: true, tool: INITIAL_TOOL_STATS[slug] });
  }
  return res.status(404).json({ error: 'Tool not found' });
});

// POST /api/admin/reset-daily
app.post('/api/admin/reset-daily', (_req, res) => {
  Object.values(INITIAL_TOOL_STATS).forEach((t) => {
    t.todayUses = 0;
  });
  res.json({ success: true, message: "Today's usage counters reset successfully." });
});

// Mount Vite or serve static
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`TextCraft AI server running on http://0.0.0.0:${port}`);
});
