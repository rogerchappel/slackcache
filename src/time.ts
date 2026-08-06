const SLACK_TIMESTAMP = /^\d+\.\d+$/;

export function isSlackTimestamp(ts: unknown): ts is string {
  if (typeof ts !== 'string' || !SLACK_TIMESTAMP.test(ts)) return false;
  const milliseconds = Number(ts) * 1000;
  return Number.isFinite(milliseconds) && !Number.isNaN(new Date(milliseconds).getTime());
}

export function slackTsToIso(ts: string): string {
  return new Date(Math.floor(Number(ts) * 1000)).toISOString();
}

export function compareSlackTs(a: string, b: string): number {
  return Number(a) - Number(b);
}
