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
  const messageFile = path.join(root, 'messages.json');
  const messages = validateMessages(await readArray<unknown>(messageFile), messageFile);
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
  const messagesByChannel = new Map<string, SlackMessage[]>();
  const files = await listJsonFiles(root);
  for (const file of files) {
    const rel = path.relative(root, file);
    const parts = rel.split(path.sep);
    if (parts.length !== 2 || parts[0] === '' || !/^\d{4}-\d{2}-\d{2}\.json$/.test(parts[1])) continue;
    const channelName = parts[0];
    const messages = validateMessages(await readArray<unknown>(file), file, channelName);
    if (!messagesByChannel.has(channelName)) messagesByChannel.set(channelName, []);
    messagesByChannel.get(channelName)!.push(...messages);
  }
  return { mode: 'export', users, channels, messagesByChannel };
}

async function maybeArray<T>(file: string): Promise<T[]> {
  if (!await exists(file)) return [];
  return readArray<T>(file);
}

async function readArray<T>(file: string): Promise<T[]> {
  const data = await readJson<unknown>(file);
  if (!Array.isArray(data)) throw new Error(`Expected ${file} to contain a top-level JSON array`);
  return data as T[];
}

type ApiSlackMessage = SlackMessage & { channel?: string; channel_name?: string };

function validateMessages(entries: unknown[], file: string, exportChannel?: string): ApiSlackMessage[] {
  return entries.map((entry, index) => {
    const channel = exportChannel ?? getMessageChannel(entry) ?? 'unknown';
    const context = `${file} (channel ${channel}, message ${index + 1})`;
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`Invalid Slack message in ${context}: entry must be an object.`);
    }
    const message = entry as Record<string, unknown>;
    if (message.text !== undefined && typeof message.text !== 'string') {
      throw new Error(`Invalid Slack message in ${context}: text must be a string when present.`);
    }
    return entry as ApiSlackMessage;
  });
}

function getMessageChannel(entry: unknown): string | undefined {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return undefined;
  const message = entry as Record<string, unknown>;
  if (typeof message.channel === 'string') return message.channel;
  if (typeof message.channel_name === 'string') return message.channel_name;
  return undefined;
}
