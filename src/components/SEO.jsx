import { useEffect } from 'react';
import structuredData, { organizationSchema, faqSchema, productServiceSchema, webSiteSchema } from '../data/structuredData';

export default function SEO({
  title,
  description,
  keywords,
  image = '/imgs/og-image.jpg',
  includeFAQ = false,
  canonicalUrl,
  ogType = 'website',
  noindex = false,
  extraSchemas = [],
  publishedTime,
  modifiedTime,
  author,
  articleSection,
  articleTags = [],
}) {
  useEffect(() => {
    const ensureMeta = (selector, attr, value) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        const [attrName, attrValue] = attr;
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
      return tag;
    };

    const removeMeta = (selector) => {
      const tags = document.querySelectorAll(selector);
      tags.forEach((tag) => tag.remove());
    };

    const resolvedCanonical = canonicalUrl
      ? new URL(canonicalUrl, window.location.origin).toString()
      : window.location.href.split('#')[0];

    const resolvedImage = image?.startsWith('http')
      ? image
      : `${window.location.origin}${image.startsWith('/') ? image : `/${image}`}`;

    const resolvedTitle = title
      ? (title.toLowerCase().includes('a3distributors') ? title : `${title} | A3Distributors`)
      : 'A3Distributors';

    const normalizedTags = Array.isArray(articleTags)
      ? articleTags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(articleTags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

    document.title = resolvedTitle;

    ensureMeta('meta[property="og:title"]', ['property', 'og:title'], resolvedTitle);
    ensureMeta('meta[name="twitter:title"]', ['name', 'twitter:title'], resolvedTitle);

    if (description) {
      ensureMeta('meta[name="description"]', ['name', 'description'], description);
      ensureMeta('meta[property="og:description"]', ['property', 'og:description'], description);
      ensureMeta('meta[name="twitter:description"]', ['name', 'twitter:description'], description);
    }

    if (keywords) {
      ensureMeta('meta[name="keywords"]', ['name', 'keywords'], keywords);
    }

    ensureMeta(
      'meta[name="robots"]',
      ['name', 'robots'],
      noindex
        ? 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    ensureMeta('meta[property="og:type"]', ['property', 'og:type'], ogType);
    ensureMeta('meta[property="og:site_name"]', ['property', 'og:site_name'], 'A3Distributors');
    ensureMeta('meta[property="og:locale"]', ['property', 'og:locale'], 'en_IN');
    ensureMeta('meta[property="og:image"]', ['property', 'og:image'], resolvedImage);
    ensureMeta('meta[property="og:image:alt"]', ['property', 'og:image:alt'], title || 'A3Distributors');
    ensureMeta('meta[property="og:url"]', ['property', 'og:url'], resolvedCanonical);
    ensureMeta('meta[name="twitter:card"]', ['name', 'twitter:card'], 'summary_large_image');
    ensureMeta('meta[name="twitter:site"]', ['name', 'twitter:site'], '@a3distributors');
    ensureMeta('meta[name="twitter:image"]', ['name', 'twitter:image'], resolvedImage);
    ensureMeta('meta[name="twitter:image:alt"]', ['name', 'twitter:image:alt'], title || 'A3Distributors');

    if (author) {
      ensureMeta('meta[name="author"]', ['name', 'author'], author);
    }

    if (ogType === 'article') {
      if (publishedTime) {
        ensureMeta('meta[property="article:published_time"]', ['property', 'article:published_time'], publishedTime);
      } else {
        removeMeta('meta[property="article:published_time"]');
      }

      if (modifiedTime) {
        ensureMeta('meta[property="article:modified_time"]', ['property', 'article:modified_time'], modifiedTime);
      } else {
        removeMeta('meta[property="article:modified_time"]');
      }

      if (articleSection) {
        ensureMeta('meta[property="article:section"]', ['property', 'article:section'], articleSection);
      } else {
        removeMeta('meta[property="article:section"]');
      }

      removeMeta('meta[property="article:tag"]');
      normalizedTags.forEach((tag) => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'article:tag');
        meta.setAttribute('content', tag);
        document.head.appendChild(meta);
      });
    } else {
      removeMeta('meta[property="article:published_time"]');
      removeMeta('meta[property="article:modified_time"]');
      removeMeta('meta[property="article:section"]');
      removeMeta('meta[property="article:tag"]');
    }

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', resolvedCanonical);

    const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-schema]');
    existingScripts.forEach((script) => script.remove());

    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.setAttribute('data-schema', 'organization');
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    const websiteScript = document.createElement('script');
    websiteScript.type = 'application/ld+json';
    websiteScript.setAttribute('data-schema', 'website');
    websiteScript.textContent = JSON.stringify(webSiteSchema);
    document.head.appendChild(websiteScript);

    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.setAttribute('data-schema', 'service');
    serviceScript.textContent = JSON.stringify(productServiceSchema);
    document.head.appendChild(serviceScript);

    const businessScript = document.createElement('script');
    businessScript.type = 'application/ld+json';
    businessScript.setAttribute('data-schema', 'business');
    businessScript.textContent = JSON.stringify(structuredData);
    document.head.appendChild(businessScript);

    if (includeFAQ) {
      const faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.setAttribute('data-schema', 'faq');
      faqScript.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(faqScript);
    }

    (extraSchemas || []).forEach((schema, index) => {
      if (!schema) return;
      const extraScript = document.createElement('script');
      extraScript.type = 'application/ld+json';
      extraScript.setAttribute('data-schema', `extra-${index}`);
      extraScript.textContent = JSON.stringify(schema);
      document.head.appendChild(extraScript);
    });

    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"][data-schema]');
      scripts.forEach((script) => script.remove());
    };
  }, [
    title,
    description,
    keywords,
    image,
    includeFAQ,
    canonicalUrl,
    ogType,
    noindex,
    extraSchemas,
    publishedTime,
    modifiedTime,
    author,
    articleSection,
    articleTags,
  ]);

  return null;
}
