import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiService";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsAdmin(false);
          return;
        }

        await apiClient.get('/auth/verify');
        setIsAdmin(true);
      } catch (err) {
        console.error("Admin verification failed:", err);
        localStorage.removeItem('authToken');
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/admin-login" />;

  return children;
};

export default AdminRoute;
