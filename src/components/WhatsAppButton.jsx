import { FaWhatsapp } from "react-icons/fa";
import { useSettingsSync } from "../hooks/useSettings";

export default function WhatsAppButton() {
  const siteConfig = useSettingsSync();
  const message = encodeURIComponent(siteConfig.whatsappMessages.general);
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={28} />
      <span className="whatsapp-btn__tooltip">Chat with us</span>
    </a>
  );
}
