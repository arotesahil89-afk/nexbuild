import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const useEventsLoader = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "translations", "events");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setEvents(data.eventList || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { events, loading, setEvents };
};

export default useEventsLoader;
