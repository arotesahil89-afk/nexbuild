import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FlashNewsMobile.css";
import { flashFirestoreService } from "../../services/firestoreService";
import { isFirebaseConfigured } from "../../services/firebase";

const FlashNewsMobile = () => {
  const { t, i18n } = useTranslation("flash");
  const rawFallback = t("messages", { returnObjects: true });
  const fallbackMessages = Array.isArray(rawFallback) ? rawFallback : [];
  const currentLang = i18n.language || "mr";

  const [messages, setMessages] = useState(fallbackMessages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popupMsg, setPopupMsg] = useState(null);
  const [zoomImg, setZoomImg] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Real-time Firebase Listener
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
          console.warn("[FlashNewsMobile] Firestore error, using fallback JSON:", err);
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
    if (!messages || !messages.length || popupMsg || !isMobile) return;

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
  }, [messages, currentIndex, popupMsg, isMobile]);

  const closePopup = () => setPopupMsg(null);
  const closeZoom = () => setZoomImg(null);

  if (!isMobile) return null;

  return (
    <div className="mobile-only">
      <ToastContainer limit={1} newestOnTop={false} closeOnClick={false} />

      {popupMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="popup-content-mobile bg-red-700 text-white p-4 rounded-lg shadow-lg w-[90%] max-h-[80vh] overflow-y-auto animate-popupOpen relative">
            <h2 className="text-lg font-bold mb-2">{popupMsg.title}</h2>

            {popupMsg.description &&
              typeof popupMsg.description === "string" &&
              popupMsg.description.split("\n").map((line, idx) => (
                <p key={idx} className="mb-1 text-sm">
                  {line}
                </p>
              ))}

            {popupMsg.links?.url && (
              <div className="mt-2">
                <a
                  href={popupMsg.links.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-yellow-300 underline hover:text-yellow-400 text-sm font-semibold"
                >
                  {popupMsg.links.name || "Link"}
                </a>
              </div>
            )}

            {popupMsg.videos && Array.isArray(popupMsg.videos) && popupMsg.videos.length > 0 && (
              <div className="my-2 space-y-2">
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

            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              {popupMsg.image && (
                <img
                  src={popupMsg.image}
                  alt="Popup Visual"
                  className="w-28 rounded cursor-zoom-in transition hover:scale-105"
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
                    className="w-28 rounded cursor-zoom-in transition hover:scale-105"
                    onClick={() => setZoomImg(img)}
                  />
                ))}
            </div>

            <button
              onClick={closePopup}
              className="absolute top-2 right-3 text-white text-lg hover:text-yellow-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default FlashNewsMobile;
