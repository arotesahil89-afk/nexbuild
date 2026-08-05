import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const FALLBACK_IMAGE = "/images/aboutImg.jpg";
const SECONDARY_FALLBACK = "/images/introbg.jpg";

const InitiativeCard = ({ title, description, images = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleDescription = () => setExpanded(!expanded);
  const { t } = useTranslation("social");

  const shortText = description ? description.slice(0, 100) : "";
  const showToggle = description && description.length > 100;

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const renderBanner = () => {
    if (!images || images.length === 0) {
      return (
        <div className="relative aspect-[4/3] rounded-t-lg overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-red-800 flex items-center justify-center p-1">
          <img
            src={FALLBACK_IMAGE}
            alt={title || "Mandal Initiative"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = SECONDARY_FALLBACK;
            }}
            className="w-full h-full object-contain rounded-t-lg opacity-90 transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 pointer-events-none">
            <span className="text-[11px] font-bold tracking-wide text-yellow-300 bg-black/60 px-2.5 py-1 rounded-full border border-yellow-400/30 backdrop-blur-xs">
              🚩 मुंबईचा राजा उपक्रम
            </span>
          </div>
        </div>
      );
    }

    if (images.length === 1) {
      return (
        <div className="relative aspect-[4/3] rounded-t-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1">
          <img
            src={images[0]}
            alt={title}
            onError={handleImageError}
            className="w-full h-full object-contain rounded-t-lg transition-transform duration-500 hover:scale-105"
          />
        </div>
      );
    }

    return (
      <div className="relative">
        <Swiper
          pagination={{ clickable: true }}
          navigation={{ nextEl: ".custom-next", prevEl: ".custom-prev" }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          modules={[Pagination, Navigation, Autoplay]}
          className="aspect-[4/3] rounded-t-lg bg-gray-50"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx} className="flex items-center justify-center p-1">
              <img
                src={img}
                alt={`Slide ${idx}`}
                onError={handleImageError}
                className="w-full h-full object-contain rounded-t-lg"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute top-1/2 -translate-y-1/2 w-full px-3 z-10 flex justify-between pointer-events-none">
          <div className="custom-prev pointer-events-auto bg-white/80 hover:bg-white text-[#b91c1c] rounded-full p-1 shadow cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="custom-next pointer-events-auto bg-white/80 hover:bg-white text-[#b91c1c] rounded-full p-1 shadow cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm max-w-[320px] mx-auto overflow-hidden hover:shadow-lg transition duration-300">
      {renderBanner()}

      <div className="p-3">
        <h2 className="text-base font-semibold text-[#b91c1c] mb-1">{title}</h2>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {expanded ? description : shortText + (showToggle ? "..." : "")}
        </p>
        {showToggle && (
          <button
            onClick={toggleDescription}
            className="mt-2 inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs hover:bg-red-200 transition"
          >
            {expanded ? t("readLess") : t("readMore")}
          </button>
        )}
      </div>
    </div>
  );
};

export default InitiativeCard;
