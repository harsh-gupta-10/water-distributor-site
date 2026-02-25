import { useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Droplets,
  GlassWater,
  Wine,
  Zap,
  X,
  Tag,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import productsData from "../data/products.json";

import siteConfig from "../data/siteConfig";

// Map icon strings from JSON to actual components
const iconMap = { Droplets, GlassWater, Wine, Zap };

function getProductImage(filename) {
  if (!filename) return null;
  return `/imgs/products/${filename}`;
}

// Build categories with resolved icons and images
const categories = productsData.categories.map((cat) => ({
  ...cat,
  icon: iconMap[cat.icon] || Droplets,
  categoryImage: cat.categoryImage ? `/imgs/products/${cat.categoryImage}` : null,
  products: cat.products.map((p) => ({
    ...p,
    imageSrc: getProductImage(p.image),
  })),
}));

function CategoryCard({ category, onClick, delay, animate }) {
  const Icon = category.icon;
  const productCount = category.products.length;
  const previewImg = category.categoryImage || category.products[0]?.imageSrc;

  return (
    <div
      className={`category-card ${animate ? "animate-fadeInUp" : ""}`}
      style={{ opacity: animate ? 1 : 0, animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      <div
        className="category-card__img-wrap"
        style={{ background: category.bgColor }}
      >
        {previewImg ? (
          <img
            src={previewImg}
            alt={category.name}
            className="category-card__img"
          />
        ) : (
          <Icon size={48} style={{ color: category.color }} />
        )}
      </div>
      <div className="category-card__content">
        <h3 className="category-card__name">{category.name}</h3>
        <p className="category-card__desc">{category.description}</p>
        <div className="category-card__footer">
          <span className="category-card__count">{productCount} Products</span>
          <span
            className="category-card__cta"
            style={{ color: category.color }}
          >
            View All <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </div>
  );
}

function ProductListModal({ category, onClose, onGetPrice }) {
  if (!category) return null;

  const Icon = category.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          <X size={18} />
        </button>

        <div
          className="product-modal__header"
          style={{ borderColor: category.color }}
        >
          <div
            className="product-modal__header-icon"
            style={{ background: category.bgColor, color: category.color }}
          >
            <Icon size={24} />
          </div>
          <div>
            <h2 className="product-modal__title">{category.name}</h2>
            <p className="product-modal__subtitle">
              {category.products.length} products available for bulk supply
            </p>
          </div>
        </div>

        <div className="product-modal__list">
          {category.products.map((product) => (
            <div key={product.name} className="product-modal__item">
              <div className="product-modal__item-img-wrap">
                {product.imageSrc ? (
                  <img
                    src={product.imageSrc}
                    alt={product.name}
                    className="product-modal__item-img"
                  />
                ) : (
                  <div
                    className="product-modal__item-icon"
                    style={{
                      background: `linear-gradient(135deg, ${product.color}20, ${product.color}08)`,
                      color: product.color,
                    }}
                  >
                    <GlassWater size={28} />
                  </div>
                )}
              </div>
              <div className="product-modal__item-info">
                <div className="product-modal__item-top">
                  <h4 className="product-modal__item-name">{product.name}</h4>
                  {product.tag && (
                    <span
                      className="product-modal__item-tag"
                      style={{
                        background: `${product.color}15`,
                        color: product.color,
                      }}
                    >
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="product-modal__item-sizes">
                  <Tag size={13} />
                  <span>Available in: {product.sizes.join(" / ")}</span>
                </div>
              </div>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`Hey, I am looking for ${product.name}. Please share pricing and availability.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-small product-modal__item-btn"
              >
                <ShoppingCart size={14} />
                Get Price
              </a>
            </div>
          ))}
        </div>

        <div className="product-modal__footer">
          <p>
            Need a product not listed here? Contact us for custom bulk orders.
          </p>
          <button className="btn btn-primary" onClick={() => onGetPrice()}>
            Request Bulk Quotation
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products({ onQuotationClick }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <section id="products" className="products" ref={ref}>
      <div className="container">
        <div
          className={`section-header ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0 }}
        >
          <span className="section-label">Our Products</span>
          <h2 className="section-title">Popular Brands We Supply</h2>
          <div className="mandala-divider" />
          <p className="section-subtitle">
            We stock and distribute India&apos;s most trusted water and beverage
            brands. Quality assured, competitively priced, and always in stock.
            <br />
            <strong>Can&apos;t find your preferred brand? No worries — we can source any brand of water or soft drink you need. Just let us know!</strong>
          </p>
        </div>

        <div className="category-grid">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => setSelectedCategory(cat)}
              delay={0.1 + i * 0.1}
              animate={inView}
            />
          ))}
        </div>
      </div>

      {selectedCategory && (
        <ProductListModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onGetPrice={() => {
            setSelectedCategory(null);
            onQuotationClick();
          }}
        />
      )}
    </section>
  );
}
