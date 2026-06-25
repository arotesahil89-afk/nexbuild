import apiClient from "../services/apiService";
import { useEffect, useState } from "react";

const useAwardsLoader = () => {
  const [awards, setAwards] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await apiClient.get('/awards');
        setAwards(response.data);
      } catch (error) {
        console.error("Error fetching awards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  return { awards, loading };
};

export default useAwardsLoader;

