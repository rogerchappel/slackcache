import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import { buildIndex } from '../src/indexer.js';
import { saveIndex } from '../src/store.js';

const execFileAsync = promisify(execFile);

async function pathExists(target: string): Promise<boolean> {
  return access(target).then(() => true, () => false);
}

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

test('CLI preserves inspect, output, and multiword search aliases', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-'));
  try {
    await execFileAsync('node', ['dist/src/cli.js', 'inspect', 'fixtures/sample', '-o', dir]);
    const searchResult = await execFileAsync(
      'node',
      ['dist/src/cli.js', 'search', 'local', 'runbook', '--output', dir],
    );
    assert.match(searchResult.stdout, /local runbook/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CLI rejects unknown options before writing an index', async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-invalid-'));
  const requestedOutput = path.join(cwd, 'requested');
  try {
    for (const args of [
      ['import', path.resolve('fixtures/sample'), '--ouput', requestedOutput],
      ['import', path.resolve('fixtures/sample'), '--unknown'],
    ]) {
      await assert.rejects(
        execFileAsync('node', [path.resolve('dist/src/cli.js'), ...args], { cwd }),
        (error: Error & { code?: number; stderr?: string }) => {
          assert.notEqual(error.code, 0);
          assert.match(error.stderr ?? '', /Unknown option for import: --(?:ouput|unknown)/);
          return true;
        },
      );
      assert.equal(await pathExists(path.join(cwd, '.slackcache')), false);
      assert.equal(await pathExists(requestedOutput), false);
    }
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('CLI rejects surplus command arguments before reading or writing an index', async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-invalid-'));
  const requestedOutput = path.join(cwd, 'requested');
  try {
    for (const args of [
      ['import', path.resolve('fixtures/sample'), 'extra', '--output', requestedOutput],
      ['scope', 'extra'],
      ['thread', '1777586400.000100', 'extra'],
    ]) {
      await assert.rejects(
        execFileAsync('node', [path.resolve('dist/src/cli.js'), ...args], { cwd }),
        (error: Error & { code?: number; stderr?: string }) => {
          assert.notEqual(error.code, 0);
          assert.match(error.stderr ?? '', /received unexpected argument: extra/);
          return true;
        },
      );
      assert.equal(await pathExists(path.join(cwd, '.slackcache')), false);
      assert.equal(await pathExists(requestedOutput), false);
    }
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('CLI import reports malformed Slack timestamps without writing an epoch range', async () => {
  const fixtureDir = await mkdtemp(path.join(tmpdir(), 'slackcache-invalid-ts-'));
  const outputDir = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-'));
  try {
    await writeFile(path.join(fixtureDir, 'messages.json'), JSON.stringify([
      { channel: 'general', ts: 'not-a-timestamp', text: 'deploy update' },
    ]));

    await assert.rejects(
      execFileAsync('node', ['dist/src/cli.js', 'import', fixtureDir, '--output', outputDir]),
      (error: Error & { stderr?: string }) => {
        assert.match(error.stderr ?? '', /Invalid Slack timestamp "not-a-timestamp"/);
        assert.match(error.stderr ?? '', /general, message 1/);
        assert.doesNotMatch(error.stderr ?? '', /1970-01-01/);
        return true;
      },
    );
  } finally {
    await rm(fixtureDir, { recursive: true, force: true });
    await rm(outputDir, { recursive: true, force: true });
  }
});

test('CLI limits search results with a positive integer', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-'));
  try {
    await execFileAsync('node', ['dist/src/cli.js', 'import', 'fixtures/sample', '--output', dir]);
    const result = await execFileAsync(
      'node',
      ['dist/src/cli.js', 'search', 'deploy', '--index', dir, '--limit', '1'],
    );
    assert.equal(result.stdout.match(/^\d{4}-\d{2}-\d{2}T/gm)?.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CLI rejects invalid search limits', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'slackcache-cli-'));
  try {
    await execFileAsync('node', ['dist/src/cli.js', 'import', 'fixtures/sample', '--output', dir]);
    const invalidLimits = [
      { args: ['--limit'], message: /--limit must be a positive integer/ },
      { args: ['--limit', '0'], message: /--limit must be a positive integer/ },
      { args: ['--limit', '-1'], message: /--limit must be a positive integer/ },
      { args: ['--limit', '1x'], message: /--limit must be a positive integer/ },
      { args: ['--limit', '1.5'], message: /--limit must be a positive integer/ },
      { args: ['--limit', '9007199254740992'], message: /--limit must be a positive safe integer/ },
    ];

    for (const invalid of invalidLimits) {
      await assert.rejects(
        execFileAsync(
          'node',
          ['dist/src/cli.js', 'search', 'deploy', '--index', dir, ...invalid.args],
        ),
        (error: Error & { code?: number; stderr?: string }) => {
          assert.notEqual(error.code, 0);
          assert.match(error.stderr ?? '', invalid.message);
          return true;
        },
      );
    }
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
