import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';
import { getBlogsWithFallback } from '../lib/blogFallback';
import { FALLBACK_BLOG_IMAGE, resolveBlogImageUrl } from '../lib/blogImage';
import { sanitizeHtml } from '../lib/sanitize';
import SEO from './SEO';
import '../styles/blogPost.css';

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ');
}

function toTagList(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  return String(tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          description: blog.excerpt,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Ignore aborted share flow.
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Ignore clipboard failures.
    }
  };

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

  const tagList = toTagList(blog.tags);
  const contentWordCount = stripHtml(blog.content).split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(contentWordCount / 220));
  const canonicalUrl = `${window.location.origin}/blog/${blog.slug}`;
  const seoImage = resolveBlogImageUrl(blog.featured_image);
  const publishedAt = blog.published_at || blog.created_at;
  const modifiedAt = blog.updated_at || blog.published_at || blog.created_at;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: new URL(seoImage, window.location.origin).toString(),
    datePublished: publishedAt,
    dateModified: modifiedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Person',
      name: blog.author || 'A3Distributors Team',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://a3distributors.com/#organization',
      name: settings.businessName || 'A3Distributors',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/imgs/logos/logo.png`,
      },
    },
    inLanguage: 'en-IN',
    articleSection: blog.category,
    keywords: (tagList || []).join(', ') || undefined,
  };

  const breadcrumbSchema = {
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
        item: `${window.location.origin}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: canonicalUrl,
      },
    ],
  };

  const seoSchemas = [articleSchema, breadcrumbSchema];

  return (
    <>
      <SEO
        title={blog.title}
        description={blog.meta_description || blog.excerpt}
        keywords={blog.meta_keywords || tagList.join(', ') || `${settings.businessName}, blog`}
        image={seoImage}
        canonicalUrl={canonicalUrl}
        ogType="article"
        publishedTime={publishedAt}
        modifiedTime={modifiedAt}
        author={blog.author || 'A3Distributors Team'}
        articleSection={blog.category}
        articleTags={tagList}
        extraSchemas={seoSchemas}
      />

      <div className="blog-post-container">
        <Link to="/blog" className="back-button">
          <ArrowLeft size={20} />
          Back to Blog
        </Link>

        <article className="blog-post-article">
          <header className="blog-post-header">
            <div className="blog-post-meta-top">
              <Link
                to={`/blog?category=${encodeURIComponent(blog.category)}`}
                className="blog-post-category"
              >
                {blog.category}
              </Link>
              <span className="blog-post-date">
                {new Date(publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1 className="blog-post-title">{blog.title}</h1>
            <p className="blog-post-excerpt">{blog.excerpt}</p>
            <div className="blog-post-author">
              <div className="author-info">
                <span className="author-name">{blog.author || 'A3Distributors Team'}</span>
                <span className="author-separator">•</span>
                <span className="read-time">{readMinutes} min read</span>
                <span className="author-separator">•</span>
                <span className="read-time">
                  Updated {new Date(modifiedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="share-buttons">
                <button className="share-btn" onClick={handleShare} title="Share this post">
                  <Share2 size={18} />
                </button>
                <button className="share-btn" onClick={handleCopyLink} title="Copy link">
                  <Copy size={18} />
                </button>
              </div>
            </div>
          </header>

          {blog.featured_image && (
            <div className="blog-post-image">
                <img
                src={resolveBlogImageUrl(blog.featured_image)}
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

          <div className="blog-post-content">
            <div
              className="blog-post-body"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
            />

            {tagList.length > 0 && (
              <div className="blog-post-tags">
                <h2>Tags</h2>
                <div className="tags-list">
                  {tagList.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?search=${encodeURIComponent(tag)}`}
                      className="tag-link"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="blog-author-box">
            <div className="author-box-content">
              <h3>{blog.author || 'A3Distributors Team'}</h3>
              <p>{settings.businessName} Team</p>
            </div>
          </div>
        </article>

        {relatedBlogs.length > 0 && (
          <section className="blog-related">
            <h2>Related Articles</h2>
            <div className="blog-related-grid">
              {relatedBlogs.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="blog-related-card">
                  {post.featured_image && (
                    <img
                      src={resolveBlogImageUrl(post.featured_image)}
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
                      {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

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

