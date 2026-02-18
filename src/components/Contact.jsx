import { useInView } from "react-intersection-observer";
import { Phone, Mail, MapPin, Clock } from "lucide-react";


export default function Contact() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section id="contact" className="contact" ref={ref}>
      <div className="container">
        <div
          className={`section-header ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0 }}
        >
          <span className="section-label">Contact Us</span>
          <h2 className="section-title">Get In Touch</h2>
          <div className="mandala-divider" />
          <p className="section-subtitle">
            Have a question or need to place an order? Reach out to us through
            any of the channels below. We are happy to assist.
          </p>
        </div>

        <div
          className={`contact__grid ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0, animationDelay: "0.2s" }}
        >
          <div className="contact__cards">
            <a href="tel:+917304555662" className="contact__card">
              <div className="contact__card-icon contact__card-icon--phone">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="contact__card-title">Call Us</h3>
                <p className="contact__card-text">+91 73045 55662</p>
                <span className="contact__card-hint">Tap to call directly</span>
              </div>
            </a>

            <a href="mailto:info@aquaflow.in" className="contact__card">
              <div className="contact__card-icon contact__card-icon--email">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="contact__card-title">Email Us</h3>
                <p className="contact__card-text">info@aquaflow.in</p>
                <span className="contact__card-hint">
                  We reply within 24 hours
                </span>
              </div>
            </a>

            <div className="contact__card">
              <div className="contact__card-icon contact__card-icon--location">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="contact__card-title">Visit Our Warehouse</h3>
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

          <div className="contact__map">
            <div className="contact__map-placeholder">
              <MapPin size={48} className="contact__map-icon" />
              <p>Google Maps</p>
              <span>Replace this with your Google Maps embed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
