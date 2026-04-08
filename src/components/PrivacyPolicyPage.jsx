import { useState, useEffect } from 'react';
import { ArrowUp, Lightbulb } from 'lucide-react';
import SEO from './SEO';
import '../styles/legal.css';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'April 2026';
  const [activeSection, setActiveSection] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const sections = [
    { id: 'information-collected', title: '1. Information We Collect' },
    { id: 'how-we-use', title: '2. How We Use Information' },
    { id: 'information-sharing', title: '3. Information Sharing' },
    { id: 'data-security', title: '4. Data Security' },
    { id: 'data-retention', title: '5. Data Retention' },
    { id: 'your-rights', title: '6. Your Rights' },
    { id: 'cookies', title: '7. Cookies and Tracking' },
    { id: 'third-party', title: '8. Third-Party Services' },
    { id: 'policy-changes', title: '9. Policy Changes' },
    { id: 'contact-info', title: '10. Contact Information' },
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

  const privacySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy - A3Distributor',
    description: 'Privacy Policy for A3Distributor wholesale water distribution - Learn how we collect, use, and protect your personal information in compliance with Indian privacy laws.',
    url: 'https://a3distributor.com/privacy-policy',
    inLanguage: 'en-IN',
    isPartOf: {
      '@id': 'https://a3distributor.com/#website',
    },
  };

  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for A3Distributor - Learn how we collect, use, and protect your personal information when using our wholesale beverage distribution services in Mumbai."
        keywords="privacy policy, data protection, A3Distributor privacy, personal information protection India"
        canonicalUrl="https://a3distributor.com/privacy-policy"
        extraSchemas={[privacySchema]}
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
              <h1>Privacy Policy</h1>
              <p className="tagline">
                Your privacy is our priority - transparent data practices you can trust
              </p>
              <div className="legal-updated">Last Updated: {lastUpdated}</div>
            </header>

            <article className="legal-content">
              <section>
                <p>
                  A3Distributor values your privacy and is committed to protecting your personal information. This Privacy Policy describes how we collect, use, store, and protect your information when you visit our website or use our services.
                </p>
                <div className="legal-highlight-box">
                  <Lightbulb className="legal-highlight-icon" size={24} />
                  <div className="legal-highlight-content">
                    <h4>Data Protection Commitment</h4>
                    <p>
                      This policy applies to information collected through our website (a3distributor.com), WhatsApp communications, phone calls, and all other interactions with A3Distributor. We comply with applicable Indian data protection laws and maintain industry-standard security practices.
                    </p>
                  </div>
                </div>
              </section>

              <section id="information-collected">
                <h2>1. Information We Collect</h2>
                <h3>1.1 Business Information</h3>
                <p>When you request quotes or place orders, we collect:</p>
                <ul>
                  <li>Business name, address, and contact information</li>
                  <li>Contact person name, phone number, and email address</li>
                  <li>Business type and size (for appropriate service delivery)</li>
                  <li>Delivery addresses and preferences</li>
                  <li>Purchase history and order patterns</li>
                </ul>
                
                <h3>1.2 Communication Data</h3>
                <p>We maintain records of:</p>
                <ul>
                  <li>WhatsApp messages, phone calls, and email communications</li>
                  <li>Order confirmations, delivery schedules, and service requests</li>
                  <li>Customer service interactions and feedback</li>
                  <li>Marketing preferences and communication consents</li>
                </ul>

                <h3>1.3 Website Usage Information</h3>
                <p>Our website may collect:</p>
                <ul>
                  <li>IP address, browser type, and device information</li>
                  <li>Pages visited, time spent, and navigation patterns</li>
                  <li>Form submissions and quotation requests</li>
                  <li>Cookie data for functionality and preferences (see Section 7)</li>
                </ul>

                <h3>1.4 Financial Information</h3>
                <p>For payment processing, we may collect:</p>
                <ul>
                  <li>Payment method preferences</li>
                  <li>Billing information for invoice generation</li>
                  <li>Transaction records for order fulfillment</li>
                </ul>
                <p><em>Note: We do not store credit card numbers or sensitive financial data on our servers.</em></p>
              </section>

              <section id="how-we-use">
                <h2>2. How We Use Your Information</h2>
                <h3>2.1 Service Delivery</h3>
                <p>We use your information to:</p>
                <ul>
                  <li>Process and fulfill your orders accurately</li>
                  <li>Coordinate delivery schedules and logistics</li>
                  <li>Provide customer support and resolve issues</li>
                  <li>Maintain accurate inventory and pricing for your business needs</li>
                </ul>

                <h3>2.2 Business Operations</h3>
                <p>Your information helps us:</p>
                <ul>
                  <li>Improve our services and product offerings</li>
                  <li>Analyze order patterns to optimize inventory</li>
                  <li>Manage accounts receivable and business relationships</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>

                <h3>2.3 Communication</h3>
                <p>We may use your contact information to:</p>
                <ul>
                  <li>Send order confirmations and delivery updates</li>
                  <li>Notify you of new products, promotions, or service changes</li>
                  <li>Request feedback to improve our services</li>
                  <li>Provide important business or policy updates</li>
                </ul>
                <p><em>You can opt out of marketing communications at any time.</em></p>
              </section>

              <section id="information-sharing">
                <h2>3. Information Sharing and Disclosure</h2>
                <h3>3.1 Third-Party Service Providers</h3>
                <p>We may share information with:</p>
                <ul>
                  <li><strong>Delivery Partners:</strong> To coordinate product delivery</li>
                  <li><strong>Payment Processors:</strong> For secure transaction processing</li>
                  <li><strong>Technology Providers:</strong> For website hosting and maintenance</li>
                  <li><strong>Communication Tools:</strong> WhatsApp Business and email services</li>
                </ul>
                <p>All third-party providers are contractually required to maintain data confidentiality.</p>

                <h3>3.2 Business Transfers</h3>
                <p>
                  In the event of a business merger, acquisition, or sale, customer information may be transferred as part of business assets, subject to the same privacy protections.
                </p>

                <h3>3.3 Legal Requirements</h3>
                <p>We may disclose information when required by:</p>
                <ul>
                  <li>Indian law enforcement or regulatory authorities</li>
                  <li>Court orders or legal proceedings</li>
                  <li>Protection of our rights, property, or safety</li>
                  <li>Investigation of fraud or security incidents</li>
                </ul>

                <h3>3.4 What We Don't Share</h3>
                <div className="legal-highlight-box">
                  <Lightbulb className="legal-highlight-icon" size={24} />
                  <div className="legal-highlight-content">
                    <h4>Never Shared</h4>
                    <p>
                      We never sell, rent, or trade your personal information to marketing companies, competitors, or unrelated third parties for their commercial purposes.
                    </p>
                  </div>
                </div>
              </section>

              <section id="data-security">
                <h2>4. Data Security</h2>
                <h3>4.1 Security Measures</h3>
                <p>We implement multiple layers of security:</p>
                <ul>
                  <li><strong>Technical Safeguards:</strong> SSL encryption, secure databases, regular security updates</li>
                  <li><strong>Access Controls:</strong> Role-based access, password policies, activity monitoring</li>
                  <li><strong>Physical Security:</strong> Secure facilities and controlled access to systems</li>
                  <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                </ul>

                <h3>4.2 Data Breach Response</h3>
                <p>
                  In the unlikely event of a data security incident, we will notify affected customers within 72 hours and take immediate steps to secure systems and prevent further unauthorized access.
                </p>

                <h3>4.3 Employee Training</h3>
                <p>
                  All employees receive privacy and security training and are bound by confidentiality agreements regarding customer information.
                </p>
              </section>

              <section id="data-retention">
                <h2>5. Data Retention</h2>
                <h3>5.1 Retention Periods</h3>
                <p>We retain information for:</p>
                <ul>
                  <li><strong>Active Customers:</strong> Throughout the business relationship plus 3 years</li>
                  <li><strong>Inactive Customers:</strong> Up to 7 years for business and tax compliance</li>
                  <li><strong>Website Visitors:</strong> Analytics data for 2 years, form data for 1 year</li>
                  <li><strong>Communication Records:</strong> 5 years for business continuity and dispute resolution</li>
                </ul>

                <h3>5.2 Data Deletion</h3>
                <p>
                  After retention periods expire, we securely delete or anonymize personal information. You can request earlier deletion subject to business and legal requirements.
                </p>
              </section>

              <section id="your-rights">
                <h2>6. Your Privacy Rights</h2>
                <h3>6.1 Access and Correction</h3>
                <p>You have the right to:</p>
                <ul>
                  <li>Access personal information we hold about you</li>
                  <li>Request corrections to inaccurate or outdated information</li>
                  <li>Update your communication preferences</li>
                  <li>Request a copy of your data in a portable format</li>
                </ul>

                <h3>6.2 Opt-Out Rights</h3>
                <p>You can:</p>
                <ul>
                  <li>Opt out of marketing communications (service communications will continue)</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Withdraw consent for optional data processing activities</li>
                </ul>

                <h3>6.3 How to Exercise Rights</h3>
                <p>
                  Contact us at contact.a3distributor@gmail.com or via WhatsApp at +91 70394 14924. We'll respond to requests within 15 business days.
                </p>
              </section>

              <section id="cookies">
                <h2>7. Cookies and Tracking Technologies</h2>
                <h3>7.1 Cookies We Use</h3>
                <p>Our website uses cookies for:</p>
                <ul>
                  <li><strong>Essential Functions:</strong> Site navigation, form submissions, security</li>
                  <li><strong>Performance:</strong> Analytics to understand site usage and improve user experience</li>
                  <li><strong>Preferences:</strong> Remember your language and regional settings</li>
                </ul>

                <h3>7.2 Cookie Management</h3>
                <p>
                  You can control cookies through your browser settings. Disabling essential cookies may affect website functionality. We don't use cookies for advertising or cross-site tracking.
                </p>

                <h3>7.3 Third-Party Analytics</h3>
                <p>
                  We may use Google Analytics or similar services to understand website usage. These tools collect anonymized data and are configured to respect user privacy preferences.
                </p>
              </section>

              <section id="third-party">
                <h2>8. Third-Party Services and Links</h2>
                <h3>8.1 External Links</h3>
                <p>
                  Our website may contain links to manufacturer websites, payment processors, or other business-relevant sites. We are not responsible for the privacy practices of external sites.
                </p>

                <h3>8.2 WhatsApp Business</h3>
                <p>
                  We use WhatsApp Business for customer communication. Your interactions are subject to WhatsApp's privacy policy in addition to ours.
                </p>

                <h3>8.3 Integration Partners</h3>
                <p>
                  We may integrate with business tools for inventory management, accounting, or customer relationship management. All integrations are configured to minimize data sharing and maintain security.
                </p>
              </section>

              <section id="policy-changes">
                <h2>9. Changes to This Privacy Policy</h2>
                <h3>9.1 Updates and Notifications</h3>
                <p>
                  We may update this Privacy Policy to reflect changes in our practices, technology, or legal requirements. Significant changes will be communicated via email or WhatsApp before taking effect.
                </p>

                <h3>9.2 Continued Use</h3>
                <p>
                  Your continued use of our services after policy updates constitutes acceptance of the revised terms. We encourage periodic review of this policy.
                </p>

                <h3>9.3 Version History</h3>
                <p>
                  Previous versions of this policy are available upon request for transparency and compliance purposes.
                </p>
              </section>

              <section id="contact-info">
                <h2>10. Contact Information</h2>
                <p>For privacy-related questions, concerns, or requests, contact us:</p>
                <address>
                  <strong>A3Distributor - Privacy Team</strong><br />
                  <strong>Email:</strong> contact.a3distributor@gmail.com<br />
                  <strong>WhatsApp:</strong> +91 70394 14924<br />
                  <strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM<br />
                  <strong>Address:</strong> Mumbai, Maharashtra, India
                </address>
                <div className="legal-highlight-box">
                  <Lightbulb className="legal-highlight-icon" size={24} />
                  <div className="legal-highlight-content">
                    <h4>Privacy Response Commitment</h4>
                    <p>
                      We take privacy inquiries seriously and will respond to your concerns within 15 business days. For urgent privacy matters, WhatsApp is our fastest communication channel.
                    </p>
                  </div>
                </div>

                <h3>10.1 Data Protection Officer</h3>
                <p>
                  For complex privacy matters or formal complaints, you may request to speak with our designated Data Protection Officer through the contact methods above.
                </p>
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
