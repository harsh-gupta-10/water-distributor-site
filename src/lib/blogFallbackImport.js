function tryParseJsonArray(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('File must contain an array of blogs');
  }
  return parsed;
}

function extractArrayFromModule(text, pattern) {
  const match = text.match(pattern);
  if (!match) return null;
  return tryParseJsonArray(match[1]);
}

export function parseFallbackBlogsImport(text) {
  const source = String(text || '').trim();
  if (!source) {
    throw new Error('Invalid fallback file format');
  }

  try {
    return tryParseJsonArray(source);
  } catch {
    // Continue with module-format parsers.
  }

  const declaredArray = extractArrayFromModule(source, /const\s+blogsFallback\s*=\s*(\[[\s\S]*?\]);/);
  if (declaredArray) return declaredArray;

  const exportedArray = extractArrayFromModule(source, /export\s+default\s+(\[[\s\S]*?\]);?/);
  if (exportedArray) return exportedArray;

  throw new Error('Invalid fallback file format');
}
