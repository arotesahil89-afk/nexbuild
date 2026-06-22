import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next"; // 👈 i18n hook
import { trackPageView } from "./analytics";
import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";

import "./App.css";
import Home from "./Pages/Home.jsx";
import ContactPage from "./Pages/ContactPage.jsx";
import AwardsPage from "./Pages/AwardPage.jsx";
import CommitteePage from "./Pages/CommitteePage.jsx";
import DonationPage from "./Pages/DonationPage.jsx";
import EventsPage from "./Pages/EventsPage.jsx";
import GalleryPage from "./Pages/GalleryPage.jsx";
import LivePage from "./Pages/LivePage.jsx";
import ThemePage from "./Pages/ThemePage.jsx";
import PageNotFound from "./Pages/PageNotFound.jsx";
import AboutPage from "./Pages/AboutPage.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Footer_all from "./Components/Footer/Footer_all";
import SocialInitiativesPage from "./Pages/SocialInitiativesPage.jsx";
import EducationalInitiativesPage from "./Pages/EducationalInitiativesPage.jsx";
import OtherSocialPage from "./Pages/OtherSocialPage.jsx";
import GunGauravGallery from "./Pages/GunGauravGallery.jsx";
import PodcastPage from "./Pages/PodcastPage.jsx";
import AdminLogin from "./Components/Admin/AdminLogin.jsx";
import AdminDashboard from "./Components/Admin/AdminDashboard.jsx";
import AdminRoute from "./Components/Admin/AdminRoute.jsx";
import ManageAward from "./Pages/Admin/ManageAward.jsx"; // 👈 Admin CRUD page
import MerchandisePage from "./Pages/MerchandisePage.jsx";
import DonationDrivePage from "./Pages/DonationDrivePage.jsx";
import MembershipPage from "./Pages/MembershipPage.jsx";

function App() {
  const location = useLocation();
  const { i18n } = useTranslation(); // 👈 current language detect

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home lang={i18n.language} />} />
        <Route path="/about" element={<AboutPage lang={i18n.language} />} />
        <Route path="/contact" element={<ContactPage lang={i18n.language} />} />
        <Route path="/committee" element={<CommitteePage lang={i18n.language} />} />
        <Route path="/donate" element={<DonationPage lang={i18n.language} />} />
        <Route path="/events" element={<EventsPage lang={i18n.language} />} />
        <Route path="/gallery" element={<GalleryPage lang={i18n.language} />} />
        <Route path="/live" element={<LivePage lang={i18n.language} />} />
        <Route path="/social" element={<SocialInitiativesPage lang={i18n.language} />} />
        <Route path="/education" element={<EducationalInitiativesPage lang={i18n.language} />} />
        <Route path="/other-social" element={<OtherSocialPage lang={i18n.language} />} />
        <Route path="/theme" element={<ThemePage lang={i18n.language} />} />
        <Route path="/awards" element={<AwardsPage lang={i18n.language} />} />
        <Route path="/podcast" element={<PodcastPage lang={i18n.language} />} />
        <Route path="/gun-gaurav-gallery" element={<GunGauravGallery lang={i18n.language} />} />
        <Route path="/merchandise" element={<MerchandisePage lang={i18n.language} />} />
        <Route path="/donate-now" element={<DonationDrivePage lang={i18n.language} />} />
        <Route path="/membership" element={<MembershipPage lang={i18n.language} />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard lang={i18n.language} />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-award"
          element={
            <AdminRoute>
              <ManageAward lang={i18n.language} />
            </AdminRoute>
          }
        />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {/* <Footer_all /> */}
    </>
  );
}

export default App;
