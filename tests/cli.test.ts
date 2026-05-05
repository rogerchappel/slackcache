import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

test('CLI imports and searches fixture data', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-'));
  try {
    const importResult = await execFileAsync('node', ['dist/cli.js', 'import', 'fixtures/sample', '--output', dir]);
    assert.match(importResult.stdout, /Messages: 4/);
    const searchResult = await execFileAsync('node', ['dist/cli.js', 'search', 'runbook', '--index', dir]);
    assert.match(searchResult.stdout, /local runbook/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
