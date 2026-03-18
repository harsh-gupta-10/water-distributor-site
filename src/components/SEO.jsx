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
    const resolvedCanonical = canonicalUrl || window.location.href;
    const resolvedImage = image?.startsWith('http') ? image : `${window.location.origin}${image.startsWith('/') ? image : `/${image}`}`;

    // Update title
    if (title) {
      document.title = `${title} | A3Distributors`;
    }

    // Update meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }

    // Update meta keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      }
    }

    // Update robots
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute(
        'content',
        noindex
          ? 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
          : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      );
    }

    // Update Open Graph tags
    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (ogTypeTag) ogTypeTag.setAttribute('content', ogType);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) ogTitle.setAttribute('content', `${title} | A3Distributors`);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) ogDescription.setAttribute('content', description);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', resolvedImage);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', resolvedCanonical);

    // Update Twitter card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && title) twitterTitle.setAttribute('content', `${title} | A3Distributors`);

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && description) twitterDescription.setAttribute('content', description);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', resolvedImage);

    // Update canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', resolvedCanonical);
    }

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
