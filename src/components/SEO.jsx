import { useEffect } from 'react';
import structuredData, { organizationSchema, faqSchema, productServiceSchema } from '../data/structuredData';

export default function SEO({ 
  title, 
  description, 
  keywords, 
  image = '/imgs/og-image.jpg',
  includeFAQ = false,
  canonicalUrl,
  ogType = 'website',
  noindex = false
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

    const resolvedCanonical = canonicalUrl || window.location.href;
    const resolvedImage = image?.startsWith('http') ? image : `${window.location.origin}${image.startsWith('/') ? image : `/${image}`}`;

    // Update title
    if (title) {
      document.title = `${title} | A3Distributors`;
    }

    // Always keep OG/Twitter title in sync.
    ensureMeta('meta[property="og:title"]', ['property', 'og:title'], title ? `${title} | A3Distributors` : 'A3Distributors');
    ensureMeta('meta[name="twitter:title"]', ['name', 'twitter:title'], title ? `${title} | A3Distributors` : 'A3Distributors');

    // Update meta description
    if (description) {
      ensureMeta('meta[name="description"]', ['name', 'description'], description);
      ensureMeta('meta[property="og:description"]', ['property', 'og:description'], description);
      ensureMeta('meta[name="twitter:description"]', ['name', 'twitter:description'], description);
    }

    // Update meta keywords
    if (keywords) {
      ensureMeta('meta[name="keywords"]', ['name', 'keywords'], keywords);
    }

    // Robots and canonical controls for indexation.
    ensureMeta(
      'meta[name="robots"]',
      ['name', 'robots'],
      noindex
        ? 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    ensureMeta('meta[property="og:type"]', ['property', 'og:type'], ogType);
    ensureMeta('meta[property="og:image"]', ['property', 'og:image'], resolvedImage);
    ensureMeta('meta[property="og:url"]', ['property', 'og:url'], resolvedCanonical);
    ensureMeta('meta[name="twitter:card"]', ['name', 'twitter:card'], 'summary_large_image');
    ensureMeta('meta[name="twitter:image"]', ['name', 'twitter:image'], resolvedImage);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', resolvedCanonical);

    // Remove any existing structured data scripts to prevent duplicates
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-schema]');
    existingScripts.forEach(script => script.remove());

    // Add Organization Schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.setAttribute('data-schema', 'organization');
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Add Product/Service Schema
    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.setAttribute('data-schema', 'service');
    serviceScript.textContent = JSON.stringify(productServiceSchema);
    document.head.appendChild(serviceScript);

    // Add LocalBusiness Schema (for backward compatibility)
    const businessScript = document.createElement('script');
    businessScript.type = 'application/ld+json';
    businessScript.setAttribute('data-schema', 'business');
    businessScript.textContent = JSON.stringify(structuredData);
    document.head.appendChild(businessScript);

    // Add FAQ Schema if requested
    if (includeFAQ) {
      const faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.setAttribute('data-schema', 'faq');
      faqScript.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(faqScript);
    }

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"][data-schema]');
      scripts.forEach(script => script.remove());
    };
  }, [title, description, keywords, image, includeFAQ, canonicalUrl, ogType, noindex]);

  return null;
}
