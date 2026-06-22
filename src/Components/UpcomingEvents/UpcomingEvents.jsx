import React, { useRef, useEffect, useState } from "react";
import CountdownTimer from "../CountdownTimer/CountdownTimer.jsx";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { db } from "../../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

gsap.registerPlugin(ScrollTrigger);

const UpcomingEvents = () => {
  const { t, i18n } = useTranslation("events");
  const sectionRef = useRef();
  const headingRef = useRef();
  const gridRef = useRef();
  const [events, setEvents] = useState([]);

  // Convert 12-hour time (08:00 AM) to 24-hour HH:mm
  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // Fetch events from Firestore
  useEffect(() => {
    const docRef = doc(db, "translations", "events");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const upcoming = (data.eventList || [])
          .map((ev) => {
            if (!ev.date || !ev.time) return null;
            const time24 = convertTo24Hour(ev.time);
            const dateTimeStr = `${ev.date}T${time24}:00`;
            const dateObj = new Date(dateTimeStr);
            if (isNaN(dateObj)) return null;

            return {
              name: ev.title?.[i18n.language] || ev.title?.en || "Event",
              date: dateObj.toISOString(),
            };
          })
          .filter((ev) => ev !== null)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 4);

        setEvents(upcoming);
      }
    });

    return () => unsubscribe();
  }, [i18n.language]);

  // GSAP animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    tl.from(headingRef.current, {
      y: -60,
      autoAlpha: 0,
      duration: 1.2,
      delay: 0.5,
      ease: "power4.out",
    });

    const cards = gridRef.current?.querySelectorAll(".event-card");
    if (cards?.length) {
      tl.from(
        cards,
        {
          y: 40,
          autoAlpha: 0,
          duration: 1.2,
          delay: 0.5,
          ease: "power4.out",
          stagger: 0.3,
        },
        "-=0.8"
      );
    }
  }, [events]);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gradient-to-br from-red-50 via-orange-50 to-white py-20 px-4 sm:px-8"
    >
      <h2
        ref={headingRef}
        className="text-3xl sm:text-4xl font-bold text-[#b91c1c] mb-12 text-center tracking-wide"
        style={{ willChange: "transform, opacity" }}
      >
        {t("upcomingHeading")}
      </h2>

      {events.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No upcoming events</p>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {events.map((event, index) => (
            <div key={index} className="event-card" style={{ willChange: "transform, opacity" }}>
              <CountdownTimer eventName={event.name} targetDate={event.date} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UpcomingEvents;
