/**
 * AI Gateway & Client Helper for TextCraft AI
 * Follows Cloudflare AI Gateway & Pages Function architecture:
 * React Frontend -> POST /api/ai -> Cloudflare Pages Function (functions/api/ai.ts) / Dev Server
 * -> Workers AI (@cf/meta/llama-3.1-8b-instruct) via AI Gateway { id: "default" }
 */

import { runAiTool } from './ai';

export interface GenerateResult {
  text: string;
  modelUsed: string;
  thinkingMode: boolean;
  wordCount: number;
}

export interface GenerateOptions {
  onProgressNotice?: (notice: string) => void;
  thinkingMode?: boolean;
}

/**
 * generateText - Phase 6 specification helper
 * Calls secure /api/ai backend endpoint with systemPrompt and userInput
 */
export async function generateText(
  systemPrompt: string,
  userInput: string,
  tone?: string,
  language?: string
): Promise<string> {
  // Network check
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('No internet connection. Please check and retry.');
  }

  let fullPrompt = systemPrompt;
  if (tone) fullPrompt += ` Maintain a ${tone} tone.`;
  if (language && language !== 'English') fullPrompt += ` Output in ${language}.`;

  const result = await runAiTool(fullPrompt, userInput);
  if (result.error) {
    throw new Error(result.error);
  }
  return result.text;
}

/**
 * generateAIContent - Rich wrapper for tool pages with loading progress and metrics
 */
export async function generateAIContent(
  toolSlug: string,
  userInput: string,
  systemPrompt: string,
  tone?: string,
  language?: string,
  thinkingMode = false,
  options?: GenerateOptions
): Promise<GenerateResult> {
  // 1. Network check
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('No internet connection. Please check and retry.');
  }

  // 2. Slow network warning timer (>15s)
  const slowTimer = setTimeout(() => {
    if (options?.onProgressNotice) {
      options.onProgressNotice('Taking longer than usual. Processing through Cloudflare AI Gateway...');
    }
  }, 15000);

  try {
    let fullPrompt = systemPrompt;
    if (tone) {
      fullPrompt += ` Maintain a ${tone} tone.`;
    }
    if (language && language !== 'English') {
      fullPrompt += ` Output in ${language}. Ensure natural phrasing and grammatical accuracy.`;
    }

    const result = await runAiTool(fullPrompt, userInput, {
      thinkingMode,
      toolSlug,
    });

    clearTimeout(slowTimer);

    if (result.error) {
      throw new Error(result.error);
    }

    const text = result.text || '';
    const wordCount = result.wordCount ?? text.split(/\s+/).filter(Boolean).length;
    const modelUsed = result.modelUsed || '@cf/meta/llama-3.1-8b-instruct';

    return {
      text,
      modelUsed,
      thinkingMode,
      wordCount,
    };
  } catch (error: any) {
    clearTimeout(slowTimer);

    if (error.name === 'AbortError') {
      throw new Error('Generation took longer than expected. Please check your connection and try again.');
    }
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      throw new Error('No internet connection. Please check and retry.');
    }
    throw error;
  }
}
