import React, { useEffect, useState, useCallback, useRef } from "react";
import apiClient from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search, RefreshCw, Download, ChevronUp, ChevronDown,
  ChevronsUpDown, CheckCircle2, XCircle, PackageCheck,
  Clock, ShoppingBag, IndianRupee, ChevronDown as DropIcon,
  Eye, X, Trash2
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "all",       label: "All Orders"  },
  { value: "pending",   label: "Pending"     },
  { value: "confirmed", label: "Confirmed"   },
  { value: "picked_up", label: "Picked Up"   },
];

const STATUS_CFG = {
  pending:   { label: "Pending",   bg: "#fffbeb", text: "#b45309", icon: Clock },
  confirmed: { label: "Confirmed", bg: "#eff6ff", text: "#1d4ed8", icon: CheckCircle2 },
  picked_up: { label: "Picked Up", bg: "#f0fdf4", text: "#15803d", icon: PackageCheck },
  cancelled: { label: "Cancelled", bg: "#fef2f2", text: "#b91c1c", icon: XCircle },
};

const PAYMENT_LABELS = {
  online: "Online", pickup: "Pay at Pickup",
  card: "Card", upi: "UPI", cod: "COD",
};

// ─── Skeleton row ────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
    {[140, 180, 140, 100, 100, 100, 90].map((w, i) => (
      <td key={i} style={{ padding: "13px 14px" }}>
        <div style={{
          height: 12, width: w, borderRadius: 6,
          background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }} />
      </td>
    ))}
  </tr>
);

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = c.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text, whiteSpace: "nowrap",
    }}>
      <Icon size={11} />{c.label}
    </span>
  );
};

// ─── Action Dropdown ──────────────────────────────────────────────────
const ActionDropdown = ({ order, onStatusChange, onView }) => {
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const changeStatus = async (status) => {
    setSaving(true);
    setOpen(false);
    try {
      await apiClient.patch(`/orders/${order.id}/status`, { status });
      onStatusChange(order.id, status);
      toast.success(`✅ Status → ${STATUS_CFG[status]?.label}`);
    } catch {
      toast.error("❌ Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 10px", borderRadius: 7,
          background: saving ? "#f1f5f9" : "#fff",
          border: "1.5px solid #e2e8f0",
          fontSize: 12, fontWeight: 600, color: "#374151",
          cursor: saving ? "wait" : "pointer",
          transition: "border-color .15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#991b1b"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
      >
        {saving ? <RefreshCw size={11} style={{ animation: "spin .7s linear infinite" }} /> : "Actions"}
        <DropIcon size={11} style={{ opacity: .5, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 99,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          minWidth: 180, overflow: "hidden",
        }}>
          {/* View details */}
          <button
            onClick={() => { onView(order); setOpen(false); }}
            style={dropItemStyle}
          >
            <Eye size={13} color="#64748b" /> View Details
          </button>

          <div style={{ height: 1, background: "#f1f5f9", margin: "2px 0" }} />

          {/* Status options */}
          <p style={dropItemHeaderStyle}>Change Order Status</p>
          {Object.entries(STATUS_CFG).filter(([val]) => val !== "cancelled").map(([val, cfg]) => {
            const Icon = cfg.icon;
            const isActive = order.status === val;
            return (
              <button
                key={val}
                onClick={() => !isActive && changeStatus(val)}
                disabled={isActive}
                style={{
                  ...dropItemStyle,
                  color: isActive ? cfg.text : "#374151",
                  background: isActive ? cfg.bg : "transparent",
                  cursor: isActive ? "default" : "pointer",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                <Icon size={13} color={cfg.text} />
                {cfg.label}
                {isActive && <span style={{ marginLeft: "auto", fontSize: 10, color: cfg.text }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const dropItemStyle = {
  display: "flex", alignItems: "center", gap: 8,
  width: "100%", padding: "8px 12px",
  background: "transparent", border: "none",
  fontSize: 12.5, fontWeight: 500, color: "#374151",
  cursor: "pointer", textAlign: "left",
  transition: "background .1s",
};

const dropItemHeaderStyle = {
  padding: "4px 12px", fontSize: 9.5, color: "#94a3b8",
  fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em",
  marginTop: 2, marginBottom: 2
};

// ─── Order Detail Modal ──────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onRefreshStatus, onCancelShipment }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  if (!order) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={{
        background: "#fff", borderRadius: 18,
        width: "100%", maxWidth: 500,
        maxHeight: "90dvh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,.2)",
        margin: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Order Details</p>
            <p style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{order.orderNo}</p>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={14} color="#64748b" />
          </button>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Customer */}
          <section style={cardSectionStyle}>
            <p style={cardSectionTitleStyle}>Customer Details</p>
            <Row label="Name"  value={order.customerName} />
            <Row label="Phone" value={`+91 ${order.customerPhone}`} />
            <Row label="Email" value={order.customerEmail} mono />
            {order.address && <Row label="Address" value={order.address} />}
            {order.pincode && <Row label="Pincode" value={order.pincode} />}
          </section>

          {/* Order info */}
          <section style={cardSectionStyle}>
            <p style={cardSectionTitleStyle}>Order Details</p>
            <Row label="Product"  value={order.productName} />
            <Row label="Size"     value={order.size} />
            <Row label="Unit"     value={`₹${order.unitPrice?.toLocaleString("en-IN")}`} />
            <Row label="Total"    value={`₹${order.totalAmount?.toLocaleString("en-IN")}`} bold red />
            <Row label="Delivery"  value={order.deliveryMethod === "home" ? "Home Delivery" : "Mandal Pickup"} />
            <Row label="Payment"  value={PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} />
            {order.paymentId && <Row label="Txn ID"  value={order.paymentId} mono small />}
            <Row label="Date"     value={new Date(order.createdAt).toLocaleString("en-IN")} />
          </section>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed", inset: 0, zIndex: 200,
  background: "rgba(0,0,0,.5)", display: "flex",
  alignItems: "center", justifyContent: "center", padding: 16,
  backdropFilter: "blur(4px)",
  overflowY: "auto",
};

const closeBtnStyle = {
  background: "#f1f5f9", border: "none", borderRadius: "50%",
  width: 28, height: 28, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const cardSectionStyle = {
  background: "#f8fafc", borderRadius: 10, padding: "14px 16px"
};

const cardSectionTitleStyle = {
  fontSize: 10.5, fontWeight: 700, color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10
};

const actionBtnStyle = (color) => ({
  padding: "6px 12px", borderRadius: 6,
  background: color, border: "none", color: "#fff",
  fontSize: 11.5, fontWeight: 600, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 5
});

const Row = ({ label, value, mono, bold, red, small }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 8 }}>
    <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>{label}</span>
    <span style={{
      fontSize: small ? 11 : 13, fontWeight: bold ? 700 : 500,
      color: red ? "#991b1b" : "#0f172a",
      fontFamily: mono ? "monospace" : "inherit",
      textAlign: "right", wordBreak: "break-all",
    }}>{value}</span>
  </div>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,.06)",
  }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...iconStyle(color) }}>
      <Icon size={18} />
    </div>
    <div>
      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
        {loading ? <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span> : value}
      </p>
    </div>
  </div>
);

const iconStyle = (c) => ({
  red:   { background: "#fef2f2", color: "#991b1b" },
  green: { background: "#f0fdf4", color: "#15803d" },
  amber: { background: "#fffbeb", color: "#b45309" },
  blue:  { background: "#eff6ff", color: "#1d4ed8" },
}[c] || {});

// ─── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ col, sortCol, dir }) =>
  sortCol !== col
    ? <ChevronsUpDown size={12} style={{ opacity: .3, marginLeft: 3 }} />
    : dir === "asc"
    ? <ChevronUp size={12} style={{ color: "#991b1b", marginLeft: 3 }} />
    : <ChevronDown size={12} style={{ color: "#991b1b", marginLeft: 3 }} />;

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageOrders = () => {
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [stats,   setStats]   = useState({ total: 0, revenue: 0, pending: 0, pickedup: 0 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page,    setPage]    = useState(1);
  
  // Modals state
  const [detail,  setDetail]  = useState(null);       // order details modal
  
  const LIMIT = 50;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        apiClient.get("/orders", {
          params: { status: filter !== "all" ? filter : undefined, search: search || undefined, page, limit: LIMIT },
        }),
        apiClient.get("/orders/stats")
      ]);
      const o = ordersRes?.data || ordersRes;
      const s = statsRes?.data || statsRes;
      setOrders(o.orders || []);
      setTotal(o.total  || 0);
      setStats({
        total: s.total || 0,
        revenue: s.revenue || 0,
        pending: s.pending || 0,
        pickedup: s.pickedup || 0
      });
    } catch {
      if (!silent) toast.error("⚠️ Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Sort (client-side on current page) ────────────────────────────────────
  const sorted = [...orders].sort((a, b) => {
    let av = a[sortCol] ?? "", bv = b[sortCol] ?? "";
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    return av < bv ? (sortDir === "asc" ? -1 : 1) : av > bv ? (sortDir === "asc" ? 1 : -1) : 0;
  });

  const onSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  // ── Optimistic status update ───────────────────────────────────────────────
  const handleStatusChange = (id, status, notes) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, ...(notes !== undefined ? { notes } : {}) } : o));
    // Load updated stats
    apiClient.get("/orders/stats").then(res => {
      const s = res?.data || res;
      setStats({
        total: s.total || 0,
        revenue: s.revenue || 0,
        pending: s.pending || 0,
        pickedup: s.pickedup || 0
      });
    }).catch(() => {});
  };

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const H = ["Order No","Date","Name","Phone","Email","Product","Size","Qty","Total","Payment","Txn ID","Status"];
    const rows = sorted.map(o => [
      o.orderNo, new Date(o.createdAt).toLocaleDateString("en-IN"),
      o.customerName, o.customerPhone, o.customerEmail,
      o.productName, o.size, o.quantity, o.totalAmount,
      PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod,
      o.paymentId || "", o.status
    ]);
    const csv = [H, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `mcr-orders-${new Date().toISOString().slice(0,10)}.csv`,
    });
    a.click();
  };

  // ── TH helper ─────────────────────────────────────────────────────────────
  const TH = ({ col, children, style: s }) => (
    <th onClick={() => onSort(col)} style={{
      padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: ".05em", color: "#94a3b8",
      background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
      whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
      ...s,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        {children}<SortIcon col={col} sortCol={sortCol} dir={sortDir} />
      </span>
    </th>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1400 }}>
      {/* ── shimmer keyframes ── */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .orders-reload:hover { background:#fee2e2 !important; color:#991b1b !important; }
        .filter-pill:hover { opacity:.8; }
      `}</style>

      {/* Page title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="a-page-title">Order Management Dashboard</h1>
          <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>Manage merchandise orders and track payments</p>
        </div>
        <button
          onClick={() => fetchOrders()}
          className="orders-reload"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 8,
            background: "#fef2f2", border: "1.5px solid #fecaca",
            fontSize: 12.5, fontWeight: 700, color: "#991b1b",
            cursor: "pointer", transition: "background .15s",
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }} />
          Reload Orders
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard icon={ShoppingBag}  label="Total Orders"  value={stats.total}    color="red"   loading={loading} />
        <StatCard icon={IndianRupee}  label="Revenue"       value={`₹${stats.revenue.toLocaleString("en-IN")}`} color="green" loading={loading} />
        <StatCard icon={Clock}        label="Pending Orders" value={stats.pending}  color="amber" loading={loading} />
        <StatCard icon={PackageCheck} label="Picked Up / Shipped" value={stats.pickedup} color="blue"  loading={loading} />
      </div>

      {/* Filter bar */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "12px 14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search name, phone, email, order no, address…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: "100%", paddingLeft: 33, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13,
                outline: "none", boxSizing: "border-box",
                transition: "border-color .15s",
              }}
              onFocus={e => e.target.style.borderColor = "#991b1b"}
              onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Status pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STATUSES.map(s => {
              const cfg = STATUS_CFG[s.value];
              const active = filter === s.value;
              return (
                <button
                  key={s.value}
                  className="filter-pill"
                  onClick={() => { setFilter(s.value); setPage(1); }}
                  style={{
                    padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: "none", cursor: "pointer", transition: "all .15s",
                    background: active ? "#991b1b" : (cfg ? cfg.bg : "#f1f5f9"),
                    color: active ? "#fff" : (cfg ? cfg.text : "#64748b"),
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* CSV */}
          <button
            onClick={exportCSV}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 13px", borderRadius: 8,
              background: "#0f172a", border: "none",
              fontSize: 12, fontWeight: 600, color: "#fff",
              cursor: "pointer", transition: "opacity .15s", marginLeft: "auto",
            }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* DataTable */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <TH col="orderNo">Order No / Date</TH>
                <TH col="customerName">Customer</TH>
                <TH col="productName">Product / Qty</TH>
                <TH col="totalAmount">Amount</TH>
                <TH col="paymentMethod">Payment</TH>
                <TH col="status">Status</TH>
                <th style={staticTHStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : sorted.length === 0
                ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
                      <ShoppingBag size={36} style={{ margin: "0 auto 10px", opacity: .3 }} />
                      <p style={{ fontSize: 13 }}>No orders found — try adjusting filters</p>
                    </td>
                  </tr>
                )
                : sorted.map((order, i) => {
                  const isOnline = order.paymentMethod !== 'pickup';
                  return (
                    <tr key={order.id} style={{
                      borderBottom: "1px solid #f8fafc",
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                    }}>
                      {/* Order No / Date */}
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <p style={{ fontFamily: "monospace", fontSize: 11.5, fontWeight: 700, color: "#475569" }}>
                          {order.orderNo}
                        </p>
                        <p style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                          <span style={{ marginLeft: 6, color: "#64748b", fontWeight: 600 }}>
                            {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                          </span>
                        </p>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "12px 14px", minWidth: 200 }}>
                        <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{order.customerName}</p>
                        <p style={{ fontSize: 11.5, color: "#64748b", marginTop: 1 }}>+91 {order.customerPhone}</p>
                        <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>{order.customerEmail}</p>
                      </td>

                      {/* Product */}
                      <td style={{ padding: "12px 14px", minWidth: 120 }}>
                        <p style={{ fontSize: 12.5, color: "#374151" }}>{order.productName}</p>
                        <span style={{ display: "inline-block", marginTop: 3, background: "#f1f5f9", borderRadius: 5, padding: "1px 7px", fontSize: 11, fontWeight: 700, color: "#475569" }}>
                          {order.size}
                        </span>
                        {order.deliveryMethod === "home" ? (
                          <span style={{ display: "inline-block", marginLeft: 4, marginTop: 3, background: "#e0f2fe", borderRadius: 5, padding: "1px 7px", fontSize: 11, fontWeight: 700, color: "#0369a1" }}>
                            🚚 Home Delivery
                          </span>
                        ) : (
                          <span style={{ display: "inline-block", marginLeft: 4, marginTop: 3, background: "#fef3c7", borderRadius: 5, padding: "1px 7px", fontSize: 11, fontWeight: 700, color: "#b45309" }}>
                            📍 Pickup
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: "12px 14px", fontWeight: 800, color: "#991b1b", whiteSpace: "nowrap", fontSize: 13 }}>
                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 8px", borderRadius: 6,
                          background: isOnline ? "#eff6ff" : "#f0fdf4",
                          color: isOnline ? "#1d4ed8" : "#15803d",
                          fontSize: 11.5, fontWeight: 600,
                        }}>
                          {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                        </span>
                        {isOnline && order.paymentId && (
                          <p style={{ fontFamily: "monospace", fontSize: 9.5, color: "#94a3b8", marginTop: 3, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }} title={order.paymentId}>
                            Txn: {order.paymentId}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 14px" }}>
                        <ActionDropdown
                          order={order}
                          onStatusChange={handleStatusChange}
                          onView={setDetail}
                        />
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && sorted.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px", borderTop: "1px solid #f1f5f9",
            fontSize: 12, color: "#94a3b8",
          }}>
            <span>Showing {sorted.length} of {total} orders</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pgBtnStyle(page === 1)}>← Prev</button>
              <span style={{ padding: "5px 10px", fontWeight: 700, color: "#374151" }}>Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={sorted.length < LIMIT} style={pgBtnStyle(sorted.length < LIMIT)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <OrderDetailModal
          order={detail}
          onClose={() => setDetail(null)}
        />
      )}

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

const staticTHStyle = {
  padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 600,
  textTransform: "uppercase", letterSpacing: ".05em", color: "#94a3b8",
  background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap"
};

const pgBtnStyle = (disabled) => ({
  padding: "5px 12px", borderRadius: 7,
  background: disabled ? "#f8fafc" : "#f1f5f9",
  border: "1px solid #e2e8f0",
  fontSize: 12, fontWeight: 600, color: disabled ? "#cbd5e1" : "#374151",
  cursor: disabled ? "not-allowed" : "pointer",
});

export default ManageOrders;
