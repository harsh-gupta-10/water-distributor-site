import { useInView } from "react-intersection-observer";

const partners = [
  { name: "Bisleri", color: "#0099CC" },
  { name: "Kinley", color: "#003399" },
  { name: "Aquafina", color: "#0066FF" },
  { name: "Coca-Cola", color: "#D32F2F" },
  { name: "Pepsi", color: "#1565C0" },
  { name: "Sprite", color: "#2E7D32" },
  { name: "Thums Up", color: "#B71C1C" },
  { name: "Fanta", color: "#E65100" },
  { name: "Maaza", color: "#F9A825" },
  { name: "Red Bull", color: "#D4AF37" },
  { name: "Frooti", color: "#8BC34A" },
  { name: "Tropicana", color: "#FF9800" },
];

// Import all logo images from the logos folder
const logoImages = import.meta.glob(
  "../assets/imgs/logos/*.{png,jpg,jpeg,svg,webp}",
  {
    eager: true,
  },
);

function getLogoImage(brandName) {
  const slug = brandName.toLowerCase().replace(/\s+/g, "-");
  const key = Object.keys(logoImages).find((k) => {
    const filename = k.split("/").pop().split(".")[0].toLowerCase();
    return filename === slug;
  });
  return key ? logoImages[key].default : null;
}

export default function Partners() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section className="partners" ref={ref}>
      <div className="container">
        <div
          className={`section-header ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0 }}
        >
          <span className="section-label">Trusted Brands</span>
          <h2 className="section-title">Authorized Distribution Partner Of</h2>
          <div className="mandala-divider" />
          <p className="section-subtitle">
            We are proud authorized distributors of India&apos;s leading water
            and beverage brands, ensuring genuine products at competitive
            prices.
          </p>
        </div>

        <div
          className={`partners__grid ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0, animationDelay: "0.2s" }}
        >
          {partners.map((partner) => {
            const logo = getLogoImage(partner.name);
            return (
              <div key={partner.name} className="partners__card">
                {logo ? (
                  <img
                    src={logo}
                    alt={partner.name}
                    className="partners__logo-img"
                  />
                ) : (
                  <span
                    className="partners__logo-text"
                    style={{ color: partner.color }}
                  >
                    {partner.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
