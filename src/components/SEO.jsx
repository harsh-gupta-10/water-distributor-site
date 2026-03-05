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
  }, [title, description, keywords, includeFAQ]);

  return null;
}
