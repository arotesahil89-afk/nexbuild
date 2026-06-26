// Official merchandise products for Mumbaicha Raja (Ganesh Galli Mandal).
// Names, descriptions & labels are translated via the `merchandise` i18n namespace.

export const products = [
  {
    id: "mr-polo-2025",
    type: "polo",
    price: 799,
    oldPrice: 1099,
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 45, M: 12, L: 120, XL: 38, XXL: 8 },
    rating: 4.9,
    reviews: 412,
    color: "#5e6b72", // graphite grey
    colorName: "Heritage Grey",
    image: "/images/merch/tee-angle.jpg",
    gallery: [
      { src: "/images/merch/tee-angle.jpg", view: "hero" },
      { src: "/images/merch/tee-front.jpg", view: "front" },
      { src: "/images/merch/tee-back.jpg", view: "back" },
      { src: "/images/merch/tee-back-angle.jpg", view: "backAngle" },
      { src: "/images/merch/tee-detail-2.jpg", view: "flatlay" },
    ],
    nameKey: "productName",
    taglineKey: "tagline",
    descKey: "descriptionBody",
    highlights: [
      "highlights.fabric",
      "highlights.embroidery",
      "highlights.trim",
      "highlights.badge",
    ],
    specs: [
      { key: "material", valueKey: "specs.materialValue" },
      { key: "fit", valueKey: "specs.fitValue" },
      { key: "collar", valueKey: "specs.collarValue" },
      { key: "care", valueKey: "specs.careValue" },
    ],
  },
  {
    id: "mr-keychain-2025",
    type: "keychain",
    price: 199,
    oldPrice: 299,
    sizes: ["Standard"],
    stock: { Standard: 150 },
    rating: 4.8,
    reviews: 89,
    color: "#D4AF37", // gold
    colorName: "24K Gold Plated",
    image: "/images/merch/keychain.png",
    gallery: [
      { src: "/images/merch/keychain.png", view: "hero" },
    ],
    nameKey: "keychain.name",
    taglineKey: "keychain.tagline",
    descKey: "keychain.description",
    highlights: [
      "keychain.highlights.1",
      "keychain.highlights.2",
      "keychain.highlights.3",
      "keychain.highlights.4",
    ],
    specs: [
      { key: "material", valueKey: "keychain.specs.material" },
      { key: "size", valueKey: "keychain.specs.size" },
      { key: "weight", valueKey: "keychain.specs.weight" },
      { key: "packaging", valueKey: "keychain.specs.packaging" },
    ],
  },
  {
    id: "mr-mug-2025",
    type: "mug",
    price: 299,
    oldPrice: 449,
    sizes: ["Standard"],
    stock: { Standard: 65 },
    rating: 4.7,
    reviews: 142,
    color: "#5e6b72", // graphite grey
    colorName: "Heritage Grey",
    image: "/images/merch/mug.png",
    gallery: [
      { src: "/images/merch/mug.png", view: "hero" },
    ],
    nameKey: "mug.name",
    taglineKey: "mug.tagline",
    descKey: "mug.description",
    highlights: [
      "mug.highlights.1",
      "mug.highlights.2",
      "mug.highlights.3",
      "mug.highlights.4",
    ],
    specs: [
      { key: "material", valueKey: "mug.specs.material" },
      { key: "capacity", valueKey: "mug.specs.capacity" },
      { key: "finish", valueKey: "mug.specs.finish" },
      { key: "care", valueKey: "mug.specs.care" },
    ],
  },
  {
    id: "mr-bag-2025",
    type: "bag",
    price: 349,
    oldPrice: 499,
    sizes: ["Standard"],
    stock: { Standard: 40 },
    rating: 4.9,
    reviews: 73,
    color: "#F5F5DC", // natural beige
    colorName: "Natural Beige",
    image: "/images/merch/bag.png",
    gallery: [
      { src: "/images/merch/bag.png", view: "hero" },
    ],
    nameKey: "bag.name",
    taglineKey: "bag.tagline",
    descKey: "bag.description",
    highlights: [
      "bag.highlights.1",
      "bag.highlights.2",
      "bag.highlights.3",
      "bag.highlights.4",
    ],
    specs: [
      { key: "material", valueKey: "bag.specs.material" },
      { key: "size", valueKey: "bag.specs.size" },
      { key: "capacity", valueKey: "bag.specs.capacity" },
      { key: "care", valueKey: "bag.specs.care" },
    ],
  },
];

export const featuredProduct = products[0];
