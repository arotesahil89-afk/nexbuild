import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaSpotify,
  FaWhatsapp,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import HeroSection from "../Components/HeroSection/HeroSection.jsx";

const ContactPage = () => {
  const { t } = useTranslation("contact");

  return (
    <>
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 pt-12 pb-20">
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#b91c1c] text-center mb-10">
          {t("title")}
        </h1>

        {/* Info + Map Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border border-red-100">
            <div>
              <h2 className="text-xl font-semibold text-[#b91c1c] mb-2">
                {t("addressTitle")}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {t("address")}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#b91c1c] mb-2">
                {t("phoneTitle")}
              </h2>
              <p className="text-gray-700">{t("phone")}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#b91c1c] mb-2">
                {t("emailTitle")}
              </h2>
              <p className="text-gray-700">{t("email")}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#b91c1c] mb-2">
                {t("websiteTitle")}
              </h2>
              <p className="text-gray-700">{t("website")}</p>
              <p className="text-gray-700">{t("website2")}</p>
              <p className="text-gray-700">{t("website3")}</p>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden shadow-md border border-red-100">
            <iframe
              title="Ganesh Galli Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.577535433182!2d72.83493497394876!3d18.994256154536192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf003122a343%3A0x3baf46081576799!2sMumbai%20Cha%20Raja%2C%20Ganesh%20Galli!5e0!3m2!1sen!2sin!4v1747645285664!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ minHeight: "350px", border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Social & Note */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-[#b91c1c] text-center mb-6">
            {t("connectTitle")}
          </h2>

          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <a
            target="_blank"
              href="https://www.youtube.com/@MumbaichaRaja22"
              className="flex items-center gap-3 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-full shadow transition no-underline"
            >
              <FaYoutube className="text-xl" />
              <span className="font-medium hidden sm:inline">YouTube</span>
            </a>

            <a
            target="_blank"
              href="https://www.facebook.com/GaneshGalli"
              className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full shadow transition no-underline"
            >
              <FaFacebookF className="text-xl" />
              <span className="font-medium hidden sm:inline">Facebook</span>
            </a>

            <a
            target="_blank"
              href="https://www.instagram.com/raja_mumbaicha"
              className="flex items-center gap-3 bg-pink-50 hover:bg-pink-100 text-pink-600 px-4 py-2 rounded-full shadow transition no-underline"
            >
              <FaInstagram className="text-xl" />
              <span className="font-medium hidden sm:inline">Instagram</span>
            </a>

            <a
            target="_blank"
              href="https://www.linkedin.com/company/mumbaicharaja-ganeshgalli1928"
              className="flex items-center gap-3 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-full shadow transition no-underline"
            >
              <FaLinkedinIn className="text-xl" />
              <span className="font-medium hidden sm:inline">LinkedIn</span>
            </a>

            <a
            target="_blank"
              href="https://whatsapp.com/channel/0029Vab1xHdBlHpfRocBSy0L"
              className="flex items-center gap-3 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full shadow transition no-underline"
            >
              <FaWhatsapp className="text-xl" />
              <span className="font-medium hidden sm:inline">Whatsapp</span>
            </a>
          </div>

          {/* <p className="text-gray-600 max-w-2xl mx-auto text-center">
            {t("note")}
          </p> */}
        </div>
      </div>
    </>
  );
};

export default ContactPage;
