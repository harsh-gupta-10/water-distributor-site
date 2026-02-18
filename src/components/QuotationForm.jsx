import { useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Send,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  MessageSquare,
  MessageCircle,
} from "lucide-react";


const productOptions = [
  "Bisleri 20L",
  "Bisleri 1L/500ml",
  "Kinley",
  "Aquafina",
  "Rail Neer",
  "Coca-Cola",
  "Pepsi",
  "Sprite",
  "Thums Up",
  "Fanta",
  "Maaza",
  "Slice",
  "Sting",
  "Limca",
];

const WHATSAPP_NUMBER = "917304555662";

function buildWhatsAppMessage(data) {
  let msg = `Hi, I am *${data.fullName}*`;
  if (data.businessName) msg += ` from *${data.businessName}*`;
  msg += `.`;
  if (data.email) msg += `\nEmail: ${data.email}`;
  if (data.phone) msg += `\nPhone: ${data.phone}`;
  if (data.products.length > 0) msg += `\n\nProducts I need: ${data.products.join(", ")}`;
  if (data.quantity) msg += `\nQuantity: ${data.quantity}`;
  if (data.location) msg += `\nDelivery Location: ${data.location}`;
  if (data.message) msg += `\n\nAdditional Info: ${data.message}`;
  msg += `\n\nPlease share your best wholesale pricing. Thank you!`;
  return msg;
}

export default function QuotationForm() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    products: [],
    quantity: "",
    location: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductToggle = (product) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In production, this would send to a backend/API
  };

  if (submitted) {
    return (
      <section id="quotation" className="quotation" ref={ref}>
        <div className="container">
          <div className="quotation__success">
            <div className="quotation__success-icon">
              <Send size={40} />
            </div>
            <h2>Thank You for Your Inquiry!</h2>
            <p>
              We have received your quotation request. Our team will get back to
              you within 2-4 business hours with the best pricing.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setSubmitted(false)}
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quotation" className="quotation" ref={ref}>
      <div className="container">
        <div
          className={`section-header ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0 }}
        >
          <span className="section-label">Get Quotation</span>
          <h2 className="section-title">Request a Price Quote</h2>
          <div className="mandala-divider" />
          <p className="section-subtitle">
            Fill in your requirements and we will provide you with the best
            wholesale pricing within hours. No obligation, no hidden charges.
          </p>
        </div>

        <form
          className={`quotation__form ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0, animationDelay: "0.2s" }}
          onSubmit={handleSubmit}
        >
          <div className="quotation__form-grid">
            <div className="quotation__field">
              <label className="quotation__label">
                <User size={16} /> Full Name{" "}
                <span className="quotation__required">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                className="quotation__input"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="quotation__field">
              <label className="quotation__label">
                <Building2 size={16} /> Business Name
              </label>
              <input
                type="text"
                name="businessName"
                className="quotation__input"
                placeholder="Your business / shop name"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>
            <div className="quotation__field">
              <label className="quotation__label">
                <Phone size={16} /> Phone Number{" "}
                <span className="quotation__required">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                className="quotation__input"
                placeholder="+91 73045 55662"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="quotation__field">
              <label className="quotation__label">
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                name="email"
                className="quotation__input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Product Selection */}
          <div className="quotation__field quotation__field--full">
            <label className="quotation__label">
              <Package size={16} /> Select Products{" "}
              <span className="quotation__required">*</span>
            </label>
            <div className="quotation__products">
              {productOptions.map((product) => (
                <button
                  key={product}
                  type="button"
                  className={`quotation__product-tag ${formData.products.includes(product) ? "quotation__product-tag--active" : ""}`}
                  onClick={() => handleProductToggle(product)}
                >
                  {product}
                </button>
              ))}
            </div>
          </div>

          <div className="quotation__form-grid">
            <div className="quotation__field">
              <label className="quotation__label">
                <Package size={16} /> Approximate Quantity
              </label>
              <input
                type="text"
                name="quantity"
                className="quotation__input"
                placeholder="e.g., 100 cases, 50 cartons"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            <div className="quotation__field">
              <label className="quotation__label">
                <MapPin size={16} /> Delivery Location{" "}
                <span className="quotation__required">*</span>
              </label>
              <input
                type="text"
                name="location"
                className="quotation__input"
                placeholder="Area / locality name"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="quotation__field quotation__field--full">
            <label className="quotation__label">
              <MessageSquare size={16} /> Additional Message
            </label>
            <textarea
              name="message"
              className="quotation__input quotation__textarea"
              placeholder="Any specific requirements, preferred delivery schedule, etc."
              value={formData.message}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="quotation__actions">
            <button type="submit" className="btn btn-primary quotation__submit">
              <Send size={18} />
              Request Quotation
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(formData))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn quotation__whatsapp-btn"
              onClick={(e) => {
                if (!formData.fullName || !formData.phone || !formData.location) {
                  e.preventDefault();
                  alert("Please fill in Name, Phone and Location before sending via WhatsApp.");
                }
              }}
            >
              <MessageCircle size={18} />
              Send via WhatsApp
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
