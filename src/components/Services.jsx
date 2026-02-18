import { useInView } from "react-intersection-observer";
import {
  Droplets,
  Store,
  Building2,
  PartyPopper,
  UtensilsCrossed,
  Clock,
} from "lucide-react";


const services = [
  {
    icon: Droplets,
    title: "Bulk Water Supply",
    description:
      "Large-scale packaged drinking water supply for businesses, institutions, and events. All major brands available.",
  },
  {
    icon: Store,
    title: "Retail Shop Supply",
    description:
      "Regular stock replenishment for retail shops and kirana stores. Consistent supply chain you can count on.",
  },
  {
    icon: Building2,
    title: "Office & Corporate Supply",
    description:
      "Scheduled delivery of water and beverages for offices, co-working spaces, and corporate premises.",
  },
  {
    icon: PartyPopper,
    title: "Event & Party Supply",
    description:
      "Bulk beverage supply for weddings, parties, conferences, and large-scale events. Flexible quantities.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant & Hotel Supply",
    description:
      "Reliable daily supply for restaurants, hotels, dhabas, and catering businesses at wholesale rates.",
  },
  {
    icon: Clock,
    title: "Emergency / Same-Day Delivery",
    description:
      "Urgent requirement? We offer same-day delivery for emergency orders within our service area.",
  },
];

export default function Services() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="services" className="services" ref={ref}>
      <div className="container">
        <div
          className={`section-header ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0 }}
        >
          <span className="section-label">Our Services</span>
          <h2 className="section-title">What We Offer</h2>
          <div className="mandala-divider" />
          <p className="section-subtitle">
            From daily retail supply to large event orders, we provide
            comprehensive beverage distribution services tailored to your needs.
          </p>
        </div>

        <div className="services__grid">
          {services.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={`services__card ${inView ? "animate-fadeInUp" : ""}`}
              style={{
                opacity: inView ? 1 : 0,
                animationDelay: `${0.1 * index}s`,
              }}
            >
              <div className="services__icon">
                <Icon size={28} />
              </div>
              <h3 className="services__title">{title}</h3>
              <p className="services__description">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
