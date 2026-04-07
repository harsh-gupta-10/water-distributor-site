import { sanitizeHtml } from '../lib/sanitize';
import '../styles/blogComponents.css';

/**
 * Reusable Blog Content Components
 * These components render blog content with consistent styling
 */

// Blog Table Component - renders tables with professional styling
export function BlogTable({ children, caption, striped = true, compact = false }) {
  return (
    <div className="blog-table-wrapper">
      <table className={`blog-table ${striped ? 'blog-table--striped' : ''} ${compact ? 'blog-table--compact' : ''}`}>
        {caption && <caption>{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

// Blog Image Component - renders images with captions and lazy loading
export function BlogImage({ 
  src, 
  alt, 
  caption, 
  width, 
  height,
  loading = 'lazy',
  priority = false,
  className = ''
}) {
  return (
    <figure className={`blog-figure ${className}`}>
      <img
        src={src}
        alt={alt || ''}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        className="blog-figure__img"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      {caption && <figcaption className="blog-figure__caption">{caption}</figcaption>}
    </figure>
  );
}

// Blog Callout/Alert Component
export function BlogCallout({ type = 'info', title, children }) {
  const icons = {
    info: '💡',
    warning: '⚠️',
    success: '✅',
    error: '❌',
    tip: '💭',
    note: '📝',
  };

  return (
    <aside className={`blog-callout blog-callout--${type}`}>
      <div className="blog-callout__header">
        <span className="blog-callout__icon">{icons[type] || icons.info}</span>
        {title && <strong className="blog-callout__title">{title}</strong>}
      </div>
      <div className="blog-callout__content">{children}</div>
    </aside>
  );
}

// Blog Quote/Testimonial Component
export function BlogQuote({ quote, author, role, image }) {
  return (
    <blockquote className="blog-quote">
      <p className="blog-quote__text">&ldquo;{quote}&rdquo;</p>
      <footer className="blog-quote__footer">
        {image && (
          <img src={image} alt={author} className="blog-quote__avatar" loading="lazy" />
        )}
        <div className="blog-quote__author">
          <cite className="blog-quote__name">{author}</cite>
          {role && <span className="blog-quote__role">{role}</span>}
        </div>
      </footer>
    </blockquote>
  );
}

// Blog Statistics Card Component
export function BlogStatCard({ value, label, icon, trend, trendValue }) {
  return (
    <div className="blog-stat-card">
      {icon && <span className="blog-stat-card__icon">{icon}</span>}
      <div className="blog-stat-card__value">{value}</div>
      <div className="blog-stat-card__label">{label}</div>
      {trend && (
        <div className={`blog-stat-card__trend blog-stat-card__trend--${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </div>
      )}
    </div>
  );
}

// Blog Stats Grid Component
export function BlogStatsGrid({ children, columns = 3 }) {
  return (
    <div className="blog-stats-grid" style={{ '--columns': columns }}>
      {children}
    </div>
  );
}

// Blog Comparison Table Component
export function BlogComparisonTable({ items, features }) {
  return (
    <div className="blog-comparison-wrapper">
      <table className="blog-comparison">
        <thead>
          <tr>
            <th>Feature</th>
            {items.map((item, i) => (
              <th key={i}>{item.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, i) => (
            <tr key={i}>
              <td className="blog-comparison__feature">{feature.name}</td>
              {items.map((item, j) => (
                <td key={j} className="blog-comparison__value">
                  {typeof feature.values[j] === 'boolean' ? (
                    feature.values[j] ? (
                      <span className="blog-comparison__check">✓</span>
                    ) : (
                      <span className="blog-comparison__cross">✗</span>
                    )
                  ) : (
                    feature.values[j]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Blog Steps/Process Component
export function BlogSteps({ steps }) {
  return (
    <ol className="blog-steps">
      {steps.map((step, index) => (
        <li key={index} className="blog-steps__item">
          <div className="blog-steps__number">{index + 1}</div>
          <div className="blog-steps__content">
            <h4 className="blog-steps__title">{step.title}</h4>
            {step.description && <p className="blog-steps__desc">{step.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Blog FAQ Accordion Component
export function BlogFAQ({ items }) {
  return (
    <div className="blog-faq">
      {items.map((item, index) => (
        <details key={index} className="blog-faq__item">
          <summary className="blog-faq__question">{item.question}</summary>
          <div className="blog-faq__answer">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

// Blog Pricing Card Component
export function BlogPricingCard({ 
  title, 
  price, 
  unit = '/unit', 
  description, 
  features = [], 
  highlighted = false,
  ctaText = 'Contact Us',
  ctaLink = '/contact'
}) {
  return (
    <div className={`blog-pricing-card ${highlighted ? 'blog-pricing-card--highlighted' : ''}`}>
      <h4 className="blog-pricing-card__title">{title}</h4>
      <div className="blog-pricing-card__price">
        <span className="blog-pricing-card__amount">{price}</span>
        <span className="blog-pricing-card__unit">{unit}</span>
      </div>
      {description && <p className="blog-pricing-card__desc">{description}</p>}
      {features.length > 0 && (
        <ul className="blog-pricing-card__features">
          {features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
      )}
      <a href={ctaLink} className="blog-pricing-card__cta">{ctaText}</a>
    </div>
  );
}

// Blog Content Renderer - Safely renders HTML content with enhanced styling
export function BlogContentRenderer({ content, className = '' }) {
  if (!content) return null;

  return (
    <div 
      className={`blog-content-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
}

// Blog Card Grid Component
export function BlogCardGrid({ children, columns = 2 }) {
  return (
    <div className="blog-card-grid" style={{ '--columns': columns }}>
      {children}
    </div>
  );
}

// Blog Feature Card Component
export function BlogFeatureCard({ icon, title, description }) {
  return (
    <div className="blog-feature-card">
      {icon && <div className="blog-feature-card__icon">{icon}</div>}
      <h4 className="blog-feature-card__title">{title}</h4>
      {description && <p className="blog-feature-card__desc">{description}</p>}
    </div>
  );
}

// Blog Code Block Component
export function BlogCodeBlock({ code, language = 'text', filename }) {
  return (
    <div className="blog-code-block">
      {filename && <div className="blog-code-block__header">{filename}</div>}
      <pre className={`blog-code-block__pre language-${language}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Blog Video Embed Component
export function BlogVideo({ src, title, type = 'youtube' }) {
  let embedUrl = src;

  // Convert YouTube watch URLs to embed URLs
  if (type === 'youtube' && src.includes('watch?v=')) {
    const videoId = src.split('watch?v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  return (
    <div className="blog-video-wrapper">
      <iframe
        src={embedUrl}
        title={title || 'Video'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="blog-video"
      />
    </div>
  );
}

// Blog Divider Component
export function BlogDivider({ style = 'solid' }) {
  return <hr className={`blog-divider blog-divider--${style}`} />;
}

// Blog CTA Banner Component
export function BlogCTABanner({ 
  title, 
  description, 
  buttonText, 
  buttonLink,
  variant = 'primary' 
}) {
  return (
    <div className={`blog-cta-banner blog-cta-banner--${variant}`}>
      <div className="blog-cta-banner__content">
        <h3 className="blog-cta-banner__title">{title}</h3>
        {description && <p className="blog-cta-banner__desc">{description}</p>}
      </div>
      <a href={buttonLink} className="blog-cta-banner__btn">{buttonText}</a>
    </div>
  );
}

export default {
  BlogTable,
  BlogImage,
  BlogCallout,
  BlogQuote,
  BlogStatCard,
  BlogStatsGrid,
  BlogComparisonTable,
  BlogSteps,
  BlogFAQ,
  BlogPricingCard,
  BlogContentRenderer,
  BlogCardGrid,
  BlogFeatureCard,
  BlogCodeBlock,
  BlogVideo,
  BlogDivider,
  BlogCTABanner,
};
