import React from "react";
import { useTranslation } from "react-i18next";

const CommitteePage = () => {
  const { t } = useTranslation("committee");

  return (
    <div className="pt-24 px-4 sm:px-6 md:px-10 lg:px-16 bg-white min-h-screen">

      {/* Page Title */}
      <h2
        className="
          text-2xl
          sm:text-3xl
          md:text-4xl
          font-bold
          text-red-700
          text-center
          mb-6
          sm:mb-8
        "
      >
        {t("title")}
      </h2>

      {/* कार्यकारिणी मंडळ Image */}
      <div className="w-full flex justify-center pb-10 sm:pb-12">
        <div className="w-full max-w-[850px]">
          <img
            src="/images/0_karyakari mandal 2026 & UPAKRAM_page-0001.jpg"
            alt="कार्यकारिणी मंडळ २०२६-२०२७"
            className="
              block
              w-full
              h-auto
              object-contain
              rounded-lg
              sm:rounded-xl
              md:rounded-2xl
              shadow-md
              sm:shadow-lg
            "
          />
        </div>
      </div>

    </div>
  );
};

export default CommitteePage;









































































// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useTranslation } from "react-i18next";

// // Hook to detect mobile screen
// const useIsMobile = () => {
//   const [isMobile, setIsMobile] = useState(
//     typeof window !== "undefined" ? window.innerWidth < 768 : false
//   );

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   return isMobile;
// };

// const CommitteePage = () => {
//   const { t } = useTranslation("committee");
//   const isMobile = useIsMobile();

//   const rawData = t("committees", { returnObjects: true });
//   const committeeData = Array.isArray(rawData) ? rawData : [];

//   const [activeIndex, setActiveIndex] = useState(null);
//   const [expandedRoles, setExpandedRoles] = useState({});

//   // Toggle committee on mobile
//   const toggleMobileSection = (index) => {
//     setActiveIndex(index === activeIndex ? null : index);
//   };

//   // Toggle role on mobile
//   const toggleRole = (committeeIndex, role) => {
//     setExpandedRoles((prev) => {
//       const key = `${committeeIndex}-${role}`;

//       return {
//         ...prev,
//         [key]: !prev[key],
//       };
//     });
//   };

//   // Hide कार्यकारिणी मंडळ from committee cards
//   const otherCommittees = committeeData.filter(
//     (committee) =>
//       !committee.title?.includes("कार्यकारिणी") &&
//       !committee.title?.includes("कार्यकारी")
//   );

//   return (
//     <div className="pt-24 px-4 sm:px-6 md:px-10 lg:px-16 bg-white min-h-screen">

//       {/* ========================================= */}
//       {/* Page Title - कार्यकारिणी मंडळ */}
//       {/* ========================================= */}

//       <h2
//         className="
//           text-2xl
//           sm:text-3xl
//           md:text-4xl
//           font-bold
//           text-red-700
//           text-center
//           mb-5
//           sm:mb-6
//         "
//       >
//         {t("title")}
//       </h2>

//       {/* ========================================= */}
//       {/* कार्यकारिणी मंडळ Poster */}
//       {/* ========================================= */}

//       <div className="w-full flex justify-center mb-10 sm:mb-12">
//         <div className="w-full max-w-[850px]">

//           <img
//             src="/images/0_karyakari mandal 2026 & UPAKRAM_page-0001.jpg"
//             alt="कार्यकारिणी मंडळ २०२६-२०२७"
//             className="
//               block
//               w-full
//               h-auto
//               object-contain
//               rounded-lg
//               sm:rounded-xl
//               md:rounded-2xl
//               shadow-md
//               sm:shadow-lg
//             "
//           />

//         </div>
//       </div>

//       {/* ========================================= */}
//       {/* Other Committees */}
//       {/* ========================================= */}

//       <div className="space-y-5 sm:space-y-6">

//         {otherCommittees.map((committee, index) => {
//           const isActive = index === activeIndex;

//           // Group members by role
//           const groupedRoles = (committee.members || []).reduce(
//             (acc, member) => {
//               const role = member.role?.trim() || "इतर";

//               acc[role] = acc[role] || [];
//               acc[role].push(member.name);

//               return acc;
//             },
//             {}
//           );

//           return (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               viewport={{ once: true }}
//               className="
//                 bg-[#fff7ed]
//                 p-3
//                 sm:p-4
//                 md:p-5
//                 rounded-xl
//                 sm:rounded-2xl
//                 shadow-md
//               "
//             >

//               {/* ========================================= */}
//               {/* Committee Heading */}
//               {/* ========================================= */}

//               <div
//                 onClick={() =>
//                   isMobile && toggleMobileSection(index)
//                 }
//                 className="
//                   cursor-pointer
//                   md:cursor-default
//                 "
//               >
//                 <div className="flex items-center justify-center">

//                   <h3
//                     className="
//                       text-xl
//                       sm:text-2xl
//                       md:text-3xl
//                       font-semibold
//                       text-red-700
//                       text-center
//                       flex-1
//                     "
//                   >
//                     {committee.title}
//                   </h3>

//                   {isMobile && (
//                     <span
//                       className="
//                         text-red-700
//                         text-lg
//                         sm:text-xl
//                         ml-2
//                         flex-shrink-0
//                       "
//                     >
//                       {isActive ? "▲" : "▼"}
//                     </span>
//                   )}

//                 </div>
//               </div>

//               {/* ========================================= */}
//               {/* Committee Content */}
//               {/* ========================================= */}

//               <AnimatePresence initial={false}>
//                 {(!isMobile || isActive) && (
//                   <motion.div
//                     key="content"
//                     initial={{
//                       height: 0,
//                       opacity: 0,
//                     }}
//                     animate={{
//                       height: "auto",
//                       opacity: 1,
//                     }}
//                     exit={{
//                       height: 0,
//                       opacity: 0,
//                     }}
//                     transition={{
//                       duration: 0.3,
//                     }}
//                     className="overflow-hidden"
//                   >

//                     {Object.entries(groupedRoles).map(
//                       ([role, names], roleIndex) => {
//                         const roleKey = `${index}-${role}`;
//                         const isRoleOpen =
//                           expandedRoles[roleKey] || false;

//                         return (
//                           <div
//                             key={roleIndex}
//                             className="
//                               mb-5
//                               sm:mb-6
//                               last:mb-0
//                             "
//                           >

//                             {/* ========================================= */}
//                             {/* Role Heading */}
//                             {/* ========================================= */}

//                             <div
//                               onClick={() =>
//                                 isMobile &&
//                                 toggleRole(index, role)
//                               }
//                               className="
//                                 cursor-pointer
//                                 md:cursor-default
//                               "
//                             >
//                               <div className="flex items-center justify-center">

//                                 <h4
//                                   className="
//                                     text-lg
//                                     sm:text-xl
//                                     md:text-2xl
//                                     text-[#9a3412]
//                                     font-semibold
//                                     text-center
//                                     flex-1
//                                   "
//                                 >
//                                   {role}
//                                 </h4>

//                                 {isMobile && (
//                                   <span
//                                     className="
//                                       text-[#9a3412]
//                                       text-base
//                                       sm:text-lg
//                                       ml-2
//                                       flex-shrink-0
//                                     "
//                                   >
//                                     {isRoleOpen ? "▲" : "▼"}
//                                   </span>
//                                 )}

//                               </div>
//                             </div>

//                             {/* ========================================= */}
//                             {/* Role Members */}
//                             {/* ========================================= */}

//                             <AnimatePresence initial={false}>
//                               {(!isMobile || isRoleOpen) && (
//                                 <motion.div
//                                   key="role-content"
//                                   initial={{
//                                     height: 0,
//                                     opacity: 0,
//                                   }}
//                                   animate={{
//                                     height: "auto",
//                                     opacity: 1,
//                                   }}
//                                   exit={{
//                                     height: 0,
//                                     opacity: 0,
//                                   }}
//                                   transition={{
//                                     duration: 0.3,
//                                   }}
//                                   className="overflow-hidden"
//                                 >

//                                   {/* Single Member */}
//                                   {names.length === 1 ? (
//                                     <div className="flex justify-center px-1">

//                                       <li
//                                         className="
//                                           w-full
//                                           sm:w-auto
//                                           min-w-0
//                                           sm:min-w-[250px]
//                                           text-gray-800
//                                           bg-white
//                                           rounded-lg
//                                           px-4
//                                           py-2.5
//                                           shadow
//                                           border-l-4
//                                           border-red-700
//                                           list-none
//                                           text-center
//                                           break-words
//                                         "
//                                       >
//                                         {names[0]}
//                                       </li>

//                                     </div>
//                                   ) : (

//                                     /* Multiple Members */
//                                     <ul
//                                       className="
//                                         grid
//                                         grid-cols-1
//                                         sm:grid-cols-2
//                                         lg:grid-cols-3
//                                         gap-3
//                                       "
//                                     >
//                                       {names.map((name, memberIndex) => (
//                                         <li
//                                           key={memberIndex}
//                                           className="
//                                             text-gray-800
//                                             bg-white
//                                             rounded-lg
//                                             px-4
//                                             py-2.5
//                                             shadow
//                                             border-l-4
//                                             border-red-700
//                                             break-words
//                                           "
//                                         >
//                                           {name}
//                                         </li>
//                                       ))}
//                                     </ul>

//                                   )}

//                                 </motion.div>
//                               )}
//                             </AnimatePresence>

//                           </div>
//                         );
//                       }
//                     )}

//                   </motion.div>
//                 )}
//               </AnimatePresence>

//             </motion.div>
//           );
//         })}

//       </div>
//     </div>
//   );
// };

// export default CommitteePage;