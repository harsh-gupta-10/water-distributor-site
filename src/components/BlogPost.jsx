import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';
import { getBlogsWithFallback } from '../lib/blogFallback';
import SEO from './SEO';
import '../styles/blogPost.css';

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

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPost();
  }, [slug, navigate]);

  async function loadBlogPost() {
    setLoading(true);
    try {
      const { blogs } = await getBlogsWithFallback(supabase, { publishedOnly: true });
      const data = (blogs || []).find((item) => item.slug === slug);

      if (!data) {
        navigate('/404');
        return;
      }

      setBlog(data);

      const related = (blogs || [])
        .filter((item) => item.category === data.category && item.id !== data.id)
        .slice(0, 3);

      setRelatedBlogs(related);
    } catch (err) {
      console.error('Error loading blog:', err);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  }

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        description: blog.excerpt,
        url: url
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  // Add structured data for the current blog post.
  useEffect(() => {
    if (!blog) return;
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt,
      image: new URL(resolveImageUrl(blog.featured_image), window.location.origin).toString(),
      datePublished: blog.published_at,
      dateModified: blog.updated_at,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${window.location.origin}/blog/${blog.slug}`
      },
      author: {
        '@type': 'Person',
        name: blog.author
      },
      publisher: {
        '@type': 'Organization',
        '@id': 'https://a3distributors.com/#organization',
        name: settings.businessName,
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/imgs/logos/logo.png`
        }
      },
      inLanguage: 'en-IN',
      articleSection: blog.category,
      keywords: blog.meta_keywords || blog.tags || undefined
    };

    const existingBlogSchemas = document.querySelectorAll('script[type="application/ld+json"][data-schema="blog"]');
    existingBlogSchemas.forEach(script => script.remove());

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.setAttribute('data-schema', 'blog');
    schemaScript.textContent = JSON.stringify(structuredData);
    document.head.appendChild(schemaScript);

    return () => {
      const schemas = document.querySelectorAll('script[type="application/ld+json"][data-schema="blog"]');
      schemas.forEach(script => script.remove());
    };
  }, [blog, settings.businessName]);

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="blog-loading">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-post-container">
        <div className="blog-error">Post not found</div>
      </div>
    );
  }

  const readMinutes = Math.max(1, Math.ceil((blog.content || '').split(/\s+/).filter(Boolean).length / 220));
  const canonicalUrl = `${window.location.origin}/blog/${blog.slug}`;
  const seoImage = resolveImageUrl(blog.featured_image);

  return (
    <>
      <SEO
        title={blog.title}
        description={blog.meta_description || blog.excerpt}
        keywords={blog.meta_keywords || blog.tags || `${settings.businessName}, blog`}
        image={seoImage}
        canonicalUrl={canonicalUrl}
        ogType="article"
        publishedTime={blog.published_at}
        modifiedTime={blog.updated_at}
      />

      <div className="blog-post-container">
        {/* Back Button */}
        <Link to="/blog" className="back-button">
          <ArrowLeft size={20} />
          Back to Blog
        </Link>

        <article className="blog-post-article">
          {/* Header */}
          <header className="blog-post-header">
            <div className="blog-post-meta-top">
              <span className="blog-post-category">{blog.category}</span>
              <span className="blog-post-date">
                {new Date(blog.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <h1 className="blog-post-title">{blog.title}</h1>
            <p className="blog-post-excerpt">{blog.excerpt}</p>
            <div className="blog-post-author">
              <div className="author-info">
                <span className="author-name">{blog.author}</span>
                <span className="author-separator">•</span>
                <span className="read-time">
                  {readMinutes} min read
                </span>
              </div>
              <div className="share-buttons">
                <button
                  className="share-btn"
                  onClick={handleShare}
                  title="Share this post"
                >
                  <Share2 size={18} />
                </button>
                <button
                  className="share-btn"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.featured_image && (
            <div className="blog-post-image">
              <img
                src={resolveImageUrl(blog.featured_image)}
                alt={blog.title}
                loading="eager"
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + FALLBACK_BLOG_IMAGE) {
                    e.currentTarget.src = FALLBACK_BLOG_IMAGE;
                  }
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="blog-post-content">
            <div
              className="blog-post-body"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags && (
              <div className="blog-post-tags">
                <h3>Tags</h3>
                <div className="tags-list">
                  {blog.tags.split(',').map((tag, idx) => (
                    <Link
                      key={idx}
                      to={`/blog?search=${encodeURIComponent(tag.trim())}`}
                      className="tag-link"
                    >
                      #{tag.trim()}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Author Box */}
          <div className="blog-author-box">
            <div className="author-box-content">
              <h3>{blog.author}</h3>
              <p>{settings.businessName} Team</p>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="blog-related">
            <h2>Related Articles</h2>
            <div className="blog-related-grid">
              {relatedBlogs.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="blog-related-card">
                  {post.featured_image && (
                    <img
                      src={resolveImageUrl(post.featured_image)}
                      alt={post.title}
                      onError={(e) => {
                        if (e.currentTarget.src !== window.location.origin + FALLBACK_BLOG_IMAGE) {
                          e.currentTarget.src = FALLBACK_BLOG_IMAGE;
                        }
                      }}
                    />
                  )}
                  <div className="related-card-content">
                    <span className="related-category">{post.category}</span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <span className="related-date">
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      {/* Conversion CTA Section */}
      <div className="blog-conversion-cta">
        <div className="blog-conversion-content">
          <h3>Need Bulk Water or Soft Drink Supply?</h3>
          <ul className="conversion-benefits">
            <li>✔ Fast delivery</li>
            <li>✔ Competitive wholesale prices</li>
            <li>✔ Reliable distributor network</li>
          </ul>
          <Link to="/#quotation" className="conversion-cta-btn">
            Request a quotation today →
          </Link>
        </div>
      </div>
    </>
  );
}
