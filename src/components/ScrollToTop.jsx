import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        const target = document.querySelector(hash);
        if (!target) {
          window.scrollTo({ top: 0, behavior: "auto" });
          return;
        }

        const nav = document.querySelector(".navbar");
        const navOffset = nav ? nav.getBoundingClientRect().height + 12 : 84;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
