import assert from 'node:assert/strict';
import test from 'node:test';
import { redactText } from '../src/redact.js';

test('redacts emails, urls, and Slack tokens', () => {
  const result = redactText('email me ada@example.com see https://x.test token=xoxb-123');
  assert.equal(result.text.includes('ada@example.com'), false);
  assert.equal(result.text.includes('https://x.test'), false);
  assert.equal(result.text.includes('xoxb-123'), false);
  assert.deepEqual(result.labels.sort(), ['email', 'generic-token', 'url']);
});

test('can leave text untouched when disabled', () => {
  const result = redactText('ada@example.com', false);
  assert.equal(result.text, 'ada@example.com');
  assert.deepEqual(result.labels, []);
});
