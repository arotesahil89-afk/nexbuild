import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import useEventsLoader from "../loaders/useEventsLoader";

const EventsPage = () => {
  const { i18n } = useTranslation();
  const { events, loading } = useEventsLoader();
  const lang = i18n.language || "mr";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto px-4 pt-24 pb-16"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-3xl font-bold text-center text-[#b91c1c] mb-10"
      >
        {lang === "mr" ? "आगामी कार्यक्रम" : lang === "hi" ? "आगामी कार्यक्रम" : "Events Schedule"}
      </motion.h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {lang === "mr" ? "सध्या कोणतेही कार्यक्रम उपलब्ध नाहीत." : "No upcoming events scheduled at the moment."}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {events.map((event, index) => {
            const title =
              typeof event.title === "object"
                ? event.title[lang] || event.title.en || event.title.mr || ""
                : event.title || "";

            const description =
              typeof event.description === "object"
                ? event.description[lang] || event.description.en || event.description.mr || ""
                : event.description || "";

            return (
              <motion.div
                key={event.id || index}
                variants={cardVariants}
                className="bg-white shadow-md rounded-2xl p-6 border-l-4 border-[#b91c1c] hover:shadow-xl transition duration-300"
              >
                <h2 className="text-xl font-semibold text-[#b91c1c] mb-2">
                  {title}
                </h2>
                {event.date && (
                  <p className="text-sm text-gray-600 mb-1">📅 {event.date}</p>
                )}
                {event.time && (
                  <p className="text-sm text-gray-600 mb-3">⏰ {event.time}</p>
                )}
                <p className="text-gray-800 whitespace-pre-line">
                  {description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EventsPage;
