import path from 'node:path';
import { exists, listJsonFiles, readJson } from './fs.js';
import type { SlackChannel, SlackMessage, SlackUser } from './types.js';

export type LoadedSlackData = {
  mode: 'export' | 'api-fixture';
  users: SlackUser[];
  channels: SlackChannel[];
  messagesByChannel: Map<string, SlackMessage[]>;
};

export async function loadSlackSource(input: string): Promise<LoadedSlackData> {
  const root = path.resolve(input);
  const apiFile = path.join(root, 'messages.json');
  if (await exists(apiFile)) return loadApiFixture(root);
  return loadSlackExport(root);
}

async function loadApiFixture(root: string): Promise<LoadedSlackData> {
  const users = await maybeArray<SlackUser>(path.join(root, 'users.json'));
  const channels = await maybeArray<SlackChannel>(path.join(root, 'channels.json'));
  const messages = await readJson<Array<SlackMessage & { channel?: string; channel_name?: string }>>(path.join(root, 'messages.json'));
  const messagesByChannel = new Map<string, SlackMessage[]>();
  for (const message of messages) {
    const channelId = message.channel ?? message.channel_name ?? 'unknown';
    if (!messagesByChannel.has(channelId)) messagesByChannel.set(channelId, []);
    messagesByChannel.get(channelId)!.push(message);
  }
  return { mode: 'api-fixture', users, channels, messagesByChannel };
}

async function loadSlackExport(root: string): Promise<LoadedSlackData> {
  const users = await maybeArray<SlackUser>(path.join(root, 'users.json'));
  const channels = await maybeArray<SlackChannel>(path.join(root, 'channels.json'));
  const knownNames = new Set(channels.map((channel) => channel.name));
  const messagesByChannel = new Map<string, SlackMessage[]>();
  const files = await listJsonFiles(root);
  for (const file of files) {
    const rel = path.relative(root, file);
    const parts = rel.split(path.sep);
    if (parts.length !== 2 || parts[0] === '' || !/^\d{4}-\d{2}-\d{2}\.json$/.test(parts[1])) continue;
    const channelName = parts[0];
    if (['users.json', 'channels.json'].includes(channelName)) continue;
    if (knownNames.size > 0 && !knownNames.has(channelName)) continue;
    const messages = await readJson<SlackMessage[]>(file);
    if (!messagesByChannel.has(channelName)) messagesByChannel.set(channelName, []);
    messagesByChannel.get(channelName)!.push(...messages);
  }
  return { mode: 'export', users, channels, messagesByChannel };
}

async function maybeArray<T>(file: string): Promise<T[]> {
  if (!await exists(file)) return [];
  const data = await readJson<unknown>(file);
  return Array.isArray(data) ? data as T[] : [];
}
