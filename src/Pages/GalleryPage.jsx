import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const ganpatiYears = [
  1928,2025, 2024,2023, 2022,2021,2020, 2019,2018,2017,2016,2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991,
  1990, 1989, 1988, 1987, 1986, 1985, 1984, 1983, 1982, 1981, 1980, 1979, 1978,
  1977,
];

const deviYears = [];

for (let i = 1; i <= 17; i++) {
  deviYears.push(i);
}

const celebratyYears = [];

for (let i = 31; i <= 123; i++) {
  celebratyYears.push(i);
}

// Dynamically generate Ganpati images
const ganpatiImages = ganpatiYears.map((year) => ({
  category: "Ganpati",
  src: `http://www.mumbaicharaja.co/gallery-image/Mumbai Cha Raja/MumbaichaRaja${year}.jpg`,
}));

// Dynamically generate Devi images
const deviImages = deviYears.map((num) => ({
  category: "Devi",
  src: `https://www.mumbaicharaja.co/gallery-image/Lalbaug Chi Mata/img${num}.jpeg`,
}));

// Dynamically generate Celebraty images
const celebrityImages = celebratyYears.map((num) => ({
  category: "Celebrity",
  src: `https://www.mumbaicharaja.co/gallery-image/Celebrity/celeb${num}.jpg`,
}));

const images = [...ganpatiImages, ...deviImages, ...celebrityImages];

const GalleryPage = () => {
  const { t } = useTranslation("gallery");
  const [selectedCategory, setSelectedCategory] = useState("Ganpati");
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredImages = images.filter(
    (img) => img.category === selectedCategory
  );

  const categories = [
    { key: "Ganpati", label: t("category.ganpati") },
    { key: "Devi", label: t("category.devi") },
    { key: "Celebrity", label: t("category.celebrity") },
  ];

  return (
    <div className="pt-24 px-4 md:px-16 bg-white min-h-screen">
      <h2 className="text-3xl font-bold text-red-700 text-center mb-6">
        {t("title")}
      </h2>

      {/* Category Filter */}
      <div className="flex justify-center gap-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              selectedCategory === cat.key
                ? "bg-red-700 text-white"
                : "bg-white text-red-700 border border-red-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry Image Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {filteredImages.map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-xl shadow-md break-inside-avoid cursor-pointer"
            onClick={() => {
              setOpen(true);
              setCurrentIndex(idx);
            }}
          >
            <img
              src={img.src}
              alt={`img-${idx}`}
              className="w-full h-auto object-contain"
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox Viewer */}
      {open && (
        <div className="z-[9999] relative">
          <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={currentIndex}
            slides={filteredImages.map((img) => ({ src: img.src }))}
          />
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
