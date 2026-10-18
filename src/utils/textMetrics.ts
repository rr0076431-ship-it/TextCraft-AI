/**
 * Utility functions for text analysis and calculation
 */

export function countWords(text: string): number {
  if (!text || text.trim() === '') return 0;
  // Match words across Latin, Arabic/Urdu, and punctuation
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function countCharacters(text: string, includeSpaces = true): number {
  if (!text) return 0;
  return includeSpaces ? text.length : text.replace(/\s+/g, '').length;
}

export function estimateReadingTime(words: number): string {
  if (words <= 0) return '0 min read';
  const minutes = Math.ceil(words / 200); // Standard 200 wpm
  return minutes === 1 ? '1 min read' : `${minutes} mins read`;
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getRoleDailyLimit(role: 'guest' | 'user' | 'admin'): number {
  if (role === 'admin') return 9999;
  if (role === 'user') return 20;
  return 5;
}

export function isLimitReached(usedCount: number, role: 'guest' | 'user' | 'admin'): boolean {
  const limit = getRoleDailyLimit(role);
  return usedCount >= limit;
}
