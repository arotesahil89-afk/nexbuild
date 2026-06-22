import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const images = [
  "https://www.mumbaicharaja.co/gallery-image/Mumbai%20Cha%20Raja/MumbaichaRaja2025.jpg",
  "https://www.mumbaicharaja.co/gallery-image/Lalbaug%20Chi%20Mata/img2.jpeg",
  // "https://www.mumbaicharaja.co/gallery-image/Mumbai%20Cha%20Raja/MumbaichaRaja1928.jpg",
  "https://www.mumbaicharaja.co/gallery-image/Lalbaug%20Chi%20Mata/img4.jpeg",
  "https://www.mumbaicharaja.co/gallery-image/Mumbai%20Cha%20Raja/MumbaichaRaja2024.jpg",
  "https://www.mumbaicharaja.co/gallery-image/Lalbaug%20Chi%20Mata/img3.jpeg",
  "https://www.mumbaicharaja.co/gallery-image/Mumbai%20Cha%20Raja/MumbaichaRaja2023.jpg",
  "https://www.mumbaicharaja.co/gallery-image/Lalbaug%20Chi%20Mata/img1.jpeg",
];

const GalleryPreview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("gallery");

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="px-4 md:px-16 py-12 bg-gray-50"
    >
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-red-700 text-center mb-6"
      >
        {t("previewTitle")}
      </motion.h2>

      {/* Masonry Layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {images.map((src, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-xl bg-white shadow-md break-inside-avoid"
          >
            <img
              src={src}
              alt={`preview-${idx}`}
              className="w-full h-auto object-contain"
            />
          </motion.div>
        ))}
      </div>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-center mt-8"
      >
        <button
          onClick={() => navigate("/gallery")}
          className="px-6 py-2 text-white bg-red-700 hover:bg-red-800 transition rounded-full text-lg shadow-lg"
        >
          {t("viewFullGallery")}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default GalleryPreview;
