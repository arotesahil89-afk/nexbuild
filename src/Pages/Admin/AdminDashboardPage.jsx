import React, { useEffect, useState, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";
import apiClient from "../../services/apiService";
import {
  ShoppingBag, Award, CalendarDays, User,
  IndianRupee, Clock, PackageCheck, ArrowRight, RefreshCw, Truck, Shirt, Heart
} from "lucide-react";

// ─── Counter animation hook ───────────────────────────────────────────────────
function useCounter(target, duration = 900, active = true) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!active || target == null) return;
    const start = performance.now();
    const from  = 0;
    const to    = Number(target) || 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (to - from) * ease));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, active]);

  return val;
}

// ─── Skeleton pulse block ────────────────────────────────────────────────────
const Pulse = ({ w = "100%", h = 14, r = 6, style: s }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: "linear-gradient(90deg, #f1f5f9 25%, #e9edf2 50%, #f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    ...s,
  }} />
);

// ─── Animated Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, prefix = "", suffix = "", iconBg, loading, delay = 0 }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!loading) { const t = setTimeout(() => setReady(true), delay); return () => clearTimeout(t); }
    else setReady(false);
  }, [loading, delay]);

  const counted = useCounter(value, 1000, ready && !loading);

  return (
    <div className="a-stat" style={{ position: "relative", overflow: "hidden" }}>
      {/* subtle shimmer overlay while loading */}
      {loading && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.6)", borderRadius: "inherit", zIndex: 1 }} />
      )}
      <div style={{
        width: 46, height: 46, borderRadius: 13,
        background: iconBg, display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0,
        boxShadow: `0 4px 12px ${iconBg}55`,
      }}>
        <Icon size={22} color="#fff" />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, color: "var(--a-muted)", fontWeight: 500, marginBottom: 3 }}>{label}</p>
        {loading
          ? <Pulse w={80} h={22} r={6} />
          : (
            <p style={{ fontSize: 24, fontWeight: 900, color: "var(--a-text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {prefix}{counted.toLocaleString("en-IN")}{suffix}
            </p>
          )
        }
      </div>
    </div>
  );
};

// ─── Quick link ───────────────────────────────────────────────────────────────
const QuickCard = ({ to, icon: Icon, label, desc, color }) => (
  <NavLink to={to} style={{ textDecoration: "none" }}>
    <div
      className="a-card"
      style={{ padding: "15px 18px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", transition: "box-shadow .18s, transform .18s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--a-shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--a-shadow)"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={17} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--a-text)" }}>{label}</p>
        <p style={{ fontSize: 11.5, color: "var(--a-muted)", marginTop: 1 }}>{desc}</p>
      </div>
      <ArrowRight size={14} color="#cbd5e1" />
    </div>
  </NavLink>
);

// ─── Table skeleton ───────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <tbody>
    {Array.from({ length: 4 }).map((_, i) => (
      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
        {[120, 110, 50, 70, 70].map((w, j) => (
          <td key={j} style={{ padding: "13px 16px" }}>
            <Pulse w={w} h={11} />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

// ─── Status chip ─────────────────────────────────────────────────────────────
const STATUS_CHIP = {
  pending:   { bg: "#fffbeb", color: "#b45309" },
  confirmed: { bg: "#eff6ff", color: "#1d4ed8" },
  picked_up: { bg: "#f0fdf4", color: "#15803d" },
  cancelled: { bg: "#fef2f2", color: "#b91c1c" },
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch stats and recent orders in parallel
      const [statsRes, ordersRes] = await Promise.all([
        apiClient.get("/orders/stats"),
        apiClient.get("/orders", { params: { limit: 6, page: 1 } })
      ]);

      const statsData = statsRes?.data || statsRes;
      const ordersData = ordersRes?.data || ordersRes;

      setStats({
        total: statsData.total || 0,
        revenue: statsData.revenue || 0,
        pending: statsData.pending || 0,
        pickedup: statsData.pickedup || 0
      });
      setRecent(ordersData.orders || []);
    } catch {
      setStats({ total: 0, revenue: 0, pending: 0, pickedup: 0 });
      setRecent([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const chip = (status) => {
    const c = STATUS_CHIP[status] || STATUS_CHIP.pending;
    return (
      <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>
        {status?.replace("_", " ")}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1100 }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media(max-width:680px){ .dash-2col{grid-template-columns:1fr !important} }
        @media(max-width:480px){ .dash-stats{grid-template-columns:1fr 1fr !important} }
      `}</style>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="a-page-title">Dashboard</h1>
          <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>
            Welcome back — here's a live overview
          </p>
        </div>
        <button
          onClick={load}
          className="a-btn a-btn-ghost"
          style={{ fontSize: 12, gap: 6 }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "shimmer 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard icon={ShoppingBag}  label="Total Orders"  value={stats?.total}   iconBg="#991b1b" loading={loading} delay={0}   />
        <StatCard icon={IndianRupee}  label="Revenue (₹)"   value={stats?.revenue} iconBg="#059669" loading={loading} delay={120} prefix="₹" />
        <StatCard icon={Clock}        label="Pending"        value={stats?.pending}  iconBg="#d97706" loading={loading} delay={240} />
        <StatCard icon={PackageCheck} label="Picked Up"     value={stats?.pickedup} iconBg="#2563eb" loading={loading} delay={360} />
      </div>

      {/* Content: recent orders + quick links */}
      <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: 16, alignItems: "start" }}>

        {/* Recent Orders */}
        <div className="a-card" style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", borderBottom: "1px solid var(--a-border)" }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>Recent Orders</p>
            <NavLink to="/admin/orders" style={{ fontSize: 12, color: "var(--a-primary)", fontWeight: 600, textDecoration: "none" }}>
              View all →
            </NavLink>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--a-border)" }}>
                  {["Order No", "Customer", "Size", "Amount", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "#94a3b8", background: "#f8fafc", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              {loading ? <TableSkeleton /> : (
                <tbody>
                  {recent.length === 0
                    ? (
                      <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No orders yet</td></tr>
                    )
                    : recent.map(o => (
                      <tr key={o.id} style={{ borderBottom: "1px solid #f8fafc" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        <td style={{ padding: "11px 16px", fontFamily: "monospace", fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{o.orderNo}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <p style={{ fontWeight: 600, color: "#0f172a" }}>{o.customerName}</p>
                          <p style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 1 }}>{o.customerPhone}</p>
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, color: "#475569" }}>
                            {o.size} ×{o.quantity}
                          </span>
                        </td>
                        <td style={{ padding: "11px 16px", fontWeight: 800, color: "#991b1b", whiteSpace: "nowrap" }}>
                          ₹{o.totalAmount?.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "11px 16px" }}>{chip(o.status)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--a-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>
            Quick Access
          </p>
          <QuickCard to="/admin/donations" icon={Heart}       label="Manage Donations" desc="Devotee offerings & receipts" color="#dc2626" />
          <QuickCard to="/admin/orders"   icon={ShoppingBag}  label="Manage Orders"    desc="View & update orders"  color="#991b1b" />
          <QuickCard to="/admin/merchandise" icon={Shirt}     label="Merchandise"      desc="Products & inventory"  color="#ec4899" />
          <QuickCard to="/admin/awards"   icon={Award}        label="Manage Awards"    desc="Add or edit awards"    color="#d97706" />
          <QuickCard to="/admin/events"   icon={CalendarDays} label="Manage Events"    desc="Schedule events"       color="#2563eb" />
          <QuickCard to="/admin/profile"  icon={User}         label="My Profile"       desc="Account & password"    color="#7c3aed" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
