import React from "react";
import { useTranslation } from "react-i18next";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const Contact = () => {
  const { t } = useTranslation("contact");

  const parentVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      variants={parentVariants}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-orange-50 via-rose-50 to-yellow-50 py-16 px-4 sm:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          variants={childVariants}
          className="text-3xl md:text-4xl font-bold text-[#b91c1c] text-center mb-10"
        >
          {t("title")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Contact Details */}
          <motion.div
            variants={parentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6 text-gray-800 text-lg"
          >
            <motion.div variants={childVariants} className="flex items-start gap-3">
              <FaPhoneAlt className="text-[#b91c1c] mt-1" />
              <span>{t("phone")}</span>
            </motion.div>

            <motion.div variants={childVariants} className="flex items-start gap-3">
              <FaEnvelope className="text-[#b91c1c] mt-1" />
              <a
                href="mailto:mumbaicharaja.lsum@gmail.com"
                className="text-gray-800 hover:text-[#b91c1c] no-underline"
              >
                {t("email")}
              </a>
            </motion.div>

            <motion.div variants={childVariants} className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-[#b91c1c] mt-1" />
              <span>{t("address")}</span>
            </motion.div>
          </motion.div>

          {/* Google Map */}
          <motion.div
            variants={childVariants}
            className="overflow-hidden rounded-xl shadow-md border border-red-100"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.577535433182!2d72.83493497394876!3d18.994256154536192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf003122a343%3A0x3baf46081576799!2sMumbai%20Cha%20Raja%2C%20Ganesh%20Galli!5e0!3m2!1sen!2sin!4v1747645285664!5m2!1sen!2sin"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ganesh Galli Location"
              className="w-full h-64"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
