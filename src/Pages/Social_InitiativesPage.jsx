// import React, { useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/pagination";

// const initiatives = [
//   {
//     title: "रक्तदान शिबिर",
//     description:
//       "गणेशोत्सवाच्या दरम्यान आयोजित करण्यात आलेल्या रक्तदान शिबिरात अनेक भक्तांनी सहभाग घेतला. या उपक्रमामुळे गरजू रुग्णांना मदत झाली. रक्तदान हे जीवनदान असून मंडळाने दरवर्षी हा उपक्रम राबवून अनेकांचे जीव वाचवले आहेत.",
//     images: ["/images/raktadan1.jpg", "/images/raktadan2.jpg"],
//   },
//   {
//     title: "आरोग्य तपासणी शिबिर",
//     description:
//       "नियमित आरोग्य तपासणी शिबिराच्या माध्यमातून नागरिकांच्या आरोग्याची काळजी घेतली जाते. डॉक्टरांच्या मार्गदर्शनाखाली मोफत तपासण्या केल्या जातात. यामध्ये रक्तदाब, शुगर, दंत तपासणी, डोळ्यांची तपासणी यांचा समावेश होतो.",
//     images: ["/images/aarogya1.jpg", "/images/aarogya2.jpg"],
//   },
//   {
//     title: "शालेय साहित्य वाटप",
//     description:
//       "गरजू विद्यार्थ्यांना शालेय साहित्य वाटप करून त्यांच्या शिक्षणाला प्रोत्साहन दिले जाते. मंडळाचे सदस्य शाळांमध्ये जाऊन विद्यार्थ्यांना वह्या, पुस्तके, पेन, कंपास बॉक्स आणि इतर साहित्य वितरित करतात.",
//     images: ["/images/school1.jpg", "/images/school2.jpg"],
//   },
// ];

// const InitiativeCard = ({ title, description, images }) => {
//   const [expanded, setExpanded] = useState(false);
//   const toggleDescription = () => setExpanded(!expanded);

//   const shortText = description.slice(0, 100);
//   const showToggle = description.length > 100;

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
//       <Swiper
//         pagination={{ clickable: true }}
//         modules={[Pagination]}
//         className="w-full h-64"
//       >
//         {images.map((img, idx) => (
//           <SwiperSlide key={idx}>
//             <img
//               src={img}
//               alt={`Slide ${idx}`}
//               className="w-full h-64 object-cover"
//             />
//           </SwiperSlide>
//         ))}
//       </Swiper>

//       <div className="p-5">
//         <h2 className="text-xl font-semibold text-[#b91c1c] mb-2">{title}</h2>
//         <p className="text-gray-700 leading-relaxed">
//           {expanded ? description : shortText + "..."}
//         </p>
//         {showToggle && (
//           <button
//             onClick={toggleDescription}
//             className="mt-3 inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm hover:bg-red-200 transition"
//           >
//             {expanded ? "कमी दाखवा" : "अधिक वाचा"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// const SocialInitiativesPage = () => {
//   return (
//     <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
//       <h1 className="text-3xl md:text-4xl font-bold text-[#b91c1c] text-center mb-10">
//         🙌 सामाजिक उपक्रम
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//         {initiatives.map((item, index) => (
//           <InitiativeCard key={index} {...item} />
//         ))}
//       </div>

//       <p className="text-center text-gray-600 mt-12">
//         समाजहितासाठी आम्ही नेहमी पुढे आहोत. 🙏
//       </p>
//     </div>
//   );
// };

// export default SocialInitiativesPage;
