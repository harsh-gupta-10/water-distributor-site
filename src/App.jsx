import { Suspense, lazy, useEffect, useMemo, useState } from "react";
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
import productsData from "./data/products.json";
import siteConfig from "./data/siteConfig";

const BlogListing = lazy(() => import("./components/BlogListing"));
const BlogPost = lazy(() => import("./components/BlogPost"));

// Admin Module
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const DashboardPage = lazy(() => import("./admin/pages/DashboardPage"));
const QuotationsPage = lazy(() => import("./admin/pages/QuotationsPage"));
const CustomersPage = lazy(() => import("./admin/pages/CustomersPage"));
const CustomerProfile = lazy(() => import("./admin/pages/CustomerProfile"));
const ProductsPage = lazy(() => import("./admin/pages/ProductsPage"));
const ProductImagesPage = lazy(() => import("./admin/pages/ProductImagesPage"));
const InvoicesPage = lazy(() => import("./admin/pages/InvoicesPage"));
const InvoiceForm = lazy(() => import("./admin/pages/InvoiceForm"));
const InvoiceView = lazy(() => import("./admin/pages/InvoiceView"));
const AnalyticsPage = lazy(() => import("./admin/pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./admin/pages/SettingsPage"));
const BlogsPage = lazy(() => import("./admin/pages/BlogsPage"));
const UploadsPage = lazy(() => import("./admin/pages/UploadsPage"));
const OrdersPage = lazy(() => import("./admin/pages/OrdersPage"));
const OrderForm = lazy(() => import("./admin/pages/OrderForm"));
const OrderView = lazy(() => import("./admin/pages/OrderView"));

function buildHomeSchemas(origin, canonicalPath = "/") {
  const isContactPage = canonicalPath === "/contact";
  const pageUrl = `${origin}${canonicalPath}`;
  const products = productsData.categories.flatMap((category) =>
    (category.products || []).slice(0, 4).map((product) => ({
      "@type": "ListItem",
      position: 0,
      item: {
        "@type": "Product",
        name: product.name,
        category: category.name,
        description: `${product.name} in ${category.name} category for bulk business supply`,
        url: `${origin}/#products`,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${origin}/#products`,
        },
      },
    }))
  );

  const itemList = products.map((item, index) => ({
    ...item,
    position: index + 1,
  }));

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: isContactPage
      ? "Contact Wholesale Water & Beverage Distributor in Mumbai"
      : "Wholesale Water & Beverage Distributor in Mumbai",
    description: isContactPage
      ? "Contact A3Distributors for bulk water and beverage supply in Mumbai. Get pricing, delivery timelines, and custom quotes for offices, events, and retail businesses."
      : "Bulk water and beverage supplier in Mumbai for offices, retailers, institutions, and events with fast delivery and competitive wholesale pricing.",
    inLanguage: "en-IN",
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${origin}/#organization` },
    primaryImageOfPage: `${origin}/imgs/og-image.jpg`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isContactPage ? "Contact" : "Products",
        item: isContactPage ? `${origin}/contact` : `${origin}/#products`,
      },
    ],
  };

  if (isContactPage) {
    return [webPageSchema, breadcrumbSchema];
  }

  breadcrumbSchema.itemListElement.push({
    "@type": "ListItem",
    position: 3,
    name: "Blog",
    item: `${origin}/blog`,
  });

  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Water and Beverage Products",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: itemList,
  };

  return [webPageSchema, breadcrumbSchema, productListSchema];
}

function HomePage({ openModal, scrollToContactOnLoad = false, canonicalPath = "/" }) {
  useEffect(() => {
    if (!scrollToContactOnLoad) return;
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollToContactOnLoad]);

  const origin = typeof window !== "undefined" ? window.location.origin : siteConfig.url;
  const isContactPage = canonicalPath === "/contact";
  const homeSchemas = useMemo(() => buildHomeSchemas(origin, canonicalPath), [origin, canonicalPath]);

  const seoTitle = isContactPage
    ? "Contact Wholesale Water & Beverage Distributor in Mumbai"
    : "Wholesale Water & Beverage Distributor in Mumbai";

  const seoDescription = isContactPage
    ? "Contact A3Distributors for bulk water and beverage supply in Mumbai. Get pricing, delivery timelines, and custom quotes for offices, events, and retail businesses."
    : "A3Distributors is a trusted wholesale water and beverage distributor in Mumbai. Bulk supply for offices, events, and retailers with fast delivery and competitive pricing.";

  const seoKeywords = isContactPage
    ? "contact water distributor mumbai, bulk water supplier phone number, beverage distributor contact, wholesale water quote mumbai"
    : "wholesale water distributor mumbai, beverage distributor mumbai, bulk water supply for office, soft drink wholesale supplier, bisleri distributor, pepsi coca cola wholesale";

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={`${origin}${canonicalPath}`}
        includeFAQ={!isContactPage}
        image="/imgs/og-image.jpg"
        extraSchemas={homeSchemas}
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

function RouteLoader() {
  return <div style={{ padding: "24px", textAlign: "center" }}>Loading...</div>;
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
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
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="uploads" element={<UploadsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ─── Public Routes ─── */}
          <Route
            path="/"
            element={
              <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
                <HomePage openModal={openModal} />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
                <HomePage openModal={openModal} scrollToContactOnLoad canonicalPath="/contact" />
              </PublicLayout>
            }
          />
          <Route
            path="/compare"
            element={
              <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
                <ComparisonPage />
              </PublicLayout>
            }
          />
          <Route
            path="/wholesale-distributor"
            element={
              <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
                <WholesaleDistributorPage />
              </PublicLayout>
            }
          />
          <Route
            path="/blog"
            element={
              <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
                <BlogListing />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
                <BlogPost />
              </PublicLayout>
            }
          />
          <Route
            path="*"
            element={
              <PublicLayout openModal={openModal} isModalOpen={isModalOpen} closeModal={closeModal}>
                <NotFoundPage />
              </PublicLayout>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
