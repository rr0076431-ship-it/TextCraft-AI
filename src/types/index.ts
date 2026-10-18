export interface ToolConfig {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'writing' | 'editing' | 'business' | 'creative' | 'marketing';
  inputLabel: string;
  inputPlaceholder: string;
  sampleInput: string;
  systemPrompt: string;
  toneSelectorEnabled: boolean;
  languageSelectorEnabled: boolean;
  supportsHighThinking: boolean;
  outputFormat: 'article' | 'paragraphs' | 'bullet_points' | 'email' | 'social' | 'translation' | 'seo';
}

export interface GenerationRecord {
  id: string;
  toolSlug: string;
  toolName: string;
  inputText: string;
  outputText: string;
  tone?: string;
  language?: string;
  thinkingMode: boolean;
  modelUsed: string;
  timestamp: number;
  wordCount: number;
  isFavorite?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  dailyLimit: number;
  createdAt: number;
}

export interface DailyUsage {
  date: string;
  count: number;
  toolCounts: Record<string, number>;
}

export interface ToolUsageStat {
  slug: string;
  name: string;
  totalUses: number;
  todayUses: number;
  isEnabled: boolean;
}
