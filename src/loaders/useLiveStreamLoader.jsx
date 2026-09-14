import { useEffect, useState } from "react";
import { liveStreamFirestoreService } from "../services/firestoreService";
import { isFirebaseConfigured } from "../services/firebase";
import apiClient from "../services/apiService";
import { extractYouTubeVideoId } from "../utils/youtubeUtils";

const DEFAULT_STREAM = {
  youtubeUrl: "https://www.youtube.com/watch?v=9ThLarUCcas",
  videoId: "9ThLarUCcas",
  isLive: true,
  title: "Mumbai Cha Raja Live",
  description: "",
  targetDate: "2025-08-27T08:00:00+05:30",
};

const useLiveStreamLoader = () => {
  const [streamData, setStreamData] = useState(DEFAULT_STREAM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // 1. If Firebase is configured, listen to Firestore in real-time
    if (isFirebaseConfigured) {
      const unsubscribe = liveStreamFirestoreService.listenLiveStream(
        (data) => {
          if (!isMounted) return;
          if (data) {
            setStreamData({
              ...DEFAULT_STREAM,
              ...data,
              videoId: data.videoId || extractYouTubeVideoId(data.youtubeUrl),
            });
            setLoading(false);
          } else {
            fetchFromApi();
          }
        },
        (err) => {
          console.warn("[LiveStreamLoader] Firestore error, falling back to API:", err);
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
        const response = await apiClient.get("/live-stream");
        if (!isMounted) return;
        const resData = response?.data || response;
        if (resData) {
          setStreamData({
            ...DEFAULT_STREAM,
            ...resData,
            videoId: resData.videoId || extractYouTubeVideoId(resData.youtubeUrl),
          });
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Using default live stream config due to API error:", err);
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

  return { streamData, setStreamData, loading, error };
};

export default useLiveStreamLoader;
