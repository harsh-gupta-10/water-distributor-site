import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Partners from "./components/Partners";
import Services from "./components/Services";
import WhyChooseUs from "./components/WhyChooseUs";
import TrustSection from "./components/TrustSection";
import QuotationForm from "./components/QuotationForm";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import QuotationModal from "./components/QuotationModal";

function HomePage({ openModal }) {
  return (
    <main>
      <Hero onQuotationClick={openModal} />
      <Products onQuotationClick={openModal} />
      <Partners />
      <Services />
      <WhyChooseUs />
      <TrustSection />
      <QuotationForm />
    </main>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <BrowserRouter>
      <Navbar openModal={openModal} />
      <Routes>
        <Route path="/" element={<HomePage openModal={openModal} />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      <QuotationModal isOpen={isModalOpen} onClose={closeModal} />
    </BrowserRouter>
  );
}

export default App;
