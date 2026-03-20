import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBlogsWithFallback,
  readBlogsFromCache,
  saveBlogsToCache,
  sortBlogs,
} from './blogFallback.js';

function createStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function createFailingBlogSupabase() {
  return {
    from() {
      return {
        select() {
          return {
            order() {
              return {
                eq: async () => ({ data: null, error: new Error('DB offline') }),
              };
            },
          };
        },
      };
    },
  };
}

test('sortBlogs orders newest published_at first', () => {
  const sorted = sortBlogs([
    { id: 1, published_at: '2024-01-02T00:00:00.000Z' },
    { id: 2, published_at: '2024-02-02T00:00:00.000Z' },
    { id: 3, published_at: '2023-12-31T00:00:00.000Z' },
  ]);

  assert.deepEqual(sorted.map((item) => item.id), [2, 1, 3]);
});

test('readBlogsFromCache returns empty list on invalid JSON', () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: createStorage() };
  globalThis.window.localStorage.setItem('a3_blog_cache_v1', '{');

  const parsed = readBlogsFromCache();
  assert.deepEqual(parsed, []);

  globalThis.window = originalWindow;
});

test('saveBlogsToCache swallows storage failures and logs warning once', () => {
  const originalWindow = globalThis.window;
  const originalWarn = console.warn;
  let warnCalls = 0;

  globalThis.window = {
    localStorage: {
      setItem() {
        throw new Error('quota exceeded');
      },
    },
  };
  console.warn = () => {
    warnCalls += 1;
  };

  assert.doesNotThrow(() => {
    saveBlogsToCache([{ title: 'Hello', slug: 'hello' }]);
  });
  assert.equal(warnCalls, 1);

  console.warn = originalWarn;
  globalThis.window = originalWindow;
});

test('getBlogsWithFallback returns cache source when DB fails', async () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: createStorage() };

  saveBlogsToCache([
    { id: 'a', title: 'A', slug: 'a', status: 'published', published_at: '2024-03-02T00:00:00.000Z' },
    { id: 'b', title: 'B', slug: 'b', status: 'draft', published_at: '2024-02-02T00:00:00.000Z' },
  ]);

  const result = await getBlogsWithFallback(createFailingBlogSupabase(), { publishedOnly: true });
  assert.equal(result.source, 'cache');
  assert.equal(Array.isArray(result.blogs), true);
  assert.equal(result.blogs.length, 1);
  assert.equal(result.blogs[0].slug, 'a');

  globalThis.window = originalWindow;
});

test('getBlogsWithFallback returns local-file source when cache is empty', async () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: createStorage() };

  const result = await getBlogsWithFallback(createFailingBlogSupabase(), { publishedOnly: true });
  assert.equal(result.source, 'local-file');
  assert.equal(Array.isArray(result.blogs), true);

  globalThis.window = originalWindow;
});
