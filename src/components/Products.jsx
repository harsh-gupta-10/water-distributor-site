import { useState, useEffect, useMemo } from "react";
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

import { useSettingsSync } from "../hooks/useSettings";
import { supabase } from "../lib/supabase";
import { safeJsonLdStringify } from "../lib/jsonLd";

// Map icon strings from JSON to actual components
const iconMap = { Droplets, GlassWater, Wine, Zap };

function getProductImage(filename) {
  if (!filename) return null;
  const legacyImageMap = {
    "maaza.png": "maaza-Fruitdrink.webp",
    "slice.png": "Slice-Fruitdrink.webp",
    "frooti.png": "Frooti-Fruitdrink.webp",
    "tropicana.png": "Tropicana-Fruitdrink.webp",
    "real.png": "Real-Fruitdrink.webp",
    "fruttu.png": "Cloud9-Fruitdrink.webp",
    "lipton.png": "Lipton-Fruitdrink.webp",
    "nimbooz.png": "Nimbooz7up-Fruitdrink.webp",
  };
  const resolved = legacyImageMap[filename] || filename;
  return `/imgs/products/${resolved}`;
}

function buildProductListSchema(displayCategories, settings) {
  const origin = typeof window !== "undefined" ? window.location.origin : (settings?.url || "https://a3distributors.com");
  const items = (displayCategories || []).flatMap((category) =>
    (category.products || []).slice(0, 4).map((product) => ({
      "@type": "ListItem",
      position: 0,
      item: {
        "@type": "Product",
        name: product.name,
        category: category.name,
        description:
          product.description ||
          `${product.name} available for bulk supply in ${category.name} category`,
        url: `${origin}/#products`,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${origin}/#products`,
          seller: {
            "@type": "Organization",
            name: settings.businessName || "A3Distributors",
          },
        },
      },
    }))
  );

  const listItems = items.map((item, index) => ({ ...item, position: index + 1 }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Wholesale Water and Beverage Products",
    numberOfItems: listItems.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: listItems,
  };
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (e.key === " ") e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`category-card ${animate ? "animate-fadeInUp" : ""}`}
      style={{ opacity: animate ? 1 : 0, animationDelay: `${delay}s` }}
      onClick={onClick}
      role="button"
      aria-label={`View ${category.name} products`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="category-card__img-wrap"
        style={{ background: category.bgColor }}
      >
        {previewImg ? (
          <img
            src={previewImg}
            alt={`${category.name} wholesale products`}
            className="category-card__img"
            width={208}
            height={158}
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

function ProductListModal({ category, onClose, onGetPrice, settings }) {
  if (!category || !settings) return null;

  const Icon = category.icon;

  return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="product-modal" onClick={(e) => e.stopPropagation()}>
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
            <button
              className="modal__close product-modal__close"
              onClick={onClose}
              aria-label="Close product list"
            >
              <X size={18} />
            </button>
          </div>

        <div className="product-modal__list">
          {category.products.map((product) => (
            <div key={product.name} className="product-modal__item">
              <div className="product-modal__item-img-wrap">
                {product.imageSrc ? (
                  <img
                    src={product.imageSrc}
                    alt={`${product.name} in ${category.name}`}
                    className="product-modal__item-img"
                    width={80}
                    height={80}
                    loading="lazy"
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
                  <span>{product.description || (product.sizes ? `Available in: ${product.sizes.join(" / ")}` : '')}</span>
                </div>
                {settings.showProductPrice && product.price != null && (
                  <div className="product-modal__item-sizes" style={{ marginTop: 4 }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Price:</span> ₹{product.price}
                  </div>
                )}
                {settings.showProductStock && product.stock != null && (
                  <div className="product-modal__item-sizes" style={{ marginTop: 4 }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Stock:</span> {product.stock > 0 ? `${product.stock} units` : <span style={{ color: '#ef4444' }}>Out of stock</span>}
                  </div>
                )}
              </div>
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hey, I am looking for ${product.name}. Please share pricing and availability.`)}`}
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
  const settings = useSettingsSync();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [displayCategories, setDisplayCategories] = useState(categories);

  useEffect(() => {
    async function loadDbProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('position', { ascending: true })
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          const catMap = {};
          data.forEach((p) => {
            if (!catMap[p.category]) catMap[p.category] = [];
            catMap[p.category].push({
              name: p.name,
              imageSrc: p.image_path,
              description: p.description,
              price: p.price,
              stock: p.stock,
              color: catMap[p.category]?.length ? catMap[p.category][0].color : undefined,
            });
          });

          // Merge DB products over JSON categories
          const newCats = categories.map((cat) => {
            const dbProducts = catMap[cat.name];
            if (dbProducts && dbProducts.length > 0) {
              return {
                ...cat,
                products: dbProducts.map((dbp) => ({ ...dbp, color: cat.products[0]?.color || cat.color })),
              };
            }
            return cat;
          });

          setDisplayCategories(newCats);
        }
      } catch (err) {
        console.error("Failed to load products from DB, using JSON fallback", err);
      }
    }
    loadDbProducts();
  }, []);

  const totalProducts = useMemo(
    () => displayCategories.reduce((sum, category) => sum + (category.products?.length || 0), 0),
    [displayCategories]
  );

  const productListSchema = useMemo(
    () => buildProductListSchema(displayCategories, settings),
    [displayCategories, settings]
  );

  return (
    <section id="products" className="products" ref={ref}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(productListSchema) }}
      />

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
          {displayCategories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => setSelectedCategory(cat)}
              delay={0.1 + i * 0.1}
              animate={inView}
            />
          ))}
        </div>

        <div className="products-seo-copy">
          <h3>Bulk Water and Beverage Categories for Businesses</h3>
          <p>
            We currently manage <strong>{totalProducts}+ products</strong> across
            packaged drinking water, soft drinks, juices, and energy drinks for
            offices, retailers, hotels, events, and institutional supply.
          </p>
          <ul className="products-seo-copy__list">
            {displayCategories.map((category) => {
              const preview = (category.products || []).slice(0, 3).map((product) => product.name).join(', ');
              return (
                <li key={category.id}>
                  <strong>{category.name}:</strong> {preview}
                  {category.products.length > 3 ? ', and more.' : '.'}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {selectedCategory && (
        <ProductListModal
          category={selectedCategory}
          settings={settings}
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
