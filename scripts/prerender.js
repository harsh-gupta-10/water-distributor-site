import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productsData from "../src/data/products.json" with { type: "json" };
import blogsFallback from "../src/data/blogsFallback.js";
import structuredData, {
  organizationSchema,
  faqSchema,
  productServiceSchema,
  webSiteSchema,
} from "../src/data/structuredData.js";
import { resolveBlogImageUrl } from "../src/lib/blogImage.js";
import { safeJsonLdStringify } from "../src/lib/jsonLd.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const INDEX_HTML_PATH = path.join(DIST, "index.html");
const SITE_ORIGIN = "https://a3distributors.com";

const COMPARISON_PAGE_UPDATED = "2026-03-20";
const COMPARISON_PAGE_REVIEWER = "A3Distributors Sales Operations Team";
const WHOLESALE_PAGE_UPDATED = "2026-03-20";
const WHOLESALE_PAGE_REVIEWER = "A3Distributors Sales Operations Team";

const comparisonFaqData = [
  {
    question: "How should I compare two beverage distributors for my business?",
    answer:
      "Start with delivery reliability, minimum order flexibility, and support responsiveness before price. A lower per-unit quote can still cost more if late deliveries, high MOQs, or limited support interrupt operations.",
  },
  {
    question: "What is a good way to estimate monthly water ordering needs?",
    answer:
      "Use employee count, average daily consumption, and working days to calculate demand. A practical benchmark for offices is around 1.5-2.5 liters per employee per day, then add a small safety buffer for peak days.",
  },
  {
    question: "When does wholesale pricing become meaningfully better than retail buying?",
    answer:
      "Wholesale pricing usually becomes more efficient once ordering is consistent and volume-based tiers apply. Regularly scheduled business orders typically unlock better rates, improved delivery planning, and fewer stock disruptions.",
  },
];

const wholesaleFaqData = [
  {
    question: "How do I estimate bulk water requirements for my office?",
    answer:
      "Use employee count, expected daily consumption, and working days. A practical benchmark is around 1.5-2.5 liters per employee per day, then convert total liters into your preferred jar or bottle format.",
  },
  {
    question: "What order volume usually unlocks better wholesale pricing?",
    answer:
      "Pricing generally improves as orders move into consistent volume tiers. Businesses that order on fixed weekly or monthly cycles tend to receive better rates and smoother delivery planning than irregular buyers.",
  },
  {
    question: "What should I check before finalizing a distributor partner?",
    answer:
      "Verify delivery reliability, stock consistency, response time, billing clarity, and return handling. These fundamentals directly affect business continuity and often matter more than a small price difference.",
  },
];

function toISODate(value) {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function normalizeBlog(raw, index = 0) {
  const createdAt = toISODate(raw?.created_at);
  const publishedAt = raw?.published_at ? toISODate(raw.published_at) : createdAt;
  const title = String(raw?.title || "Untitled Post").trim();
  const slug = String(raw?.slug || `blog-post-${index + 1}`).trim();

  return {
    id: raw?.id || `fallback-${slug}-${index}`,
    title,
    slug,
    excerpt: String(raw?.excerpt || "").trim(),
    content: String(raw?.content || "").trim(),
    featured_image: raw?.featured_image || "",
    author: String(raw?.author || "A3Distributor").trim(),
    category: String(raw?.category || "business").trim(),
    tags: String(raw?.tags || "").trim(),
    status: String(raw?.status || "published").trim(),
    meta_description: String(raw?.meta_description || "").trim(),
    meta_keywords: String(raw?.meta_keywords || "").trim(),
    published_at: publishedAt,
    created_at: createdAt,
    updated_at: toISODate(raw?.updated_at || createdAt),
  };
}

function sortBlogs(items) {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.published_at || a.created_at).getTime();
    const bDate = new Date(b.published_at || b.created_at).getTime();
    return bDate - aDate;
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizePath(routePath) {
  if (routePath === "/") return "/";
  return routePath.startsWith("/") ? routePath : `/${routePath}`;
}

function buildHomeSchemas(origin, canonicalPath = "/") {
  const isContactPage = canonicalPath === "/contact";
  const pageUrl = `${origin}${canonicalPath}`;
  const products = productsData.categories.flatMap((category) =>
    (category.products || []).slice(0, 4).map((product) => ({
      "@type": "ListItem",
      position: 0,
      item: {
        "@type": "Product",
        name: product.name,
        category: category.name,
        description: `${product.name} in ${category.name} category for bulk business supply`,
        url: `${origin}/#products`,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${origin}/#products`,
        },
      },
    }))
  );

  const itemList = products.map((item, index) => ({
    ...item,
    position: index + 1,
  }));

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: isContactPage
      ? "Contact Wholesale Water & Beverage Distributor in Mumbai"
      : "Wholesale Water & Beverage Distributor in Mumbai",
    description: isContactPage
      ? "Contact A3Distributors for bulk water and beverage supply in Mumbai. Get pricing, delivery timelines, and custom quotes for offices, events, and retail businesses."
      : "Bulk water and beverage supplier in Mumbai for offices, retailers, institutions, and events with fast delivery and competitive wholesale pricing.",
    inLanguage: "en-IN",
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${origin}/#organization` },
    primaryImageOfPage: `${origin}/imgs/og-image.jpg`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isContactPage ? "Contact" : "Products",
        item: isContactPage ? `${origin}/contact` : `${origin}/#products`,
      },
    ],
  };

  if (isContactPage) return [webPageSchema, breadcrumbSchema];

  breadcrumbSchema.itemListElement.push({
    "@type": "ListItem",
    position: 3,
    name: "Blog",
    item: `${origin}/blog`,
  });

  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Water and Beverage Products",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: itemList,
  };

  return [webPageSchema, breadcrumbSchema, productListSchema];
}

function buildCompareSchemas(origin) {
  const canonicalUrl = `${origin}/compare`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Distributor Comparison",
        item: canonicalUrl,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: canonicalUrl,
    name: "A3Distributor vs Other Local Distributors - Comparison",
    description:
      "Feature-by-feature comparison for wholesale beverage distribution across pricing, delivery, MOQ flexibility, service support, and reliability.",
    inLanguage: "en-IN",
    dateModified: COMPARISON_PAGE_UPDATED,
    author: {
      "@type": "Organization",
      name: "A3Distributors",
      url: `${origin}/`,
    },
    reviewedBy: {
      "@type": "Organization",
      name: COMPARISON_PAGE_REVIEWER,
    },
  };

  const pageFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comparisonFaqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return [breadcrumbSchema, webPageSchema, pageFaqSchema];
}

function buildWholesaleSchemas(origin) {
  const canonicalUrl = `${origin}/wholesale-distributor`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Wholesale Distributor", item: canonicalUrl },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: canonicalUrl,
    name: "Best Wholesale Water & Beverage Distributor in Mumbai",
    description:
      "Wholesale supplier for packaged drinking water, soft drinks, juices, and energy drinks with fast delivery and volume discounts in Mumbai.",
    inLanguage: "en-IN",
    dateModified: WHOLESALE_PAGE_UPDATED,
    author: {
      "@type": "Organization",
      name: "A3Distributors",
      url: `${origin}/`,
    },
    reviewedBy: {
      "@type": "Organization",
      name: WHOLESALE_PAGE_REVIEWER,
    },
  };

  const pageFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: wholesaleFaqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return [breadcrumbSchema, webPageSchema, pageFaqSchema];
}

function buildBlogListingSchemas(origin, blogs) {
  const canonicalUrl = `${origin}/blog`;
  const pageDescription = `Explore A3Distributors insights on wholesale water supply, beverage distribution, pricing trends, product updates, and business buying guides.`;

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "A3Distributors Blog",
    description: pageDescription,
    url: canonicalUrl,
    inLanguage: "en-IN",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: canonicalUrl,
      },
    ],
  };

  const blogCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "A3Distributors Blog",
    url: canonicalUrl,
    description: pageDescription,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: blogs.slice(0, 20).map((blog, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${origin}/blog/${blog.slug}`,
        name: blog.title,
      })),
    },
  };

  return [blogSchema, breadcrumbSchema, blogCollectionSchema];
}

function toTagList(tags) {
  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildBlogPostSchemas(origin, blog) {
  const canonicalUrl = `${origin}/blog/${blog.slug}`;
  const seoImage = new URL(resolveBlogImageUrl(blog.featured_image), origin).toString();
  const publishedAt = blog.published_at || blog.created_at;
  const modifiedAt = blog.updated_at || blog.published_at || blog.created_at;
  const tagList = toTagList(blog.tags);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: seoImage,
    datePublished: publishedAt,
    dateModified: modifiedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author: {
      "@type": "Person",
      name: blog.author || "A3Distributors Team",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: "A3Distributors",
      logo: {
        "@type": "ImageObject",
        url: `${origin}/imgs/logos/logo.png`,
      },
    },
    inLanguage: "en-IN",
    articleSection: blog.category,
    keywords: tagList.join(", ") || undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/blog` },
      { "@type": "ListItem", position: 3, name: blog.title, item: canonicalUrl },
    ],
  };

  return { articleSchema, breadcrumbSchema, canonicalUrl, seoImage, publishedAt, modifiedAt, tagList };
}

function applyMetaTag(html, attrName, attrValue, content) {
  if (content == null || content === "") return html;
  const escapedContent = escapeHtml(content);
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attrName}=["']${attrValue}["'][^>]*>`,
    "i"
  );
  const replacement = `<meta ${attrName}="${attrValue}" content="${escapedContent}" />`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function applyCanonical(html, href) {
  if (!href) return html;
  const escapedHref = escapeHtml(href);
  if (/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(
      /<link\s+[^>]*rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${escapedHref}" />`
    );
  }
  return html;
}

function injectSchemas(html, schemas) {
  if (!Array.isArray(schemas) || schemas.length === 0) return html;
  const injection = schemas
    .filter(Boolean)
    .map((schema) => `<script type="application/ld+json">${safeJsonLdStringify(schema)}</script>`)
    .join("\n    ");
  return html.replace("</head>", `    ${injection}\n  </head>`);
}

function applySeoToTemplate(templateHtml, routeSeo) {
  let html = templateHtml;
  const fullCanonical = `${SITE_ORIGIN}${sanitizePath(routeSeo.path)}`;
  const ogType = routeSeo.ogType || "website";
  const imagePath = routeSeo.image || "/imgs/og-image.jpg";
  const fullImage = imagePath.startsWith("http") ? imagePath : `${SITE_ORIGIN}${imagePath}`;
  const title = routeSeo.title?.toLowerCase().includes("a3distributors")
    ? routeSeo.title
    : `${routeSeo.title} | A3Distributors`;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = applyMetaTag(html, "name", "description", routeSeo.description);
  html = applyMetaTag(html, "name", "keywords", routeSeo.keywords);
  html = applyMetaTag(html, "name", "author", routeSeo.author || "A3Distributors");
  html = applyMetaTag(
    html,
    "name",
    "robots",
    routeSeo.noindex
      ? "noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  );

  html = applyMetaTag(html, "property", "og:type", ogType);
  html = applyMetaTag(html, "property", "og:title", title);
  html = applyMetaTag(html, "property", "og:description", routeSeo.description);
  html = applyMetaTag(html, "property", "og:url", fullCanonical);
  html = applyMetaTag(html, "property", "og:image", fullImage);
  html = applyMetaTag(html, "property", "og:image:alt", routeSeo.title || "A3Distributors");
  html = applyMetaTag(html, "property", "og:site_name", "A3Distributors");
  html = applyMetaTag(html, "property", "og:locale", "en_IN");

  html = applyMetaTag(html, "name", "twitter:card", "summary_large_image");
  html = applyMetaTag(html, "name", "twitter:title", title);
  html = applyMetaTag(html, "name", "twitter:description", routeSeo.description);
  html = applyMetaTag(html, "name", "twitter:image", fullImage);
  html = applyMetaTag(html, "name", "twitter:image:alt", routeSeo.title || "A3Distributors");
  html = applyMetaTag(html, "name", "twitter:site", "@a3distributors");

  html = applyCanonical(html, fullCanonical);

  if (routeSeo.ogType === "article") {
    if (routeSeo.publishedTime) {
      html = applyMetaTag(html, "property", "article:published_time", routeSeo.publishedTime);
    }
    if (routeSeo.modifiedTime) {
      html = applyMetaTag(html, "property", "article:modified_time", routeSeo.modifiedTime);
    }
    if (routeSeo.articleSection) {
      html = applyMetaTag(html, "property", "article:section", routeSeo.articleSection);
    }
    if (Array.isArray(routeSeo.articleTags)) {
      const tagMeta = routeSeo.articleTags
        .filter(Boolean)
        .map(
          (tag) =>
            `<meta property="article:tag" content="${escapeHtml(tag)}" />`
        )
        .join("\n    ");
      if (tagMeta) {
        html = html.replace("</head>", `    ${tagMeta}\n  </head>`);
      }
    }
  }

  const baseSchemas = [organizationSchema, webSiteSchema, productServiceSchema, structuredData];
  if (routeSeo.includeFAQ) baseSchemas.push(faqSchema);
  const allSchemas = [...baseSchemas, ...(routeSeo.extraSchemas || [])];
  html = injectSchemas(html, allSchemas);

  return html;
}

function getRouteOutputPath(routePath) {
  if (routePath === "/") return path.join(DIST, "index.html");
  return path.join(DIST, routePath.replace(/^\//, ""), "index.html");
}

async function writeRouteHtml(routePath, html) {
  const outputPath = getRouteOutputPath(routePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
}

async function main() {
  const indexHtml = await readFile(INDEX_HTML_PATH, "utf8");
  const publishedBlogs = sortBlogs((blogsFallback || []).map(normalizeBlog)).filter(
    (blog) => blog.status === "published"
  );
  const featuredBlog = publishedBlogs[0] || null;

  const routeMap = [];

  routeMap.push({
    path: "/",
    seo: {
      path: "/",
      title: "Wholesale Water & Beverage Distributor in Mumbai",
      description:
        "A3Distributors is a trusted wholesale water and beverage distributor in Mumbai. Bulk supply for offices, events, and retailers with fast delivery and competitive pricing.",
      keywords:
        "wholesale water distributor mumbai, beverage distributor mumbai, bulk water supply for office, soft drink wholesale supplier, bisleri distributor, pepsi coca cola wholesale",
      canonicalUrl: `${SITE_ORIGIN}/`,
      includeFAQ: true,
      image: "/imgs/og-image.jpg",
      extraSchemas: buildHomeSchemas(SITE_ORIGIN, "/"),
    },
  });

  routeMap.push({
    path: "/contact",
    seo: {
      path: "/contact",
      title: "Contact Wholesale Water & Beverage Distributor in Mumbai",
      description:
        "Contact A3Distributors for bulk water and beverage supply in Mumbai. Get pricing, delivery timelines, and custom quotes for offices, events, and retail businesses.",
      keywords:
        "contact water distributor mumbai, bulk water supplier phone number, beverage distributor contact, wholesale water quote mumbai",
      canonicalUrl: `${SITE_ORIGIN}/contact`,
      includeFAQ: false,
      image: "/imgs/og-image.jpg",
      extraSchemas: buildHomeSchemas(SITE_ORIGIN, "/contact"),
    },
  });

  routeMap.push({
    path: "/compare",
    seo: {
      path: "/compare",
      title: "A3Distributor vs Other Local Distributors - Comparison",
      description:
        "Compare A3Distributor with other local wholesale distributors. See why we offer better pricing, faster delivery, wider product selection, and superior customer support for water and beverage distribution.",
      keywords:
        "A3 comparison, wholesale distributor comparison, best local distributor, beverage wholesale India, water distributor Mumbai comparison, distributor vs distributor",
      canonicalUrl: `${SITE_ORIGIN}/compare`,
      includeFAQ: false,
      image: "/imgs/og-image.jpg",
      author: COMPARISON_PAGE_REVIEWER,
      extraSchemas: buildCompareSchemas(SITE_ORIGIN),
    },
  });

  routeMap.push({
    path: "/wholesale-distributor",
    seo: {
      path: "/wholesale-distributor",
      title: "Best Wholesale Water & Beverage Distributor in Mumbai",
      description:
        "A3Distributor is Mumbai's leading wholesale water and beverage supplier. Best prices, 500+ products, same-day delivery. Serving small businesses to large enterprises with GST billing and flexible payment terms.",
      keywords:
        "best wholesale distributor mumbai, wholesale water distributor, bulk beverage supplier, same day water delivery mumbai, beverage wholesale india",
      canonicalUrl: `${SITE_ORIGIN}/wholesale-distributor`,
      includeFAQ: false,
      image: "/imgs/og-image.jpg",
      author: WHOLESALE_PAGE_REVIEWER,
      extraSchemas: buildWholesaleSchemas(SITE_ORIGIN),
    },
  });

  routeMap.push({
    path: "/blog",
    seo: {
      path: "/blog",
      title: "Blog - A3Distributors",
      description:
        "Explore A3Distributors insights on wholesale water supply, beverage distribution, pricing trends, product updates, and business buying guides.",
      keywords:
        "A3Distributors, wholesale blog, water distribution blog, beverage business blog, supply chain insights",
      canonicalUrl: `${SITE_ORIGIN}/blog`,
      includeFAQ: false,
      image: "/imgs/og-image.jpg",
      extraSchemas: buildBlogListingSchemas(SITE_ORIGIN, publishedBlogs),
    },
  });

  if (featuredBlog) {
    const blogSchemas = buildBlogPostSchemas(SITE_ORIGIN, featuredBlog);
    routeMap.push({
      path: `/blog/${featuredBlog.slug}`,
      seo: {
        path: `/blog/${featuredBlog.slug}`,
        title: featuredBlog.title,
        description: featuredBlog.meta_description || featuredBlog.excerpt,
        keywords: featuredBlog.meta_keywords || toTagList(featuredBlog.tags).join(", "),
        canonicalUrl: blogSchemas.canonicalUrl,
        includeFAQ: false,
        image: blogSchemas.seoImage,
        author: featuredBlog.author || "A3Distributors Team",
        ogType: "article",
        publishedTime: blogSchemas.publishedAt,
        modifiedTime: blogSchemas.modifiedAt,
        articleSection: featuredBlog.category,
        articleTags: blogSchemas.tagList,
        extraSchemas: [blogSchemas.articleSchema, blogSchemas.breadcrumbSchema],
      },
    });
  }

  for (const route of routeMap) {
    const rendered = applySeoToTemplate(indexHtml, route.seo);
    await writeRouteHtml(route.path, rendered);
    console.log(`Prerendered ${route.path}`);
  }
}

main().catch((error) => {
  console.error("Prerender failed:", error);
  throw error;
});
