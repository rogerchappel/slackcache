export function slackTsToIso(ts: string): string {
  const seconds = Number.parseFloat(ts);
  if (!Number.isFinite(seconds)) return new Date(0).toISOString();
  return new Date(Math.floor(seconds * 1000)).toISOString();
}

export function compareSlackTs(a: string, b: string): number {
  return Number.parseFloat(a) - Number.parseFloat(b);
}
