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
import ComparisonPage from "./components/ComparisonPage";
import WholesaleDistributorPage from "./components/WholesaleDistributorPage";
import NotFoundPage from "./components/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";
import SEO from "./components/SEO";

// Admin Module
import AdminLayout from "./admin/AdminLayout";
import DashboardPage from "./admin/pages/DashboardPage";
import QuotationsPage from "./admin/pages/QuotationsPage";
import CustomersPage from "./admin/pages/CustomersPage";
import CustomerProfile from "./admin/pages/CustomerProfile";
import ProductsPage from "./admin/pages/ProductsPage";
import ProductImagesPage from "./admin/pages/ProductImagesPage";
import InvoicesPage from "./admin/pages/InvoicesPage";
import InvoiceForm from "./admin/pages/InvoiceForm";
import InvoiceView from "./admin/pages/InvoiceView";
import AnalyticsPage from "./admin/pages/AnalyticsPage";
import SettingsPage from "./admin/pages/SettingsPage";
import OrdersPage from "./admin/pages/OrdersPage";
import OrderForm from "./admin/pages/OrderForm";
import OrderView from "./admin/pages/OrderView";

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

function PublicLayout({ children, openModal, isModalOpen, closeModal }) {
  return (
    <>
      <Navbar openModal={openModal} />
      {children}
      <Footer />
      <WhatsAppButton />
      <QuotationModal isOpen={isModalOpen} onClose={closeModal} />
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
      <Routes>
        {/* ─── Admin Routes (no Navbar/Footer) ─── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/new" element={<OrderForm />} />
          <Route path="orders/:id" element={<OrderView />} />
          <Route path="orders/:id/edit" element={<OrderForm />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerProfile />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="product-images" element={<ProductImagesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="invoices/:id" element={<InvoiceView />} />
          <Route path="invoices/:id/edit" element={<InvoiceForm />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ─── Public Routes ─── */}
        <Route path="/" element={
          <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
            <HomePage openModal={openModal} />
          </PublicLayout>
        } />
        <Route path="/contact" element={
          <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
            <HomePage openModal={openModal} scrollToContactOnLoad />
          </PublicLayout>
        } />
        <Route path="/compare" element={
          <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
            <ComparisonPage />
          </PublicLayout>
        } />
        <Route path="/wholesale-distributor" element={
          <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
            <WholesaleDistributorPage />
          </PublicLayout>
        } />
        <Route path="*" element={
          <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
            <NotFoundPage />
          </PublicLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
