import { useEffect, useState } from "react";

const images = [
  "https://www.mumbaicharaja.co/images/introbg.jpg",
  "https://www.mumbaicharaja.co/devi-2023.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://www.mumbaicharaja.co/gallery-images/ganeshotsav/MumbaichaRaja2024.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://www.mumbaicharaja.co/gallery-images/ganeshotsav/MumbaichaRaja2023_1.jpg?auto=compress&cs=tinysrgb&h=650&w=940", // ✅ fixed URL
];

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-16 relative w-full h-[calc(100vh-64px)]">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Slide ${index + 1}`}
          className={`absolute w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full border border-white transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-125" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

// const images = [
//   "https://www.mumbaicharaja.co/images/introbg.jpg",
//   "https://www.mumbaicharaja.co/devi-2023.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
//   "https://www.mumbaicharaja.co/gallery-images/ganeshotsav/MumbaichaRaja2024.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
//   "https://www.mumbaicharaja.co/gallery-images/ganeshotsav/MumbaichaRaja2023_1.jpg?auto=compress&cs=tinysrgb&h=650&w=940", // ✅ fixed URL
// ];
