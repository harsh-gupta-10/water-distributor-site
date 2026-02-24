import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ChevronRight } from "lucide-react";
import siteConfig from "../data/siteConfig";

const logoImg = "/imgs/logo-footer.png";

const quickLinks = [
  { label: "Home", href: "#home", type: "anchor" },
  { label: "Products", href: "#products", type: "anchor" },
  { label: "Services", href: "#services", type: "anchor" },
  { label: "Why Choose Us", href: "#why-us", type: "anchor" },
  { label: "About", href: "#about", type: "anchor" },
  { label: "Get Quotation", href: "#quotation", type: "anchor" },
  { label: "Contact", href: "#contact", type: "anchor" },
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

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__tricolor" />

      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <a href="#home" className="footer__logo">
              <img
                src={logoImg}
                alt="A3 Distributors"
                className="footer__logo-img"
              />
            </a>
            <p className="footer__tagline">{siteConfig.footerDescription}</p>
            <div className="footer__contact-item">
              <Phone size={14} />
              <a href={`tel:${siteConfig.phone}`}>{siteConfig.phoneDisplay}</a>
            </div>
            <div className="footer__contact-item">
              <Mail size={14} />
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </div>
            <div className="footer__contact-item">
              <MapPin size={14} />
              <span>{siteConfig.addressShort}</span>
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
              {siteConfig.serviceAreas.slice(0, 3).map((area) => (
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
                  <p>{siteConfig.hours.allDays}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} {siteConfig.businessName}
            {siteConfig.businessNameHighlight}. All rights reserved.
          </p>
          <p className="footer__gst">{siteConfig.gstInfo}</p>
          <p className="footer__credit">
            Website made by{" "}
            <a
              href="https://harshugupta.in"
              target="_blank"
              rel="noopener noreferrer"
            >
              Harshugupta.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
