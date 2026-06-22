import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { t } = useTranslation("about");
  const containerRef = useRef();
  const imgRef = useRef();
  const textRef = useRef();

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    tl.from(imgRef.current, {
      x: -120,
      autoAlpha: 0,
      duration: 1.6,
      ease: "power4.out",
    });

    tl.from(
      textRef.current,
      {
        x: 120,
        autoAlpha: 0,
        duration: 1.6,
        ease: "power4.out",
      },
      "-=1.2"
    );
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="bg-gradient-to-b from-red-50 to-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto gap-10">
        {/* Left Side - Image */}
        <div ref={imgRef} className="w-full lg:w-1/2">
          <img
            src="/images/Picsart_25-08-26_21-11-36-106.png"
            alt="Ganesh Mandal"
            className="rounded-2xl shadow-lg w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] object-cover "
            style={{ willChange: "transform, opacity" }}
          />
        </div>

        {/* Right Side - Text Content */}
        <div
          ref={textRef}
          className="w-full lg:w-1/2 space-y-6 text-justify"
          style={{ willChange: "transform, opacity" }}
        >
          <h2 className="text-3xl font-bold text-red-700">{t("title")}</h2>
          <p className="text-gray-800 leading-relaxed">{t("para1")}</p>
          <p className="text-gray-800 leading-relaxed">{t("para2")}</p>
          <p className="text-gray-800 leading-relaxed">{t("para3")}</p>

          <Link to="/about">
            <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300">
              {t("button")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
