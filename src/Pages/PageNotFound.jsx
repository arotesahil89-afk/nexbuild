import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PageNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#fff7ed] text-center px-4">
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-8xl font-bold text-[#b91c1c] mb-4"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-medium text-[#7c2d12] mb-6"
      >
        क्षमा करा! ही पृष्ठ सापडली नाही 🙁
      </motion.p>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-600 mb-8"
      >
        आपण ज्या पृष्ठाचा शोध घेत आहात ते अस्तित्वात नाही. कृपया मुख्य पृष्ठावर परत जा.
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Link
          to="/"
          className="inline-block bg-[#b91c1c] hover:bg-[#9f1239] text-white px-6 py-3 rounded-full shadow-lg transition"
        >
          मुख्यपृष्ठावर परत जा
        </Link>
      </motion.div>
    </div>
  );
};

export default PageNotFound;
