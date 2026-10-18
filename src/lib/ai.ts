// Frontend helper — sirf apni /api/ai route ko call karta hai
// Kabhi directly browser se AI Gateway ko nahi bulata (Security requirement)

export interface AiResult {
  text: string;
  error?: string;
  modelUsed?: string;
  wordCount?: number;
}

export async function runAiTool(
  systemPrompt: string,
  userInput: string,
  options?: {
    thinkingMode?: boolean;
    toolSlug?: string;
  }
): Promise<AiResult> {
  const apiBase = import.meta.env.VITE_API_BASE ?? '/api';

  try {
    const res = await fetch(`${apiBase}/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userInput,
        thinkingMode: options?.thinkingMode,
        toolSlug: options?.toolSlug,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        text: '',
        error: data.error ?? `Request failed with status ${res.status}`,
      };
    }

    return {
      text: data.text ?? '',
      modelUsed: data.modelUsed ?? '@cf/meta/llama-3.1-8b-instruct',
      wordCount: data.wordCount ?? (data.text ? data.text.split(/\s+/).filter(Boolean).length : 0),
    };
  } catch (err: any) {
    return {
      text: '',
      error: err?.message || 'Network error occurred while calling AI endpoint',
    };
  }
}
