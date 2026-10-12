import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useLiveStreamLoader from "../loaders/useLiveStreamLoader";
import { getYouTubeEmbedUrl } from "../utils/youtubeUtils";

const LivePage = () => {
  const { t } = useTranslation("live");
  const { streamData, loading } = useLiveStreamLoader();

  const targetDate = streamData?.targetDate
    ? new Date(streamData.targetDate).getTime()
    : new Date("2025-08-27T08:00:00+05:30").getTime();

  const [countdown, setCountdown] = useState(
    Math.floor((targetDate - Date.now()) / 1000)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((targetDate - now) / 1000);
      setCountdown(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return "0d 0h 0m 0s";
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Determine if stream should be live: either isLive flag is explicitly true OR target date passed
  const isLiveActive = streamData?.isLive !== false || countdown <= 0;
  const videoEmbedUrl = getYouTubeEmbedUrl(streamData?.videoId || streamData?.youtubeUrl || "9ThLarUCcas");

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
      <h1
        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
        className="text-3xl md:text-4xl font-bold text-[#b91c1c] mb-6"
      >
        {streamData?.title || t("title")}
      </h1>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm">Loading Live Stream...</p>
        </div>
      ) : isLiveActive ? (
        <>
          {streamData?.description && (
            <p className="text-base md:text-lg text-gray-700 mb-6 max-w-3xl mx-auto whitespace-pre-line">
              {streamData.description}
            </p>
          )}
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl bg-black">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={videoEmbedUrl}
              title={streamData?.title || "Mumbai Cha Raja Live Stream"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </>
      ) : (
        <>
          <p className="text-xl text-gray-700 mb-4">{t("notLiveMessage")}</p>
          <p className="text-lg text-gray-600 mb-6">
            {t("countdownLabel")}:{" "}
            <span className="font-semibold text-red-600">{formatTime(countdown)}</span>
          </p>
          <div className="w-full max-w-md mx-auto bg-yellow-100 border border-yellow-300 text-yellow-900 p-4 rounded-lg shadow">
            {t("waitMessage")}
          </div>
        </>
      )}
    </div>
  );
};

export default LivePage;


