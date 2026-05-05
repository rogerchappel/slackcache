import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIndex } from '../src/indexer.js';
import { searchIndex, threadMessages } from '../src/search.js';

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
