import React from "react";
import Hero from "../Components/Hero/Hero.jsx";
import AboutSection from "../Components/About/AboutSection.jsx";
import Theme from "../Components/Theme/Theme.jsx";
import UpcomingEvents from "../Components/UpcomingEvents/UpcomingEvents.jsx";
import GalleryPreview from "../Components/GalleryPreview/GalleryPreview.jsx";
import Donate from "../Components/Donate/Donate.jsx";
import Footer from "../Components/Footer/Footer.jsx";
import Contact from "../Components/Contact/Contact.jsx";
import Awards from "../Components/Award/Awards.jsx";
import SocialSidebar from "../Components/SocialSidebar/SocialSidebar.jsx";
import FlashBanner from "../Components/FlashBanner/FlashBanner.jsx";
import MarqueeStrip from "../Components/MarqueeStrip/MarqueeStrip.jsx"; 
import GunGauravSohala from "../Components/GunGauravSohala/GunGauravSohala.jsx"
import Padyapujan from "../Components/Padyapujan/Padyapujan.jsx";
import WorldRecordVideo from "../Components/WorldRecordVideo/WorldRecordVideo.jsx";
import FlashNewsMobile from "../Components/FlashNewsMobile/FlashNewsMobile.jsx";
import VisarjanSohala from "../Components/VisarjanSohala/VisarjanSohala.jsx";
import AuraTeaser from "../Components/AuraTeaser/AuraTeaser.jsx";
import MerchandisePromo from "../Components/MerchandisePromo/MerchandisePromo.jsx";

const Home = () => {
  return (
    <>
      <MerchandisePromo />
      <FlashBanner />
      <FlashNewsMobile />
      <SocialSidebar />
      <MarqueeStrip /> 
      <Hero />
      <AuraTeaser />
      <AboutSection />
      {/* <GunGauravSohala /> */}
      
      <VisarjanSohala />
      <WorldRecordVideo />
      <Theme />
      <Padyapujan />
      <UpcomingEvents />
      <GalleryPreview />
      <Awards />
      <Donate />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
