import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const podcastSeasons = [
  {
    id: "season1",
    titleKey: "season1",
    videos: [
      "https://www.youtube.com/embed/Vek2v-P37TM?si=4OVxue5721hNqEGU",
      "https://www.youtube.com/embed/RsLDHr2gYsg?si=Ya4zfoIDIgHzFTeg",
      "https://www.youtube.com/embed/snkZZNZ332U?si=BZrMIYqc2FHUqwZl",
      "https://www.youtube.com/embed/2iDHOILMkEQ?si=vAtYOAHeOo-5Outk",
      "https://www.youtube.com/embed/3oyED1Su7Xg?si=QhX0ZyCMw_zUxpBL",
      "https://www.youtube.com/embed/T3qphTOAOdg?si=8cp70cYBDilZNYY1"
    ]
  },
  {
    id: "season2",
    titleKey: "season2",
    videos: [
      "https://www.youtube.com/embed/YaSV_fmamUA?si=tNj9-poX1DBi6CF1",
      "https://www.youtube.com/embed/DVVW1YKW49U?si=MfQdV5QBdAOJijZ5",
      "https://www.youtube.com/embed/FYHnUhts5jU?si=z2N462vo8ODcBqmO",
      "https://www.youtube.com/embed/OVcXm9RvhY8?si=8nMWQJahaNADYcfr",
      "https://www.youtube.com/embed/UAAto12_n7o?si=QENvMFuahXjnLX7w"
    ]
  },
  {
    id: "season3",
    titleKey: "season3",
    videos: [
      "https://www.youtube.com/embed/KwAX3aro8hE?si=NdkDwjlvUDyqLKPC",
      "https://www.youtube.com/embed/BbF8bsuzEN4?si=tzNZAWwRVbbOjRi6",
      "https://www.youtube.com/embed/AdWm_k3wjgo?si=NdWnR9A6LjLyG0DF"
    ]
  }
];

const PodcastPage = () => {
  const { t } = useTranslation("podcast");
  const [activeSeason, setActiveSeason] = useState("season1");

  const selectedSeason = podcastSeasons.find(
    (season) => season.id === activeSeason
  );

  return (
    <div className="min-h-screen bg-[#FDF0E9] px-4 py-10 mt-[50px]">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h1
          className="text-3xl font-bold text-red-700 mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t("title")}
        </motion.h1>
        <p className="text-lg text-gray-700 mb-10">{t("description")}</p>

        {/* Season Selector */}
        <div className="flex justify-center gap-4 flex-wrap mb-10">
          {podcastSeasons.map((season) => (
            <button
              key={season.id}
              onClick={() => setActiveSeason(season.id)}
              className={`px-4 py-2 rounded-full border transition-all ${
                activeSeason === season.id
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white border-red-400 text-red-700"
              }`}
            >
              {t(season.titleKey)}
            </button>
          ))}
        </div>

        {/* Podcast Content */}
        {selectedSeason.comingSoon ? (
          <div className="text-xl font-semibold text-gray-700 mt-10">
            {t("comingSoon")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {selectedSeason.videos.map((url, index) => (
              <div
                key={index}
                className="aspect-video rounded-xl overflow-hidden shadow-lg"
              >
                <iframe
                  src={url}
                  title={`Podcast ${t(selectedSeason.titleKey)} - ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastPage;
