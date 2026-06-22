import React from "react";
import Marquee from "react-fast-marquee";
import { useTranslation } from "react-i18next";

const MarqueeStrip = () => {
  const { t } = useTranslation("marquee"); // "marquee" namespace

  return (
    <div className="bg-[#b91c1c] text-white py-2 mt-[56px] md:mt-[72px] z-40 relative shadow">
      <Marquee speed={50} gradient={false} pauseOnHover={true}>
        <span className="px-4 text-sm md:text-base whitespace-nowrap">
          {t("message")}
        </span>
      </Marquee>
    </div>
  );
};

export default MarqueeStrip;
