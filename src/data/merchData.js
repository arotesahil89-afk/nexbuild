// Official merchandise products for Mumbaicha Raja (Ganesh Galli Mandal).
// Names, descriptions & labels are translated via the `merchandise` i18n namespace.

export const products = [
  {
    id: "mr-polo-2025",
    type: "polo",
    price: 330,
    sizes: ["Standard"],
    stock: { "Standard": 0 },
    rating: 4.8,
    reviews: 1,
    color: "#5e6b72", // graphite grey
    colorName: {
      en: "Heritage Grey",
      mr: "हेरिटेज ग्रे",
      hi: "हेरिटेज ग्रे"
    },
    image: "/images/merch/tee-angle.jpg",
    gallery: [
      { src: "/images/merch/tee-angle.jpg", view: "hero" },
      { src: "/images/merch/tee-front.jpg", view: "front" },
      { src: "/images/merch/tee-back.jpg", view: "back" },
      { src: "/images/merch/tee-back-angle.jpg", view: "backAngle" },
      { src: "/images/merch/tee-detail-2.jpg", view: "flatlay" },
    ],
    name: {
      en: "Mumbaicha Raja Official Polo — Heritage Grey",
      mr: "मुंबईचा राजा ऑफिशियल पोलो — हेरिटेज ग्रे",
      hi: "मुंबईचा राजा ऑफिशियल पोलो — हेरिटेज ग्रे"
    },
    tagline: {
      en: "Limited festive stock — Ganeshotsav 2025",
      mr: "मर्यादित फेस्टिव्ह स्टॉक — गणेशोत्सव 2025",
      hi: "सीमित उत्सव स्टॉक — गणेशोत्सव 2025"
    },
    description: {
      en: "Wear the devotion. Carry the legacy of Ganesh Galli.",
      mr: "श्रद्धा परिधान करा. गणेश गल्लीचा वारसा सोबत बाळगा.",
      hi: "श्रद्धा पहनें। गणेश गली की विरासत साथ रखें।"
    },
    highlights: {
      en: [
        "Premium 100% bio-washed cotton — breathable & soft",
        "Hand-finished golden Ganpati crest embroidery",
        "Signature yellow & white sleeve and collar trim",
        "Iconic red 'Mumbaicha Raja' badge on the back"
      ],
      mr: [
        "प्रीमियम 100% बायो-वॉश्ड कॉटन — हवेशीर आणि मऊ",
        "हाताने तयार केलेली सोनेरी गणपती क्रेस्ट भरतकाम",
        "खास पिवळी आणि पांढरी बाही व कॉलर ट्रिम",
        "पाठीवर प्रतिष्ठित लाल 'मुंबईचा राजा' बॅज"
      ],
      hi: [
        "प्रीमियम 100% बायो-वॉश्ड कॉटन — हवादार और मुलायम",
        "हाथ से तैयार सुनहरी गणपति क्रेस्ट कढ़ाई",
        "खास पीली और सफेद आस्तीन व कॉलर ट्रिम",
        "पीठ पर प्रतिष्ठित लाल 'मुंबईचा राजा' बैज"
      ]
    },
    specs: []
  }
];

export const featuredProduct = products[0];

