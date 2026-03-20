import { test } from 'node:test';
import assert from 'node:assert';
import { sanitizeHtml } from './sanitize.js';

test('sanitizeHtml removes script tags', () => {
  const input = '<div>Hello</div><script>alert("xss")</script>';
  const expected = '<div>Hello</div>';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml removes style tags', () => {
  const input = '<div>Hello</div><style>body { background: red; }</style>';
  const expected = '<div>Hello</div>';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml removes event handlers (quoted)', () => {
  const input = '<button onclick="alert(\'xss\')">Click me</button><img src="x" onerror="alert(1)">';
  const expected = 'Click me<img src="x">'; // button is not in whitelist
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml removes event handlers (unquoted)', () => {
  const input = '<img src="x" onerror=alert(1)>';
  const expected = '<img src="x">';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml replaces javascript URIs (quoted)', () => {
  const input = '<a href="javascript:alert(\'xss\')">Link</a>';
  const expected = '<a href="#">Link</a>';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml replaces javascript URIs (unquoted)', () => {
  const input = '<a href=javascript:alert(\'xss\')>Link</a>';
  const expected = '<a href="#">Link</a>';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml removes non-whitelisted tags', () => {
  const input = '<iframe></iframe><object></object><embed></embed><form><input></form><button>Click</button>';
  const expected = 'Click';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml preserves whitelisted tags and attributes', () => {
  const input = '<div class="content"><h1 id="main">Title</h1><p>Paragraph with <a href="/link" target="_blank">link</a>.</p><img src="/image.webp" alt="Image"></div>';
  const expected = '<div class="content"><h1 id="main">Title</h1><p>Paragraph with <a href="/link" target="_blank">link</a>.</p><img src="/image.webp" alt="Image"></div>';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml removes disallowed attributes', () => {
  const input = '<p style="color: red;" data-custom="value">Hello</p>';
  const expected = '<p>Hello</p>';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml removes HTML comments', () => {
  const input = '<div>Hello<!-- comment --></div>';
  const expected = '<div>Hello</div>';
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml allows data:image URIs', () => {
  const input = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==">';
  const expected = input;
  assert.strictEqual(sanitizeHtml(input), expected);
});

test('sanitizeHtml blocks other data: URIs', () => {
  const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
  const expected = '<a href="#">Link</a>';
  assert.strictEqual(sanitizeHtml(input), expected);
});
