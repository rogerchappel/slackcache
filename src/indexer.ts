import path from 'node:path';
import { loadSlackSource } from './loader.js';
import { redactText } from './redact.js';
import { compareSlackTs, isSlackTimestamp, slackTsToIso } from './time.js';
import type { CachedMessage, ScopeReport, SlackCacheIndex, SlackChannel, SlackUser } from './types.js';

export type BuildIndexOptions = { redact?: boolean };

export async function buildIndex(input: string, options: BuildIndexOptions = {}): Promise<SlackCacheIndex> {
  const sourcePath = path.resolve(input);
  const loaded = await loadSlackSource(sourcePath);
  const redact = options.redact !== false;
  const sourceUsers = dedupeById(loaded.users);
  const channels = ensureChannels(loaded.channels, loaded.messagesByChannel);
  const userNames = new Map(sourceUsers.map((user) => [user.id, user.profile?.display_name || user.profile?.real_name || user.real_name || user.name || user.id]));
  const { users, profileEmailRedactions } = sanitizeUsers(sourceUsers, redact);
  const channelByNameOrId = new Map<string, SlackChannel>();
  for (const channel of channels) {
    channelByNameOrId.set(channel.name, channel);
    channelByNameOrId.set(channel.id, channel);
  }

  const messages: CachedMessage[] = [];
  for (const [channelKey, rawMessages] of loaded.messagesByChannel) {
    const channel = channelByNameOrId.get(channelKey) ?? { id: channelKey, name: channelKey };
    for (const [messageIndex, raw] of rawMessages.entries()) {
      if (!isSlackTimestamp(raw.ts)) {
        const timestamp = typeof raw.ts === 'string' ? `"${raw.ts}"` : String(raw.ts);
        throw new Error(
          `Invalid Slack timestamp ${timestamp} in ${sourcePath} (${channelKey}, message ${messageIndex + 1}): ` +
          'expected digits followed by a decimal point and fractional digits (for example, "1777586400.000100").',
        );
      }
      if (raw.thread_ts !== undefined && !isSlackTimestamp(raw.thread_ts)) {
        const timestamp = typeof raw.thread_ts === 'string' ? `"${raw.thread_ts}"` : String(raw.thread_ts);
        throw new Error(
          `Invalid Slack thread timestamp ${timestamp} in ${sourcePath} (${channelKey}, message ${messageIndex + 1}): ` +
          'expected digits followed by a decimal point and fractional digits (for example, "1777586400.000100").',
        );
      }
      const redacted = redactText(raw.text ?? '', redact);
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
    scope: buildScopeReport(users, channels, messages, profileEmailRedactions),
    users,
    channels,
    messages
  };
}

function sanitizeUsers(users: SlackUser[], redact: boolean): { users: SlackUser[]; profileEmailRedactions: number } {
  if (!redact) return { users, profileEmailRedactions: 0 };
  let profileEmailRedactions = 0;
  const sanitized = users.map((user) => {
    if (!user.profile || !('email' in user.profile)) return user;
    const { email, ...profile } = user.profile;
    if (typeof email === 'string' && email.length > 0) profileEmailRedactions += 1;
    return { ...user, profile };
  });
  return { users: sanitized, profileEmailRedactions };
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

function buildScopeReport(users: SlackUser[], channels: SlackChannel[], messages: CachedMessage[], profileEmailRedactions: number): ScopeReport {
  const redactionCounts: Record<string, number> = {};
  for (const message of messages) {
    for (const label of message.redactions) redactionCounts[label] = (redactionCounts[label] ?? 0) + 1;
  }
  if (profileEmailRedactions > 0) redactionCounts['profile-email'] = profileEmailRedactions;
  return {
    channelCount: channels.length,
    userCount: users.length,
    messageCount: messages.length,
    earliestMessage: messages.at(0)?.isoTime,
    latestMessage: messages.at(-1)?.isoTime,
    redactionCounts,
    notes: ['No network calls were made.', 'Only local fixture/export files were read.', 'Message text and user profile emails are redacted by default.']
  };
}
