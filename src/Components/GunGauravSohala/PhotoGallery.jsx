import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const images = Array.from({ length: 33 }, (_, i) => ({
  id: i + 1,
  src: `/images/gallery/img-${i + 1}.jpg`, // your image path
}));

const PhotoGallery = () => {
  return (
    <section className="py-16 px-4 sm:px-8 bg-gradient-to-b from-white to-red-50">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-red-700 mb-2">
          📸 गॅलरी
        </h2>
        <p className="text-gray-600 text-base sm:text-lg">
          गणेशोत्सवातील काही खास क्षण
        </p>
      </div>

      <PhotoProvider>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
            <PhotoView key={image.id} src={image.src}>
              <img
                src={image.src}
                alt={`gallery-${image.id}`}
                className="rounded-xl shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer object-cover aspect-square"
              />
            </PhotoView>
          ))}
        </div>
      </PhotoProvider>
    </section>
  );
};

export default PhotoGallery;
