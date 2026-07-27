import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import { buildIndex } from '../src/indexer.js';
import { saveIndex } from '../src/store.js';

const execFileAsync = promisify(execFile);

test('CLI imports and searches fixture data', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-'));
  try {
    const importResult = await execFileAsync('node', ['dist/src/cli.js', 'import', 'fixtures/sample', '--output', dir]);
    assert.match(importResult.stdout, /Messages: 4/);
    const searchResult = await execFileAsync('node', ['dist/src/cli.js', 'search', 'runbook', '--index', dir]);
    assert.match(searchResult.stdout, /local runbook/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CLI explains how to disambiguate a timestamp shared by channels', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-'));
  try {
    const index = await buildIndex('fixtures/sample');
    index.messages.push({
      ...index.messages[0]!,
      id: 'C002:1777586400.000100',
      channelId: 'C002',
      channelName: 'random',
    });
    await saveIndex(dir, index);

    await assert.rejects(
      execFileAsync('node', ['dist/src/cli.js', 'thread', '1777586400.000100', '--index', dir]),
      (error: Error & { stderr?: string }) => {
        assert.match(error.stderr ?? '', /matches threads in multiple channels \(general, random\)/);
        assert.match(error.stderr ?? '', /Retry with --channel <name-or-id>/);
        return true;
      },
    );

    const resolved = await execFileAsync(
      'node',
      ['dist/src/cli.js', 'thread', '1777586400.000100', '--index', dir, '--channel', 'random'],
    );
    assert.match(resolved.stdout, /#random/);
    assert.doesNotMatch(resolved.stdout, /#general/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
