import {
  Truck,
  Package,
  Users,
  Zap,
  ChevronRight,
  Phone,
  Droplets,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useInView } from "react-intersection-observer";


const trustSignals = [
  { icon: Truck, label: "Fast Delivery" },
  { icon: Package, label: "Bulk Orders Available" },
  { icon: Users, label: "Local Distributor Network" },
];

export default function Hero({ onQuotationClick }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="home" className="hero" ref={ref}>
      {/* Subtle tricolor gradient strip at the very top */}
      <div className="hero__tricolor-strip" />

      <div className="hero__bg-pattern" />

      <div
        className={`hero__container container ${inView ? "animate-fadeInUp" : ""}`}
      >
        <div className="hero__content">
          <div className="hero__badge">
            <ShieldCheck size={16} />
            <span>Authorized Distributor</span>
          </div>
          <h1 className="hero__title">
            Reliable Water &amp; Beverage{" "}
            <span className="hero__title-highlight">Distribution</span> for Your
            Business
          </h1>
          <p className="hero__subtitle">
            Supplying trusted water &amp; cold drink brands across offices,
            shops, events, and wholesalers. Competitive pricing with on-time
            delivery guaranteed.
          </p>

          <div className="hero__actions">
            <button
              className="btn btn-primary hero__btn"
              onClick={onQuotationClick}
            >
              <Sparkles size={18} />
              Get Quotation
            </button>
            <a href="tel:+917304555662" className="btn btn-secondary hero__btn">
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

        <div className="hero__visual">
          <div className="hero__visual-card">
            <div className="hero__visual-bottles">
              <Droplets
                size={80}
                className="hero__bottle-icon hero__bottle-icon--1"
              />
              <Droplets
                size={60}
                className="hero__bottle-icon hero__bottle-icon--2"
              />
              <Droplets
                size={50}
                className="hero__bottle-icon hero__bottle-icon--3"
              />
            </div>
            <div className="hero__visual-label">
              <Zap size={16} />
              <span>500+ Businesses Served</span>
            </div>
          </div>
          <div className="hero__visual-floating hero__visual-floating--1">
            <Package size={20} />
            <span>Same-Day Delivery</span>
          </div>
          <div className="hero__visual-floating hero__visual-floating--2">
            <ShieldCheck size={20} />
            <span>GST Billing</span>
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
