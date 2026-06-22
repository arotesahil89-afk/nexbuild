import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation("about");

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section className="h-[90vh] w-full bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 relative mt-[64px]">
      <div
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4"
        data-aos="zoom-in"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-[#b91c1c] drop-shadow">
          {t("heroTitle")}
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-800 font-medium">
          {t("heroSubtitle")}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
