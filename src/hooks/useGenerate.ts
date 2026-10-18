import { useState } from 'react';
import { ToolConfig } from '../types/index';
import { generateAIContent, GenerateResult } from '../lib/aiGateway';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useGenerate() {
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [progressNotice, setProgressNotice] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLimitReached, recordGeneration, remainingTodayCount, user } = useAuth();
  const { showToast } = useToast();

  const generate = async (
    tool: ToolConfig,
    userInput: string,
    tone?: string,
    language?: string,
    thinkingMode = false
  ) => {
    if (!userInput || userInput.trim() === '') {
      setError('Please enter some text or topic to continue.');
      showToast('Please enter some text or topic.', 'error');
      return null;
    }

    if (isLimitReached) {
      const msg =
        user.role === 'guest'
          ? "You've reached your 5 free generations today. Sign up for 20/day!"
          : 'Daily limit of 20 generations reached. Please check back tomorrow!';
      setError(msg);
      showToast(msg, 'error');
      return null;
    }

    setIsLoading(true);
    setIsThinking(thinkingMode);
    setProgressNotice(null);
    setError(null);

    try {
      const data = await generateAIContent(
        tool.slug,
        userInput.trim(),
        tool.systemPrompt,
        tone,
        language,
        thinkingMode,
        {
          onProgressNotice: (notice) => setProgressNotice(notice),
        }
      );

      setResult(data);
      setProgressNotice(null);

      // Record to history and update usage
      recordGeneration({
        toolSlug: tool.slug,
        toolName: tool.name,
        inputText: userInput.trim(),
        outputText: data.text,
        tone,
        language,
        thinkingMode: data.thinkingMode,
        modelUsed: data.modelUsed,
        wordCount: data.wordCount,
        isFavorite: false,
      });

      showToast(`Generated successfully with ${data.modelUsed}!`, 'success');
      return data;
    } catch (err: any) {
      const msg = err.message || 'Something went wrong while generating text. Please try again.';
      setError(msg);
      showToast(msg, 'error');
      return null;
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    generate,
    isLoading,
    isThinking,
    progressNotice,
    result,
    error,
    clearResult,
    remainingTodayCount,
    isLimitReached,
  };
}
