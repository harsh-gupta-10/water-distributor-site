import {
  Truck,
  Package,
  Users,
  ChevronRight,
  Phone,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import heroBg from "../assets/imgs/hero-bg.webp";

const trustSignals = [
  { icon: Truck, label: "Fast Delivery" },
  { icon: Package, label: "Bulk Orders Available" },
  { icon: Users, label: "Local Distributor Network" },
];

export default function Hero({ onQuotationClick }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="home" className="hero" ref={ref}>
      <div
        className="hero__bg-image"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="hero__overlay" />

      <div
        className={`hero__container container ${inView ? "animate-fadeInUp" : ""}`}
      >
        <div className="hero__content">
          <div className="hero__badge">
            <ShieldCheck size={16} />
            <span>Authorized Distributor</span>
          </div>
          <h1 className="hero__title">
            Your Trusted Water &amp; Beverage{" "}
            <span className="hero__title-highlight">Distribution</span> Partner
          </h1>
          <p className="hero__subtitle">
            A3Distributors supplies top water &amp; cold drink brands to
            offices, shops, events, and wholesalers. Competitive pricing with
            on-time delivery guaranteed.
          </p>

          <div className="hero__actions">
            <button
              className="btn btn-primary hero__btn"
              onClick={onQuotationClick}
            >
              <Sparkles size={18} />
              Get Quotation
            </button>
            <a
              href="tel:+917304555662"
              className="btn btn-secondary hero__btn hero__btn--outline"
            >
              <Phone size={18} />
              Call Now
            </a>
          </div>

          <div className="hero__trust">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="hero__trust-item">
                <div className="hero__trust-icon">
                  <Icon size={20} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#products" className="hero__scroll">
        <ChevronRight size={20} className="hero__scroll-icon" />
        <span>Explore Products</span>
      </a>
    </section>
  );
}
