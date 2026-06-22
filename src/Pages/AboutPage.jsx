import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation("about");

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="bg-[#fffdf4] text-gray-800 font-serif overflow-x-hidden">
      {/* Hero Section */}
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

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 space-y-24">
        {/* History Section */}
        <section data-aos="fade-up">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl font-bold text-[#b91c1c]">
              {t("history.title")}
            </h2>
            {[...Array(5)].map((_, i) => (
              <p key={i} className="text-left">{t(`history.paragraph${i}`)}</p>
            ))}
          </div>
        </section>

    {/* Overview Section */}
<section data-aos="fade-up">
  <div className="max-w-4xl mx-auto px-4 space-y-6">
    {/* Centered and slightly smaller image */}
    <div className="flex justify-center mb-8">
      <img
        src="/images/Vishwavikkrami Mumbaicha Raja.png"
        alt="Mandap Image"
        className="w-full max-w-xs rounded-2xl transition-transform duration-300 hover:scale-105"
      />
    </div>

    {/* Left-aligned overview text */}
    {[...Array(5)].map((_, i) => (
      <p key={i} className="text-left text-gray-800">
        {t(`overview.paragraph${i}`)}
      </p>
    ))}
  </div>
</section>




        {/* Navratri Utsav Section */}
        <section className="py-20" data-aos="fade-up">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center mb-8">
              <img
                src="https://www.mumbaicharaja.co/images/navratri-logo.png"
                alt="Navratri Utsav"
                className="w-full max-w-md rounded-2xl  transition-transform duration-300 hover:scale-105"
              />
            </div>
            {t("navratri.sections", { returnObjects: true }).map((item, i) => (
              <div key={i} className="mb-8">
                <h3 className="text-xl font-semibold text-[#b91c1c] mb-2 text-left">{item.title}</h3>
                <p className="text-gray-800 text-left">{item.paragraph}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sculptor Section */}
        <section className="py-16" data-aos="fade-up">
          <div className="max-w-4xl mx-auto px-4 text-left">
            <img
              src="https://www.mumbaicharaja.co/images/veling-pic.jpg"
              alt="Dinanath Weling"
              className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-8 transition-transform duration-300 hover:scale-105"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-[#b91c1c] mb-6">
              {t("sculptor.title")}
            </h2>
            <div className="text-lg text-gray-800 leading-loose space-y-6">
              {[...Array(5)].map((_, i) => (
                <p key={i} className="text-left">{t(`sculptor.paragraph${i}`)}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Cultural Impact */}
        <section className="py-16" data-aos="fade-up">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#b91c1c] mb-8 text-left">
              {t("impact.title")}
            </h2>
            <div className="space-y-10 text-lg text-gray-800 leading-relaxed">
              {[...Array(13)].map((_, i) => (
                <div className="border-l-4 border-[#b91c1c] pl-4" key={i}>
                  <h3 className="font-semibold text-xl text-[#b91c1c]">{t(`impact.item${i}.title`)}</h3>
                  <p className="text-left">{t(`impact.item${i}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer
        className="bg-[#7f1d1d] text-center py-6 text-white text-sm"
        data-aos="fade-in"
      >
        {t("footerText")}
      </footer>
    </div>
  );
};

export default AboutPage;
