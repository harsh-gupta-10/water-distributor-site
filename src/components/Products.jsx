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

const categories = [
  {
    id: "water",
    name: "Packaged Drinking Water",
    description: "Premium branded mineral & packaged drinking water for every need",
    icon: Droplets,
    color: "#0066cc",
    bgColor: "#e8f4fd",
    products: [
      { name: "Bisleri", sizes: ["20L Jar", "5L Bottle", "1L Bottle", "500ml Bottle"], color: "#0099CC", tag: "Most Popular" },
      { name: "Kinley", sizes: ["20L Jar", "1L Bottle", "500ml Bottle"], color: "#003399", tag: "Coca-Cola Brand" },
      { name: "Aquafina", sizes: ["1L Bottle", "500ml Bottle"], color: "#0066FF", tag: "PepsiCo Brand" },
      { name: "Rail Neer", sizes: ["1L Bottle", "500ml Bottle"], color: "#1A8CFF", tag: "IRCTC" },
    ],
  },
  {
    id: "softdrinks",
    name: "Soft Drinks",
    description: "Popular carbonated beverages — Coca-Cola, Pepsi & more",
    icon: GlassWater,
    color: "#D32F2F",
    bgColor: "#fde8e8",
    products: [
      { name: "Coca-Cola", sizes: ["2L", "1.25L", "750ml", "300ml", "200ml Glass"], color: "#D32F2F", tag: "Top Seller" },
      { name: "Pepsi", sizes: ["2L", "1.25L", "750ml", "300ml", "200ml Glass"], color: "#1565C0", tag: "Top Seller" },
      { name: "Sprite", sizes: ["2L", "1.25L", "750ml", "300ml"], color: "#2E7D32", tag: null },
      { name: "Thums Up", sizes: ["2L", "1.25L", "750ml", "300ml", "200ml Glass"], color: "#B71C1C", tag: "Strong Taste" },
      { name: "Fanta", sizes: ["2L", "1.25L", "750ml", "300ml"], color: "#E65100", tag: null },
      { name: "Limca", sizes: ["2L", "1.25L", "750ml", "300ml"], color: "#00897B", tag: null },
      { name: "7UP", sizes: ["2L", "1.25L", "750ml", "300ml"], color: "#388E3C", tag: null },
    ],
  },
  {
    id: "juices",
    name: "Juices & Fruit Drinks",
    description: "Refreshing fruit juices and mango drinks for all seasons",
    icon: Wine,
    color: "#F9A825",
    bgColor: "#fff8e1",
    products: [
      { name: "Maaza", sizes: ["1.2L", "600ml", "250ml Tetra Pack"], color: "#F9A825", tag: "Mango Favourite" },
      { name: "Slice", sizes: ["1.2L", "600ml", "250ml Tetra Pack"], color: "#FF8F00", tag: null },
      { name: "Frooti", sizes: ["1.2L", "600ml", "200ml Tetra Pack"], color: "#8BC34A", tag: null },
      { name: "Real Juice", sizes: ["1L", "200ml Tetra Pack"], color: "#E91E63", tag: "Multiple Flavours" },
      { name: "Tropicana", sizes: ["1L", "200ml Tetra Pack"], color: "#FF9800", tag: "PepsiCo Brand" },
    ],
  },
  {
    id: "energy",
    name: "Energy & Sports Drinks",
    description: "High-energy drinks and hydration solutions",
    icon: Zap,
    color: "#C62828",
    bgColor: "#fce4ec",
    products: [
      { name: "Sting", sizes: ["250ml Can"], color: "#C62828", tag: "Energy Boost" },
      { name: "Red Bull", sizes: ["250ml Can"], color: "#D4AF37", tag: "Premium" },
      { name: "Monster", sizes: ["350ml Can"], color: "#4CAF50", tag: null },
      { name: "Gatorade", sizes: ["500ml Bottle"], color: "#FF6F00", tag: "Sports Hydration" },
    ],
  },
];

function CategoryCard({ category, onClick, delay, animate }) {
  const Icon = category.icon;
  const productCount = category.products.length;

  return (
    <div
      className={`category-card ${animate ? "animate-fadeInUp" : ""}`}
      style={{ opacity: animate ? 1 : 0, animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      <div
        className="category-card__icon-wrap"
        style={{ background: category.bgColor, color: category.color }}
      >
        <Icon size={32} />
      </div>
      <div className="category-card__content">
        <h3 className="category-card__name">{category.name}</h3>
        <p className="category-card__desc">{category.description}</p>
        <div className="category-card__footer">
          <span className="category-card__count">{productCount} Products</span>
          <span className="category-card__cta" style={{ color: category.color }}>
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
      <div
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="product-modal__header" style={{ borderColor: category.color }}>
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
              <div
                className="product-modal__item-icon"
                style={{
                  background: `linear-gradient(135deg, ${product.color}20, ${product.color}08)`,
                  color: product.color,
                }}
              >
                <GlassWater size={28} />
              </div>
              <div className="product-modal__item-info">
                <div className="product-modal__item-top">
                  <h4 className="product-modal__item-name">{product.name}</h4>
                  {product.tag && (
                    <span
                      className="product-modal__item-tag"
                      style={{ background: `${product.color}15`, color: product.color }}
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
              <button
                className="btn btn-primary btn-small product-modal__item-btn"
                onClick={() => onGetPrice()}
              >
                <ShoppingCart size={14} />
                Get Price
              </button>
            </div>
          ))}
        </div>

        <div className="product-modal__footer">
          <p>Need a product not listed here? Contact us for custom bulk orders.</p>
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
