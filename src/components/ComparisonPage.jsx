import { useInView } from "react-intersection-observer";
import { Check, X, ArrowRight, Phone } from "lucide-react";
import SEO from "./SEO";
import { useSettingsSync } from "../hooks/useSettings";

const comparisonData = [
  {
    feature: "Pricing",
    a3: "5-20% cheaper with transparent volume discounts. No hidden fees or surprise charges.",
    competitor: "Standard market rates. Limited flexibility on pricing. Hidden delivery and handling charges.",
    a3Better: true,
  },
  {
    feature: "Product Range",
    a3: "500+ SKUs of water & beverages. All major Indian & international brands available immediately.",
    competitor: "Limited to 100-200 products. Often stock only select brands or categories.",
    a3Better: true,
  },
  {
    feature: "Delivery Time",
    a3: "Same-day or next-day delivery across Mumbai & surrounding regions. Emergency orders accepted.",
    competitor: "2-5 business days standard. Same-day delivery often not available or costs extra.",
    a3Better: true,
  },
  {
    feature: "Minimum Order Quantity",
    a3: "No strict minimums. Flexible ordering from 50 units to container loads. Small businesses welcome.",
    competitor: "High minimums (200-500 units). Small orders rejected or charged premium rates.",
    a3Better: true,
  },
  {
    feature: "Customer Support",
    a3: "Dedicated local account manager. Phone support in Hindi & English. Instant WhatsApp response.",
    competitor: "General customer service. Limited availability. Email-only support common.",
    a3Better: true,
  },
  {
    feature: "Quality Assurance",
    a3: "100% authentic products. Direct from authorized manufacturers. Full quality guarantee.",
    competitor: "Quality varies. May source from multiple channels. Limited warranty coverage.",
    a3Better: true,
  },
  {
    feature: "Payment Terms",
    a3: "Flexible payment options. Credit terms for verified businesses. GST invoicing included.",
    competitor: "Strict payment on delivery. Limited credit options. GST billing may not be available.",
    a3Better: true,
  },
  {
    feature: "Returns & Refunds",
    a3: "Easy local returns. Same-day replacement for damaged goods. Money-back guarantee.",
    competitor: "Complex return process. Refunds take 7-15 days. Restocking fees may apply.",
    a3Better: true,
  },
];

function ComparisonRow({ feature, a3, competitor, a3Better }) {
  return (
    <tr>
      <td className="comparison-table__feature">{feature}</td>
      <td className="comparison-table__cell comparison-table__cell--a3">
        <div className="comparison-table__content">
          <Check className="comparison-table__icon comparison-table__icon--check" size={20} />
          <span>{a3}</span>
        </div>
      </td>
      <td className="comparison-table__cell comparison-table__cell--competitor">
        <div className="comparison-table__content">
          <X className="comparison-table__icon comparison-table__icon--x" size={20} />
          <span>{competitor}</span>
        </div>
      </td>
    </tr>
  );
}

export default function ComparisonPage() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: tableRef, inView: tableInView } = useInView({ threshold: 0.05, triggerOnce: true });
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const siteConfig = useSettingsSync();

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Hi, I'd like to learn more about A3Distributor's services after comparing with other local distributors."
    );
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${message}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${siteConfig.phone}`;
  };

  return (
    <>
      <SEO 
        title="A3Distributor vs Other Local Distributors - Comparison"
        description="Compare A3Distributor with other local wholesale distributors. See why we offer better pricing, faster delivery, wider product selection, and superior customer support for water and beverage distribution."
        keywords="A3 comparison, wholesale distributor comparison, best local distributor, beverage wholesale India, water distributor Mumbai comparison, distributor vs distributor"
      />
      
      <main className="comparison-page">
        {/* Hero Section */}
        <section className="comparison-hero" ref={heroRef}>
          <div className="container">
            <div className={`comparison-hero__content ${heroInView ? "animate-fadeInUp" : ""}`}>
              <span className="section-label">Smart Sourcing Comparison</span>
              <h1 className="comparison-hero__title">
                A3Distributor vs Other Local Distributors
              </h1>
              <div className="mandala-divider" />
              <p className="comparison-hero__subtitle">
                Why thousands of Indian businesses choose A3Distributor over other local suppliers 
                for reliable, cost-effective wholesale water & beverage distribution.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="comparison-section" ref={tableRef}>
          <div className="container">
            <div className={`comparison-intro ${tableInView ? "animate-fadeInUp" : ""}`}>
              <h2>Feature-by-Feature Breakdown</h2>
              <p>
                We understand you have options. Here's an honest comparison to help you make the best 
                decision for your business needs.
              </p>
            </div>

            <div className={`comparison-table-wrapper ${tableInView ? "animate-fadeInUp" : ""}`}>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th className="comparison-table__header">Feature</th>
                    <th className="comparison-table__header comparison-table__header--a3">
                      A3Distributor
                      <span className="comparison-table__badge">Recommended</span>
                    </th>
                    <th className="comparison-table__header">Other Local Distributors</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, index) => (
                    <ComparisonRow key={index} {...item} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Comparison Cards */}
            <div className="comparison-mobile">
              {comparisonData.map((item, index) => (
                <div key={index} className="comparison-mobile-card">
                  <h3 className="comparison-mobile-card__title">{item.feature}</h3>
                  <div className="comparison-mobile-card__row comparison-mobile-card__row--a3">
                    <div className="comparison-mobile-card__label">
                      <Check size={16} />
                      <strong>A3Distributor</strong>
                    </div>
                    <p>{item.a3}</p>
                  </div>
                  <div className="comparison-mobile-card__row">
                    <div className="comparison-mobile-card__label">
                      <X size={16} />
                      <strong>Other Local Distributors</strong>
                    </div>
                    <p>{item.competitor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="comparison-cta" ref={ctaRef}>
          <div className="container">
            <div className={`comparison-cta__content ${ctaInView ? "animate-fadeInUp" : ""}`}>
              <h2>Ready to Experience Better Wholesale?</h2>
              <p>
                Join hundreds of satisfied businesses already saving time and money with A3Distributor. 
                No long-term commitments. No hidden fees. Just honest, reliable service.
              </p>
              <div className="comparison-cta__buttons">
                <button onClick={handleWhatsApp} className="btn btn-primary">
                  Get Free Quote
                  <ArrowRight size={18} />
                </button>
                <button onClick={handleCall} className="btn btn-secondary">
                  <Phone size={18} />
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
