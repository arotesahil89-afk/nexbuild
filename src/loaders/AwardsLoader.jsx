import { useEffect, useState } from "react";
import { awardsFirestoreService } from "../services/firestoreService";
import { isFirebaseConfigured } from "../services/firebase";
import apiClient from "../services/apiService";

const useAwardsLoader = (currentLang = "mr") => {
  const [awards, setAwards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // 1. If Firebase is active, listen to Firestore in real-time
    if (isFirebaseConfigured) {
      const unsubscribe = awardsFirestoreService.listenAwards(
        (items) => {
          if (!isMounted) return;
          if (items && items.length > 0) {
            // Filter by language or return all
            const langItems = items.filter(
              (a) => !a.language || a.language === currentLang
            );
            const heading =
              langItems[0]?.heading ||
              (currentLang === "mr"
                ? "पुरस्कार आणि सन्मान"
                : currentLang === "hi"
                ? "पुरस्कार और सम्मान"
                : "Awards & Honors");

            setAwards({
              title: heading,
              items: langItems.map((a) => a.text || a.title || a),
            });
            setLoading(false);
          } else {
            // Fallback to backend API if Firestore collection is empty
            fetchFromApi();
          }
        },
        (err) => {
          console.warn("[AwardsLoader] Firestore error, falling back to API:", err);
          fetchFromApi();
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } else {
      // 2. If Firebase is not configured, fetch from backend API
      fetchFromApi();
    }

    async function fetchFromApi() {
      try {
        const response = await apiClient.get("/awards");
        if (isMounted) {
          const data = response.data;
          const langData = data?.[currentLang] || data?.mr || [];
          setAwards({
            title: data?.heading?.[currentLang] || "Awards & Honors",
            items: Array.isArray(langData) ? langData : [],
          });
        }
      } catch (apiErr) {
        if (isMounted) {
          console.error("Error fetching awards from API:", apiErr);
          setError(apiErr);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [currentLang]);

  return { awards, loading, error };
};

export default useAwardsLoader;
