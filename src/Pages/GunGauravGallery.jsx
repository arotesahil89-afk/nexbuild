import React, { useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const GunGauravGallery = () => {
    const { t } = useTranslation("gunGaurav");
  const [images] = useState(
    Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      src: `/images/gungaurav/gungaurav-sohala-2025_page-${(i + 1).toString().padStart(4, "0")}.jpg`,
    }))
  );

  return (
    <section className="bg-[#FDF0E9] py-10 px-4 sm:px-8 lg:px-20 min-h-screen mt-[50px]">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-red-700 mb-8">
         {t("heading")}
      </h2>
      <PhotoProvider
        speed={() => 300}
        easing={(type) => (type === 2 ? "cubic-bezier(0.36, 0, 0.66, -0.56)" : "linear")}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <motion.div
              key={img.id}
              className="rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
              whileHover={{ scale: 1.05 }}
            >
              <PhotoView key={img.id} src={img.src}>
                <img
                  src={img.src}
                  alt={`Gun Gaurav Pic ${img.id}`}
                  className=" w-full h-48 sm:h-56 lg:h-64"
                  loading="lazy"
                />
              </PhotoView>
            </motion.div>
          ))}
        </div>
      </PhotoProvider>
    </section>
  );
};

export default GunGauravGallery;
