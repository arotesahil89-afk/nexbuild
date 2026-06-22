import React from "react";
import { useTranslation } from "react-i18next";
import HeroSection from "../Components/HeroSection/HeroSection";

const DonatePage = () => {
  const { t } = useTranslation("donate"); // Use the 'donate' namespace

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        backgroundImage=""
        height="60vh"
      />

      {/* Page Heading */}
      <div className="text-center mt-12 mb-8 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-red-700">
          {t("heading")}
        </h2>
        <p className="text-gray-700 mt-2 text-lg">{t("subheading")}</p>
      </div>

      {/* Donation Info Section */}

<section className="pb-20 px-4 md:px-10">
  <div className="flex justify-center">
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg border border-red-100 p-6 md:p-10">
      <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">
        {t("bankTitle")}
      </h3>
      <ul className="text-gray-800 space-y-3 text-base leading-relaxed">
        <li>
          🔸 <strong>{t("nameLabel")}:</strong> Lalbaug Sarvajanik Utsav Mandal
        </li>
        <li>
          🔸 <strong>{t("bankLabel")}:</strong> Bank of Baroda
        </li>
        <li>
          🔸 <strong>{t("accountLabel")}:</strong> 33380100002204
        </li>
        <li>
          🔸 <strong>{t("ifscLabel")}:</strong> BARB0LALBAU [Fifth character is zero]
        </li>
      </ul>
    </div>
  </div>
</section>

    </>
  );
};

export default DonatePage;
