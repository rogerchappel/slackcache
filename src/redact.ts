export type RedactionResult = { text: string; labels: string[] };

const rules: Array<{ label: string; pattern: RegExp; replacement: string }> = [
  { label: 'email', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, replacement: '[redacted:email]' },
  { label: 'slack-token', pattern: /xox[baprs]-[A-Za-z0-9-]+/g, replacement: '[redacted:slack-token]' },
  { label: 'generic-token', pattern: /\b(?:api[_-]?key|token|secret)\s*[:=]\s*['\"]?[^\s'\"]+/gi, replacement: '[redacted:secret]' },
  { label: 'url', pattern: /https?:\/\/[^\s>)]+/gi, replacement: '[redacted:url]' }
];

export function redactText(input = '', enabled = true): RedactionResult {
  if (!enabled) return { text: input, labels: [] };
  let text = input;
  const labels: string[] = [];
  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      labels.push(rule.label);
      rule.pattern.lastIndex = 0;
      text = text.replace(rule.pattern, rule.replacement);
    }
    rule.pattern.lastIndex = 0;
  }
  return { text, labels };
}
