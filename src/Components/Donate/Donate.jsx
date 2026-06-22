import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const DonateSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("donate");

  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="px-4 py-20 bg-gradient-to-br from-yellow-50 via-red-50 to-rose-100 text-center rounded-none"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-red-700 mb-4"
        >
          {t("Heading")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-700 text-lg sm:text-xl mb-8 leading-relaxed"
        >
          {t("description")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => navigate("/donate")}
            className="px-8 py-3 bg-red-700 text-white rounded-full text-lg sm:text-xl hover:bg-red-800 transition duration-300 shadow-md"
          >
            {t("button")}
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default DonateSection;
