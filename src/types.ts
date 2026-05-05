export type SlackUser = {
  id: string;
  name?: string;
  real_name?: string;
  profile?: { email?: string; real_name?: string; display_name?: string };
  deleted?: boolean;
  is_bot?: boolean;
};

export type SlackChannel = {
  id: string;
  name: string;
  is_archived?: boolean;
  is_channel?: boolean;
  is_group?: boolean;
};

export type SlackMessage = {
  type?: string;
  user?: string;
  username?: string;
  bot_id?: string;
  text?: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{ name: string; count: number; users?: string[] }>;
  files?: Array<{ id?: string; name?: string; mimetype?: string; url_private?: string }>;
};

export type CachedMessage = {
  id: string;
  channelId: string;
  channelName: string;
  userId?: string;
  userName: string;
  text: string;
  ts: string;
  isoTime: string;
  threadTs?: string;
  redactions: string[];
  fileCount: number;
};

export type SlackCacheIndex = {
  schemaVersion: 1;
  generatedAt: string;
  source: { path: string; mode: 'export' | 'api-fixture'; network: false };
  scope: ScopeReport;
  users: SlackUser[];
  channels: SlackChannel[];
  messages: CachedMessage[];
};

export type ScopeReport = {
  channelCount: number;
  userCount: number;
  messageCount: number;
  earliestMessage?: string;
  latestMessage?: string;
  redactionCounts: Record<string, number>;
  notes: string[];
};

export type SearchHit = CachedMessage & { score: number; snippet: string };
