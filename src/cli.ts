#!/usr/bin/env node
import { buildIndex } from './indexer.js';
import { renderHits, renderScope, renderThread } from './render.js';
import { searchIndex, threadMessages } from './search.js';
import { loadIndex, saveIndex } from './store.js';

type Args = { _: string[] } & { [key: string]: string | boolean | string[] | undefined };

async function main(argv = process.argv.slice(2)): Promise<void> {
  const args = parseArgs(argv);
  const command = args._[0];
  if (!command || args.help || args.h) return printHelp();

  if (command === 'import' || command === 'inspect') {
    const input = String(args._[1] ?? args.input ?? '');
    if (!input) throw new Error('import requires an input Slack export/fixture path');
    const output = String(args.output ?? args.o ?? './.slackcache');
    const index = await buildIndex(input, { redact: args.redact !== false && args.redact !== 'false' });
    const file = await saveIndex(output, index);
    console.log(`Wrote ${file}`);
    console.log(renderScope(index.scope));
    return;
  }

  if (command === 'scope') {
    const index = await loadIndex(String(args.index ?? args.output ?? args.o ?? './.slackcache'));
    console.log(renderScope(index.scope));
    return;
  }

  if (command === 'search') {
    const query = String(args._.slice(1).join(' ') || args.query || '');
    if (!query) throw new Error('search requires a query');
    const index = await loadIndex(String(args.index ?? args.output ?? args.o ?? './.slackcache'));
    console.log(renderHits(searchIndex(index, query, { channel: stringOpt(args.channel), limit: numberOpt(args.limit) })));
    return;
  }

  if (command === 'thread') {
    const ts = String(args._[1] ?? args.ts ?? '');
    if (!ts) throw new Error('thread requires a Slack timestamp');
    const index = await loadIndex(String(args.index ?? args.output ?? args.o ?? './.slackcache'));
    console.log(renderThread(threadMessages(index, ts, stringOpt(args.channel))));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function parseArgs(argv: string[]): Args {
  const out: Args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('-')) {
      out._.push(token);
      continue;
    }
    const key = token.replace(/^--?/, '');
    const next = argv[i + 1];
    if (!next || next.startsWith('-')) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function stringOpt(value: string | boolean | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function numberOpt(value: string | boolean | string[] | undefined): number | undefined {
  if (typeof value !== 'string') return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function printHelp(): void {
  console.log(`slackcache — local-first Slack archive cache\n\nUsage:\n  slackcache import <export-dir> --output ./.slackcache\n  slackcache inspect <export-dir> --output ./.slackcache\n  slackcache scope --index ./.slackcache\n  slackcache search "deploy key" --index ./.slackcache [--channel general] [--limit 5]\n  slackcache thread <slack-ts> --index ./.slackcache [--channel general]\n\nDefaults are privacy-first: local files only, redaction on, no network calls.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
