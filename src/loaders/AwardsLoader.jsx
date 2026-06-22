import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const useAwardsLoader = (lang = "en") => {
  const [awards, setAwards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "translations", "awards");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Only take the selected language
          const formatted = {
            title: data.heading?.[lang] || "Awards & Recognition",
            items: data[lang] || [],
          };

          setAwards(formatted);
        } else {
          setAwards({ title: "", items: [] });
        }
      } catch (err) {
        console.error("Error fetching awards:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [lang]);

  return { awards, loading, error };
};

export default useAwardsLoader;
