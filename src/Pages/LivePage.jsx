import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LivePage = () => {
  const { t } = useTranslation("live");

  // 🎯 Live start time: 27 Aug 2025, 8:00 AM IST
  const targetDate = new Date("2025-08-27T08:00:00+05:30").getTime();

  const [isLive, setIsLive] = useState(false);
  const [countdown, setCountdown] = useState(
    Math.floor((targetDate - Date.now()) / 1000)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((targetDate - now) / 1000);

      if (diff <= 0) {
        setIsLive(true);
        clearInterval(timer);
      } else {
        setCountdown(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
      <h1 style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }} className="text-3xl md:text-4xl  font-bold text-[#b91c1c] mb-6">
        {t("title")}
      </h1>

      {isLive ? (
        <>
          {/* <p className="text-lg text-gray-700 mb-6">{t("liveMessage")}</p> */}
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/9ThLarUCcas?si=2ogd-WyZi7o-lfPp"
              title="Live Stream"
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
