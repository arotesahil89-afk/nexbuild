import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import apiClient from "../services/apiService";

const EventsPage = () => {
  const { i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const lang = i18n.language;

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/events');
        setEvents(response.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

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
        Events Schedule
      </motion.h1>

      <motion.div
        variants={containerVariants}
        className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {events.map((event, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-white shadow-md rounded-2xl p-6 border-l-4 border-[#b91c1c] hover:shadow-xl transition duration-300"
          >
            <h2 className="text-xl font-semibold text-[#b91c1c] mb-2">
              {event.title[lang] || event.title.en}
            </h2>
            <p className="text-sm text-gray-600 mb-1">📅 {event.date}</p>
            <p className="text-sm text-gray-600 mb-3">⏰ {event.time}</p>
            <p className="text-gray-800">
              {event.description[lang] || event.description.en}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default EventsPage;
