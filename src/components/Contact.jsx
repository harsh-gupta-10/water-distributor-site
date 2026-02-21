import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Phone, Mail, MapPin, Clock, MessageCircle, ArrowRight } from "lucide-react";

export default function Contact() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page">
      <div className="contact-page__hero">
        <div className="container">
          <h1 className="contact-page__title">Get In Touch</h1>
          <p className="contact-page__subtitle">
            Have a question, need a bulk order, or want to become a retail
            partner? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <section className="contact-page__content" ref={ref}>
        <div className="container">
          <div
            className={`contact-page__grid ${inView ? "animate-fadeInUp" : ""}`}
            style={{ opacity: inView ? 1 : 0 }}
          >
            <div className="contact-page__info">
              <h2 className="contact-page__info-title">Contact Information</h2>
              <p className="contact-page__info-desc">
                Reach out to us through any of these channels. Our team is ready
                to assist you with orders, pricing, and distribution queries.
              </p>

              <div className="contact-page__cards">
                <a href="tel:+917304555662" className="contact__card">
                  <div className="contact__card-icon contact__card-icon--phone">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="contact__card-title">Call Us</h3>
                    <p className="contact__card-text">+91 73045 55662</p>
                    <span className="contact__card-hint">
                      Tap to call directly
                    </span>
                  </div>
                </a>

                <a
                  href="mailto:info@a3distributors.in"
                  className="contact__card"
                >
                  <div className="contact__card-icon contact__card-icon--email">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="contact__card-title">Email Us</h3>
                    <p className="contact__card-text">info@a3distributors.in</p>
                    <span className="contact__card-hint">
                      We reply within 24 hours
                    </span>
                  </div>
                </a>

                <a
                  href="https://wa.me/917304555662"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact__card"
                >
                  <div className="contact__card-icon contact__card-icon--whatsapp">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h3 className="contact__card-title">WhatsApp</h3>
                    <p className="contact__card-text">+91 73045 55662</p>
                    <span className="contact__card-hint">
                      Quick responses on WhatsApp
                    </span>
                  </div>
                </a>

                <div className="contact__card">
                  <div className="contact__card-icon contact__card-icon--location">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="contact__card-title">
                      Visit Our Warehouse
                    </h3>
                    <p className="contact__card-text">
                      Plot No. 45, Industrial Area,
                      <br />
                      Main Distribution Hub, City - 110001
                    </p>
                  </div>
                </div>

                <div className="contact__card">
                  <div className="contact__card-icon contact__card-icon--hours">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="contact__card-title">Business Hours</h3>
                    <p className="contact__card-text">
                      Mon - Sat: 7:00 AM - 9:00 PM
                      <br />
                      Sunday: 8:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-page__map-wrap">
              <div className="contact__map">
                <div className="contact__map-placeholder">
                  <MapPin size={48} className="contact__map-icon" />
                  <p>Google Maps</p>
                  <span>Replace this with your Google Maps embed</span>
                </div>
              </div>

              <div className="contact-page__cta-box">
                <h3>Need a Bulk Order?</h3>
                <p>
                  For large orders, custom requirements, or wholesale pricing,
                  get in touch with our distribution team.
                </p>
                <a
                  href="https://wa.me/917304555662?text=Hi%2C%20I%20need%20a%20bulk%20order%20quotation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Request Quotation <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
