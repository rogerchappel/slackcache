import path from 'node:path';
import { readJson, writeJson } from './fs.js';
import type { SlackCacheIndex } from './types.js';

export const INDEX_FILE = 'slackcache.index.json';

export function indexPath(output: string): string {
  return path.join(path.resolve(output), INDEX_FILE);
}

export async function saveIndex(output: string, index: SlackCacheIndex): Promise<string> {
  const file = indexPath(output);
  await writeJson(file, index);
  return file;
}

export async function loadIndex(output: string): Promise<SlackCacheIndex> {
  return readJson<SlackCacheIndex>(indexPath(output));
}
