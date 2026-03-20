import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_UPLOAD_BYTES,
  ensureWebp,
  sanitizeBaseName,
  validateUploadFile,
} from './uploadSanitizers.js';

test('ensureWebp validates extension and MIME type', () => {
  assert.equal(ensureWebp({ name: 'hero.webp', type: 'image/webp' }), true);
  assert.equal(ensureWebp({ name: 'hero.jpg', type: 'image/webp' }), false);
  assert.equal(ensureWebp({ name: 'hero.webp', type: 'image/jpeg' }), false);
});

test('sanitizeBaseName strips unsafe characters and extra separators', () => {
  assert.equal(sanitizeBaseName('  My Banner (2026).webp  '), 'my-banner-2026');
  assert.equal(sanitizeBaseName('@@@offer___image###'), 'offer___image');
  assert.equal(sanitizeBaseName('----a--b----'), 'a-b');
});

test('validateUploadFile enforces required checks', () => {
  assert.equal(validateUploadFile(null), 'Choose a .webp image to upload.');
  assert.equal(
    validateUploadFile({ name: 'hero.png', type: 'image/png', size: 1200 }),
    'Only .webp images are allowed.',
  );
  assert.equal(
    validateUploadFile({ name: 'hero.webp', type: 'image/webp', size: MAX_UPLOAD_BYTES + 1 }),
    'File too large. Maximum is 50MB.',
  );
  assert.equal(
    validateUploadFile({ name: 'hero.webp', type: 'image/webp', size: 512 }),
    null,
  );
});
