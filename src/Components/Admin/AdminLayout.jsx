import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../services/apiService";
import "./admin.css";
import {
  LayoutDashboard, Award, CalendarDays, ShoppingBag,
  LogOut, Menu, User, ChevronRight, Shield, Truck, Shirt,
} from "lucide-react";

// ─── Nav items definition ───────────────────────────────────────────────────
const NAV = [
  { to: "/admin",          end: true,  icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/admin/orders",              icon: ShoppingBag,      label: "Orders"       },
  { to: "/admin/merchandise",         icon: Shirt,            label: "Merchandise"  },
  { to: "/admin/awards",              icon: Award,            label: "Awards"       },
  { to: "/admin/events",              icon: CalendarDays,     label: "Events"       },
  { to: "/admin/users",               icon: Shield,           label: "User Master"  },
  { to: "/admin/profile",             icon: User,             label: "Profile"      },
];

// ─── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ open, onClose }) => {

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="a-overlay md-hidden" onClick={onClose} style={{ display: "block" }} />}

      <aside
        className={`a-sidebar${open ? " open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100dvh",
          width: "var(--a-sidebar-w)",
          background: "var(--a-sidebar-bg)",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--a-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                Mumbai Cha Raja
              </p>
              <p style={{ color: "#a8a29e", fontSize: 11 }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px" }}>
          <p style={{ color: "#57534e", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", padding: "0 8px", marginBottom: 6 }}>
            Menu
          </p>
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `a-nav-item${isActive ? " active" : ""}`
              }
            >
              <Icon size={17} className="a-nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <p style={{ color: "#57534e", fontSize: 10, padding: "0 8px 6px" }}>Ganesh Galli · Est. 1928</p>
        </div>
      </aside>
    </>
  );
};

// ─── Header ─────────────────────────────────────────────────────────────────
const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  // Build breadcrumb from path
  const crumbs = location.pathname
    .replace("/admin", "")
    .split("/")
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).replace("-", " "));

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await apiClient.post("/auth/logout"); } catch {}
    localStorage.removeItem("authToken");
    navigate("/admin-login");
  };

  return (
    <header
      className="a-header"
      style={{
        position: "fixed",
        top: 0,
        left: "var(--a-sidebar-w)",
        right: 0,
        height: "var(--a-header-h)",
        background: "var(--a-header-bg)",
        borderBottom: "1px solid var(--a-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 30,
        gap: 12,
      }}
    >
      {/* Left — hamburger + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <button
          onClick={onMenuClick}
          style={{
            display: "none",
            padding: 8, borderRadius: 8,
            background: "#f1f5f9", border: "none", cursor: "pointer",
          }}
          className="mobile-menu-btn"
        >
          <Menu size={18} color="#64748b" />
        </button>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#94a3b8" }}>
          <span>Admin</span>
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              <ChevronRight size={13} />
              <span style={{ color: i === crumbs.length - 1 ? "#0f172a" : "#94a3b8", fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>
                {c}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right — profile + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <NavLink
          to="/admin/profile"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, textDecoration: "none", background: "transparent", transition: "background .15s" }}
          className={({ isActive }) => isActive ? "bg-red-50" : ""}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--a-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <User size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }} className="hide-xs">Admin</span>
        </NavLink>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 13px", borderRadius: 8,
            background: "#fef2f2", border: "none",
            color: "var(--a-primary)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "background .15s",
          }}
        >
          <LogOut size={14} />
          <span className="hide-xs">{loggingOut ? "..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
};

// ─── Layout ─────────────────────────────────────────────────────────────────
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-scope" style={{ minHeight: "100dvh", background: "var(--a-bg)" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Push content right of sidebar on desktop */}
      <div
        className="a-main"
        style={{
          marginLeft: "var(--a-sidebar-w)",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header onMenuClick={() => setSidebarOpen(s => !s)} />

        {/* Page content */}
        <main
          className="admin-scroll"
          style={{
            flex: 1,
            marginTop: "var(--a-header-h)",
            padding: "24px 20px",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Responsive sidebar toggle visibility */}
      <style>{`
        @media (max-width: 768px) {
          .a-main   { margin-left: 0 !important; }
          .a-header { left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
          .hide-xs  { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
