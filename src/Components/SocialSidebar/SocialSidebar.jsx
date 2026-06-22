import React, { useEffect, useRef, useState } from "react";
import {
  FaYoutube,
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaSpotify,
  FaWhatsapp,
} from "react-icons/fa";

const SocialSidebar = () => {
  const [visible, setVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(true);
      clearTimeout(timeoutRef.current);

      // Only hide if not hovering after 1.5 seconds
      timeoutRef.current = setTimeout(() => {
        if (!isHovered) {
          setVisible(false);
        }
      }, 1500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutRef.current);
    };
  }, [isHovered]);

  const links = [
    {
      href: "https://www.youtube.com/@MumbaichaRaja22",
      icon: <FaYoutube />,
      target: "_blank",
      label: "YouTube",
      hoverColor: "hover:text-red-600",
    },
    {
      href: "https://www.facebook.com/GaneshGalli",
      icon: <FaFacebookF />,
      target: "_blank",
      label: "Facebook",
      hoverColor: "hover:text-blue-600",
    },
    {
      href: "https://www.instagram.com/raja_mumbaicha",
      icon: <FaInstagram />,
      target: "_blank",
      label: "Instagram",
      hoverColor: "hover:text-pink-500",
    },
    {
      href: "https://www.linkedin.com/company/mumbaicharaja-ganeshgalli1928",
      icon: <FaLinkedin />,
      target: "_blank",
      label: "LinkedIn",
      hoverColor: "hover:text-sky-600",
    },
    {
      href: "https://whatsapp.com/channel/0029Vab1xHdBlHpfRocBSy0L",
      icon: <FaWhatsapp />,
      target: "_blank",
      label: "Whatsapp",
      hoverColor: "hover:text-sky-600",
    },
    // {
    //   href: "#",
    //   icon: <FaSpotify />,
    // target:"_blank",
    //   label: "Spotify",
    //   hoverColor: "hover:text-green-500",
    // },
  ];

  return (
    <div
      className={`${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } transition-opacity duration-500 hidden lg:flex flex-col fixed top-[50%] translate-y-[-50%] right-4 z-50 space-y-4`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative text-gray-600 text-2xl p-3 bg-white rounded-full shadow-md transition duration-300 hover:bg-gray-100 ${link.hoverColor}`}
          aria-label={link.label}
        >
          {link.icon}
          <span className="absolute right-full mr-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition duration-300">
            {link.label}
          </span>
        </a>
      ))}
    </div>
  );
};

export default SocialSidebar;
