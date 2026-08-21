import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import useAwardsLoader from "../../loaders/AwardsLoader";

const AwardsSlider = ({ lang }) => {
  const { t, i18n } = useTranslation("awards");
  const fallbackAwards = t("awards", { returnObjects: true }) || [];
  const currentLang = lang || i18n.language || "mr";
  const { awards, loading } = useAwardsLoader(currentLang);

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: true,
  };

  const displayHeading = awards?.title || t("heading") || "Awards & Honors";
  const displayItems =
    awards?.items && awards.items.length > 0
      ? awards.items
      : Array.isArray(fallbackAwards)
      ? fallbackAwards
      : [];

  if (loading && displayItems.length === 0)
    return (
      <div className="text-center py-10 text-gray-600">Loading awards...</div>
    );

  if (displayItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="m-5 px-4 py-12 bg-gradient-to-r from-yellow-50 via-red-50 to-rose-100 rounded-3xl shadow-lg max-w-5xl mx-auto"
    >
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-center text-red-700 mb-6"
      >
        {displayHeading}
      </motion.h2>

      <Slider {...settings}>
        {displayItems.map((award, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="backdrop-blur-md bg-white/80 border border-red-100 p-6 rounded-xl shadow-md min-h-[180px] flex items-center justify-center text-center text-gray-800 text-lg sm:text-xl transition-all duration-300 hover:shadow-lg">
              {typeof award === "string" ? award : award.text || award.title}
            </div>
          </motion.div>
        ))}
      </Slider>
    </motion.div>
  );
};

export default AwardsSlider;
