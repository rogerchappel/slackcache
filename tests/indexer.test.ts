import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildIndex } from '../src/indexer.js';

test('builds a local export index with scope and redactions', async () => {
  const index = await buildIndex('fixtures/sample');
  assert.equal(index.source.network, false);
  assert.equal(index.scope.channelCount, 2);
  assert.equal(index.scope.userCount, 2);
  assert.equal(index.scope.messageCount, 4);
  assert.equal(index.scope.redactionCounts.email, 1);
  assert.equal(index.scope.redactionCounts.url, 1);
});

test('builds an API fixture index without network calls', async () => {
  const index = await buildIndex('fixtures/api');
  assert.equal(index.source.mode, 'api-fixture');
  assert.equal(index.messages[0]?.channelName, 'agent-handoff');
});

test('discovers export channels missing from channels.json', async () => {
  const index = await buildIndex('fixtures/incomplete-channels');

  assert.equal(index.scope.channelCount, 2);
  assert.equal(index.scope.messageCount, 2);
  assert.deepEqual(index.channels, [
    { id: 'C_GENERAL', name: 'general', is_channel: true },
    { id: 'private-room', name: 'private-room' }
  ]);
  assert.deepEqual(index.messages.map(({ channelName, text }) => ({ channelName, text })), [
    { channelName: 'general', text: 'public' },
    { channelName: 'private-room', text: 'private' }
  ]);
});

test('rejects malformed and non-finite Slack message timestamps with source context', async () => {
  for (const timestamp of ['not-a-timestamp', '1e999']) {
    const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-invalid-ts-'));
    try {
      await mkdir(path.join(dir, 'general'));
      await writeFile(
        path.join(dir, 'general', '2026-05-01.json'),
        JSON.stringify([{ ts: timestamp, text: 'deploy update' }]),
      );

      await assert.rejects(
        buildIndex(dir),
        (error: Error) => {
          assert.match(error.message, new RegExp(`Invalid Slack timestamp "${timestamp}"`));
          assert.match(error.message, /general, message 1/);
          assert.match(error.message, new RegExp(dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          assert.match(error.message, /digits followed by a decimal point and fractional digits/);
          return true;
        },
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

test('preserves valid fractional Slack timestamps, ordering, scope, search, and threads', async () => {
  const index = await buildIndex('fixtures/sample');

  assert.deepEqual(index.messages.map((message) => message.ts), [
    '1777586400.000100',
    '1777586460.000200',
    '1777587000.000100',
    '1777590000.000300',
  ]);
  assert.equal(index.scope.earliestMessage, '2026-04-30T22:00:00.000Z');
  assert.equal(index.scope.latestMessage, '2026-04-30T23:00:00.000Z');
});
