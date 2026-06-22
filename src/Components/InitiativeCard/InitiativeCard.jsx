import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const InitiativeCard = ({ title, description, images = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleDescription = () => setExpanded(!expanded);
  const { t } = useTranslation("social");

  const shortText = description.slice(0, 100);
  const showToggle = description.length > 100;

  return (
    <div className="bg-white rounded-lg shadow-sm max-w-[320px] mx-auto overflow-hidden hover:shadow-lg transition duration-300">
      {images.length > 0 && (
        <div className="relative">
          <Swiper
            pagination={{ clickable: true }}
            navigation={{ nextEl: ".custom-next", prevEl: ".custom-prev" }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            modules={[Pagination, Navigation, Autoplay]}
            className="aspect-[4/3] rounded-t-lg"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt={`Slide ${idx}`}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute top-1/2 -translate-y-1/2 w-full px-3 z-10 flex justify-between">
            <div className="custom-prev bg-white/70 hover:bg-white text-[#b91c1c] rounded-full p-1 shadow cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="custom-next bg-white/70 hover:bg-white text-[#b91c1c] rounded-full p-1 shadow cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="p-3">
        <h2 className="text-base font-semibold text-[#b91c1c] mb-1">{title}</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {expanded ? description : shortText + "..."}
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
