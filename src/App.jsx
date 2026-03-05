import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Partners from "./components/Partners";
import Services from "./components/Services";
import WhyChooseUs from "./components/WhyChooseUs";
import TrustSection from "./components/TrustSection";
import FAQ from "./components/FAQ";
import QuotationForm from "./components/QuotationForm";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import QuotationModal from "./components/QuotationModal";
import AdminDashboard from "./components/AdminDashboard";
import ComparisonPage from "./components/ComparisonPage";
import WholesaleDistributorPage from "./components/WholesaleDistributorPage";
import NotFoundPage from "./components/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";
import SEO from "./components/SEO";

function HomePage({ openModal, scrollToContactOnLoad = false }) {
  useEffect(() => {
    if (!scrollToContactOnLoad) return;
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollToContactOnLoad]);

  return (
    <>
      <SEO 
        title="Home - Wholesale Water & Beverage Distribution" 
        description="A3Distributors — Reliable water & cold drink distribution for businesses across India. Bulk supply of Bisleri, Kinley, Coca-Cola, Pepsi & more. Best wholesale pricing and on-time delivery."
        keywords="wholesale distributor, water distributor, beverage distributor, bulk water supply, cold drink supplier, Coca-Cola distributor, Pepsi distributor, beverage wholesale India"
        includeFAQ={true}
      />
      <main>
        <Hero onQuotationClick={openModal} />
        <Products onQuotationClick={openModal} />
        <Partners />
        <Services />
        <WhyChooseUs />
        <FAQ />
        <TrustSection />
        <QuotationForm />
        <Contact inline />
      </main>
    </>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar openModal={openModal} />
      <Routes>
        <Route path="/" element={<HomePage openModal={openModal} />} />
        <Route
          path="/contact"
          element={<HomePage openModal={openModal} scrollToContactOnLoad />}
        />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/wholesale-distributor" element={<WholesaleDistributorPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      <QuotationModal isOpen={isModalOpen} onClose={closeModal} />
    </BrowserRouter>
  );
}

export default App;
