import { useEffect, useState } from "react";
import { eventsFirestoreService } from "../services/firestoreService";
import { isFirebaseConfigured } from "../services/firebase";
import apiClient from "../services/apiService";

const useEventsLoader = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // 1. If Firebase is active, listen to Firestore in real-time
    if (isFirebaseConfigured) {
      const unsubscribe = eventsFirestoreService.listenEvents(
        (items) => {
          if (!isMounted) return;
          if (items && items.length > 0) {
            setEvents(items);
            setLoading(false);
          } else {
            fetchFromApi();
          }
        },
        (err) => {
          console.warn("[EventsLoader] Firestore error, falling back to API:", err);
          fetchFromApi();
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } else {
      fetchFromApi();
    }

    async function fetchFromApi() {
      try {
        const response = await apiClient.get("/events");
        if (isMounted) {
          setEvents(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching events from API:", err);
          setError(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return { events, setEvents, loading, error };
};

export default useEventsLoader;
