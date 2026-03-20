import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFallbackBlogsImport } from './blogFallbackImport.js';

test('parseFallbackBlogsImport parses plain JSON arrays', () => {
  const parsed = parseFallbackBlogsImport('[{"title":"A"}]');
  assert.deepEqual(parsed, [{ title: 'A' }]);
});

test('parseFallbackBlogsImport parses const module format', () => {
  const parsed = parseFallbackBlogsImport('const blogsFallback = [{"slug":"hello"}]; export default blogsFallback;');
  assert.deepEqual(parsed, [{ slug: 'hello' }]);
});

test('parseFallbackBlogsImport parses export default array format', () => {
  const parsed = parseFallbackBlogsImport('export default [{"id":1}];');
  assert.deepEqual(parsed, [{ id: 1 }]);
});

test('parseFallbackBlogsImport throws for invalid formats', () => {
  assert.throws(() => parseFallbackBlogsImport('const foo = 123;'), /Invalid fallback file format/);
  assert.throws(() => parseFallbackBlogsImport('{"not":"an array"}'), /Invalid fallback file format|File must contain an array of blogs/);
});
