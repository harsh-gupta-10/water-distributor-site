import SEO from './SEO';
import '../styles/legal.css';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'April 2026';

  const privacySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy - A3Distributor',
    description: 'Privacy Policy for A3Distributor wholesale water and beverage distribution services in Mumbai, India.',
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
        description="Privacy Policy for A3Distributor - Learn how we collect, use, and protect your personal information when using our wholesale water and beverage distribution services."
        keywords="privacy policy, data protection, A3Distributor privacy, wholesale distributor privacy policy India"
        canonicalUrl="https://a3distributor.com/privacy-policy"
        extraSchemas={[privacySchema]}
      />

      <main className="legal-page">
        <div className="legal-container">
          <header className="legal-header">
            <h1>Privacy Policy</h1>
            <p className="legal-updated">Last Updated: {lastUpdated}</p>
          </header>

          <article className="legal-content">
            <section>
              <p>
                Welcome to A3Distributor ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at a3distributor.com, contact us via WhatsApp, phone, or email, or use our wholesale water and beverage distribution services.
              </p>
              <p>
                By accessing or using our services, you agree to the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services. We encourage you to review this policy periodically as we may update it from time to time.
              </p>
            </section>

            <section>
              <h2>1. Information We Collect</h2>
              <p>We collect information that you provide directly to us, as well as information collected automatically when you use our services.</p>
              
              <h3>1.1 Personal Information You Provide</h3>
              <p>When you interact with A3Distributor, we may collect the following types of personal information:</p>
              <ul>
                <li><strong>Contact Information:</strong> Name, email address, phone number, WhatsApp number, and business address</li>
                <li><strong>Business Information:</strong> Company name, GST number, business type, and designation</li>
                <li><strong>Order Information:</strong> Product preferences, order history, delivery addresses, and payment details</li>
                <li><strong>Communication Records:</strong> Messages sent via WhatsApp, email correspondence, phone call logs, and quotation requests</li>
                <li><strong>Feedback and Reviews:</strong> Customer testimonials, ratings, and feedback you choose to share</li>
              </ul>

              <h3>1.2 Information Collected Automatically</h3>
              <p>When you visit our website, we automatically collect certain information, including:</p>
              <ul>
                <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, and navigation paths</li>
                <li><strong>Location Data:</strong> Approximate geographic location based on IP address</li>
                <li><strong>Referral Information:</strong> The website or source that directed you to our site</li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li><strong>Service Delivery:</strong> To process and fulfill your orders, manage deliveries, and provide customer support</li>
                <li><strong>Communication:</strong> To respond to inquiries, send order confirmations, delivery updates, and quotations via WhatsApp, email, or phone</li>
                <li><strong>Business Operations:</strong> To generate invoices, maintain accounting records, and comply with tax regulations including GST</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve our website, products, and services</li>
                <li><strong>Marketing:</strong> To send promotional offers, new product announcements, and newsletters (with your consent)</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                <li><strong>Security:</strong> To detect, prevent, and address fraud, unauthorized access, and other illegal activities</li>
              </ul>
            </section>

            <section>
              <h2>3. Cookies and Tracking Technologies</h2>
              <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience and collect usage information.</p>
              
              <h3>3.1 Types of Cookies We Use</h3>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for the website to function properly, including session management and security features</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website through Google Analytics and similar tools</li>
                <li><strong>Advertising Cookies:</strong> Used to display relevant advertisements through Google AdSense and track ad performance</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences for a better user experience</li>
              </ul>

              <h3>3.2 Managing Cookies</h3>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to refuse or delete cookies. However, blocking essential cookies may affect the functionality of our website. For more information about managing cookies, visit your browser's help documentation.
              </p>
            </section>

            <section>
              <h2>4. WhatsApp Communication</h2>
              <p>
                We use WhatsApp Business as a primary communication channel for customer inquiries, order updates, and support. When you contact us via WhatsApp:
              </p>
              <ul>
                <li>Your phone number and WhatsApp profile information become visible to us</li>
                <li>Chat history is stored for customer service and record-keeping purposes</li>
                <li>We may send order confirmations, delivery updates, and promotional messages</li>
                <li>You can opt out of promotional messages at any time by messaging "STOP"</li>
              </ul>
              <p>
                WhatsApp communication is subject to WhatsApp's own privacy policy and terms of service. We recommend reviewing WhatsApp's privacy practices at their official website.
              </p>
            </section>

            <section>
              <h2>5. Third-Party Services and Links</h2>
              <p>Our website and services may contain links to third-party websites and integrate with external services:</p>
              <ul>
                <li><strong>Google Services:</strong> Google Analytics for website analytics, Google AdSense for advertising, and Google Tag Manager for tag management</li>
                <li><strong>Payment Processors:</strong> Third-party payment gateways for processing transactions</li>
                <li><strong>Social Media:</strong> Links to our social media profiles on Facebook, Instagram, and LinkedIn</li>
                <li><strong>Maps:</strong> Google Maps integration for location and delivery information</li>
              </ul>
              <p>
                These third-party services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of external websites or services.
              </p>
            </section>

            <section>
              <h2>6. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              <ul>
                <li><strong>Service Providers:</strong> With trusted partners who assist in delivering our services, such as delivery personnel, payment processors, and IT service providers</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of business assets</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property, and that of our customers and partners</li>
              </ul>
            </section>

            <section>
              <h2>7. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul>
                <li>Secure HTTPS encryption for all website communications</li>
                <li>Restricted access to personal information on a need-to-know basis</li>
                <li>Regular security assessments and updates</li>
                <li>Secure storage of business and payment records</li>
              </ul>
              <p>
                While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2>8. Your Rights</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at info@a3distributor.com. We will respond to your request within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2>9. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Business and transaction records are retained as per Indian tax and accounting regulations.
              </p>
            </section>

            <section>
              <h2>10. Children's Privacy</h2>
              <p>
                Our services are intended for businesses and individuals above 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2>11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website with a new "Last Updated" date. Your continued use of our services after such modifications constitutes your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2>12. Governing Law</h2>
              <p>
                This Privacy Policy is governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
              </p>
            </section>

            <section>
              <h2>13. Contact Us</h2>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <address>
                <strong>A3Distributor</strong><br />
                Off Din Quarry Rd, near Masjid, Panjarapole,<br />
                Chembur, Mumbai, Maharashtra 400088<br />
                India<br /><br />
                <strong>Email:</strong> info@a3distributor.com<br />
                <strong>Phone:</strong> +91 7039414924<br />
                <strong>WhatsApp:</strong> +91 7039414924
              </address>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
