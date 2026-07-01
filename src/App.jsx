import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trackPageView } from "./analytics";
import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";

import "./App.css";

// ── Public pages ──────────────────────────────────────────────────────────────
import Home                    from "./Pages/Home.jsx";
import ContactPage             from "./Pages/ContactPage.jsx";
import AwardsPage              from "./Pages/AwardPage.jsx";
import CommitteePage           from "./Pages/CommitteePage.jsx";
import DonationPage            from "./Pages/DonationPage.jsx";
import EventsPage              from "./Pages/EventsPage.jsx";
import GalleryPage             from "./Pages/GalleryPage.jsx";
import LivePage                from "./Pages/LivePage.jsx";
import ThemePage               from "./Pages/ThemePage.jsx";
import PageNotFound            from "./Pages/PageNotFound.jsx";
import AboutPage               from "./Pages/AboutPage.jsx";
import SocialInitiativesPage   from "./Pages/SocialInitiativesPage.jsx";
import EducationalInitiativesPage from "./Pages/EducationalInitiativesPage.jsx";
import OtherSocialPage         from "./Pages/OtherSocialPage.jsx";
import GunGauravGallery        from "./Pages/GunGauravGallery.jsx";
import PodcastPage             from "./Pages/PodcastPage.jsx";
import MerchandisePage         from "./Pages/MerchandisePage.jsx";
import CheckoutPage            from "./Pages/CheckoutPage.jsx";
import DonationDrivePage       from "./Pages/DonationDrivePage.jsx";
import MembershipPage          from "./Pages/MembershipPage.jsx";

// ── Public UI components ──────────────────────────────────────────────────────
import Navbar   from "./Components/Navbar/Navbar.jsx";

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminLogin          from "./Components/Admin/AdminLogin.jsx";
import AdminRoute          from "./Components/Admin/AdminRoute.jsx";
import AdminLayout         from "./Components/Admin/AdminLayout.jsx";
import AdminDashboardPage  from "./Pages/Admin/AdminDashboardPage.jsx";
import ManageAward         from "./Pages/Admin/ManageAward.jsx";
import ManageEvents        from "./Pages/Admin/ManageEvents.jsx";
import ManageOrders        from "./Pages/Admin/ManageOrders.jsx";
import ManageMerchandise   from "./Pages/Admin/ManageMerchandise.jsx";
import AdminProfile        from "./Pages/Admin/AdminProfile.jsx";

function App() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Don't render Navbar on admin routes
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}

      <Routes>
        {/* ── Public routes ── */}
        <Route path="/"                element={<Home lang={i18n.language} />} />
        <Route path="/about"           element={<AboutPage lang={i18n.language} />} />
        <Route path="/contact"         element={<ContactPage lang={i18n.language} />} />
        <Route path="/committee"       element={<CommitteePage lang={i18n.language} />} />
        <Route path="/donate"          element={<DonationPage lang={i18n.language} />} />
        <Route path="/events"          element={<EventsPage lang={i18n.language} />} />
        <Route path="/gallery"         element={<GalleryPage lang={i18n.language} />} />
        <Route path="/live"            element={<LivePage lang={i18n.language} />} />
        <Route path="/social"          element={<SocialInitiativesPage lang={i18n.language} />} />
        <Route path="/education"       element={<EducationalInitiativesPage lang={i18n.language} />} />
        <Route path="/other-social"    element={<OtherSocialPage lang={i18n.language} />} />
        <Route path="/theme"           element={<ThemePage lang={i18n.language} />} />
        <Route path="/awards"          element={<AwardsPage lang={i18n.language} />} />
        <Route path="/podcast"         element={<PodcastPage lang={i18n.language} />} />
        <Route path="/gun-gaurav-gallery" element={<GunGauravGallery lang={i18n.language} />} />
        <Route path="/merchandise"     element={<MerchandisePage lang={i18n.language} />} />
        <Route path="/merchandise/:slug" element={<MerchandisePage lang={i18n.language} />} />
        <Route path="/merchandise/:slug/checkout" element={<CheckoutPage />} />
        <Route path="/donate-now"      element={<DonationDrivePage lang={i18n.language} />} />
        <Route path="/membership"      element={<MembershipPage lang={i18n.language} />} />

        {/* ── Admin login (standalone, no layout) ── */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ── Admin nested routes (share AdminLayout) ── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index           element={<AdminDashboardPage />} />
          <Route path="orders"   element={<ManageOrders />} />
          <Route path="awards"   element={<ManageAward />} />
          <Route path="events"   element={<ManageEvents />} />
          <Route path="merchandise" element={<ManageMerchandise />} />
          <Route path="profile"  element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
