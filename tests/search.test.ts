import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIndex } from '../src/indexer.js';
import { searchIndex, threadMessages } from '../src/search.js';
import type { SlackCacheIndex } from '../src/types.js';

test('searches cached messages by term and channel', async () => {
  const index = await buildIndex('fixtures/sample');
  const hits = searchIndex(index, 'deploy', { channel: 'general' });
  assert.equal(hits.length, 2);
  assert.equal(hits[0]?.channelName, 'general');
});

test('returns root and replies for a thread', async () => {
  const index = await buildIndex('fixtures/sample');
  const thread = threadMessages(index, '1777586400.000100', 'general');
  assert.equal(thread.length, 2);
  assert.equal(thread[1]?.userName, 'grace');
});

test('infers the root channel when no channel is supplied', async () => {
  const index = await buildIndex('fixtures/sample');
  const unrelatedReply = {
    ...index.messages[1]!,
    id: 'C002:1777586460.000200',
    channelId: 'C002',
    channelName: 'random',
  };
  const thread = threadMessages(withMessages(index, [...index.messages, unrelatedReply]), '1777586400.000100');

  assert.equal(thread.length, 2);
  assert.ok(thread.every((message) => message.channelName === 'general'));
});

test('rejects an ambiguous root timestamp unless a channel is supplied', async () => {
  const index = await buildIndex('fixtures/sample');
  const duplicateRoot = {
    ...index.messages[0]!,
    id: 'C002:1777586400.000100',
    channelId: 'C002',
    channelName: 'random',
  };
  const ambiguousIndex = withMessages(index, [...index.messages, duplicateRoot]);

  assert.throws(
    () => threadMessages(ambiguousIndex, '1777586400.000100'),
    /Timestamp 1777586400\.000100 matches threads in multiple channels \(general, random\)\. Retry with --channel <name-or-id>\./,
  );
  assert.deepEqual(
    threadMessages(ambiguousIndex, '1777586400.000100', 'random').map((message) => message.channelName),
    ['random'],
  );
});

test('uses exact timestamp order for search recency and thread chronology', async () => {
  const index = await buildIndex('fixtures/sample');
  const root = { ...index.messages[0]!, id: 'C001:9.900000', ts: '9.900000', text: 'matching root', threadTs: undefined };
  const olderReply = { ...root, id: 'C001:10.100000000000000000', ts: '10.100000000000000000', text: 'matching reply', threadTs: root.ts };
  const newerReply = { ...root, id: 'C001:10.100000000000000001', ts: '10.100000000000000001', text: 'matching reply', threadTs: root.ts };
  const preciseIndex = withMessages(index, [newerReply, root, olderReply]);

  assert.deepEqual(searchIndex(preciseIndex, 'matching').map((hit) => hit.ts), [newerReply.ts, olderReply.ts, root.ts]);
  assert.deepEqual(threadMessages(preciseIndex, root.ts).map((message) => message.ts), [root.ts, olderReply.ts, newerReply.ts]);
});

function withMessages(index: SlackCacheIndex, messages: SlackCacheIndex['messages']): SlackCacheIndex {
  return { ...index, messages };
}
