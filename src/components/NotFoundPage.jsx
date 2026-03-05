import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import SEO from "./SEO";

export default function NotFoundPage() {
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
      <SEO 
        title="Page Not Found - 404"
        description="The page you're looking for doesn't exist."
      />
      
      <main className="not-found-page">
        <div className="not-found-container">
          <div className="not-found-content">
            <h1 className="not-found-number">404</h1>
            <h2 className="not-found-title">Page Not Found</h2>
            <p className="not-found-subtitle">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="not-found-redirect">
              <p>Redirecting to homepage in</p>
              <div className="not-found-countdown">{countdown}</div>
              <p>seconds...</p>
            </div>

            <div className="not-found-actions">
              <button onClick={handleGoHome} className="btn btn-primary">
                <Home size={18} />
                Go to Homepage
              </button>
              <Link to="/contact" className="btn btn-secondary">
                <ArrowLeft size={18} />
                Contact Support
              </Link>
            </div>

            <div className="not-found-links">
              <p>Popular pages:</p>
              <div className="not-found-links-grid">
                <Link to="/">Home</Link>
                <Link to="/wholesale-distributor">Wholesale Distributor</Link>
                <Link to="/compare">Compare</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
