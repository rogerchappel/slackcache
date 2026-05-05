import type { SearchHit, SlackCacheIndex } from './types.js';

export type SearchOptions = { channel?: string; limit?: number };

export function searchIndex(index: SlackCacheIndex, query: string, options: SearchOptions = {}): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const limit = options.limit ?? 20;
  if (terms.length === 0) return [];
  return index.messages
    .filter((message) => !options.channel || message.channelName === options.channel || message.channelId === options.channel)
    .map((message) => {
      const haystack = `${message.text} ${message.userName} ${message.channelName}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + occurrences(haystack, term), 0);
      return { ...message, score, snippet: snippet(message.text, terms[0]) };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || b.ts.localeCompare(a.ts))
    .slice(0, limit);
}

export function threadMessages(index: SlackCacheIndex, ts: string, channel?: string) {
  const root = index.messages.find((message) => message.ts === ts && (!channel || message.channelName === channel || message.channelId === channel));
  const threadTs = root?.threadTs ?? root?.ts ?? ts;
  return index.messages
    .filter((message) => (message.ts === threadTs || message.threadTs === threadTs) && (!channel || message.channelName === channel || message.channelId === channel))
    .sort((a, b) => a.ts.localeCompare(b.ts));
}

function occurrences(text: string, term: string): number {
  return text.split(term).length - 1;
}

function snippet(text: string, term: string): string {
  const lower = text.toLowerCase();
  const index = lower.indexOf(term.toLowerCase());
  if (index < 0) return text.slice(0, 160);
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + term.length + 90);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}
