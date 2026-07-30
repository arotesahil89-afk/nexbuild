import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiService";
import { Navigate } from "react-router-dom";
import { AdminContext } from "./adminContext";

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "fail"
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) { setStatus("fail"); return; }
        const res = await apiClient.get("/auth/verify");
        setProfile(res?.data || res);
        setStatus("ok");
      } catch {
        localStorage.removeItem("authToken");
        setStatus("fail");
      }
    };
    verify();
  }, []);

  // Inactivity auto-logout logic
  useEffect(() => {
    if (status !== "ok") return;

    let inactivityTimer;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes in milliseconds

    const handleLogout = async () => {
      try {
        await apiClient.post("/auth/logout");
      } catch (err) {
        // Ignore error if logout fails
      }
      localStorage.removeItem("authToken");
      setStatus("fail");
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleLogout, INACTIVITY_LIMIT);
    };

    // Initialize timer
    resetTimer();

    // Setup event listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [status]);

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

  return (
    <AdminContext.Provider value={{ profile, role: profile?.role || "admin" }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminRoute;
