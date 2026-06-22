import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FlashBanner.css";

const FlashBanner = () => {
  const { t } = useTranslation("flash");
  const messages = t("messages", { returnObjects: true }) || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [popupMsg, setPopupMsg] = useState(null);
  const [zoomImg, setZoomImg] = useState(null);

  useEffect(() => {
    if (!messages.length || popupMsg) return;

    const msg = messages[currentIndex];
    toast.dismiss();

    toast(
      <div
        onClick={() => setPopupMsg(msg)}
        className="flash-toast-inner flex items-center gap-2 cursor-pointer"
      >
        <span className="truncate">{msg.title}</span>
      </div>,
      {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: true,
        pauseOnHover: true,
        closeOnClick: false,
        draggable: false,
        transition: Slide,
        toastClassName: "flash-toast-wrapper",
        closeButton: false,
        icon: false,
      }
    );

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [messages, currentIndex, popupMsg]);

  const closePopup = () => setPopupMsg(null);
  const closeZoom = () => setZoomImg(null);

  return (
    <>
      <div className="hidden md:block">
        <ToastContainer limit={1} newestOnTop={false} closeOnClick={false} />
      </div>

      {/* 🔴 Main Popup */}
      {popupMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-red-700 text-white p-6 rounded-lg shadow-lg max-w-md w-[90%] animate-popupOpen relative">
            <h2 className="text-xl font-bold mb-2">{popupMsg.title}</h2>

            {/* 🔄 Formatted description */}
            {popupMsg.description &&
              popupMsg.description.split("\n").map((line, idx) => (
                <p key={idx} className="mb-1">
                  {line}
                </p>
              ))}

            {/* 📋 Added direct link from JSON */}
            {popupMsg.links?.url && (
              <div className="mt-3">
                <a
                  href={popupMsg.links.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-yellow-300 underline hover:text-yellow-400 transition font-semibold"
                >
                  {popupMsg.links.name || "Link"}
                </a>
              </div>
            )}

            {/* 📸 Image gallery */}
            <div className="flex flex-wrap gap-3 mb-3">
              {popupMsg.image && (
                <img
                  src={popupMsg.image}
                  alt="Popup Visual"
                  className="w-40 rounded cursor-zoom-in transition hover:scale-105"
                  onClick={() => setZoomImg(popupMsg.image)}
                />
              )}
              {popupMsg.images &&
                popupMsg.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Image ${idx + 1}`}
                    className="w-40 rounded cursor-zoom-in transition hover:scale-105"
                    onClick={() => setZoomImg(img)}
                  />
                ))}
            </div>

            {/* 🔗 Social Media Links */}
            {popupMsg.links?.instagram || popupMsg.links?.facebook ? (
              <div className="flex flex-col gap-2 mt-2">
                {popupMsg.links.instagram && (
                  <a
                    href={popupMsg.links.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-yellow-300 underline hover:text-yellow-400 transition"
                  >
                    Instagram Link
                  </a>
                )}
                {popupMsg.links.facebook && (
                  <a
                    href={popupMsg.links.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-yellow-300 underline hover:text-yellow-400 transition"
                  >
                    Facebook Link
                  </a>
                )}
              </div>
            ) : null}

            {/* 🎧 Episodes List */}
            {popupMsg.episodes && popupMsg.episodes.length > 0 && (
              <div className="mt-3">
                <h3 className="text-lg font-semibold mb-2 text-yellow-300">पहा:</h3>
                <ul className="pl-1 space-y-3">
                  {popupMsg.episodes.map((ep, idx) => (
                    <li key={idx} className="text-white-200">
                      <p className="mb-[2px] text-base font-medium">{ep.label}</p>
                      {ep["link name"] && (
                        <a
                          href={ep.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold transition no-underline"
                          style={{ color: "#FCD34D" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#fde68a")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#FCD34D")}
                        >
                          {ep["link name"]}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ❌ Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-3 text-white text-lg hover:text-yellow-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 🔍 Fullscreen Zoom Image */}
      {zoomImg && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={closeZoom}
        >
          <img
            src={zoomImg}
            alt="Zoomed"
            className="max-w-full max-h-full rounded-lg shadow-lg animate-popupOpen"
          />
          <button
            className="absolute top-4 right-5 text-white text-3xl font-bold"
            onClick={closeZoom}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default FlashBanner;
