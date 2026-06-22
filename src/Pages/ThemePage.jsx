import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";


const years = [2025, 2024];


const ThemePage = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { t } = useTranslation("theme");

  const decoration = t(`years.${selectedYear}`, { returnObjects: true });
  const title = decoration?.title || t("title");
  const description = decoration?.description;
  const images = decoration?.images || [];
  const videos = decoration?.videos || [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar Header (common) */}
      <aside className="w-full md:w-56 bg-red-700 text-white py-4 px-3 md:sticky md:top-0 md:self-start md:h-screen">
        <h2 className="text-xl font-bold mb-4 text-center">{t("title")}</h2>

        {/* Small screen: horizontal scroll */}
        <div className="flex md:hidden overflow-x-auto space-x-2 scrollbar-thin pb-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`text-sm font-semibold py-2 px-3 rounded-md transition text-center whitespace-nowrap ${
                year === selectedYear
                  ? "bg-yellow-400 text-red-900 shadow-lg"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Big screen: vertical scroll with fixed height even for 2 years */}
        <div
          className="hidden md:flex flex-col overflow-y-auto space-y-2 scrollbar-thin flex-1 justify-start min-h-[calc(100vh-6rem)]"
          style={{ maxHeight: "calc(100vh - 6rem)" }}
        >
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`text-sm font-semibold py-2 px-3 rounded-md transition text-center ${
                year === selectedYear
                  ? "bg-yellow-400 text-red-900 shadow-lg"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full py-8 sm:pt-4 md:pt-24 px-4 md:px-8 lg:px-12 text-center overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-red-700">
          {selectedYear} - {title}
        </h1>

        {description ? (
          <>
            <p className="mb-6 text-gray-700 text-lg">{description}</p>

            {/* Videos */}
            {videos.length > 0 && (
              <div className="space-y-6 mb-10">
                {videos.map((videoUrl, idx) => (
                  <div
                    key={idx}
                    className="aspect-video w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-md"
                  >
                    <iframe
                      src={videoUrl}
                      title={`Decoration Video ${selectedYear} - ${idx + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                ))}
              </div>
            )}

            {/* Images */}
            {images.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-full h-64 sm:h-72 md:h-80 rounded-lg overflow-hidden shadow-md cursor-pointer"
                      onClick={() => {
                        setLightboxIndex(idx);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={img}
                        alt={`Decoration ${selectedYear} - ${idx + 1}`}
                        className="w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>

                {/* Lightbox */}
                <Lightbox
                  open={lightboxOpen}
                  close={() => setLightboxOpen(false)}
                  index={lightboxIndex}
                  slides={images.map((src) => ({ src }))}
                />
              </>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">{t("noData")}</p>
        )}
      </main>
    </div>
  );
};

export default ThemePage;
