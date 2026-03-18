import { useInView } from "react-intersection-observer";
import {
  CheckCircle,
  TrendingDown,
  Package,
  Zap,
  Shield,
  Users,
  Clock,
  Award,
  Phone,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import SEO from "./SEO";
import { useSettingsSync } from "../hooks/useSettings";

const keyFeatures = [
  {
    icon: TrendingDown,
    title: "Unbeatable Wholesale Pricing",
    description: "Save 5-20% compared to competitors with our transparent volume-based pricing model.",
  },
  {
    icon: Package,
    title: "500+ Product SKUs",
    description: "Complete range of water & beverages from all major brands - Bisleri, Coca-Cola, Pepsi, and more.",
  },
  {
    icon: Zap,
    title: "Same-Day Delivery",
    description: "Urgent orders delivered within hours. No extra charges for express delivery in Mumbai region.",
  },
  {
    icon: Shield,
    title: "100% Quality Guarantee",
    description: "Authentic products directly from authorized manufacturers. Full warranty on all items.",
  },
  {
    icon: Users,
    title: "Dedicated Account Manager",
    description: "Personal service for bulk clients. Real-time inventory updates and order tracking.",
  },
  {
    icon: Clock,
    title: "24/7 Order Placement",
    description: "Place orders anytime through WhatsApp, phone, or online portal. We never close.",
  },
];

const pricingTiers = [
  {
    name: "Small Business",
    range: "50-200 Units",
    discount: "5-10% Off",
    features: [
      "No minimum order restrictions",
      "Flexible payment options",
      "Next-day delivery",
      "Email support",
      "GST invoicing",
    ],
    cta: "Get Started",
  },
  {
    name: "Medium Enterprise",
    range: "200-500 Units",
    discount: "10-15% Off",
    features: [
      "Enhanced volume discounts",
      "Priority delivery slots",
      "Dedicated WhatsApp support",
      "Weekly billing options",
      "Free delivery on orders ₹10,000+",
    ],
    popular: true,
    cta: "Most Popular",
  },
  {
    name: "Large Corporate",
    range: "500+ Units",
    discount: "15-20% Off",
    features: [
      "Maximum bulk discounts",
      "Personal account manager",
      "Same-day emergency delivery",
      "Monthly credit terms",
      "Custom pricing & contracts",
    ],
    cta: "Contact Sales",
  },
];

const whyBestList = [
  "India's most competitive wholesale pricing with transparent discount structure",
  "Largest product selection: 500+ SKUs across all major water & beverage brands",
  "Fastest delivery in Mumbai region - same-day service at no extra cost",
  "Zero minimum order quantity - we serve everyone from small cafes to large enterprises",
  "Professional GST billing with flexible payment terms for verified businesses",
  "Award-winning customer service with dedicated local support team",
  "100% authentic products with money-back quality guarantee",
  "Real-time inventory visibility - never face stock-out situations",
];

function PricingCard({ name, range, discount, features, popular, cta }) {
  const handleClick = () => {
    const message = encodeURIComponent(
      `Hi, I'm interested in the ${name} plan (${range}). Please share more details.`
    );
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div className={`pricing-card ${popular ? "pricing-card--popular" : ""}`}>
      {popular && <div className="pricing-card__badge">Most Popular</div>}
      <div className="pricing-card__header">
        <h3 className="pricing-card__name">{name}</h3>
        <p className="pricing-card__range">{range}</p>
        <div className="pricing-card__discount">{discount}</div>
      </div>
      <ul className="pricing-card__features">
        {features.map((feature, idx) => (
          <li key={idx}>
            <CheckCircle size={16} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button onClick={handleClick} className={`btn ${popular ? "btn-primary" : "btn-secondary"}`}>
        {cta}
        {popular && <ArrowRight size={16} />}
      </button>
    </div>
  );
}

export default function WholesaleDistributorPage() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: featuresRef, inView: featuresInView } = useInView({ threshold: 0.05, triggerOnce: true });
  const { ref: pricingRef, inView: pricingInView } = useInView({ threshold: 0.05, triggerOnce: true });
  const { ref: whyRef, inView: whyInView } = useInView({ threshold: 0.05, triggerOnce: true });
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const siteConfig = useSettingsSync();

  const handleWhatsApp = () => {
    const message = encodeURIComponent(siteConfig.whatsappMessages.general);
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${message}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${siteConfig.phone}`;
  };

  return (
    <>
      <SEO 
        title="Best Wholesale Water & Beverage Distributor in Mumbai"
        description="A3Distributor is Mumbai's leading wholesale water and beverage supplier. Best prices, 500+ products, same-day delivery. Serving small businesses to large enterprises. GST billing, flexible payment terms."
        keywords="best wholesale distributor, wholesale water distributor, beverage distributor Mumbai, bulk water supply, wholesale drinks supplier, water distributor near me, beverage wholesale India, drink distributor, soft drink wholesale"
      />
      
      <main className="wholesale-page">
        {/* Hero Section */}
        <section className="wholesale-hero" ref={heroRef}>
          <div className="container">
            <div className={`wholesale-hero__content ${heroInView ? "animate-fadeInUp" : ""}`}>
              <div className="wholesale-hero__badge">
                <Award size={16} />
                <span>Mumbai's #1 Rated Wholesale Distributor</span>
              </div>
              <h1 className="wholesale-hero__title">
                Best Wholesale Water & Beverage Distributor
              </h1>
              <p className="wholesale-hero__subtitle">
                Supplying quality water and beverages to 500+ businesses across Mumbai. 
                Unbeatable wholesale pricing, massive product selection, and delivery you can count on.
              </p>
              <div className="wholesale-hero__buttons">
                <button onClick={handleWhatsApp} className="btn btn-primary">
                  <MessageCircle size={18} />
                  Get Free Quote
                </button>
                <button onClick={handleCall} className="btn btn-secondary">
                  <Phone size={18} />
                  Call {siteConfig.phoneDisplay}
                </button>
              </div>
              <div className="wholesale-hero__trust">
                <div className="wholesale-hero__trust-item">
                  <strong>500+</strong>
                  <span>Happy Clients</span>
                </div>
                <div className="wholesale-hero__trust-item">
                  <strong>500+</strong>
                  <span>Product SKUs</span>
                </div>
                <div className="wholesale-hero__trust-item">
                  <strong>5.0★</strong>
                  <span>Google Rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="wholesale-features" ref={featuresRef}>
          <div className="container">
            <div className={`section-header ${featuresInView ? "animate-fadeInUp" : ""}`}>
              <span className="section-label">Core Features</span>
              <h2 className="section-title">Why Businesses Choose A3Distributor</h2>
              <div className="mandala-divider" />
            </div>

            <div className="wholesale-features__grid">
              {keyFeatures.map(({ icon: Icon, title, description }, index) => (
                <div
                  key={title}
                  className={`wholesale-feature-card ${featuresInView ? "animate-fadeInUp" : ""}`}
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="wholesale-feature-card__icon">
                    <Icon size={28} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="wholesale-pricing" ref={pricingRef}>
          <div className="container">
            <div className={`section-header ${pricingInView ? "animate-fadeInUp" : ""}`}>
              <span className="section-label">Transparent Pricing</span>
              <h2 className="section-title">Volume-Based Discount Tiers</h2>
              <div className="mandala-divider" />
              <p className="section-subtitle">
                The more you order, the more you save. No hidden fees, no surprises.
              </p>
            </div>

            <div className="pricing-grid">
              {pricingTiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className={pricingInView ? "animate-fadeInUp" : ""}
                  style={{ animationDelay: `${0.15 * index}s` }}
                >
                  <PricingCard {...tier} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why We're the Best */}
        <section className="wholesale-why" ref={whyRef}>
          <div className="container">
            <div className={`wholesale-why__content ${whyInView ? "animate-fadeInUp" : ""}`}>
              <h2>What Makes Us the Best Wholesale Distributor?</h2>
              <ul className="wholesale-why__list">
                {whyBestList.map((item, index) => (
                  <li key={index}>
                    <CheckCircle size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="wholesale-cta" ref={ctaRef}>
          <div className="container">
            <div className={`wholesale-cta__content ${ctaInView ? "animate-fadeInUp" : ""}`}>
              <h2>Ready to Start Saving on Wholesale Orders?</h2>
              <p>
                Join hundreds of successful businesses already partnering with A3Distributor. 
                Get your customized quote in under 5 minutes. No commitments, no pressure.
              </p>
              <div className="wholesale-cta__buttons">
                <button onClick={handleWhatsApp} className="btn btn-primary btn-large">
                  <MessageCircle size={20} />
                  Request Free Quote Now
                </button>
              </div>
              <p className="wholesale-cta__note">
                Questions? Call us at <a href={`tel:${siteConfig.phone}`}>{siteConfig.phoneDisplay}</a> 
                {" "}— We're available 24/7
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
