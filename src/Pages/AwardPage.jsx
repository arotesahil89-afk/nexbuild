import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import useAwardsLoader from "../loaders/AwardsLoader";

const AwardPage = () => {
  const { t, i18n } = useTranslation("awards");
  const fallbackAwards = t("awards", { returnObjects: true }) || [];
  const fallbackHeading = t("heading");
  const currentLang = i18n.language || "mr";

  const { awards, loading } = useAwardsLoader(currentLang);

  const displayHeading = awards?.title || fallbackHeading;
  const displayAwards =
    awards?.items && awards.items.length > 0 ? awards.items : fallbackAwards;

  return (
    <section className="bg-[#fff8ec] py-16 px-4 md:px-10 mt-[23px]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-red-700 mb-10">
          {displayHeading}
        </h2>

        {loading && (!displayAwards || displayAwards.length === 0) ? (
          <div className="text-center py-10 text-gray-500">Loading awards...</div>
        ) : (
          <ul className="space-y-3 list-disc list-inside text-sm sm:text-[15px] md:text-lg text-gray-800">
            {displayAwards.map((award, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                viewport={{ once: true }}
              >
                {typeof award === "string" ? award : award.text || award.title}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AwardPage;
