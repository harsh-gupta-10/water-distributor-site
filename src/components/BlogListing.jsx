import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';
import { getBlogsWithFallback } from '../lib/blogFallback';
import SEO from './SEO';
import '../styles/blogListing.css';

const FALLBACK_BLOG_IMAGE = '/imgs/logo-footer.png';

function resolveImageUrl(url) {
  if (!url) return FALLBACK_BLOG_IMAGE;
  const value = String(url).trim();
  if (!value) return FALLBACK_BLOG_IMAGE;
  if (/^https?:\/\//i.test(value) || value.startsWith('/') || value.startsWith('data:')) {
    return value;
  }
  return `/${value.replace(/^\/+/, '')}`;
}

const BLOG_CATEGORIES = [
  { value: 'all', label: 'All Posts' },
  { value: 'business', label: 'Business' },
  { value: 'product', label: 'Products' },
  { value: 'tips', label: 'Tips & Tricks' },
  { value: 'industry', label: 'Industry News' },
  { value: 'case-study', label: 'Case Studies' }
];

export default function BlogListing() {
  const { settings } = useSettings();
  const brandName = settings.businessName?.trim() || 'A3Distributor';
  const [searchParams, setSearchParams] = useSearchParams();
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';

  const postsPerPage = 8;

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    try {
      const { blogs } = await getBlogsWithFallback(supabase, { publishedOnly: true });
      setAllBlogs(blogs || []);
    } catch (err) {
      console.error('Error loading blogs:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((blog) => {
      const categoryMatch = selectedCategory === 'all' || blog.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return categoryMatch;
      const title = blog.title?.toLowerCase() || '';
      const excerpt = blog.excerpt?.toLowerCase() || '';
      const tags = blog.tags?.toLowerCase() || '';
      return categoryMatch && (title.includes(q) || excerpt.includes(q) || tags.includes(q));
    });
  }, [allBlogs, selectedCategory, searchQuery]);

  const featuredPost = filteredBlogs[0] || null;
  const regularPosts = featuredPost ? filteredBlogs.slice(1) : [];
  const twoCardRowMode = filteredBlogs.length === 2;
  const pairedPost = twoCardRowMode ? (regularPosts[0] || null) : null;
  const gridPosts = twoCardRowMode ? regularPosts.slice(1) : regularPosts;

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    const next = new URLSearchParams(searchParams);
    if (category === 'all') {
      next.delete('category');
    } else {
      next.set('category', category);
    }
    setCurrentPage(1);
    setSearchParams(next);
  };

  const handleSearchChange = (e) => {
    const next = new URLSearchParams(searchParams);
    const value = e.target.value;
    if (value.trim()) {
      next.set('search', value);
    } else {
      next.delete('search');
    }
    setCurrentPage(1);
    setSearchParams(next);
  };

  const totalPages = Math.ceil(gridPosts.length / postsPerPage);
  const startIdx = (currentPage - 1) * postsPerPage;
  const endIdx = startIdx + postsPerPage;
  const displayedBlogs = gridPosts.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const pageTitle = selectedCategory !== 'all'
    ? `${BLOG_CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Blog'} - ${brandName} Blog`
    : `Blog - ${brandName}`;

  const pageDescription =
    `Explore ${brandName} insights on wholesale water supply, beverage distribution, pricing trends, product updates, and business buying guides.`;

  const hasFilters = Boolean(searchQuery.trim() || (selectedCategory && selectedCategory !== 'all'));
  const canonicalUrl = `${window.location.origin}/blog`;
  const totalCategoryCount = new Set((allBlogs || []).map((blog) => blog.category).filter(Boolean)).size;

  const blogCollectionSchema = useMemo(() => {
    if (hasFilters) return null;

    const items = filteredBlogs.slice(0, 20).map((blog, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${window.location.origin}/blog/${blog.slug}`,
      name: blog.title,
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${brandName} Blog`,
      url: canonicalUrl,
      description: pageDescription,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: items,
      },
    };
  }, [hasFilters, filteredBlogs, brandName, canonicalUrl, pageDescription]);

  const blogSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${brandName} Blog`,
    description: pageDescription,
    url: canonicalUrl,
    inLanguage: 'en-IN',
  }), [brandName, pageDescription, canonicalUrl]);

  const breadcrumbSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${window.location.origin}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: canonicalUrl,
      },
    ],
  }), [canonicalUrl]);

  const seoSchemas = useMemo(() => {
    const schemas = [blogSchema, breadcrumbSchema];
    if (blogCollectionSchema) schemas.push(blogCollectionSchema);
    return schemas;
  }, [blogSchema, breadcrumbSchema, blogCollectionSchema]);

  function renderBlogCard(blog, { featured = false } = {}) {
    const HeadingTag = featured ? 'h2' : 'h3';

    return (
      <article className={`blog-card${featured ? ' blog-card--featured' : ''}`} key={blog.id}>
        <Link to={`/blog/${blog.slug}`} className="blog-card-link">
          {blog.featured_image ? (
            <div className="blog-image">
              <img
                src={resolveImageUrl(blog.featured_image)}
                alt={blog.title}
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + FALLBACK_BLOG_IMAGE) {
                    e.currentTarget.src = FALLBACK_BLOG_IMAGE;
                  }
                }}
              />
              <span className="blog-category-badge">{blog.category}</span>
            </div>
          ) : (
            <div className="blog-image blog-image--placeholder" aria-hidden="true" />
          )}
          <div className="blog-content">
            {featured && <span className="blog-featured-badge">Featured</span>}
            <HeadingTag className="blog-title">{blog.title}</HeadingTag>
            <p className="blog-excerpt">{blog.excerpt}</p>
            <div className="blog-meta">
              <span className="blog-author">By {blog.author || brandName}</span>
              <span className="blog-date">
                {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`${brandName}, wholesale blog, water distribution blog, beverage business blog, supply chain insights`}
        canonicalUrl={canonicalUrl}
        noindex={hasFilters}
        ogType="website"
        image="/imgs/og-image.jpg"
        extraSchemas={seoSchemas}
      />

      <div className="blog-listing-container">
        <div className="blog-shell">
          <header className="blog-header">
            <div className="blog-header-content">
              <span className="blog-kicker">Industry Insights</span>
              <h1>Water &amp; Beverage Distribution Blog</h1>
              <p>
                Practical guides, wholesale buying tips, and supply insights for offices,
                retailers, and event businesses looking for reliable beverage distribution.
              </p>
              <div className="blog-header-stats">
                <div>
                  <strong>{allBlogs.length}</strong>
                  <span>Total Articles</span>
                </div>
                <div>
                  <strong>{totalCategoryCount}</strong>
                  <span>Categories</span>
                </div>
                <div>
                  <strong>{filteredBlogs.length}</strong>
                  <span>Matching Posts</span>
                </div>
              </div>
            </div>
          </header>

          <div className="blog-controls">
            <form onSubmit={handleSearch} className="blog-search-form">
              <div className="blog-search-field">
                <Search size={18} className="blog-search-icon" />
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="blog-search-input"
                />
              </div>
              <button type="submit" className="blog-search-btn">Search</button>
            </form>

            <div className="blog-categories">
              {BLOG_CATEGORIES.map(category => (
                <button
                  key={category.value}
                  type="button"
                  className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="blog-loading">Loading blog posts...</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="blog-empty">
              <h2>No matching posts found</h2>
              <p>Try another keyword or browse a different category.</p>
            </div>
          ) : (
            <>
              {featuredPost && (
                <section className={`blog-featured-wrap ${twoCardRowMode ? 'blog-featured-wrap--paired' : 'blog-featured-wrap--full'}`}>
                  {renderBlogCard(featuredPost, { featured: true })}
                  {pairedPost && renderBlogCard(pairedPost)}
                </section>
              )}

              <div className="blog-grid">
                {displayedBlogs.map((blog) => renderBlogCard(blog))}
              </div>

              <section className="blog-suggestions" aria-label="Suggested next steps">
                <h2 className="blog-suggestions__title">Suggested Next Steps</h2>
                <div className="blog-suggestions__grid">
                  <Link to="/wholesale-distributor" className="blog-suggestion-card">
                    <h3>Need Bulk Water Supply?</h3>
                    <p>See wholesale plans, delivery coverage, and business pricing options.</p>
                    <span>Explore wholesale →</span>
                  </Link>
                  <Link to="/compare" className="blog-suggestion-card">
                    <h3>Compare Distributors</h3>
                    <p>Check side-by-side comparison to choose the best partner for your business.</p>
                    <span>View comparison →</span>
                  </Link>
                  <Link to="/#quotation" className="blog-suggestion-card">
                    <h3>Get a Quick Quotation</h3>
                    <p>Tell us your requirement and get a customized quote for your team.</p>
                    <span>Request quote →</span>
                  </Link>
                </div>
              </section>

              {totalPages > 1 && (
                <div className="blog-pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
