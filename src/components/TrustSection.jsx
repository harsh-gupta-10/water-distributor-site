import { useInView } from "react-intersection-observer";
import { Award, MapPin, Clock, Quote } from "lucide-react";


const stats = [
  { number: "10+", label: "Years of Experience" },
  { number: "500+", label: "Businesses Served" },
  { number: "50+", label: "Areas Covered" },
  { number: "98%", label: "On-Time Delivery" },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    business: "Kumar General Store",
    text: "AquaFlow has been our water and cold drink supplier for 3 years. Always on time, genuine products, and fair pricing. Highly recommended for any retailer.",
  },
  {
    name: "Priya Sharma",
    business: "Sharma Catering Services",
    text: "We order in bulk for events and weddings. Their same-day delivery service has saved us many times. Truly reliable and professional.",
  },
  {
    name: "Mohammed Ansari",
    business: "Blue Star Restaurant",
    text: "Consistent quality and regular supply. Their GST billing and professional approach makes them stand out from other distributors.",
  },
];

export default function TrustSection() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="about" className="trust" ref={ref}>
      {/* Subtle tricolor gradient bar */}
      <div className="trust__tricolor" />

      <div className="container">
        <div
          className={`section-header ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0 }}
        >
          <span className="section-label">About Us</span>
          <h2 className="section-title">
            Serving Local Businesses with Honesty &amp; Reliability
          </h2>
          <div className="mandala-divider" />
          <p className="section-subtitle">
            As a dedicated water and beverage distributor, we take pride in
            being the supply backbone for hundreds of local businesses. Our
            commitment is simple — quality products, fair prices, and dependable
            service.
          </p>
        </div>

        {/* Stats */}
        <div
          className={`trust__stats ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0, animationDelay: "0.2s" }}
        >
          {stats.map(({ number, label }) => (
            <div key={label} className="trust__stat">
              <span className="trust__stat-number">{number}</span>
              <span className="trust__stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Areas served */}
        <div
          className={`trust__areas ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0, animationDelay: "0.3s" }}
        >
          <div className="trust__areas-header">
            <MapPin size={20} />
            <h3>Areas We Serve</h3>
          </div>
          <div className="trust__areas-tags">
            {[
              "Main Market Area",
              "Industrial Zone",
              "Station Road",
              "Civil Lines",
              "University Area",
              "Nehru Nagar",
              "Gandhi Chowk",
              "Bus Stand Area",
              "Hospital Road",
              "Ring Road",
            ].map((area) => (
              <span key={area} className="trust__area-tag">
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div
          className={`trust__testimonials ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0, animationDelay: "0.4s" }}
        >
          <h3 className="trust__testimonials-title">
            <Award size={20} />
            Trusted by Local Business Owners
          </h3>
          <div className="trust__testimonials-grid">
            {testimonials.map(({ name, business, text }) => (
              <div key={name} className="trust__testimonial-card">
                <Quote size={24} className="trust__quote-icon" />
                <p className="trust__testimonial-text">{text}</p>
                <div className="trust__testimonial-author">
                  <div className="trust__testimonial-avatar">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <strong>{name}</strong>
                    <span>{business}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
