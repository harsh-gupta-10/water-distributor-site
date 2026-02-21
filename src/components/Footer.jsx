import { Link } from "react-router-dom";
import {
  Warehouse,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#home", type: "anchor" },
  { label: "Products", href: "#products", type: "anchor" },
  { label: "Services", href: "#services", type: "anchor" },
  { label: "Why Choose Us", href: "#why-us", type: "anchor" },
  { label: "About", href: "#about", type: "anchor" },
  { label: "Get Quotation", href: "#quotation", type: "anchor" },
  { label: "Contact", href: "/contact", type: "route" },
];

const productLinks = [
  "Bisleri",
  "Kinley",
  "Aquafina",
  "Coca-Cola",
  "Pepsi",
  "Sprite",
  "Thums Up",
  "Maaza",
];

const serviceAreas = [
  "Main Market",
  "Industrial Zone",
  "Station Road",
  "Civil Lines",
  "University Area",
  "Ring Road",
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__tricolor" />

      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <a href="#home" className="footer__logo">
              <Warehouse size={24} />
              <span>
                A3<strong>Distributors</strong>
              </span>
            </a>
            <p className="footer__tagline">
              Your trusted water and beverage distribution partner.
              A3Distributors serves businesses with quality products,
              competitive pricing, and reliable delivery.
            </p>
            <div className="footer__contact-item">
              <Phone size={14} />
              <a href="tel:+917304555662">+91 73045 55662</a>
            </div>
            <div className="footer__contact-item">
              <Mail size={14} />
              <a href="mailto:info@a3distributors.in">info@a3distributors.in</a>
            </div>
            <div className="footer__contact-item">
              <MapPin size={14} />
              <span>Industrial Area, City - 110001</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__column">
            <h4 className="footer__column-title">Quick Links</h4>
            <ul className="footer__links">
              {quickLinks.map(({ label, href, type }) => (
                <li key={label}>
                  {type === "route" ? (
                    <Link to={href} className="footer__link">
                      <ChevronRight size={14} />
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className="footer__link">
                      <ChevronRight size={14} />
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="footer__column">
            <h4 className="footer__column-title">Products</h4>
            <ul className="footer__links">
              {productLinks.map((name) => (
                <li key={name}>
                  <a href="#products" className="footer__link">
                    <ChevronRight size={14} />
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas & Info */}
          <div className="footer__column">
            <h4 className="footer__column-title">Service Areas</h4>
            <ul className="footer__links">
              {serviceAreas.map((area) => (
                <li key={area}>
                  <span className="footer__link footer__link--static">
                    <ChevronRight size={14} />
                    {area}
                  </span>
                </li>
              ))}
            </ul>
            <div className="footer__info-block">
              <h4 className="footer__column-title">Business Hours</h4>
              <div className="footer__hours">
                <Clock size={14} />
                <div>
                  <p>Mon - Sat: 7 AM - 9 PM</p>
                  <p>Sunday: 8 AM - 2 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} A3Distributors. All rights
            reserved.
          </p>
          <p className="footer__gst">
            GST Registered | Professional Billing Available
          </p>
        </div>
      </div>
    </footer>
  );
}
