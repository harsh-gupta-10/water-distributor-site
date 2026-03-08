import { useState } from "react";
import {
  X,
  Send,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  MessageSquare,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSettingsSync } from "../hooks/useSettings";
import { submitQuotation } from "../lib/submitQuotation";

function buildWhatsAppMessage(data) {
  let msg = `Hi, I am *${data.fullName}*`;
  if (data.businessName) msg += ` from *${data.businessName}*`;
  msg += `.`;
  if (data.email) msg += `\nEmail: ${data.email}`;
  if (data.phone) msg += `\nPhone: ${data.phone}`;
  if (data.products.length > 0)
    msg += `\n\nProducts I need: ${data.products.join(", ")}`;
  if (data.quantity) msg += `\nQuantity: ${data.quantity}`;
  if (data.location) msg += `\nDelivery Location: ${data.location}`;
  if (data.message) msg += `\n\nAdditional Info: ${data.message}`;
  msg += `\n\nPlease share your best wholesale pricing. Thank you!`;
  return msg;
}

export default function QuotationModal({ isOpen, onClose }) {
  const siteConfig = useSettingsSync();
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!isOpen) return null;

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

  const handleWhatsApp = async (e) => {
    e.preventDefault();
    setSaveError("");

    if (!formData.fullName || !formData.phone || !formData.location) {
      setSaveError("Please fill in Name, Phone and Location.");
      return;
    }

    setSaving(true);
    const result = await submitQuotation(formData, "modal");
    setSaving(false);

    if (!result.success) {
      setSaveError("Could not save your request: " + result.error);
      return;
    }

    window.open(
      `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(formData))}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setSaveError("");
    setFormData({
      fullName: "",
      businessName: "",
      phone: "",
      email: "",
      products: [],
      quantity: "",
      location: "",
      message: "",
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal__close"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="modal__success">
            <div className="modal__success-icon">
              <Send size={32} />
            </div>
            <h2>Thank You!</h2>
            <p>
              We have received your quotation request. Our team will respond
              within 2-4 business hours.
            </p>
            <button className="btn btn-primary" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="modal__header">
              <h2 className="modal__title">Request a Quotation</h2>
              <p className="modal__subtitle">
                Fill in your details and we will get back with the best pricing.
              </p>
            </div>

            <form className="modal__form" onSubmit={(e) => e.preventDefault()}>
              <div className="modal__form-grid">
                <div className="modal__field">
                  <label>
                    <User size={14} /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="modal__field">
                  <label>
                    <Building2 size={14} /> Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    placeholder="Your business name"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal__field">
                  <label>
                    <Phone size={14} /> Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 70394 14924"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="modal__field">
                  <label>
                    <Mail size={14} /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal__field">
                <label>
                  <Package size={14} /> Select Products
                </label>
                <div className="modal__products">
                  {siteConfig.productOptions.map((product) => (
                    <button
                      key={product}
                      type="button"
                      className={`modal__product-tag ${formData.products.includes(product) ? "modal__product-tag--active" : ""}`}
                      onClick={() => handleProductToggle(product)}
                    >
                      {product}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal__form-grid">
                <div className="modal__field">
                  <label>
                    <Package size={14} /> Quantity
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    placeholder="e.g., 100 cases"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal__field">
                  <label>
                    <MapPin size={14} /> Delivery Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Area / locality"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal__field">
                <label>
                  <MessageSquare size={14} /> Message
                </label>
                <textarea
                  name="message"
                  placeholder="Any additional requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="modal__actions">
                {saveError && (
                  <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "8px" }}>
                    {saveError}
                  </p>
                )}
                <button
                  type="button"
                  className="btn modal__whatsapp-btn modal__submit"
                  onClick={handleWhatsApp}
                  disabled={saving}
                >
                  <FaWhatsapp size={16} />
                  {saving ? "Saving..." : "Request Quotation via WhatsApp"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
