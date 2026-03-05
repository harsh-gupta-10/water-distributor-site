import { useInView } from "react-intersection-observer";
import {
  ShieldCheck,
  BadgeDollarSign,
  Truck,
  MapPin,
  HeadphonesIcon,
  FileText,
} from "lucide-react";


const reasons = [
  {
    icon: ShieldCheck,
    title: "Authorized Distributor",
    description:
      "Official distribution partner for leading water and beverage brands in the region.",
  },
  {
    icon: BadgeDollarSign,
    title: "Best-in-Market Wholesale Pricing",
    description:
      "Up to 20% cheaper than competitors with transparent pricing and no hidden fees. Volume discounts starting at just 50 units.",
  },
  {
    icon: Truck,
    title: "On-Time Delivery",
    description:
      "Punctual delivery schedules you can rely on, every single time. Same-day delivery available for urgent orders.",
  },
  {
    icon: MapPin,
    title: "500+ Product SKUs Available",
    description:
      "One-stop wholesale solution covering all major water & beverage brands - from Bisleri to Coca-Cola, Pepsi to energy drinks.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description:
      "Responsive customer service team available to assist with all your needs. Personal account manager for bulk clients.",
  },
  {
    icon: FileText,
    title: "GST Billing Available",
    description:
      "Proper GST-compliant invoicing for all orders. Professional and transparent. Flexible payment terms for verified businesses.",
  },
];

export default function WhyChooseUs() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="why-us" className="why-us" ref={ref}>
      <div className="container">
        <div
          className={`section-header ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0 }}
        >
          <span className="section-label">Why Choose Us</span>
          <h2 className="section-title">Your Trusted Distribution Partner</h2>
          <div className="mandala-divider" />
          <p className="section-subtitle">
            We go beyond just delivery. Our commitment is to build lasting
            partnerships with every business we serve.
          </p>
        </div>

        <div className="why-us__grid">
          {reasons.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={`why-us__card ${inView ? "animate-fadeInUp" : ""}`}
              style={{
                opacity: inView ? 1 : 0,
                animationDelay: `${0.1 * index}s`,
              }}
            >
              <div className="why-us__card-icon">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="why-us__card-title">{title}</h3>
                <p className="why-us__card-desc">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
