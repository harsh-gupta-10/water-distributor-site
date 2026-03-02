/**
 * Structured Data (JSON-LD) for A3Distributors
 * Adds schema.org markup for search engine optimization
 */

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "A3Distributors",
  "alternateName": "A3 Distributors",
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
