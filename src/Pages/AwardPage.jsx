import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const AwardPage = () => {
  const { t } = useTranslation("awards");
  const awards = t("awards", { returnObjects: true });

  return (
    <section className="bg-[#fff8ec] py-16 px-4 md:px-10 mt-[23px]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-red-700 mb-10">
          {t("heading")}
        </h2>
        <ul className="space-y-3 list-disc list-inside text-sm sm:text-[15px] md:text-lg text-gray-800">
          {awards.map((award, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              viewport={{ once: true }}
            >
              {award}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AwardPage;
