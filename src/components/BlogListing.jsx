import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';
import { getBlogsWithFallback } from '../lib/blogFallback';
import SEO from './SEO';
import BlogAdUnit from './BlogAdUnit';
import '../styles/blogListing.css';

const FALLBACK_BLOG_IMAGE = '/imgs/logo-footer.png';
const BLOG_LISTING_AD_SLOT = '2573632378'; // Re-using the known slot id, can be updated later.

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
  const brandName = settings.businessName?.trim() || 'A3 Distributor';
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

  const totalPages = Math.ceil(regularPosts.length / postsPerPage);
  const startIdx = (currentPage - 1) * postsPerPage;
  const endIdx = startIdx + postsPerPage;
  const displayedBlogs = regularPosts.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const pageTitle = selectedCategory !== 'all'
    ? `${BLOG_CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Blog'} - ${brandName} Blog`
    : `Blog - ${brandName}`;

  const pageDescription = `Explore the ${brandName} blog for insights on water distribution, products, industry news, and business tips.`;

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`${brandName}, blog, water distribution, products, industry insights`}
        image={featuredPost && featuredPost.featured_image ? resolveImageUrl(featuredPost.featured_image) : undefined}
      />

      <div className="blog-listing-container">
        <div className="blog-controls container">
          <form onSubmit={handleSearch} className="blog-search-form">
            <Search size={18} className="blog-search-icon" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="blog-search-input"
            />
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
            <h3>No matching posts found</h3>
            <p>Try another keyword or browse a different category.</p>
          </div>
        ) : (
          <>
            {featuredPost && (
              <section className="blog-featured container">
                <article className="blog-featured-card">
                  <Link to={`/blog/${featuredPost.slug}`} className="blog-featured-link">
                    {featuredPost.featured_image ? (
                      <div className="blog-featured-media">
                        <img
                          src={resolveImageUrl(featuredPost.featured_image)}
                          alt={featuredPost.title}
                          onError={(e) => {
                            e.currentTarget.closest('.blog-featured-media')?.classList.add('blog-featured-media--placeholder');
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="blog-featured-media blog-featured-media--placeholder" aria-hidden="true">
                        <div className="blog-featured-placeholder-text">Top Story</div>
                      </div>
                    )}
                    <div className="blog-featured-body">
                      <span className="blog-featured-label">Featured Story</span>
                      <h2>{featuredPost.title}</h2>
                      <p>{featuredPost.excerpt}</p>
                      <div className="blog-meta">
                        <span className="blog-author">By {featuredPost.author || brandName}</span>
                        <span className="blog-date">
                          {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              </section>
            )}

            {/* AdUnit between featured post and regular posts */}
            <div className="container">
              <BlogAdUnit
                slot={BLOG_LISTING_AD_SLOT}
                containerClassName="blog-ads-container"
                insClassName="blog-ads-unit"
              />
            </div>

            <div className="blog-grid container">
              {displayedBlogs.map((blog, idx) => (
                <React.Fragment key={blog.id}>
                <article className="blog-card">
                  <Link to={`/blog/${blog.slug}`} className="blog-card-link">
                    {blog.featured_image && (
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
                    )}
                    <div className="blog-content">
                      <h2 className="blog-title">{blog.title}</h2>
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
                {/* Insert an ad after the 4th post in the grid, if there are more than 4 posts */}
                {idx === 3 && displayedBlogs.length > 4 && (
                  <div className="blog-grid-ad-container" style={{ gridColumn: '1 / -1' }}>
                    <BlogAdUnit
                      slot={BLOG_LISTING_AD_SLOT}
                      containerClassName="blog-ads-container"
                      insClassName="blog-ads-unit"
                    />
                  </div>
                )}
                </React.Fragment>
              ))}
            </div>

            {/* Bottom Ad Unit */}
            <div className="container">
              <BlogAdUnit
                slot={BLOG_LISTING_AD_SLOT}
                containerClassName="blog-ads-container"
                insClassName="blog-ads-unit"
              />
            </div>

            {/* Pagination */}
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
    </>
  );
}
