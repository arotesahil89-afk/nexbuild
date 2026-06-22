import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const images = [
  "https://www.mumbaicharaja.co/images/introbg.jpg", // ✅ fixed URL
];

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className=" relative w-full h-[calc(100vh-64px)] overflow-hidden">
      {images.map((img, index) => (
        <motion.img
          key={index}
          src={img}
          alt={`Slide ${index + 1}`}
          className={`absolute w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          initial={{ scale: 1 }}
          animate={{ scale: index === currentIndex ? 1.2 : 1 }}
          transition={{ duration: 9, ease: "easeOut" }}
        />
      ))}

      {/* Dot Indicators (optional) */}
      {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full border border-white transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-125" : "bg-gray-400"
            }`}
          />
        ))}
      </div> */}
    </div>
  );
};

export default HeroBanner;
