import blogsFallback from '../data/blogsFallback.js';

const BLOG_CACHE_KEY = 'a3_blog_cache_v1';

export function toISODate(value) {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export function normalizeBlog(raw, index = 0) {
  const createdAt = toISODate(raw?.created_at);
  const publishedAt = raw?.published_at ? toISODate(raw.published_at) : createdAt;
  const title = String(raw?.title || 'Untitled Post').trim();
  const slug = String(raw?.slug || `blog-post-${index + 1}`).trim();

  return {
    id: raw?.id || `fallback-${slug}-${index}`,
    title,
    slug,
    excerpt: String(raw?.excerpt || '').trim(),
    content: String(raw?.content || '').trim(),
    featured_image: raw?.featured_image || '',
    author: String(raw?.author || 'A3Distributor').trim(),
    category: String(raw?.category || 'business').trim(),
    tags: String(raw?.tags || '').trim(),
    status: String(raw?.status || 'published').trim(),
    meta_description: String(raw?.meta_description || '').trim(),
    meta_keywords: String(raw?.meta_keywords || '').trim(),
    published_at: publishedAt,
    created_at: createdAt,
    updated_at: toISODate(raw?.updated_at || createdAt),
  };
}

export function sortBlogs(items) {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.published_at || a.created_at).getTime();
    const bDate = new Date(b.published_at || b.created_at).getTime();
    return bDate - aDate;
  });
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveBlogsToCache(items) {
  if (!canUseStorage()) return;
  try {
    const normalized = sortBlogs((items || []).map(normalizeBlog));
    window.localStorage.setItem(BLOG_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn('Could not store blog cache:', error?.message || error);
  }
}

export function readBlogsFromCache() {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(BLOG_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortBlogs(parsed.map(normalizeBlog));
  } catch {
    return [];
  }
}

export function readBlogsFromLocalFile() {
  if (!Array.isArray(blogsFallback)) return [];
  return sortBlogs(blogsFallback.map(normalizeBlog));
}

export async function getBlogsWithFallback(supabase, options = {}) {
  const { publishedOnly = false } = options;
  const statusValue = publishedOnly ? 'published' : null;

  try {
    let query = supabase.from('blogs').select('*').order('published_at', { ascending: false });
    if (statusValue) {
      query = query.eq('status', statusValue);
    }

    const { data, error } = await query;
    if (error) throw error;

    const fromDb = sortBlogs((data || []).map(normalizeBlog));
    if (fromDb.length > 0) {
      saveBlogsToCache(fromDb);
      return { blogs: fromDb, source: 'db' };
    }
  } catch (error) {
    console.warn('Blog DB fetch failed, trying fallbacks:', error?.message || error);
  }

  const fromCache = readBlogsFromCache();
  if (fromCache.length > 0) {
    const cacheBlogs = publishedOnly ? fromCache.filter((b) => b.status === 'published') : fromCache;
    return { blogs: sortBlogs(cacheBlogs), source: 'cache' };
  }

  const fromFile = readBlogsFromLocalFile();
  const fileBlogs = publishedOnly ? fromFile.filter((b) => b.status === 'published') : fromFile;
  return { blogs: sortBlogs(fileBlogs), source: 'local-file' };
}
