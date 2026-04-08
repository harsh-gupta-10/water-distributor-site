import { useState, useEffect } from 'react';
import { ArrowUp, Lightbulb } from 'lucide-react';
import SEO from './SEO';
import '../styles/legal.css';

export default function TermsPage() {
  const lastUpdated = 'April 2026';
  const [activeSection, setActiveSection] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const sections = [
    { id: 'definitions', title: '1. Definitions' },
    { id: 'acceptance', title: '2. Acceptance of Terms' },
    { id: 'services', title: '3. Our Services' },
    { id: 'ordering', title: '4. Ordering and Payment' },
    { id: 'delivery', title: '5. Delivery Terms' },
    { id: 'returns', title: '6. Returns and Refunds' },
    { id: 'liability', title: '7. Limitation of Liability' },
    { id: 'termination', title: '8. Termination' },
    { id: 'governing-law', title: '9. Governing Law' },
    { id: 'changes', title: '10. Changes to Terms' },
    { id: 'contact', title: '11. Contact Information' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const progress = (scrolled / (documentHeight - windowHeight)) * 100;
      
      // Update progress bar
      const progressBar = document.querySelector('.legal-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
      }

      // Show/hide back to top button
      setShowBackToTop(scrolled > 400);

      // Update active section
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const termsSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms and Conditions - A3Distributor',
    description: 'Terms and Conditions for A3Distributor wholesale water and beverage distribution services in Mumbai, India.',
    url: 'https://a3distributor.com/terms-and-conditions',
    inLanguage: 'en-IN',
    isPartOf: {
      '@id': 'https://a3distributor.com/#website',
    },
  };

  return (
    <>
      <SEO
        title="Terms and Conditions"
        description="Terms and Conditions for A3Distributor - Read our complete terms of service for wholesale water and beverage distribution, including order terms, payment, delivery, and refund policies."
        keywords="terms and conditions, terms of service, A3Distributor terms, wholesale distributor terms India"
        canonicalUrl="https://a3distributor.com/terms-and-conditions"
        extraSchemas={[termsSchema]}
      />

      <div className="legal-progress">
        <div className="legal-progress-bar"></div>
      </div>

      <main className="legal-page">
        <div className="legal-container">
          {/* Table of Contents */}
          <aside className="legal-toc">
            <div className="legal-toc-header">
              Table of Contents
            </div>
            <ul className="legal-toc-list">
              {sections.map((section) => (
                <li key={section.id} className="legal-toc-item">
                  <button
                    className={`legal-toc-link ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <div className="legal-content-wrapper">
            <header className="legal-header">
              <h1>Terms and Conditions</h1>
              <p className="tagline">
                Professional wholesale distribution services with transparent terms
              </p>
              <div className="legal-updated">Last Updated: {lastUpdated}</div>
            </header>

            <article className="legal-content">
              <section>
                <p>
                  Welcome to A3Distributor. These Terms and Conditions ("Terms") govern your use of our website at a3distributor.com and our wholesale water and beverage distribution services. By placing an order or using our services, you agree to be bound by these Terms.
                </p>
                <div className="legal-highlight-box">
                  <Lightbulb className="legal-highlight-icon" size={24} />
                  <div className="legal-highlight-content">
                    <h4>Important Notice</h4>
                    <p>
                      A3Distributor operates as a business-to-business (B2B) wholesale distributor of packaged drinking water, soft drinks, juices, and energy drinks in Mumbai and surrounding areas. Please read these Terms carefully before engaging with our services.
                    </p>
                  </div>
                </div>
              </section>

              <section id="definitions">
                <h2>1. Definitions</h2>
                <p>In these Terms and Conditions:</p>
                <ul>
                  <li><strong>"Company," "we," "us," or "our"</strong> refers to A3Distributor, a proprietorship firm registered in Mumbai, Maharashtra, India</li>
                  <li><strong>"Customer," "you," or "your"</strong> refers to any business entity, organization, or individual who purchases products or services from us</li>
                  <li><strong>"Products"</strong> refers to packaged drinking water, soft drinks, juices, energy drinks, and related beverage products we distribute</li>
                  <li><strong>"Services"</strong> refers to our wholesale distribution, delivery, and customer support services</li>
                  <li><strong>"Order"</strong> refers to a request to purchase products placed through our website, WhatsApp, phone, or other communication channels</li>
                  <li><strong>"Delivery Area"</strong> refers to Mumbai, Thane, Navi Mumbai, and other areas we service as indicated on our website</li>
                </ul>
              </section>

              <section id="acceptance">
                <h2>2. Acceptance of Terms</h2>
                <p>
                  By accessing our website, placing an order, or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these Terms, please do not use our services.
                </p>
                <h3>2.1 Business-to-Business Nature</h3>
                <p>
                  Our services are exclusively designed for businesses, organizations, and commercial entities. We do not provide services to individual consumers for personal use.
                </p>
                <h3>2.2 Capacity to Enter Agreement</h3>
                <p>
                  By placing an order, you represent that you have the legal authority to bind the organization or business entity on whose behalf you are acting.
                </p>
              </section>

              <section id="services">
                <h2>3. Our Services</h2>
                <h3>3.1 Product Distribution</h3>
                <p>We provide wholesale distribution services for:</p>
                <ul>
                  <li>Packaged drinking water (brands: Bisleri, Kinley, Aquafina, Bailey)</li>
                  <li>Soft drinks (Coca-Cola, Pepsi, Sprite, Fanta, and other carbonated beverages)</li>
                  <li>Fruit juices and beverages (Frooti, Maaza, Real, Tropicana)</li>
                  <li>Energy drinks (Red Bull, Monster, Sting, and similar products)</li>
                  <li>Other FMCG beverage products as available</li>
                </ul>
                <h3>3.2 Delivery Services</h3>
                <p>
                  We offer same-day delivery for orders placed before 2:00 PM, subject to product availability and delivery area coverage. Standard delivery is within 24-48 hours.
                </p>
                <h3>3.3 Customer Support</h3>
                <p>
                  Our customer support team is available Monday through Saturday from 9:00 AM to 6:00 PM to assist with orders, inquiries, and service issues.
                </p>
              </section>

              <section id="ordering">
                <h2>4. Ordering and Payment</h2>
                <h3>4.1 Order Placement</h3>
                <p>Orders can be placed through:</p>
                <ul>
                  <li>Our website contact form or quotation system</li>
                  <li>WhatsApp at +91 70394 14924</li>
                  <li>Phone calls to our customer service team</li>
                  <li>Email at contact.a3distributor@gmail.com</li>
                </ul>
                <h3>4.2 Order Confirmation</h3>
                <p>
                  All orders are subject to availability and confirmation by our team. We will confirm order details, pricing, and delivery schedule before processing payment.
                </p>
                <h3>4.3 Pricing and Payment Terms</h3>
                <p>
                  Prices are quoted based on current wholesale rates and are subject to change without notice. Payment terms are typically advance payment or cash on delivery, depending on the customer relationship and order value.
                </p>
                <h3>4.4 Minimum Order Requirements</h3>
                <p>
                  We maintain minimum order values for delivery services. Current minimum order requirements will be communicated during order placement.
                </p>
              </section>

              <section id="delivery">
                <h2>5. Delivery Terms</h2>
                <h3>5.1 Delivery Areas</h3>
                <p>
                  We deliver to Mumbai, Thane, Navi Mumbai, and select areas. Delivery availability and charges may vary by location.
                </p>
                <h3>5.2 Delivery Timeframes</h3>
                <p>
                  Same-day delivery is available for orders confirmed before 2:00 PM, subject to product availability and delivery schedule. Standard delivery is within 24-48 hours of order confirmation.
                </p>
                <h3>5.3 Delivery Charges</h3>
                <p>
                  Delivery charges, if applicable, will be communicated during order confirmation and depend on order value, delivery location, and urgency.
                </p>
                <h3>5.4 Failed Deliveries</h3>
                <p>
                  If delivery cannot be completed due to incorrect address, unavailability of recipient, or access issues, additional charges may apply for re-delivery attempts.
                </p>
              </section>

              <section id="returns">
                <h2>6. Returns and Refunds</h2>
                <h3>6.1 Product Quality</h3>
                <p>
                  We guarantee the quality and authenticity of all products. Any quality issues must be reported within 24 hours of delivery.
                </p>
                <h3>6.2 Returns Policy</h3>
                <p>
                  Returns are accepted for damaged products, incorrect items delivered, or quality issues. Returned products must be in original packaging and condition.
                </p>
                <h3>6.3 Refund Process</h3>
                <p>
                  Refunds for returned products will be processed within 7-10 business days through the original payment method or bank transfer.
                </p>
                <h3>6.4 Non-Returnable Items</h3>
                <p>
                  Certain products may not be returnable due to hygiene and safety reasons, as governed by FSSAI regulations and manufacturer policies.
                </p>
              </section>

              <section id="liability">
                <h2>7. Limitation of Liability</h2>
                <p>
                  A3Distributor's liability is limited to the value of products purchased. We are not liable for indirect, consequential, or punitive damages arising from product use or service issues.
                </p>
                <h3>7.1 Product Liability</h3>
                <p>
                  Product liability claims should be directed to the respective manufacturers. We act as distributors and are not responsible for product defects beyond our distribution and storage practices.
                </p>
                <h3>7.2 Service Interruptions</h3>
                <p>
                  We are not liable for delivery delays due to weather conditions, traffic situations, government restrictions, or other circumstances beyond our reasonable control.
                </p>
              </section>

              <section id="termination">
                <h2>8. Termination</h2>
                <p>
                  Either party may terminate the business relationship with reasonable notice. Outstanding orders and payments will be honored according to agreed terms.
                </p>
                <h3>8.1 Immediate Termination</h3>
                <p>
                  We reserve the right to immediately terminate services for payment defaults, breach of terms, or fraudulent activities.
                </p>
              </section>

              <section id="governing-law">
                <h2>9. Governing Law</h2>
                <p>
                  These Terms and Conditions are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in Mumbai, Maharashtra.
                </p>
                <h3>9.1 Dispute Resolution</h3>
                <p>
                  We encourage resolution of disputes through direct communication. If formal resolution is required, Mumbai courts will have exclusive jurisdiction.
                </p>
              </section>

              <section id="changes">
                <h2>10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms and Conditions at any time. Updated terms will be posted on our website with the revision date.
                </p>
                <h3>10.1 Notification of Changes</h3>
                <p>
                  Significant changes to terms will be communicated to existing customers via email or WhatsApp before the effective date.
                </p>
              </section>

              <section id="contact">
                <h2>11. Contact Information</h2>
                <p>For questions about these Terms and Conditions, please contact us:</p>
                <address>
                  <strong>A3Distributor</strong><br />
                  <strong>WhatsApp:</strong> +91 70394 14924<br />
                  <strong>Email:</strong> contact.a3distributor@gmail.com<br />
                  <strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM<br />
                  <strong>Service Areas:</strong> Mumbai, Thane, Navi Mumbai
                </address>
                
                <div className="legal-highlight-box">
                  <Lightbulb className="legal-highlight-icon" size={24} />
                  <div className="legal-highlight-content">
                    <h4>Quick Resolution</h4>
                    <p>
                      For immediate assistance or urgent matters, WhatsApp is our preferred communication method. Most inquiries are resolved within a few hours during business hours.
                    </p>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>

        <button 
          className={`legal-back-to-top ${showBackToTop ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp size={24} />
        </button>
      </main>
    </>
  );
}
