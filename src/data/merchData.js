// Official merchandise product for Mumbaicha Raja (Ganesh Galli Mandal).
// Single product containing official T-shirt banner images (Banner 07 kept at last position).

export const products = [
  {
    id: "mr-tshirt-2025",
    type: "tshirt",
    price: 330,
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { "S": 50, "M": 100, "L": 120, "XL": 80, "XXL": 40 },
    rating: 4.9,
    reviews: 582,
    color: "#E19313",
    colorName: {
      en: "",
      mr: "",
      hi: ""
    },
    image: "/tshirt/banner-02.jpg",
    gallery: [
      { src: "/tshirt/banner-02.jpg", view: "banner02" },
      { src: "/tshirt/banner-03.jpg", view: "banner03" },
      { src: "/tshirt/banner-04.jpg", view: "banner04" },
      { src: "/tshirt/banner-05.jpg", view: "banner05" },
      { src: "/tshirt/banner-06.jpg", view: "banner06" },
      { src: "/tshirt/banner-07.jpg", view: "banner07" }
    ],
    name: {
      en: "Mumbaicha Raja Official T-Shirt",
      mr: "मुंबईचा राजा ऑफिशियल टी-शर्ट",
      hi: "मुंबईचा राजा ऑफिशियल टी-शर्ट"
    },
    tagline: {
      en: "Devotional Edition — Ganeshotsav 2026",
      mr: "भक्ती आवृत्ती — गणेशोत्सव २०२६",
      hi: "भक्ति संस्करण — गणेशोत्सव २०२६"
    },
    description: {
      en: "Wear the devotion. Carry the legacy of Ganesh Galli Mandal (Est. 1928) with our official T-Shirt edition.",
      mr: "श्रद्धा परिधान करा. गणेश गल्लीचा ९८ वर्षांचा वारसा या ऑफिशियल टी-शर्ट सोबत बाळगा.",
      hi: "श्रद्धा पहनें। गणेश गली की ९८ वर्षों की विरासत इस ऑफिशियल टी-शर्ट के साथ रखें।"
    },
    highlights: {
      en: [
        "Premium 100% bio-washed breathable cotton — soft & durable",
        "Iconic Ganesh Galli Mandal calligraphic graphics",
        "Sweat-absorbent fabric perfect for Wari & Visarjan Miravnuk",
        "Official Ganesh Galli Mandal authenticity badge"
      ],
      mr: [
        "प्रीमियम १००% बायो-वॉश्ड हवेशीर सुती कापड — मऊ आणि टिकाऊ",
        "प्रतिष्ठित गणेश गल्ली मराठी कॅलिग्राफी प्रिंट",
        "वारी व विसर्जन मिरवणुकीसाठी घाम शोषून घेणारे कापड",
        "गणेश गल्ली मंडळाचे अधिकृत प्रामाणिकपणा बॅज"
      ],
      hi: [
        "प्रीमियम १००% बायो-वॉश्ड हवादार कॉटन कपड़ा — मुलायम और टिकाऊ",
        "प्रतिष्ठित गणेश गली मराठी सुलेखन प्रिंट",
        "वारी और विसर्जन जुलूस के लिए अनुकूल कपड़ा",
        "गणेश गली मंडल का आधिकारिक प्रामाणिकता बैज"
      ]
    },
    specs: [
      { key: "Material", value: { en: "100% Combed Bio-washed Cotton", mr: "१००% कॉम्ब्ड बायो-वॉश्ड कॉटन", hi: "१००% कॉम्ब्ड बायो-वॉश्ड कॉटन" } },
      { key: "Fit", value: { en: "Regular Devotional Comfort Fit", mr: "रेगुलर भक्ती कम्फर्ट फिट", hi: "रेगुलर भक्ति कम्फर्ट फिट" } },
      { key: "Neck", value: { en: "Durable Crew Neck", mr: "टिकाऊ क्रू नेक", hi: "टिकाऊ क्रू नेक" } },
      { key: "Sleeve", value: { en: "Half Sleeve", mr: "हाफ स्लीव्ह", hi: "हाफ स्लीव" } }
    ]
  }
];

export const featuredProduct = products[0];
