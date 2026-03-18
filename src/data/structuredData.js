/**
 * Structured Data (JSON-LD) for A3Distributors
 * Adds schema.org markup for search engine optimization
 */

// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://a3distributors.com/#organization",
  "name": "A3Distributors",
  "alternateName": "A3Distributor",
  "url": "https://a3distributors.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://a3distributors.com/imgs/logos/logo.png"
  },
  "description": "Leading wholesale water and beverage distributor in India. A3Distributors offers competitive pricing, extensive product range, and reliable delivery for businesses. Authorized distributor of Coca-Cola, Pepsi, Bisleri, and major beverage brands.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Off Din Quarry Rd, near Masjid, Panjarapole, Chembur",
    "addressLocality": "Mumbai",
    "addressRegion": "Maharashtra",
    "postalCode": "400088",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+917039414924",
    "contactType": "sales",
    "areaServed": "IN",
    "availableLanguage": ["en", "hi"]
  },
  "email": "contact.a3distributor@gmail.com",
  "telephone": "+917039414924",
  "sameAs": [
    "https://www.facebook.com/a3distributors",
    "https://www.instagram.com/a3distributors",
    "https://www.linkedin.com/company/a3distributors"
  ]
};

// WebSite Schema (AI/answer-engine friendly)
export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://a3distributors.com/#website",
  "url": "https://a3distributors.com",
  "name": "A3Distributors",
  "alternateName": "A3Distributor",
  "description": "Wholesale water and beverage distribution platform for businesses in India.",
  "publisher": {
    "@id": "https://a3distributors.com/#organization"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://a3distributors.com/blog?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// FAQPage Schema
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does A3Distributor stand out in pricing and product selection compared to other one-stop wholesale suppliers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A3Distributor offers the most competitive wholesale pricing in the market with volume-based discounts starting at just 50 units. Unlike many suppliers, we provide access to 500+ SKUs across all major beverage brands (Coca-Cola, Pepsi, Bisleri, and more) from a single source, eliminating the need for multiple vendor relationships. Our pricing is transparent with no hidden fees, and we offer same-day delivery at no extra charge for urgent orders."
      }
    },
    {
      "@type": "Question",
      "name": "What advantages does working with A3Distributor offer for sourcing a wide range of products?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A3Distributor serves as your complete one-stop wholesale solution with several key advantages: (1) Access to 500+ products including water, soft drinks, energy drinks, and juices from all major brands; (2) No minimum order restrictions - we serve both small businesses and large enterprises; (3) Dedicated account manager for personalized service; (4) Real-time inventory visibility; (5) Flexible payment terms for verified businesses; (6) Quality guarantee on all products; (7) 24/7 order placement capability; (8) Coverage across Mumbai and surrounding regions with reliable logistics."
      }
    },
    {
      "@type": "Question",
      "name": "What bulk purchase discounts does A3Distributor offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A3Distributor offers tiered bulk purchase discounts: 5-10% off for orders of 50-200 units, 10-15% off for orders of 200-500 units, 15-20% off for orders of 500-1000 units, and 20%+ off for orders exceeding 1000 units. Additional discounts available for recurring monthly contracts. We also provide seasonal promotional pricing, free delivery on bulk orders over ₹10,000, and special rates for long-term business partnerships. Contact us for a customized quote based on your specific volume requirements."
      }
    }
  ]
};

// Product/Service Schema
export const productServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://a3distributors.com/#service",
  "serviceType": "Wholesale Water and Beverage Distribution",
  "name": "Wholesale Water & Beverage Supply",
  "description": "Professional wholesale distribution of packaged drinking water, soft drinks, and beverages. Serving businesses, offices, events, retailers, and institutions across India with competitive pricing and reliable delivery.",
  "provider": {
    "@id": "https://a3distributors.com/#organization"
  },
  "areaServed": {
    "@type": "State",
    "name": "Maharashtra"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Water & Beverage Products",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Bulk Packaged Drinking Water",
          "description": "Bisleri, Kinley, Aquafina, Rail Neer - 20L jars, 1L, 500ml bottles"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Carbonated Soft Drinks",
          "description": "Coca-Cola, Pepsi, Sprite, Thums Up, Fanta, Limca - All sizes"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Fruit Beverages & Juices",
          "description": "Maaza, Slice, Frooti, Real Juice - Multiple flavors and sizes"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Energy & Sports Drinks",
          "description": "Sting, Red Bull, Gatorade - Wholesale supply"
        }
      }
    ]
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "INR",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "priceType": "https://schema.org/ListPrice",
      "minPrice": "10",
      "maxPrice": "1000",
      "priceCurrency": "INR"
    }
  }
};

// Local Business Schema (maintaining backward compatibility)
export const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "A3Distributors",
  "alternateName": "A3Distributor",
  "image": "https://a3distributors.com/imgs/logos/logo.png",
  "description": "Reliable water and beverage distribution service for businesses across India. Authorized distributor of major brands including Coca-Cola, Pepsi, Bisleri, and more.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Off Din Quarry Rd, near Masjid, Panjarapole, Chembur",
    "addressLocality": "Mumbai",
    "addressRegion": "Maharashtra",
    "postalCode": "400088",
    "addressCountry": "IN"
  },
  "telephone": "+917039414924",
  "email": "contact.a3distributor@gmail.com",
  "url": "https://a3distributors.com",
  "sameAs": [
    "https://www.facebook.com/a3distributors",
    "https://www.instagram.com/a3distributors",
    "https://www.linkedin.com/company/a3distributors"
  ],
  "priceRange": "$$",
  "areaServed": {
    "@type": "City",
    "name": "Mumbai"
  },
  "availableLanguage": "en-IN",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "knows": [
    {
      "@type": "Brand",
      "name": "Coca-Cola"
    },
    {
      "@type": "Brand",
      "name": "Pepsi"
    },
    {
      "@type": "Brand",
      "name": "Bisleri"
    },
    {
      "@type": "Brand",
      "name": "Sprite"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Water & Beverage Products",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Bulk Water Supply",
        "description": "Large-scale packaged drinking water supply for businesses and institutions"
      },
      {
        "@type": "Offer",
        "name": "Cold Drink Distribution",
        "description": "Soft drinks and beverages from leading global brands"
      },
      {
        "@type": "Offer",
        "name": "Same-Day Delivery",
        "description": "Emergency orders with same-day delivery service"
      }
    ]
  }
};

export default structuredData;
