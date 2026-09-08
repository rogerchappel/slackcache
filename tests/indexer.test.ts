import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildIndex } from '../src/indexer.js';
import { renderHits } from '../src/render.js';
import { searchIndex } from '../src/search.js';

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

test('orders valid Slack timestamps without losing integer or fractional precision', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-timestamp-order-'));
  try {
    await writeFile(path.join(dir, 'messages.json'), JSON.stringify([
      { channel: 'general', text: 'largest fraction', ts: '10.100000000000000001' },
      { channel: 'general', text: 'single-digit seconds', ts: '9.900000' },
      { channel: 'general', text: 'smaller fraction', ts: '10.100000000000000000' },
    ]));

    const index = await buildIndex(dir);
    assert.deepEqual(index.messages.map((message) => message.ts), [
      '9.900000',
      '10.100000000000000000',
      '10.100000000000000001',
    ]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
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

test('rejects missing, non-string, malformed, and non-finite Slack timestamps with source context', async () => {
  for (const timestamp of [undefined, 123, 'not-a-timestamp', '1e999']) {
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
          const rendered = typeof timestamp === 'string' ? `"${timestamp}"` : String(timestamp);
          assert.match(error.message, new RegExp(`Invalid Slack timestamp ${rendered}`));
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

test('rejects malformed thread timestamps in API fixtures and exports with source context', async () => {
  for (const mode of ['api-fixture', 'export'] as const) {
    const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-invalid-thread-ts-'));
    try {
      const messages = [
        { channel: 'general', ts: '1777586400.000100', text: 'root' },
        { channel: 'general', ts: '1777586401.000100', thread_ts: 'not-a-timestamp', text: 'reply' },
      ];
      if (mode === 'api-fixture') {
        await writeFile(path.join(dir, 'messages.json'), JSON.stringify(messages));
      } else {
        await mkdir(path.join(dir, 'general'));
        await writeFile(path.join(dir, 'general', '2026-05-01.json'), JSON.stringify(messages));
      }

      await assert.rejects(
        buildIndex(dir),
        (error: Error) => {
          assert.match(error.message, /Invalid Slack thread timestamp "not-a-timestamp"/);
          assert.match(error.message, /general, message 2/);
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

test('rejects non-array API, export, users, and channels JSON files', async () => {
  for (const relativeFile of ['messages.json', 'users.json', 'channels.json', 'general/2026-05-01.json']) {
    const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-invalid-shape-'));
    try {
      if (relativeFile.includes('/')) await mkdir(path.join(dir, 'general'));
      await writeFile(path.join(dir, relativeFile), JSON.stringify({ invalid: true }));
      await assert.rejects(buildIndex(dir), /top-level JSON array/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

test('rejects malformed API fixture and export message entries with file and channel context', async () => {
  for (const mode of ['api-fixture', 'export'] as const) {
    for (const entry of [null, 'message', { channel: 'general', ts: '1777586400.000100', text: { invalid: true } }]) {
      const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-invalid-message-'));
      try {
        const file = mode === 'api-fixture'
          ? path.join(dir, 'messages.json')
          : path.join(dir, 'general', '2026-05-01.json');
        if (mode === 'export') await mkdir(path.dirname(file));
        await writeFile(file, JSON.stringify([entry]));

        await assert.rejects(
          buildIndex(dir),
          (error: Error) => {
            assert.match(error.message, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
            const expectedChannel = mode === 'export' || (entry && typeof entry === 'object') ? 'general' : 'unknown';
            assert.match(error.message, new RegExp(`channel ${expectedChannel}, message 1`));
            assert.match(error.message, entry && typeof entry === 'object' ? /text must be a string/ : /must be an object/);
            return true;
          },
        );
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }
  }
});

test('rejects malformed user metadata entries in API fixtures and exports', async () => {
  const invalidEntries: Array<[unknown, RegExp]> = [
    [null, /entry must be an object/],
    [[], /entry must be an object/],
    ['user', /entry must be an object/],
    [{ name: 'ada' }, /id must be a non-empty string/],
    [{ id: 42 }, /id must be a non-empty string/],
    [{ id: 'U1', name: 42 }, /name must be a string/],
    [{ id: 'U1', real_name: false }, /real_name must be a string/],
    [{ id: 'U1', profile: [] }, /profile must be an object/],
    [{ id: 'U1', profile: { display_name: 42 } }, /profile\.display_name must be a string/],
    [{ id: 'U1', deleted: 'no' }, /deleted must be a boolean/],
  ];
  for (const mode of ['api-fixture', 'export'] as const) {
    for (const [entry, expected] of invalidEntries) {
      const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-invalid-user-'));
      try {
        const file = path.join(dir, 'users.json');
        await writeFile(file, JSON.stringify([entry]));
        if (mode === 'api-fixture') await writeFile(path.join(dir, 'messages.json'), '[]');
        await assert.rejects(buildIndex(dir), (error: Error) => {
          assert.match(error.message, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          assert.match(error.message, /Slack user.*user 1/);
          assert.match(error.message, expected);
          return true;
        });
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }
  }
});

test('rejects malformed channel metadata entries in API fixtures and exports', async () => {
  const invalidEntries: Array<[unknown, RegExp]> = [
    [null, /entry must be an object/],
    [[], /entry must be an object/],
    [7, /entry must be an object/],
    [{ name: 'general' }, /id must be a non-empty string/],
    [{ id: 'C1' }, /name must be a non-empty string/],
    [{ id: 'C1', name: { invalid: true } }, /name must be a non-empty string/],
    [{ id: 'C1', name: 'general', is_archived: 'no' }, /is_archived must be a boolean/],
  ];
  for (const mode of ['api-fixture', 'export'] as const) {
    for (const [entry, expected] of invalidEntries) {
      const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-invalid-channel-'));
      try {
        const file = path.join(dir, 'channels.json');
        await writeFile(file, JSON.stringify([entry]));
        if (mode === 'api-fixture') await writeFile(path.join(dir, 'messages.json'), '[]');
        await assert.rejects(buildIndex(dir), (error: Error) => {
          assert.match(error.message, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          assert.match(error.message, /Slack channel.*channel 1/);
          assert.match(error.message, expected);
          return true;
        });
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }
  }
});

test('imports, searches, and renders messages with omitted or string text', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-valid-message-'));
  try {
    await writeFile(path.join(dir, 'messages.json'), JSON.stringify([
      { channel: 'general', ts: '1777586400.000100' },
      { channel: 'general', ts: '1777586401.000100', text: 'deploy ready' },
    ]));

    const index = await buildIndex(dir);
    assert.deepEqual(index.messages.map((message) => message.text), ['', 'deploy ready']);
    assert.match(renderHits(searchIndex(index, 'deploy')), /deploy ready/);
  } finally {
    await rm(dir, { recursive: true, force: true });
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
