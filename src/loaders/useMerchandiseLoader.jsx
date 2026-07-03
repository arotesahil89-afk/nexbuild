import { useEffect, useState } from "react";
import apiClient from "../services/apiService";
import { products as defaultProducts } from "../data/merchData";

const useMerchandiseLoader = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try fetching from the backend API
        const response = await apiClient.get('/merchandise');
        if (response && response.data) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            setProducts(response.data);
            localStorage.setItem("merchandise_products", JSON.stringify(response.data));
            setLoading(false);
            return;
          } else {
            // Database is empty, seed it with defaults
            try {
              await apiClient.post('/merchandise/sync', { products: defaultProducts });
              setProducts(defaultProducts);
              localStorage.setItem("merchandise_products", JSON.stringify(defaultProducts));
              setLoading(false);
              return;
            } catch (seedErr) {
              console.warn("Failed to seed backend with default products, using local fallback:", seedErr.message);
            }
          }
        }
      } catch (error) {
        console.warn("Backend /merchandise API not available, falling back to localStorage:", error.message);
      }

      // Local storage fallback
      const cached = localStorage.getItem("merchandise_products");
      if (cached) {
        try {
          setProducts(JSON.parse(cached));
        } catch {
          setProducts(defaultProducts);
        }
      } else {
        setProducts(defaultProducts);
        localStorage.setItem("merchandise_products", JSON.stringify(defaultProducts));
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const saveProductsList = async (updatedList) => {
    setProducts(updatedList);
    localStorage.setItem("merchandise_products", JSON.stringify(updatedList));

    // Try syncing with backend API, ignore error if API is not implemented
    try {
      await apiClient.post('/merchandise/sync', { products: updatedList });
    } catch {
      // Backend does not support sync, ignore
    }
  };

  return { products, loading, setProducts: saveProductsList };
};

export default useMerchandiseLoader;
