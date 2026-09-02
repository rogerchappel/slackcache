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
  const [aSeconds = '', aFraction = ''] = a.split('.');
  const [bSeconds = '', bFraction = ''] = b.split('.');
  const normalizedASeconds = aSeconds.replace(/^0+(?=\d)/, '');
  const normalizedBSeconds = bSeconds.replace(/^0+(?=\d)/, '');

  if (normalizedASeconds.length !== normalizedBSeconds.length) {
    return normalizedASeconds.length < normalizedBSeconds.length ? -1 : 1;
  }
  if (normalizedASeconds !== normalizedBSeconds) {
    return normalizedASeconds < normalizedBSeconds ? -1 : 1;
  }

  const width = Math.max(aFraction.length, bFraction.length);
  const normalizedAFraction = aFraction.padEnd(width, '0');
  const normalizedBFraction = bFraction.padEnd(width, '0');
  if (normalizedAFraction === normalizedBFraction) return 0;
  return normalizedAFraction < normalizedBFraction ? -1 : 1;
}
