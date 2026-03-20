export const FALLBACK_BLOG_IMAGE = '/imgs/logo-footer.png';

export function resolveBlogImageUrl(url) {
  if (!url) return FALLBACK_BLOG_IMAGE;

  const value = String(url).trim();
  if (!value) return FALLBACK_BLOG_IMAGE;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^data:image\//i.test(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return `/${value.replace(/^\/+/, '')}`;
  }

  return `/${value.replace(/^\/+/, '')}`;
}
