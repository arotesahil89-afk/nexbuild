import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const VisarjanSohala = () => {
  const { t } = useTranslation("visarjan");
  const containerRef = useRef();
  const headingRef = useRef();
  const descRef = useRef();
  const videoRef = useRef();

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      tl.from(headingRef.current, {
        y: -60,
        autoAlpha: 0,
        duration: 1.4,
        ease: "power4.out",
      });
      tl.from(
        descRef.current,
        { y: 40, autoAlpha: 0, duration: 1.6, ease: "power4.out" },
        "-=0.8"
      );
      tl.from(
        videoRef.current,
        { scale: 0.9, autoAlpha: 0, duration: 1.5, ease: "power4.out" },
        "-=1"
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="px-4 py-16 bg-gradient-to-r from-yellow-50 via-red-50 to-rose-100"
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl font-bold text-[#dc2626] mb-6"
          style={{ willChange: "transform, opacity" }}
        >
          {t("sectionTitle")}
        </h2>
        <p
          ref={descRef}
          className="text-gray-800 text-lg sm:text-xl lg:text-2xl mb-10 leading-relaxed max-w-3xl mx-auto"
          style={{ willChange: "transform, opacity" }}
        >
          {t("description")}
        </p>

        <div
          ref={videoRef}
          className="relative w-full max-w-3xl mx-auto rounded-xl shadow-lg overflow-hidden border border-yellow-300 aspect-video"
          style={{ willChange: "transform, opacity" }}
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/O1dM0aqE07w?si=gydTg5pdSMRWGktZ"
            title={t("videoTitle")}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default VisarjanSohala;


 