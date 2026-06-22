// Single official merchandise product for Mumbaicha Raja (Ganesh Galli Mandal).
// Names, descriptions & labels are translated via the `merchandise` i18n namespace.
export const featuredProduct = {
  id: "mr-polo-2025",
  price: 799,
  oldPrice: 1099,
  sizes: ["S", "M", "L", "XL", "XXL"],
  // Mock stock per size — if < 50 show "Only X left" warning
  stock: { S: 45, M: 12, L: 120, XL: 38, XXL: 8 },
  rating: 4.9,
  reviews: 412,
  color: "#5e6b72", // graphite grey
  // Image carousel — every angle of the t-shirt
  gallery: [
    { src: "/images/merch/tee-angle.jpg", view: "hero" },
    { src: "/images/merch/tee-front.jpg", view: "front" },
    { src: "/images/merch/tee-back.jpg", view: "back" },
    { src: "/images/merch/tee-back-angle.jpg", view: "backAngle" },
    { src: "/images/merch/tee-detail-2.jpg", view: "flatlay" },
  ],
  // Large showcase grid ("see every angle")
  angles: [
    { src: "/images/merch/tee-front.jpg", key: "front" },
    { src: "/images/merch/tee-angle.jpg", key: "threeQuarter" },
    { src: "/images/merch/tee-back.jpg", key: "back" },
    { src: "/images/merch/tee-back-angle.jpg", key: "backAngle" },
  ],
};

// Backwards compatibility for any older imports.
export const products = [featuredProduct];
