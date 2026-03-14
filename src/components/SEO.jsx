import { useEffect } from 'react';
import structuredData, { organizationSchema, faqSchema, productServiceSchema } from '../data/structuredData';

export default function SEO({ 
  title, 
  description, 
  keywords, 
  image = '/imgs/og-image.jpg',
  includeFAQ = false 
}) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = `${title} | A3Distributors`;

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `${title} | A3Distributors`);

      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', `${title} | A3Distributors`);
    }

    // Update meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }

      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', description);

      let twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescription) {
        twitterDescription = document.createElement('meta');
        twitterDescription.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescription);
      }
      twitterDescription.setAttribute('content', description);
    }

    // Update meta keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      }
    }

    // Update og:image and twitter:image
    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      const absoluteImage = image.startsWith('http') ? image : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;
      ogImage.setAttribute('content', absoluteImage);

      let twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImage) {
        twitterImage = document.createElement('meta');
        twitterImage.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImage);
      }
      twitterImage.setAttribute('content', absoluteImage);

      let twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCard) {
        twitterCard = document.createElement('meta');
        twitterCard.setAttribute('name', 'twitter:card');
        document.head.appendChild(twitterCard);
      }
      twitterCard.setAttribute('content', 'summary_large_image');
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

      // Cleanup dynamically added meta tags for OG/Twitter
      const dynamicMetaTags = document.querySelectorAll(
        'meta[property="og:title"], meta[name="twitter:title"], ' +
        'meta[property="og:description"], meta[name="twitter:description"], ' +
        'meta[property="og:image"], meta[name="twitter:image"], ' +
        'meta[name="twitter:card"]'
      );
      dynamicMetaTags.forEach(tag => tag.remove());
    };
  }, [title, description, keywords, image, includeFAQ]);

  return null;
}
