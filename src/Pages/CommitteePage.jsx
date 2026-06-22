import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

// Hook to detect mobile screen
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const CommitteePage = () => {
  const { t } = useTranslation("committee");
  const isMobile = useIsMobile();

  const rawData = t("committees", { returnObjects: true });
  const committeeData = Array.isArray(rawData) ? rawData : [];

  const [activeIndex, setActiveIndex] = useState(null);
  const [expandedRoles, setExpandedRoles] = useState({});

  const toggleMobileSection = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const toggleRole = (committeeIndex, role) => {
    setExpandedRoles((prev) => {
      const key = `${committeeIndex}-${role}`;
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  return (
    <div className="pt-24 px-4 md:px-16 bg-white min-h-screen">
      <h2 className="text-3xl font-bold text-red-700 text-center mb-10">
        {t("title")}
      </h2>

      <div className="space-y-6">
        {committeeData.map((committee, index) => {
          const isActive = index === activeIndex;

          // Group members by role
          const groupedRoles = committee.members.reduce((acc, member) => {
            const role = member.role?.trim() || "इतर";
            acc[role] = acc[role] || [];
            acc[role].push(member.name);
            return acc;
          }, {});

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[#fff7ed] p-4 rounded-2xl shadow-md"
            >
              {/* Committee Heading */}
              <div
                onClick={() => isMobile && toggleMobileSection(index)}
                className="cursor-pointer md:cursor-default"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold text-red-700 mb-4 text-center w-full">
                    {committee.title}
                  </h3>
                  {isMobile && (
                    <span className="text-red-700 text-xl ml-2">
                      {isActive ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </div>

              {/* Committee Content */}
              <AnimatePresence initial={false}>
                {(!isMobile || isActive) && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {Object.entries(groupedRoles).map(([role, names], i) => {
                      const roleKey = `${index}-${role}`;
                      const isRoleOpen = expandedRoles[roleKey] || false;

                      return (
                        <div key={i} className="mb-6">
                          <div
                            onClick={() => isMobile && toggleRole(index, role)}
                            className="cursor-pointer md:cursor-default"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-xl text-[#9a3412] font-semibold mb-2 text-center w-full">
                                {role}
                              </h4>
                              {isMobile && (
                                <span className="text-[#9a3412] text-lg ml-2">
                                  {isRoleOpen ? "▲" : "▼"}
                                </span>
                              )}
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {(!isMobile || isRoleOpen) && (
                              <motion.div
                                key="role-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                {names.length === 1 ? (
                                  <div className="flex justify-center">
                                    <li className="text-gray-800 bg-white rounded-lg px-4 py-2 shadow border-l-4 border-red-700 list-none">
                                      {names[0]}
                                    </li>
                                  </div>
                                ) : (
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {names.map((name, j) => (
                                      <li
                                        key={j}
                                        className="text-gray-800 bg-white rounded-lg px-4 py-2 shadow border-l-4 border-red-700"
                                      >
                                        {name}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CommitteePage;
