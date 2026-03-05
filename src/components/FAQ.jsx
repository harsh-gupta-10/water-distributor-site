import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqData = [
  {
    question:
      "How does A3 Distributor stand out in pricing and product selection compared to other one-stop wholesale suppliers?",
    answer:
      "A3 Distributor offers the most competitive wholesale pricing in the market with volume-based discounts starting at just 50 units. Unlike many suppliers, we provide access to 500+ SKUs across all major beverage brands (Coca-Cola, Pepsi, Bisleri, and more) from a single source, eliminating the need for multiple vendor relationships. Our pricing is transparent with no hidden fees, and we offer same-day delivery at no extra charge for urgent orders.",
  },
  {
    question:
      "What advantages does working with A3 Distributor offer for sourcing a wide range of products?",
    answer:
      "A3 Distributor serves as your complete one-stop wholesale solution with several key advantages: (1) Access to 500+ products including water, soft drinks, energy drinks, and juices from all major brands; (2) No minimum order restrictions - we serve both small businesses and large enterprises; (3) Dedicated account manager for personalized service; (4) Real-time inventory visibility; (5) Flexible payment terms for verified businesses; (6) Quality guarantee on all products; (7) 24/7 order placement capability; (8) Coverage across Mumbai and surrounding regions with reliable logistics.",
  },
  {
    question: "What bulk purchase discounts does A3 Distributor offer?",
    answer:
      "A3 Distributor offers tiered bulk purchase discounts: 5-10% off for orders of 50-200 units, 10-15% off for orders of 200-500 units, 15-20% off for orders of 500-1000 units, and 20%+ off for orders exceeding 1000 units. Additional discounts available for recurring monthly contracts. We also provide seasonal promotional pricing, free delivery on bulk orders over ₹10,000, and special rates for long-term business partnerships. Contact us for a customized quote based on your specific volume requirements.",
  },
];

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={onToggle} aria-expanded={isOpen}>
        <span>{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section" ref={ref}>
      <div className="container">
        <div
          className={`section-header ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0 }}
        >
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="mandala-divider" />
          <p className="section-subtitle">
            Get answers to common questions about our wholesale distribution services,
            pricing, and how we can help your business.
          </p>
        </div>

        <div
          className={`faq-container ${inView ? "animate-fadeInUp" : ""}`}
          style={{ opacity: inView ? 1 : 0, animationDelay: "0.2s" }}
        >
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
