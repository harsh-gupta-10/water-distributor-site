import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Services from "./components/Services";
import WhyChooseUs from "./components/WhyChooseUs";
import TrustSection from "./components/TrustSection";
import QuotationForm from "./components/QuotationForm";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import QuotationModal from "./components/QuotationModal";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Navbar onQuotationClick={openModal} />
      <main>
        <Hero onQuotationClick={openModal} />
        <Products onQuotationClick={openModal} />
        <Services />
        <WhyChooseUs />
        <TrustSection />
        <QuotationForm />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <QuotationModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

export default App;
