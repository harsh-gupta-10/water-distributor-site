import { useState, useEffect } from "react";
import { Menu, X, Droplets } from "lucide-react";


const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#products" },
  { label: "Services", href: "#services" },
  { label: "Why Choose Us", href: "#why-us" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ onQuotationClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleLinkClick = () => setIsMobileOpen(false);

  return (
    <nav className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__container container">
        <a href="#home" className="navbar__logo">
          <Droplets size={28} className="navbar__logo-icon" />
          <span className="navbar__logo-text">
            Aqua<span className="navbar__logo-highlight">Flow</span>
          </span>
        </a>

        <ul
          className={`navbar__links ${isMobileOpen ? "navbar__links--open" : ""}`}
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="navbar__link"
                onClick={handleLinkClick}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="navbar__links-cta-mobile">
            <button
              className="btn btn-primary"
              onClick={() => {
                onQuotationClick();
                handleLinkClick();
              }}
            >
              Get Quotation
            </button>
          </li>
        </ul>

        <button
          className="btn btn-primary navbar__cta-desktop"
          onClick={onQuotationClick}
        >
          Get Quotation
        </button>

        <button
          className="navbar__toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="navbar__overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </nav>
  );
}
