import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const OtherSocialPage = () => {
  const { t } = useTranslation("otherInitiatives");
  const initiatives = t("initiatives", { returnObjects: true }) || [];

  return (
    <div className="px-4 py-10 max-w-4xl mx-auto mt-24">
      <motion.h2
        className="text-3xl font-bold text-red-700 mb-8 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {t("title")}
      </motion.h2>

      <div className="space-y-8">
        {Array.isArray(initiatives) && initiatives.length > 0 ? (
          initiatives.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 100,scale:0.8 }}
              animate={{ opacity: 1, x: 0, scale:1 }}
              transition={{ delay: index * 0.15, duration: 2 }}
              className="border-l-4 border-red-700 pl-4 bg-white shadow-sm p-4 rounded-md hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-red-700 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-800 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500">No initiatives found.</p>
        )}
      </div>
    </div>
  );
};

export default OtherSocialPage;
