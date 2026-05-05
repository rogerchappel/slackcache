import path from 'node:path';
import { loadSlackSource } from './loader.js';
import { redactText } from './redact.js';
import { compareSlackTs, slackTsToIso } from './time.js';
import type { CachedMessage, ScopeReport, SlackCacheIndex, SlackChannel, SlackUser } from './types.js';

export type BuildIndexOptions = { redact?: boolean };

export async function buildIndex(input: string, options: BuildIndexOptions = {}): Promise<SlackCacheIndex> {
  const sourcePath = path.resolve(input);
  const loaded = await loadSlackSource(sourcePath);
  const users = dedupeById(loaded.users);
  const channels = ensureChannels(loaded.channels, loaded.messagesByChannel);
  const userNames = new Map(users.map((user) => [user.id, user.profile?.display_name || user.profile?.real_name || user.real_name || user.name || user.id]));
  const channelByNameOrId = new Map<string, SlackChannel>();
  for (const channel of channels) {
    channelByNameOrId.set(channel.name, channel);
    channelByNameOrId.set(channel.id, channel);
  }

  const messages: CachedMessage[] = [];
  for (const [channelKey, rawMessages] of loaded.messagesByChannel) {
    const channel = channelByNameOrId.get(channelKey) ?? { id: channelKey, name: channelKey };
    for (const raw of rawMessages) {
      if (!raw.ts) continue;
      const redacted = redactText(raw.text ?? '', options.redact !== false);
      messages.push({
        id: `${channel.id}:${raw.ts}`,
        channelId: channel.id,
        channelName: channel.name,
        userId: raw.user,
        userName: raw.user ? userNames.get(raw.user) ?? raw.user : raw.username ?? raw.bot_id ?? 'unknown',
        text: redacted.text,
        ts: raw.ts,
        isoTime: slackTsToIso(raw.ts),
        threadTs: raw.thread_ts,
        redactions: redacted.labels,
        fileCount: raw.files?.length ?? 0
      });
    }
  }
  messages.sort((a, b) => compareSlackTs(a.ts, b.ts));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: { path: sourcePath, mode: loaded.mode, network: false },
    scope: buildScopeReport(users, channels, messages),
    users,
    channels,
    messages
  };
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.filter((item) => item.id).map((item) => [item.id, item])).values()].sort((a, b) => a.id.localeCompare(b.id));
}

function ensureChannels(channels: SlackChannel[], messagesByChannel: Map<string, unknown[]>): SlackChannel[] {
  const byName = new Map(channels.map((channel) => [channel.name, channel]));
  const byId = new Map(channels.map((channel) => [channel.id, channel]));
  const result = [...channels];
  for (const key of messagesByChannel.keys()) {
    if (!byName.has(key) && !byId.has(key)) result.push({ id: key, name: key });
  }
  return dedupeById(result);
}

function buildScopeReport(users: SlackUser[], channels: SlackChannel[], messages: CachedMessage[]): ScopeReport {
  const redactionCounts: Record<string, number> = {};
  for (const message of messages) {
    for (const label of message.redactions) redactionCounts[label] = (redactionCounts[label] ?? 0) + 1;
  }
  return {
    channelCount: channels.length,
    userCount: users.length,
    messageCount: messages.length,
    earliestMessage: messages.at(0)?.isoTime,
    latestMessage: messages.at(-1)?.isoTime,
    redactionCounts,
    notes: ['No network calls were made.', 'Only local fixture/export files were read.', 'Message text is redacted by default.']
  };
}
