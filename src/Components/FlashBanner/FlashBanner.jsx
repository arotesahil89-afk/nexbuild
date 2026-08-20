import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FlashBanner.css";
import { flashFirestoreService } from "../../services/firestoreService";
import { isFirebaseConfigured } from "../../services/firebase";

const FlashBanner = () => {
  const { t, i18n } = useTranslation("flash");
  const rawFallback = t("messages", { returnObjects: true });
  const fallbackMessages = Array.isArray(rawFallback) ? rawFallback : [];
  const currentLang = i18n.language || "mr";

  const [messages, setMessages] = useState(fallbackMessages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popupMsg, setPopupMsg] = useState(null);
  const [zoomImg, setZoomImg] = useState(null);

  // 1. Real-time Firebase Listener with fallback to static translation JSON
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = flashFirestoreService.listenFlashMessages(
        (items) => {
          if (Array.isArray(items) && items.length > 0) {
            const activeItems = items.filter(
              (m) =>
                m.isActive !== false &&
                (!m.language || m.language === currentLang || m.language === "all")
            );
            if (activeItems.length > 0) {
              setMessages(activeItems);
            } else {
              setMessages(fallbackMessages);
            }
          } else {
            setMessages(fallbackMessages);
          }
        },
        (err) => {
          console.warn("[FlashBanner] Firestore error, using fallback JSON:", err);
          setMessages(fallbackMessages);
        }
      );
      return () => unsubscribe();
    } else {
      setMessages(fallbackMessages);
    }
  }, [currentLang]);

  // 2. Toast ticker rotation
  useEffect(() => {
    if (!messages || !messages.length || popupMsg) return;

    const safeIndex = currentIndex >= messages.length ? 0 : currentIndex;
    const msg = messages[safeIndex];
    if (!msg) return;

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
          <div className="bg-red-700 text-white p-6 rounded-lg shadow-lg max-w-md w-[90%] max-h-[85vh] overflow-y-auto animate-popupOpen relative">
            <h2 className="text-xl font-bold mb-2">{popupMsg.title}</h2>

            {/* 🔄 Formatted description */}
            {popupMsg.description &&
              typeof popupMsg.description === "string" &&
              popupMsg.description.split("\n").map((line, idx) => (
                <p key={idx} className="mb-1 text-sm sm:text-base">
                  {line}
                </p>
              ))}

            {/* 📋 Added direct link */}
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

            {/* 🎥 Embedded Videos */}
            {popupMsg.videos && Array.isArray(popupMsg.videos) && popupMsg.videos.length > 0 && (
              <div className="my-3 space-y-2">
                {popupMsg.videos.map((vidUrl, vIdx) => (
                  <div key={vIdx} className="aspect-video w-full rounded overflow-hidden shadow">
                    <iframe
                      src={vidUrl}
                      title={`Video ${vIdx + 1}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 📸 Image gallery */}
            <div className="flex flex-wrap gap-3 my-3">
              {popupMsg.image && (
                <img
                  src={popupMsg.image}
                  alt="Popup Visual"
                  className="w-40 rounded cursor-zoom-in transition hover:scale-105"
                  onClick={() => setZoomImg(popupMsg.image)}
                />
              )}
              {popupMsg.images &&
                Array.isArray(popupMsg.images) &&
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
            {popupMsg.episodes && Array.isArray(popupMsg.episodes) && popupMsg.episodes.length > 0 && (
              <div className="mt-3">
                <h3 className="text-lg font-semibold mb-2 text-yellow-300">
                  {currentLang === "mr" ? "पहा:" : currentLang === "hi" ? "देखें:" : "Watch:"}
                </h3>
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
