import { useEffect, useState } from "react";
import apiClient from "../services/apiService";
import { products as defaultProducts } from "../data/merchData";

const useMerchandiseLoader = () => {
  const [products, setProducts] = useState(defaultProducts);
  const [loading, setLoading] = useState(false);

  const saveProductsList = async (updatedList) => {
    setProducts(updatedList);
    // Demo mode: skip local storage and backend sync
  };

  return { products, loading, setProducts: saveProductsList };
};

export default useMerchandiseLoader;
