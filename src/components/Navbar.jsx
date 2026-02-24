import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import siteConfig from "../data/siteConfig";
import logoImg from "../assets/imgs/favicon.png";

const navLinks = [
  { label: "Home", href: "#home", type: "anchor" },
  { label: "Products", href: "#products", type: "anchor" },
  { label: "Services", href: "#services", type: "anchor" },
  { label: "Why Choose Us", href: "#why-us", type: "anchor" },
  { label: "About", href: "#about", type: "anchor" },
  { label: "Contact", href: "#contact", type: "anchor" },
];

export default function Navbar({ openModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const hero = document.getElementById("home");
      if (hero) {
        setPastHero(window.scrollY > hero.offsetHeight - 72);
      } else {
        setPastHero(true);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

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
        <Link to="/" className="navbar__logo">
          <img
            src={logoImg}
            alt="A3 Distributors"
            className="navbar__logo-img"
          />
          <span className="navbar__logo-text">
            {siteConfig.businessName}
            <span className="navbar__logo-highlight">
              {siteConfig.businessNameHighlight}
            </span>
          </span>
        </Link>

        <ul
          className={`navbar__links ${isMobileOpen ? "navbar__links--open" : ""}`}
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.type === "route" ? (
                <Link
                  to={link.href}
                  className={`navbar__link ${location.pathname === link.href ? "navbar__link--active" : ""}`}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={location.pathname === "/" ? link.href : `/${link.href}`}
                  className="navbar__link"
                  onClick={handleLinkClick}
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
          {/* Mobile CTA inside drawer */}
          <li className="navbar__links-cta-mobile">
            <button
              className="btn btn-primary"
              onClick={() => {
                handleLinkClick();
                openModal?.();
              }}
            >
              <Sparkles size={16} />
              Get Quotation
            </button>
          </li>
        </ul>

        <button
          className={`btn btn-primary navbar__cta-desktop ${pastHero ? "navbar__cta-desktop--visible" : ""}`}
          onClick={() => openModal?.()}
        >
          <Sparkles size={16} />
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
