import React from "react";
import { FaFilePdf } from "react-icons/fa";
import { HiArrowDownTray } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const GunGauravSohala = () => {
  const { t } = useTranslation("gunGaurav");

  return (
    <section className="bg-gradient-to-b from-red-50 to-white py-16 px-4 sm:px-6 lg:px-8 text-center">
      <div className="bg-white shadow-2xl rounded-xl p-10 max-w-3xl mx-auto border-t-8 border-red-600">
        <div className="flex flex-col items-center space-y-6">
          <FaFilePdf className="text-red-600 text-6xl animate-bounce" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-red-700 border-b-2 border-red-200 pb-1">
            {t("heading")}
          </h2>
          <p className="text-gray-800 leading-relaxed text-base sm:text-lg">
            {t("description")}
          </p>
          <p className="italic text-red-600 text-sm sm:text-base">
            {t("tagline")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a
              href="/pdf/gungaurav-sohala-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-300 shadow-md no-underline"
            >
              📄 {t("viewPdf")}
            </a>
            <a
              href="/pdf/gungaurav-sohala-2025.pdf"
              download
              className="flex items-center justify-center gap-2 text-red-700 border-2 border-red-700 px-6 py-3 rounded-lg hover:bg-red-100 transition duration-300 shadow-md"
            >
              <HiArrowDownTray className="text-xl" /> {t("download")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GunGauravSohala;

