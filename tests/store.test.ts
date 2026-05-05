import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildIndex } from '../src/indexer.js';
import { loadIndex, saveIndex } from '../src/store.js';

test('saves and loads the JSON cache index', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-test-'));
  try {
    const index = await buildIndex('fixtures/sample');
    await saveIndex(dir, index);
    const loaded = await loadIndex(dir);
    assert.equal(loaded.messages.length, index.messages.length);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
