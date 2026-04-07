import { Link } from 'react-router-dom';
import { 
  Target, Zap, ShieldCheck, Handshake, 
  Droplets, GlassWater, Battery, Apple,
  MapPin, Phone, Mail, MessageCircle,
  Users, Truck, Clock, Award, Check
} from 'lucide-react';
import SEO from './SEO';
import '../styles/about.css';

const stats = [
  { value: '500+', label: 'Happy Clients', icon: Users },
  { value: '98%', label: 'On-Time Delivery', icon: Truck },
  { value: 'Same Day', label: 'Delivery Available', icon: Clock },
  { value: '5+', label: 'Years Experience', icon: Award },
];

const values = [
  {
    icon: Target,
    title: 'Reliability',
    description: 'When you place an order with A3Distributor, you can count on it arriving on time, every time. Our track record speaks for itself—over 98% on-time delivery rate across all orders.',
    color: 'blue',
  },
  {
    icon: Zap,
    title: 'Speed',
    description: 'Same-day delivery for orders placed before 2 PM. Our strategic warehouse locations across Mumbai ensure quick turnaround times for all your urgent requirements.',
    color: 'amber',
  },
  {
    icon: ShieldCheck,
    title: 'Quality',
    description: 'Every product we distribute is sourced directly from authorized channels. We maintain strict quality control with temperature monitoring and regular inventory rotation.',
    color: 'emerald',
  },
  {
    icon: Handshake,
    title: 'Transparency',
    description: 'Clear pricing with no hidden charges. We communicate proactively about order status and suggest alternatives if any product is unavailable.',
    color: 'violet',
  },
];

const products = [
  {
    icon: Droplets,
    title: 'Packaged Drinking Water',
    description: 'From 500ml bottles to 20-litre jars from Bisleri, Kinley, Aquafina, and Bailey with competitive bulk pricing.',
  },
  {
    icon: GlassWater,
    title: 'Soft Drinks',
    description: 'Complete range from Coca-Cola and PepsiCo families including Sprite, Fanta, 7Up, Mountain Dew, and Thums Up.',
  },
  {
    icon: Battery,
    title: 'Energy Drinks',
    description: 'Popular brands including Red Bull, Monster Energy, and Sting—perfect for convenience stores and gyms.',
  },
  {
    icon: Apple,
    title: 'Juices & Fruit Drinks',
    description: 'Maaza, Slice, Frooti, Real Fruit Power, and Tropicana for health-conscious consumers.',
  },
];

const areas = [
  {
    name: 'Mumbai',
    description: 'Complete coverage across South Mumbai, Central Mumbai, Western & Eastern Suburbs. From Colaba to Dahisar, Chembur to Andheri.',
  },
  {
    name: 'Thane',
    description: 'Thane West, East, Ghodbunder Road, Majiwada, Wagle Estate, Kalwa, Dombivli, Kalyan, and Ulhasnagar.',
  },
  {
    name: 'Navi Mumbai',
    description: 'Vashi, Nerul, Belapur, Kharghar, Panvel, Airoli, Ghansoli, and Sanpada across all CIDCO nodes.',
  },
];

const whyChoose = [
  '500+ Happy Clients trust us for their beverage supply',
  'Same-Day Delivery for orders placed before 2 PM',
  'Volume-based discounts from 5% to 20% on bulk orders',
  'No minimum order hassles—we accommodate all sizes',
  'Flexible payment terms for regular customers',
  '100% authentic products from authorized channels',
  'Dedicated account management for large customers',
  'Easy ordering via WhatsApp, phone, or website',
];

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About A3Distributor',
    description: 'Learn about A3Distributor - Mumbai\'s trusted wholesale water and beverage distributor serving 500+ clients across Mumbai, Thane, and Navi Mumbai.',
    url: 'https://a3distributor.com/about',
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://a3distributor.com/#organization',
      name: 'A3Distributor',
      description: 'Wholesale water and beverage distributor in Mumbai, India',
      foundingLocation: {
        '@type': 'Place',
        name: 'Mumbai, Maharashtra, India',
      },
      areaServed: [
        { '@type': 'City', name: 'Mumbai' },
        { '@type': 'City', name: 'Thane' },
        { '@type': 'City', name: 'Navi Mumbai' },
      ],
      knowsAbout: [
        'Packaged Drinking Water Distribution',
        'Soft Drinks Wholesale',
        'Energy Drinks Distribution',
        'Juice Distribution',
        'FMCG Distribution',
      ],
    },
  };

  return (
    <>
      <SEO
        title="About Us"
        description="A3Distributor is Mumbai's trusted wholesale water and beverage distributor. From a small start to serving 500+ clients across Mumbai, Thane, and Navi Mumbai."
        keywords="about A3Distributor, Mumbai water distributor, wholesale beverage supplier Mumbai, FMCG distributor Mumbai"
        canonicalUrl="https://a3distributor.com/about"
        extraSchemas={[aboutSchema]}
      />

      <main className="about-page-v2">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero__bg" />
          <div className="container about-hero__content">
            <span className="about-hero__badge">Est. Mumbai</span>
            <h1 className="about-hero__title">
              Mumbai&apos;s Trusted Partner for<br />
              <span className="about-hero__highlight">Water &amp; Beverage Distribution</span>
            </h1>
            <p className="about-hero__subtitle">
              From a small family operation to serving 500+ businesses across the Mumbai Metropolitan Region with quality beverages and same-day delivery.
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="about-stats">
          <div className="container">
            <div className="about-stats__grid">
              {stats.map((stat) => (
                <div key={stat.label} className="about-stat">
                  <stat.icon className="about-stat__icon" size={28} strokeWidth={1.5} />
                  <div className="about-stat__value">{stat.value}</div>
                  <div className="about-stat__label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="about-story">
          <div className="container">
            <div className="about-story__grid">
              <div className="about-story__content">
                <h2 className="section-title">Our Story</h2>
                <p className="about-story__lead">
                  A3Distributor began as a small, family-run distribution operation in Mumbai with a simple mission: to ensure that businesses across the city have reliable access to quality packaged water and beverages.
                </p>
                <p>
                  What started from a single warehouse in Chembur has grown into a comprehensive distribution network serving over 500 satisfied clients across Mumbai, Thane, and Navi Mumbai. Our journey has been driven by a commitment to service excellence.
                </p>
                <p>
                  Over the years, we have built strong partnerships with leading beverage manufacturers and brands. These relationships allow us to offer authentic products at competitive wholesale prices while ensuring consistent supply even during peak demand seasons.
                </p>
              </div>
              <div className="about-story__image">
                <div className="about-story__image-card">
                  <img 
                    src="/imgs/hero-bg.webp" 
                    alt="A3Distributor warehouse operations" 
                    loading="lazy"
                  />
                  <div className="about-story__image-overlay">
                    <span>Serving Mumbai Since Day One</span>
                  </div>
                </div>
                <p className="about-story__image-prompt" style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.85rem', 
                  color: '#64748b',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  💡 <strong>Admin Note:</strong> Replace this image with warehouse operations or team photo at /imgs/about-story.webp
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="about-mission-vision">
          <div className="container">
            <div className="mission-vision__grid">
              <div className="mission-card">
                <div className="mission-card__icon">
                  <Target size={32} strokeWidth={1.5} />
                </div>
                <h3>Our Mission</h3>
                <p>
                  To be the most reliable and affordable water and beverage supply partner for businesses in Mumbai and the Mumbai Metropolitan Region. Every business deserves access to quality beverages at fair prices with dependable delivery.
                </p>
              </div>
              <div className="mission-card mission-card--vision">
                <div className="mission-card__icon">
                  <Award size={32} strokeWidth={1.5} />
                </div>
                <h3>Our Vision</h3>
                <p>
                  To become Mumbai&apos;s most trusted FMCG distributor by 2030, combining the efficiency of modern logistics with the personal touch of traditional business relationships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values-section">
          <div className="container">
            <h2 className="section-title section-title--center">Our Values</h2>
            <p className="section-subtitle">The principles that guide everything we do</p>
            <div className="values-grid">
              {values.map((value) => (
                <div key={value.title} className={`value-card value-card--${value.color}`}>
                  <div className="value-card__icon">
                    <value.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="value-card__title">{value.title}</h3>
                  <p className="value-card__desc">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="about-products-section">
          <div className="container">
            <h2 className="section-title section-title--center">What We Distribute</h2>
            <p className="section-subtitle">A comprehensive range of beverages for all business needs</p>
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.title} className="product-card">
                  <div className="product-card__icon">
                    <product.icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="product-card__title">{product.title}</h3>
                  <p className="product-card__desc">{product.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Area */}
        <section className="about-coverage-section">
          <div className="container">
            <h2 className="section-title section-title--center">Areas We Cover</h2>
            <p className="section-subtitle">Reliable delivery across the Mumbai Metropolitan Region</p>
            <div className="coverage-grid">
              {areas.map((area) => (
                <div key={area.name} className="coverage-card">
                  <MapPin className="coverage-card__icon" size={24} strokeWidth={1.5} />
                  <h3 className="coverage-card__title">{area.name}</h3>
                  <p className="coverage-card__desc">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="about-why-section">
          <div className="container">
            <div className="why-content">
              <h2 className="section-title">Why Choose A3Distributor?</h2>
              <ul className="why-list">
                {whyChoose.map((item, index) => (
                  <li key={index}>
                    <Check className="why-list__icon" size={20} strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta-section">
          <div className="container">
            <div className="cta-card">
              <div className="cta-card__content">
                <h2>Let&apos;s Work Together</h2>
                <p>
                  Whether you run a small retail shop, manage a corporate office, organize events, or operate a hotel or restaurant, A3Distributor is ready to be your reliable beverage supply partner.
                </p>
                <div className="cta-card__actions">
                  <a href="https://wa.me/917039414924" className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={20} />
                    WhatsApp Us
                  </a>
                  <Link to="/contact" className="btn btn-secondary btn-lg">
                    Contact Page
                  </Link>
                </div>
              </div>
              <div className="cta-card__info">
                <div className="cta-contact">
                  <Phone size={18} strokeWidth={1.5} />
                  <span>+91 7039414924</span>
                </div>
                <div className="cta-contact">
                  <Mail size={18} strokeWidth={1.5} />
                  <span>info@a3distributor.com</span>
                </div>
                <div className="cta-contact">
                  <MapPin size={18} strokeWidth={1.5} />
                  <span>Chembur, Mumbai 400088</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
