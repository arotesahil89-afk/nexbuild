import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InitiativeCard from "../Components/InitiativeCard/InitiativeCard.jsx";

const SocialInitiativesPage = () => {
  const { t } = useTranslation("social");

  // 📆 Sort years descending and add 'other' at end
  const rawYears = t("years", { returnObjects: true });
  const years = [...rawYears.sort((a, b) => b - a), "other"];
  const data = t("data", { returnObjects: true });

  const [selectedYear, setSelectedYear] = useState(years[0]);

  const initiatives = data[selectedYear] || [];

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[#b91c1c] text-center mb-10">
         {t("title")}
      </h1>
      <p className="text-center text-gray-600 ">{t("description")}</p>

      {/* Year Selector */}
      <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-1 mb-8 animate-fadeIn">
        <label
          htmlFor="year-select"
          className="text-sm font-medium text-gray-700 md:mr-2"
        >
          {t("selectYear")}:
        </label>
        <div className="relative w-full md:w-48">
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block w-full appearance-none border border-gray-300 bg-white px-4 py-2 pr-10 rounded-md text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year === "other" ? t("other") : year}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 011.08 1.04l-4.25 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Initiatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initiatives.map((item, index) => (
          <InitiativeCard key={index} {...item} />
        ))}
      </div>

      
    </div>
  );
};

export default SocialInitiativesPage;
