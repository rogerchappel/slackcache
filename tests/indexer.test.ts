import assert from 'node:assert/strict';
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
