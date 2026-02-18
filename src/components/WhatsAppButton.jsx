import { MessageCircle } from "lucide-react";


export default function WhatsAppButton() {
  const phoneNumber = "917304555662";
  const message = encodeURIComponent(
    "Hi, I would like to inquire about bulk water/beverage supply. Please share your product list and pricing.",
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
      <span className="whatsapp-btn__tooltip">Chat with us</span>
    </a>
  );
}
