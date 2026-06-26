import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiService";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "fail"

  useEffect(() => {
    const verify = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) { setStatus("fail"); return; }
        await apiClient.get("/auth/verify");
        setStatus("ok");
      } catch {
        localStorage.removeItem("authToken");
        setStatus("fail");
      }
    };
    verify();
  }, []);

  if (status === "checking") return (
    <div style={{
      minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#1c1917", color: "#a8a29e", fontSize: 14, gap: 10,
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: "50%",
        border: "2px solid #991b1b", borderTopColor: "transparent",
        display: "inline-block", animation: "spin .7s linear infinite",
      }} />
      Verifying…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (status === "fail") return <Navigate to="/admin-login" replace />;

  return children;
};

export default AdminRoute;
