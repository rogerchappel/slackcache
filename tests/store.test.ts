import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
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

for (const fixture of ['sample', 'api']) {
  test(`default cache serialization omits profile emails from ${fixture} fixtures`, async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-private-'));
    try {
      const index = await buildIndex(`fixtures/${fixture}`);
      await saveIndex(dir, index);
      const serialized = await readFile(path.join(dir, 'slackcache.index.json'), 'utf8');

      assert.doesNotMatch(serialized, /[a-z]+@example\.com/);
      assert.equal(index.users.every((user) => user.profile?.email === undefined), true);
      assert.equal(index.users.every((user) => Boolean(user.id && (user.name || user.profile?.display_name))), true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}

test('disabled redaction preserves profile emails in the serialized cache', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-raw-'));
  try {
    const index = await buildIndex('fixtures/sample', { redact: false });
    await saveIndex(dir, index);
    const serialized = await readFile(path.join(dir, 'slackcache.index.json'), 'utf8');

    assert.match(serialized, /ada@example\.com/);
    assert.equal(index.scope.redactionCounts['profile-email'], undefined);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
