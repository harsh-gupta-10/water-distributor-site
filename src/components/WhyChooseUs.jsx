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
    title: "Competitive Wholesale Pricing",
    description:
      "Best-in-market wholesale rates for bulk and regular supply orders.",
  },
  {
    icon: Truck,
    title: "On-Time Delivery",
    description:
      "Punctual delivery schedules you can rely on, every single time.",
  },
  {
    icon: MapPin,
    title: "Local Area Coverage",
    description:
      "Wide distribution network covering your city and surrounding areas.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description:
      "Responsive customer service team available to assist with all your needs.",
  },
  {
    icon: FileText,
    title: "GST Billing Available",
    description:
      "Proper GST-compliant invoicing for all orders. Professional and transparent.",
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
