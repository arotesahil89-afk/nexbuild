import React, { useEffect, useState, useCallback } from "react";
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
  const [slideIndex, setSlideIndex] = useState(0);

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

  // Build combined image list: main image first, then gallery images
  const allSlideImages = popupMsg
    ? [
        ...(popupMsg.image ? [popupMsg.image] : []),
        ...(Array.isArray(popupMsg.images) ? popupMsg.images : []),
      ]
    : [];

  const prevSlide = useCallback(() => {
    setSlideIndex((i) => (i - 1 + allSlideImages.length) % allSlideImages.length);
  }, [allSlideImages.length]);

  const nextSlide = useCallback(() => {
    setSlideIndex((i) => (i + 1) % allSlideImages.length);
  }, [allSlideImages.length]);

  // Reset slide index when popup opens/changes
  useEffect(() => {
    setSlideIndex(0);
  }, [popupMsg]);

  // Auto-slide every 3 seconds when multiple images exist
  useEffect(() => {
    if (allSlideImages.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % allSlideImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [allSlideImages.length, popupMsg]);

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

            {/* 📸 Image Slideshow */}
            {allSlideImages.length > 0 && (
              <div className="mt-3 mb-2">
                {/* Main Slide */}
                <div className="relative w-full overflow-hidden rounded-lg bg-black/20">
                  <img
                    key={slideIndex}
                    src={allSlideImages[slideIndex]}
                    alt={`Slide ${slideIndex + 1}`}
                    className="w-full max-h-56 object-contain rounded-lg cursor-zoom-in animate-fadeIn"
                    onClick={() => setZoomImg(allSlideImages[slideIndex])}
                    onError={(e) => {
                      if (!e.currentTarget.src.includes("/images/logo-removebg-preview.png")) {
                        e.currentTarget.src = "/images/logo-removebg-preview.png";
                      }
                    }}
                  />

                  {/* Prev / Next Arrows */}
                  {allSlideImages.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition"
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Image counter badge */}
                  {allSlideImages.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      {slideIndex + 1} / {allSlideImages.length}
                    </span>
                  )}
                </div>

                {/* Dot indicators */}
                {allSlideImages.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-2">
                    {allSlideImages.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setSlideIndex(dotIdx)}
                        className={`w-2 h-2 rounded-full transition ${
                          dotIdx === slideIndex ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

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
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg animate-popupOpen"
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
