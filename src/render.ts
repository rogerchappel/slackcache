import type { CachedMessage, ScopeReport, SearchHit } from './types.js';

export function renderScope(scope: ScopeReport): string {
  const redactions = Object.entries(scope.redactionCounts).map(([key, value]) => `${key}=${value}`).join(', ') || 'none';
  return [
    `Channels: ${scope.channelCount}`,
    `Users: ${scope.userCount}`,
    `Messages: ${scope.messageCount}`,
    `Range: ${scope.earliestMessage ?? 'n/a'} → ${scope.latestMessage ?? 'n/a'}`,
    `Redactions: ${redactions}`,
    ...scope.notes.map((note) => `- ${note}`)
  ].join('\n');
}

export function renderHits(hits: SearchHit[]): string {
  if (hits.length === 0) return 'No matches.';
  return hits.map((hit) => `${hit.isoTime} #${hit.channelName} ${hit.userName} (${hit.ts})\n  ${hit.snippet}`).join('\n\n');
}

export function renderThread(messages: CachedMessage[]): string {
  if (messages.length === 0) return 'No thread messages found.';
  return messages.map((message) => `${message.isoTime} #${message.channelName} ${message.userName}\n  ${message.text}`).join('\n');
}
