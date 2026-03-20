import test from 'node:test';
import assert from 'node:assert/strict';
import { FALLBACK_BLOG_IMAGE, resolveBlogImageUrl } from './blogImage.js';

test('resolveBlogImageUrl falls back for empty values', () => {
  assert.equal(resolveBlogImageUrl(''), FALLBACK_BLOG_IMAGE);
  assert.equal(resolveBlogImageUrl('   '), FALLBACK_BLOG_IMAGE);
  assert.equal(resolveBlogImageUrl(null), FALLBACK_BLOG_IMAGE);
});

test('resolveBlogImageUrl keeps absolute and root-relative URLs', () => {
  assert.equal(resolveBlogImageUrl('https://cdn.example.com/img.webp'), 'https://cdn.example.com/img.webp');
  assert.equal(resolveBlogImageUrl('/imgs/hero.webp'), '/imgs/hero.webp');
});

test('resolveBlogImageUrl allows data image URLs and normalizes relative paths', () => {
  const dataUrl = 'data:image/webp;base64,AAA=';
  assert.equal(resolveBlogImageUrl(dataUrl), dataUrl);
  assert.equal(resolveBlogImageUrl('imgs/blog.webp'), '/imgs/blog.webp');
  assert.equal(resolveBlogImageUrl('///imgs/blog.webp'), '/imgs/blog.webp');
});
