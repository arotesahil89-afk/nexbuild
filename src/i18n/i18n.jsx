import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Navbar translations
import enNavbar from "./locales/en/navbar.json";
import hiNavbar from "./locales/hi/navbar.json";
import mrNavbar from "./locales/mr/navbar.json";

// Flash messages
import enFlash from "./locales/en/flash.json";
import hiFlash from "./locales/hi/flash.json";
import mrFlash from "./locales/mr/flash.json";

// Social translations
import enSocial from "./locales/en/social.json";
import hiSocial from "./locales/hi/social.json";
import mrSocial from "./locales/mr/social.json";

// Committee translations
import enCommittee from "./locales/en/committee.json";
import hiCommittee from "./locales/hi/committee.json";
import mrCommittee from "./locales/mr/committee.json";

// Education translations
import enEducation from "./locales/en/education.json";
import hiEducation from "./locales/hi/education.json";
import mrEducation from "./locales/mr/education.json";

// Theme translations
import enTheme from "./locales/en/theme.json";
import hiTheme from "./locales/hi/theme.json";
import mrTheme from "./locales/mr/theme.json";

// Footer translations
import enFooter from "./locales/en/footer.json";
import hiFooter from "./locales/hi/footer.json";
import mrFooter from "./locales/mr/footer.json";

// Contact translations
import enContact from "./locales/en/contact.json";
import hiContact from "./locales/hi/contact.json";
import mrContact from "./locales/mr/contact.json";

// Donation translations
import enDonate from "./locales/en/donation.json";
import hiDonate from "./locales/hi/donation.json";
import mrDonate from "./locales/mr/donation.json";

// Awards translations
import enAwards from "./locales/en/awards.json";
import hiAwards from "./locales/hi/awards.json";
import mrAwards from "./locales/mr/awards.json";

// Events translations
import enEvents from "./locales/en/events.json";
import hiEvents from "./locales/hi/events.json";
import mrEvents from "./locales/mr/events.json";

// About translations
import enAbout from "./locales/en/about.json";
import hiAbout from "./locales/hi/about.json";
import mrAbout from "./locales/mr/about.json";

// Gallery translations
import enGallery from "./locales/en/gallery.json";
import hiGallery from "./locales/hi/gallery.json";
import mrGallery from "./locales/mr/gallery.json";

// Live translations
import enLive from "./locales/en/live.json";
import hiLive from "./locales/hi/live.json";
import mrLive from "./locales/mr/live.json";

// Marquee translations
import enMarquee from "./locales/en/marquee.json";
import hiMarquee from "./locales/hi/marquee.json";
import mrMarquee from "./locales/mr/marquee.json";

// GunGaurav translations
import enGunGaurav from "./locales/en/gunGaurav.json";
import hiGunGaurav from "./locales/hi/gunGaurav.json";
import mrGunGaurav from "./locales/mr/gunGaurav.json";

// Other Initiatives translations
import hiOtherInitiatives from "./locales/hi/other-initiatives.json";
import mrOtherInitiatives from "./locales/mr/other-initiatives.json";
import enOtherInitiatives from "./locales/en/other-initiatives.json";

// Podcast translations
import enPodcast from "./locales/en/podcast.json";
import hiPodcast from "./locales/hi/podcast.json";
import mrPodcast from "./locales/mr/podcast.json";

// Padyapujan translations
import enPadyapujan from "./locales/en/padyapujan.json";
import hiPadyapujan from "./locales/hi/padyapujan.json";
import mrPadyapujan from "./locales/mr/padyapujan.json";

// WorldRecord translations
import enWorldRecord from "./locales/en/worldrecord.json";
import hiWorldRecord from "./locales/hi/worldrecord.json";
import mrWorldRecord from "./locales/mr/worldrecord.json";

// Visarjan Sohala translations
import enVisarjan from "./locales/en/visarjan.json";
import hiVisarjan from "./locales/hi/visarjan.json";
import mrVisarjan from "./locales/mr/visarjan.json";

// Aura Teaser translations
import enAuraTeaser from "./locales/en/aura-teaser.json";
import hiAuraTeaser from "./locales/hi/aura-teaser.json";
import mrAuraTeaser from "./locales/mr/aura-teaser.json";

// Merchandise translations
import enMerchandise from "./locales/en/merchandise.json";
import hiMerchandise from "./locales/hi/merchandise.json";
import mrMerchandise from "./locales/mr/merchandise.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "mr",
    resources: {
      en: {
        navbar: enNavbar,
        flash: enFlash,
        social: enSocial,
        committee: enCommittee,
        education: enEducation,
        theme: enTheme,
        footer: enFooter,
        contact: enContact,
        donate: enDonate,
        awards: enAwards,
        events: enEvents,
        about: enAbout,
        gallery: enGallery,
        live: enLive,
        marquee: enMarquee,
        gunGaurav: enGunGaurav,
        otherInitiatives: enOtherInitiatives,
        podcast: enPodcast,
        padyapujan: enPadyapujan,
        worldrecord: enWorldRecord,
        visarjan: enVisarjan,
        auraTeaser: enAuraTeaser,   // ✅ Added
        merchandise: enMerchandise,
      },
      hi: {
        navbar: hiNavbar,
        flash: hiFlash,
        social: hiSocial,
        committee: hiCommittee,
        education: hiEducation,
        theme: hiTheme,
        footer: hiFooter,
        contact: hiContact,
        donate: hiDonate,
        awards: hiAwards,
        events: hiEvents,
        about: hiAbout,
        gallery: hiGallery,
        live: hiLive,
        marquee: hiMarquee,
        gunGaurav: hiGunGaurav,
        otherInitiatives: hiOtherInitiatives,
        podcast: hiPodcast,
        padyapujan: hiPadyapujan,
        worldrecord: hiWorldRecord,
        visarjan: hiVisarjan,
        auraTeaser: hiAuraTeaser,   // ✅ Added
        merchandise: hiMerchandise,
      },
      mr: {
        navbar: mrNavbar,
        flash: mrFlash,
        social: mrSocial,
        committee: mrCommittee,
        education: mrEducation,
        theme: mrTheme,
        footer: mrFooter,
        contact: mrContact,
        donate: mrDonate,
        awards: mrAwards,
        events: mrEvents,
        about: mrAbout,
        gallery: mrGallery,
        live: mrLive,
        marquee: mrMarquee,
        gunGaurav: mrGunGaurav,
        otherInitiatives: mrOtherInitiatives,
        podcast: mrPodcast,
        padyapujan: mrPadyapujan,
        worldrecord: mrWorldRecord,
        visarjan: mrVisarjan,
        auraTeaser: mrAuraTeaser,   // ✅ Added
        merchandise: mrMerchandise,
      },
    },

    ns: [
      "navbar",
      "flash",
      "social",
      "committee",
      "education",
      "theme",
      "footer",
      "contact",
      "donate",
      "awards",
      "events",
      "about",
      "gallery",
      "live",
      "marquee",
      "gunGaurav",
      "otherInitiatives",
      "podcast",
      "padyapujan",
      "worldrecord",
      "visarjan",
      "auraTeaser",   // ✅ Added
      "merchandise"
    ],

    defaultNS: "navbar",
    interpolation: { escapeValue: false },
  });

export default i18n;

