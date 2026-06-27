import React, { useEffect, useState, useCallback } from "react";
import apiClient from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search, Plus, Edit, Trash2, CheckCircle2, XCircle,
  HelpCircle, RefreshCw, X, ChevronUp, ChevronDown
} from "lucide-react";

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
  blue:  { background: "#eff6ff", color: "#1d4ed8" },
}[c] || {});

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageShipping = () => {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Null for Add, record for Edit
  
  // Form fields
  const [form, setForm] = useState({
    pincode: "",
    city: "",
    state: "",
    deliveryCharge: "",
    estimatedDelivery: "3-4 Days",
    active: true
  });

  // Fetch
  const fetchPincodes = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiClient.get("/shipping/pincodes");
      const list = res.data || res;
      setPincodes(list || []);
    } catch {
      if (!silent) toast.error("⚠️ Failed to load pincode rates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPincodes();
  }, [fetchPincodes]);

  // Open Add Modal
  const handleAddOpen = () => {
    setEditingItem(null);
    setForm({
      pincode: "",
      city: "",
      state: "",
      deliveryCharge: "",
      estimatedDelivery: "3-4 Days",
      active: true
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleEditOpen = (item) => {
    setEditingItem(item);
    setForm({
      pincode: item.pincode,
      city: item.city,
      state: item.state,
      deliveryCharge: item.deliveryCharge.toString(),
      estimatedDelivery: item.estimatedDelivery,
      active: item.active
    });
    setModalOpen(true);
  };

  // Delete
  const handleDelete = async (pincode) => {
    if (!window.confirm(`Are you sure you want to delete pincode ${pincode}?`)) return;
    try {
      await apiClient.delete(`/shipping/pincodes/${pincode}`);
      toast.success("🗑 Pincode deleted successfully");
      fetchPincodes(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete pincode");
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (item) => {
    try {
      const updatedStatus = !item.active;
      await apiClient.put(`/shipping/pincodes/${item.pincode}`, { active: updatedStatus });
      toast.success(`✓ Pincode ${item.pincode} ${updatedStatus ? "Enabled" : "Disabled"}`);
      fetchPincodes(true);
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  // Submit Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Pincode must be a 6-digit number");
      return;
    }
    if (!form.city.trim() || !form.state.trim() || !form.deliveryCharge) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingItem) {
        // Edit Mode
        await apiClient.put(`/shipping/pincodes/${editingItem.pincode}`, {
          city: form.city.trim(),
          state: form.state.trim(),
          deliveryCharge: Number(form.deliveryCharge),
          estimatedDelivery: form.estimatedDelivery,
          active: form.active
        });
        toast.success("✓ Pincode updated successfully");
      } else {
        // Add Mode
        await apiClient.post("/shipping/pincodes", {
          pincode: form.pincode.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          deliveryCharge: Number(form.deliveryCharge),
          estimatedDelivery: form.estimatedDelivery,
          active: form.active
        });
        toast.success("✓ Pincode added successfully");
      }
      setModalOpen(false);
      fetchPincodes(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save pincode rate");
    }
  };

  // Filter list
  const filtered = pincodes.filter(item => {
    const s = search.toLowerCase();
    return (
      item.pincode.toLowerCase().includes(s) ||
      item.city.toLowerCase().includes(s) ||
      item.state.toLowerCase().includes(s)
    );
  });

  // Stats calculation
  const totalCount = pincodes.length;
  const activeCount = pincodes.filter(i => i.active).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1200 }}>
      {/* title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="a-page-title">Pincode Shipping Master</h1>
          <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>
            Configure delivery availability, charges, and transit times per pincode
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => fetchPincodes()}
            style={btnGhostStyle}
          >
            <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }} />
            Reload
          </button>
          
          <button
            onClick={handleAddOpen}
            style={btnPrimaryStyle}
          >
            <Plus size={14} /> Add Pincode
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        <StatCard icon={HelpCircle} label="Total Pincodes" value={totalCount} color="blue" loading={loading} />
        <StatCard icon={CheckCircle2} label="Active / Serviceable" value={activeCount} color="green" loading={loading} />
        <StatCard icon={XCircle} label="Disabled / Blocked" value={inactiveCount} color="red" loading={loading} />
      </div>

      {/* Search and Action Bar */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "12px 14px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by pincode, city, or state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={thStyle}>Pincode</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>State</th>
                <th style={thStyle}>Delivery Charge</th>
                <th style={thStyle}>Est. Delivery</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                    Loading shipping master...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                    No pincodes configured matching search query.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.pincode} style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: idx % 2 === 0 ? "#fff" : "#fafafa",
                  }}>
                    <td style={{ ...tdStyle, fontWeight: 700, fontFamily: "monospace", fontSize: 14 }}>
                      {item.pincode}
                    </td>
                    <td style={tdStyle}>{item.city}</td>
                    <td style={tdStyle}>{item.state}</td>
                    <td style={{ ...tdStyle, fontWeight: 800, color: "#b91c1c" }}>
                      ₹{item.deliveryCharge}
                    </td>
                    <td style={tdStyle}>{item.estimatedDelivery}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleToggleActive(item)}
                        style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          backgroundColor: item.active ? "#f0fdf4" : "#fef2f2",
                          color: item.active ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {item.active ? (
                          <>Active / Serviceable</>
                        ) : (
                          <>Disabled</>
                        )}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleEditOpen(item)}
                          style={actionIconBtnStyle}
                          title="Edit"
                        >
                          <Edit size={13} color="#475569" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.pincode)}
                          style={actionIconBtnStyle}
                          title="Delete"
                        >
                          <Trash2 size={13} color="#b91c1c" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div style={modalOverlayStyle}>
          <div style={{
            background: "#fff", borderRadius: 16,
            width: "100%", maxWidth: 400,
            boxShadow: "0 20px 50px rgba(0,0,0,.15)",
            overflow: "hidden",
            margin: "auto",
            maxHeight: "90dvh",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>
                {editingItem ? `Edit Shipping Master: ${editingItem.pincode}` : "Add New Serviceable Pincode"}
              </p>
              <button onClick={() => setModalOpen(false)} style={closeBtnStyle}>
                <X size={14} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
              {/* Pincode */}
              <div>
                <label style={labelStyle}>Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 400070"
                  disabled={!!editingItem}
                  value={form.pincode}
                  onChange={e => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, "") }))}
                  style={inputStyle}
                  required
                />
              </div>

              {/* City */}
              <div>
                <label style={labelStyle}>City *</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={form.city}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>

              {/* State */}
              <div>
                <label style={labelStyle}>State *</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={form.state}
                  onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Delivery Charge */}
              <div>
                <label style={labelStyle}>Delivery Charge (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={form.deliveryCharge}
                  onChange={e => setForm(p => ({ ...p, deliveryCharge: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Estimated Delivery */}
              <div>
                <label style={labelStyle}>Estimated Delivery Time *</label>
                <input
                  type="text"
                  placeholder="e.g. 2-3 Days"
                  value={form.estimatedDelivery}
                  onChange={e => setForm(p => ({ ...p, estimatedDelivery: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Active Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="active-check"
                  checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <label htmlFor="active-check" style={{ fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                  Active & Serviceable
                </label>
              </div>

              <button
                type="submit"
                style={btnPrimaryFullStyle}
              >
                {editingItem ? "Save Changes" : "Add Pincode"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

// Styles
const thStyle = {
  padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 600,
  textTransform: "uppercase", letterSpacing: ".05em", color: "#94a3b8",
  borderBottom: "1px solid #e2e8f0"
};

const tdStyle = {
  padding: "12px 14px", color: "#374151"
};

const btnPrimaryStyle = {
  display: "flex", alignItems: "center", gap: 5,
  padding: "8px 14px", borderRadius: 8,
  background: "#991b1b", border: "none",
  fontSize: 12.5, fontWeight: 700, color: "#fff",
  cursor: "pointer"
};

const btnPrimaryFullStyle = {
  width: "100%", padding: "10px", borderRadius: 8,
  background: "#991b1b", border: "none",
  fontSize: 13, fontWeight: 700, color: "#fff",
  cursor: "pointer", marginTop: 8
};

const btnGhostStyle = {
  display: "flex", alignItems: "center", gap: 5,
  padding: "8px 14px", borderRadius: 8,
  background: "#f1f5f9", border: "1.5px solid #cbd5e1",
  fontSize: 12.5, fontWeight: 600, color: "#475569",
  cursor: "pointer"
};

const actionIconBtnStyle = {
  background: "#f1f5f9", border: "none", borderRadius: 6,
  width: 26, height: 26, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const modalOverlayStyle = {
  position: "fixed", inset: 0, zIndex: 200,
  background: "rgba(0,0,0,.45)", display: "flex",
  alignItems: "center", justifyContent: "center", padding: 16,
  backdropFilter: "blur(3px)",
  overflowY: "auto",
};

const closeBtnStyle = {
  background: "#f1f5f9", border: "none", borderRadius: "50%",
  width: 24, height: 24, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const labelStyle = {
  display: "block", fontSize: 11.5, fontWeight: 600, color: "#64748b",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em"
};

const inputStyle = {
  width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0",
  borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box"
};

export default ManageShipping;
