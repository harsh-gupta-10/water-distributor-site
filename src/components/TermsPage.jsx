import SEO from './SEO';
import '../styles/legal.css';

export default function TermsPage() {
  const lastUpdated = 'April 2026';

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

      <main className="legal-page">
        <div className="legal-container">
          <header className="legal-header">
            <h1>Terms and Conditions</h1>
            <p className="legal-updated">Last Updated: {lastUpdated}</p>
          </header>

          <article className="legal-content">
            <section>
              <p>
                Welcome to A3Distributor. These Terms and Conditions ("Terms") govern your use of our website at a3distributor.com and our wholesale water and beverage distribution services. By placing an order or using our services, you agree to be bound by these Terms.
              </p>
              <p>
                A3Distributor operates as a business-to-business (B2B) wholesale distributor of packaged drinking water, soft drinks, juices, and energy drinks in Mumbai and surrounding areas. Please read these Terms carefully before engaging with our services.
              </p>
            </section>

            <section>
              <h2>1. Definitions</h2>
              <p>In these Terms and Conditions:</p>
              <ul>
                <li><strong>"Company," "we," "us," or "our"</strong> refers to A3Distributor, a proprietorship firm registered in Mumbai, Maharashtra, India</li>
                <li><strong>"Customer," "you," or "your"</strong> refers to any individual, business, or entity that places orders or uses our services</li>
                <li><strong>"Products"</strong> refers to packaged drinking water, soft drinks, juices, energy drinks, and other beverages we distribute</li>
                <li><strong>"Services"</strong> refers to our wholesale distribution, delivery, and related services</li>
                <li><strong>"Order"</strong> refers to a request for Products placed by the Customer</li>
              </ul>
            </section>

            <section>
              <h2>2. Eligibility and Account</h2>
              <p>Our services are primarily designed for business customers, including but not limited to:</p>
              <ul>
                <li>Retail shops and kiranas</li>
                <li>Offices and corporate establishments</li>
                <li>Hotels, restaurants, and cafes</li>
                <li>Event organizers and caterers</li>
                <li>Institutions and educational establishments</li>
                <li>Other wholesale and retail businesses</li>
              </ul>
              <p>
                By placing an order, you represent that you are at least 18 years of age and have the legal authority to enter into binding contracts. If ordering on behalf of a business, you represent that you have the authority to bind that business to these Terms.
              </p>
            </section>

            <section>
              <h2>3. Orders and Acceptance</h2>
              
              <h3>3.1 Placing Orders</h3>
              <p>Orders may be placed through the following channels:</p>
              <ul>
                <li>WhatsApp at +91 7039414924</li>
                <li>Phone call at +91 7039414924</li>
                <li>Email at info@a3distributor.com</li>
                <li>Website quotation form at a3distributor.com</li>
              </ul>

              <h3>3.2 Order Confirmation</h3>
              <p>
                All orders are subject to acceptance by A3Distributor. An order is considered confirmed only when we provide written or verbal confirmation, typically via WhatsApp or phone call. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, pricing errors, or suspected fraudulent activity.
              </p>

              <h3>3.3 Minimum Order Requirements</h3>
              <p>
                While we strive to accommodate orders of all sizes, certain products may have minimum order quantities. We will inform you of any minimum requirements at the time of order placement. Bulk discounts are available for larger orders as per our tiered pricing structure.
              </p>

              <h3>3.4 Order Modifications and Cancellations</h3>
              <p>
                Order modifications or cancellations must be communicated before dispatch. Once products have been dispatched, modifications or cancellations may not be possible. We will make reasonable efforts to accommodate last-minute changes, but cannot guarantee acceptance.
              </p>
            </section>

            <section>
              <h2>4. Pricing and Payment</h2>

              <h3>4.1 Pricing</h3>
              <p>
                All prices are quoted in Indian Rupees (INR) and are subject to change without prior notice. Prices do not include delivery charges unless explicitly stated. We offer volume-based discounts for bulk orders, typically ranging from 5% to 20% depending on order quantity.
              </p>

              <h3>4.2 Taxes</h3>
              <p>
                All prices are exclusive of applicable taxes, including Goods and Services Tax (GST), unless otherwise stated. GST will be charged as per prevailing rates and applicable laws. We are a GST-registered business and will provide valid GST invoices for all transactions.
              </p>

              <h3>4.3 Payment Terms</h3>
              <p>Payment terms vary based on customer relationship and order type:</p>
              <ul>
                <li><strong>New Customers:</strong> Full advance payment or cash on delivery (COD) for initial orders</li>
                <li><strong>Regular Customers:</strong> Credit terms may be extended based on payment history and business relationship</li>
                <li><strong>Large Orders:</strong> Partial advance payment may be required</li>
              </ul>

              <h3>4.4 Payment Methods</h3>
              <p>We accept the following payment methods:</p>
              <ul>
                <li>Cash on Delivery (COD)</li>
                <li>Bank Transfer (NEFT/RTGS/IMPS)</li>
                <li>UPI payments</li>
                <li>Cheque (for verified business customers)</li>
              </ul>

              <h3>4.5 Late Payment</h3>
              <p>
                For credit customers, payment is due within the agreed credit period. Late payments may result in suspension of credit facilities, additional charges, and/or legal action to recover outstanding amounts.
              </p>
            </section>

            <section>
              <h2>5. Delivery</h2>

              <h3>5.1 Delivery Areas</h3>
              <p>We currently provide delivery services in:</p>
              <ul>
                <li>Mumbai and all suburbs</li>
                <li>Navi Mumbai</li>
                <li>Thane</li>
                <li>Selected areas in MMR (Mumbai Metropolitan Region)</li>
              </ul>

              <h3>5.2 Delivery Schedule</h3>
              <p>
                We offer same-day delivery for orders placed before 2:00 PM (subject to availability and location). Delivery times are estimates and may vary based on traffic conditions, weather, and other factors beyond our control.
              </p>

              <h3>5.3 Delivery Charges</h3>
              <p>
                Free delivery is available for orders above a certain threshold (typically ₹10,000). Delivery charges for smaller orders or remote locations will be communicated at the time of order confirmation.
              </p>

              <h3>5.4 Receiving Delivery</h3>
              <p>
                The Customer or an authorized representative must be present at the delivery address to receive the order. Upon delivery, the Customer should inspect the products and sign the delivery receipt. Any visible damage or discrepancy must be noted on the delivery receipt immediately.
              </p>

              <h3>5.5 Failed Delivery</h3>
              <p>
                If delivery cannot be completed due to customer unavailability, incorrect address, or refusal to accept, additional delivery charges may apply for redelivery. Multiple failed delivery attempts may result in order cancellation.
              </p>
            </section>

            <section>
              <h2>6. Product Quality and Returns</h2>

              <h3>6.1 Product Quality</h3>
              <p>
                All products supplied by A3Distributor are sourced directly from authorized manufacturers and distributors. We guarantee that all products are genuine, properly stored, and within their expiration dates at the time of delivery.
              </p>

              <h3>6.2 Inspection</h3>
              <p>
                Customers must inspect products upon delivery. Any claims regarding quantity discrepancies or visible damage must be raised immediately at the time of delivery and noted on the delivery receipt.
              </p>

              <h3>6.3 Returns and Replacements</h3>
              <p>We accept returns and provide replacements in the following cases:</p>
              <ul>
                <li>Products delivered are different from what was ordered</li>
                <li>Products are damaged during transit (reported at delivery)</li>
                <li>Products are expired or near expiry (less than 30 days to expiration)</li>
                <li>Manufacturing defects</li>
              </ul>
              <p>
                Return requests must be made within 24 hours of delivery. Products must be in original, unopened condition with packaging intact. Perishable items and opened products cannot be returned except in cases of quality defects.
              </p>

              <h3>6.4 Refunds</h3>
              <p>
                Refunds, where applicable, will be processed within 7-10 business days after inspection and approval of returned products. Refunds will be issued through the original payment method or as credit for future orders, at the Customer's preference.
              </p>
            </section>

            <section>
              <h2>7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law:
              </p>
              <ul>
                <li>A3Distributor shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our products or services</li>
                <li>Our total liability for any claim arising from an order shall not exceed the value of that specific order</li>
                <li>We are not responsible for damages arising from improper storage or handling of products after delivery</li>
                <li>We are not liable for delays or failures in delivery caused by force majeure events, including but not limited to natural disasters, strikes, riots, government actions, or pandemic-related restrictions</li>
              </ul>
            </section>

            <section>
              <h2>8. Intellectual Property</h2>
              <p>
                All content on our website, including but not limited to text, graphics, logos, images, and software, is the property of A3Distributor or its content suppliers and is protected by Indian and international copyright laws.
              </p>
              <p>
                Product names, brand names, and trademarks displayed on our website belong to their respective owners. A3Distributor is an authorized distributor and does not claim ownership of these trademarks.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative works from any content on our website without prior written permission.
              </p>
            </section>

            <section>
              <h2>9. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless A3Distributor, its owners, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from:
              </p>
              <ul>
                <li>Your breach of these Terms</li>
                <li>Your violation of any applicable laws or regulations</li>
                <li>Your misuse of products supplied by us</li>
                <li>Any dispute between you and your customers regarding products purchased from us</li>
              </ul>
            </section>

            <section>
              <h2>10. Force Majeure</h2>
              <p>
                A3Distributor shall not be liable for any failure or delay in performing our obligations due to circumstances beyond our reasonable control, including but not limited to natural disasters, epidemics, war, terrorism, riots, government actions, strikes, supply chain disruptions, or transportation failures.
              </p>
            </section>

            <section>
              <h2>11. Dispute Resolution</h2>
              <p>
                Any dispute arising from these Terms or our services shall first be attempted to be resolved through good-faith negotiations between the parties. If the dispute cannot be resolved amicably within 30 days, it shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996.
              </p>
              <p>
                The arbitration shall be conducted in Mumbai, Maharashtra, by a sole arbitrator mutually appointed by the parties. The language of arbitration shall be English. The arbitrator's decision shall be final and binding on both parties.
              </p>
            </section>

            <section>
              <h2>12. Governing Law and Jurisdiction</h2>
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of India, including but not limited to the Indian Contract Act, 1872, the Sale of Goods Act, 1930, and the Consumer Protection Act, 2019.
              </p>
              <p>
                Subject to the arbitration clause above, the courts of Mumbai, Maharashtra, India, shall have exclusive jurisdiction over any disputes arising from these Terms.
              </p>
            </section>

            <section>
              <h2>13. Modifications to Terms</h2>
              <p>
                A3Distributor reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after any modifications constitutes acceptance of the updated Terms.
              </p>
              <p>
                We encourage you to review these Terms periodically. Material changes will be communicated to regular customers via email or WhatsApp.
              </p>
            </section>

            <section>
              <h2>14. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
              </p>
            </section>

            <section>
              <h2>15. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and any specific terms agreed upon for individual orders, constitute the entire agreement between you and A3Distributor regarding our services, superseding any prior agreements or understandings.
              </p>
            </section>

            <section>
              <h2>16. Contact Information</h2>
              <p>For questions about these Terms and Conditions or our services, please contact us:</p>
              <address>
                <strong>A3Distributor</strong><br />
                Off Din Quarry Rd, near Masjid, Panjarapole,<br />
                Chembur, Mumbai, Maharashtra 400088<br />
                India<br /><br />
                <strong>Email:</strong> info@a3distributor.com<br />
                <strong>Phone:</strong> +91 7039414924<br />
                <strong>WhatsApp:</strong> +91 7039414924<br />
                <strong>Website:</strong> https://a3distributor.com
              </address>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
