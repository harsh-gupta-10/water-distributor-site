export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export function ensureWebp(file) {
  if (!file) return false;
  const lowerName = String(file.name || '').toLowerCase();
  return file.type === 'image/webp' && lowerName.endsWith('.webp');
}

export function sanitizeBaseName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\.webp$/i, '')
    .replace(/[^a-z0-9-_.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateUploadFile(file, maxUploadBytes = MAX_UPLOAD_BYTES) {
  if (!file) {
    return 'Choose a .webp image to upload.';
  }

  if (!ensureWebp(file)) {
    return 'Only .webp images are allowed.';
  }

  if (file.size > maxUploadBytes) {
    return 'File too large. Maximum is 50MB.';
  }

  return null;
}
