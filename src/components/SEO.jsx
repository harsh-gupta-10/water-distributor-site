import { useEffect } from 'react';
import structuredData from '../data/structuredData';

export default function SEO({ title, description, keywords, image = '/imgs/og-image.jpg' }) {
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

    // Add structured data if not already present
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, [title, description, keywords]);

  return null;
}
