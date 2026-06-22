import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const location = useLocation();

  const { t, i18n } = useTranslation("navbar");

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    setDropdownOpen(null);
  };

  const toggleDropdown = (title) => {
    setDropdownOpen((prev) => (prev === title ? null : title));
  };

  const toggleLanguage = () => {
    const nextLang =
      i18n.language === "mr" ? "hi" : i18n.language === "hi" ? "en" : "mr";
    i18n.changeLanguage(nextLang);
  };

  const navCategories = useMemo(
    () => [
      {
        title: t("mandapInfo"),
        links: [
          { name: t("home"), path: "/" },
          { name: t("about"), path: "/about" },
          { name: t("committee"), path: "/committee" },
        ],
      },
      {
        title: t("initiative"),
        links: [
          { name: t("socialWork"), path: "/social" },
          { name: t("education"), path: "/education" },
          { name: t("otherInitiatives"), path: "/other-social" },
        ],
      },
      {
        title: t("festiveZone"),
        links: [
          { name: t("podcast"), path: "/podcast"},
          { name: t("theme"), path: "/theme" },
          { name: t("gallery"), path: "/gallery" },
          { name: t("live"), path: "/live" },
        ],
      },
      {
        title: t("more"),
        links: [
          { name: t("events"), path: "/events" },
          { name: t("award"), path: "/awards" },
          { name: t("donation"), path: "/donate" },
          { name: "Donate Now", path: "/donate-now" },
          { name: "Merchandise", path: "/merchandise" },
          { name: "Membership", path: "/membership" },
          { name: t("contact"), path: "/contact" },
        ],
      },
    ],
    [t]
  );

  const languageNames = {
    en: "English",
    hi: "हिन्दी",
    mr: "मराठी",
  };

  return (
    <nav className="bg-[#B91C1C] text-white fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 py-[4px] md:py-[4px] lg:py-[4px]  flex justify-between items-center ">
        {/* <Link
  to="/"
  className="text-2xl font-extrabold bg-yellow-400  bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 leading-tight pt-1"
>
  <span className="font-sans">||</span>
  <span className="font-dekko font-bold px-1">मुंबईचा राजा</span>
  <span className="font-sans">||</span>
</Link> */}
<Link
  to="/"
  className="flex items-center hover:scale-105 transition-transform duration-300 pt-1"
>
  <img
    src="/images/logo - img.png"
    alt="मुंबईचा राजा"
    className="h-[45px] md:h-[60px] lg:h-[60px] w-auto object-contain "
  />
</Link>



        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navCategories.map((cat) => (
            <div
              key={cat.title}
              className="relative group"
              onMouseEnter={() => setDropdownOpen(cat.title)}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <button className="font-semibold flex items-center gap-1 hover:text-yellow-300 transition no-underline">
                {cat.title}
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {dropdownOpen === cat.title && (
                  <motion.ul
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full bg-white text-[#B91C1C] rounded-lg shadow-lg mt-2 min-w-[180px] z-20 py-2"
                  >
                    {cat.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className={`block px-4 py-2 text-sm hover:bg-yellow-100 hover:text-[#B91C1C] no-underline ${
                            location.pathname === link.path
                              ? "font-bold bg-yellow-50"
                              : ""
                          }`}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* ✅ Language Button - Only render if initialized */}
          {i18n.isInitialized && (
            <button
              onClick={toggleLanguage}
              className="bg-white text-[#B91C1C] font-semibold text-sm px-3 py-1 rounded-full shadow hover:bg-yellow-300 transition"
            >
              {languageNames[i18n.language] || "🌐"}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {i18n.isInitialized && (
            <button
              onClick={toggleLanguage}
              className="bg-white text-[#B91C1C] font-semibold text-sm px-3 py-1 rounded-full shadow hover:bg-yellow-300 transition"
            >
              {languageNames[i18n.language] || "🌐"}
            </button>
          )}
          <button onClick={toggleMenu}>
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-[#B91C1C] px-4 overflow-hidden"
          >
            <ul className="flex flex-col space-y-4 mt-2 pb-4">
              {navCategories.map((cat) => (
                <li key={cat.title}>
                  <button
                    onClick={() => toggleDropdown(cat.title)}
                    className="flex justify-between items-center w-full font-semibold text-white"
                  >
                    {cat.title}
                    {dropdownOpen === cat.title ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen === cat.title && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-2 space-y-2 overflow-hidden"
                      >
                        {cat.links.map((link) => (
                          <li key={link.path}>
                            <Link
                              to={link.path}
                              onClick={() => {
                                toggleMenu();
                                setDropdownOpen(null);
                              }}
                              className="block text-sm py-1 text-white hover:text-yellow-300 transition no-underline"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
