import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaWhatsapp,
  FaLinkedinIn,
} from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const { t } = useTranslation("footer");

  const links = [
    { name: t("home"), href: "/" },
    { name: t("about"), href: "/about" },
    { name: t("committee"), href: "/committee" },
    { name: t("socialWork"), href: "/social" },
    { name: t("education"), href: "/education" },
    { name: t("theme"), href: "/theme" },
    { name: t("events"), href: "/events" },
    { name: t("gallery"), href: "/gallery" },
    { name: t("live"), href: "/live" },
    { name: t("donate"), href: "/donate" },
    { name: t("contact"), href: "/contact" },
  ];

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
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
      }}
      className="bg-[#7f1d1d] text-white px-6 py-12"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* About Us */}
        <motion.div variants={iconVariants}>
          <img
            src="/images/Vishwavikkrami Mumbaicha Raja.png"
            alt="Logo"
            className="mb-4 w-28"
          />
          <h3 className="text-lg font-bold mb-2">{t("aboutUs")}</h3>
          <p className="text-sm leading-relaxed">{t("footerDescription")}</p>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={iconVariants}>
          <h3 className="text-lg font-bold mb-4">{t("importantLinks")}</h3>
          <ul className="space-y-2 text-sm">
            {links.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.href}
                  className="group relative inline-block text-white no-underline transition-transform duration-300 hover:scale-[1.05]"
                >
                  {link.name}
                  <span className="absolute left-0 -bottom-[2px] h-[2px] w-0 bg-white group-hover:w-full transition-all duration-300 ease-in-out"></span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Social + Contact */}
        <motion.div variants={iconVariants}>
          <h3 className="text-lg font-bold mb-4">{t("contactUs")}</h3>
          <p className="text-sm mb-2">{t("phone")}: ०२२ २४७११४१४</p>
          <p className="text-sm mb-2">
            {t("email")}: mumbaicharaja.lsum@gmail.com 
          </p>
          
          <p className="text-sm mb-4">{t("website")}: www.ganeshgali.com | mumbaicharaja.org</p>
          <div className="flex gap-3 mt-4">
            {[
              { href: "https://www.facebook.com/GaneshGalli", icon: FaFacebookF, color: "#4267B2", label: "Facebook" },
              { href: "https://www.instagram.com/raja_mumbaicha", icon: FaInstagram, color: "#E1306C", label: "Instagram" },
              { href: "https://www.youtube.com/@MumbaichaRaja22", icon: FaYoutube, color: "#FF0000", label: "YouTube" },
              { href: "https://twitter.com/Mumbaicha_Raja", icon: FaTwitter, color: "#1DA1F2", label: "Twitter" },
              { href: "https://whatsapp.com/channel/0029Vab1xHdBlHpfRocBSy0L", icon: FaWhatsapp, color: "#25D366", label: "WhatsApp" },
              { href: "https://www.linkedin.com/company/mumbaicharaja-ganeshgalli1928", icon: FaLinkedinIn, color: "#0077B5", label: "LinkedIn" },
            ].map(({ href, icon: Icon, color, label }, i) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                variants={iconVariants}
                className={`relative isolate bg-[${color}] text-white p-2 rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.4)] before:absolute before:inset-0 before:rounded-full before:opacity-0 hover:before:opacity-30 hover:before:scale-[1.1] before:bg-white before:transition before:duration-300`}
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Line */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs mt-6 border-t border-red-300 pt-4"
      >
        &copy; {new Date().getFullYear()} | {t("mandalName")}
        {/* <div>{t("developer")}</div> */}
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
