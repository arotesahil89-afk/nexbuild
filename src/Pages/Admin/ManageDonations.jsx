import React, { useEffect, useState, useCallback, useRef } from "react";
import apiClient from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { downloadDonationReceipt } from "../../utils/marathiReceipt";
import {
  Search, RefreshCw, Download, ChevronUp, ChevronDown,
  CheckCircle2, XCircle, Clock, IndianRupee, Eye, X,
  Heart, Phone, MapPin, Mail, Send, FileSpreadsheet,
  AlertCircle, Calendar, Filter, ChevronDown as DropIcon
} from "lucide-react";

// ─── Status Definitions ───────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "all",       label: "All Statuses" },
  { value: "confirmed", label: "Paid / Confirmed" },
  { value: "pending",   label: "Pending" },
  { value: "failed",    label: "Failed / Cancelled" },
];

const STATUS_CFG = {
  confirmed: { label: "Confirmed (Paid)", bg: "#f0fdf4", text: "#15803d", icon: CheckCircle2 },
  pending:   { label: "Pending",          bg: "#fffbeb", text: "#b45309", icon: Clock },
  failed:    { label: "Failed",           bg: "#fef2f2", text: "#b91c1c", icon: XCircle },
  refunded:  { label: "Refunded",         bg: "#f1f5f9", text: "#475569", icon: AlertCircle },
};

const fmtINR = (n) => Number(n || 0).toLocaleString("en-IN");

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = c.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: c.bg, color: c.text, whiteSpace: "nowrap",
    }}>
      <Icon size={11} />{c.label}
    </span>
  );
};

// ─── Donation Detail Modal ────────────────────────────────────────────────────
const DonationDetailModal = ({ donation, onClose, onResendSMS }) => {
  const [resending, setResending] = useState(false);

  if (!donation) return null;

  const handleDownloadPavati = () => {
    try {
      downloadDonationReceipt({
        donationNo: donation.donationNo,
        donorName: donation.donorName || "देणगीदार",
        donorPhone: donation.donorPhone,
        donorAddress: donation.donorAddress,
        amount: donation.amount || 0,
        txnId: donation.paymentId || donation.donationNo || "",
        paymentMode: donation.paymentMode || "CCAvenue Online",
        bankRefNo: donation.bankRefNo,
        date: donation.createdAt,
      });
      toast.success("पावती यशस्वीरित्या तयार झाली!");
    } catch (err) {
      console.error("Failed to generate Pavati:", err);
      toast.error("पावती तयार करण्यात त्रुटी आली.");
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await onResendSMS(donation.id);
      toast.success(`✅ SMS Receipt link resent to +91 ${donation.donorPhone}`);
    } catch (err) {
      toast.error("❌ Failed to resend SMS receipt link");
    } finally {
      setResending(false);
    }
  };

  const dateStr = new Date(donation.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div onClick={onClose} style={modalOverlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalContainerStyle}>
        
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🪔</span>
              <p style={{ fontWeight: 800, fontSize: 16, color: "#991b1b" }}>Donation Details (देणगी तपशील)</p>
            </div>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b", marginTop: 2 }}>{donation.donationNo}</p>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          
          {/* Left Column: Devotee info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section style={cardSectionStyle}>
              <p style={cardSectionTitleStyle}>Donor Information</p>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Full Name</span><span style={detailValStyle}>{donation.donorName}</span></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Phone</span><span style={detailValStyle}>+91 {donation.donorPhone}</span></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Email</span><span style={detailValStyle}>{donation.donorEmail || "Not provided"}</span></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Address</span><span style={{ ...detailValStyle, maxWidth: "60%" }}>{donation.donorAddress}</span></div>
              {donation.panNumber && (
                <div style={detailRowStyle}><span style={detailLabelStyle}>PAN Card</span><span style={{ ...detailValStyle, fontFamily: "monospace", color: "#991b1b" }}>{donation.panNumber}</span></div>
              )}
            </section>

            <section style={cardSectionStyle}>
              <p style={cardSectionTitleStyle}>Offering & Seva</p>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Cause / Purpose</span><span style={detailValStyle}>{donation.cause}</span></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Terms Accepted</span><span style={{ ...detailValStyle, color: "#16a34a" }}>Yes (Voluntary Offering)</span></div>
            </section>
          </div>

          {/* Right Column: Payment Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section style={cardSectionStyle}>
              <p style={cardSectionTitleStyle}>Payment Breakdown</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fee2e2", marginBottom: 10 }}>
                <span style={{ fontWeight: 600, color: "#991b1b", fontSize: 13 }}>Amount Donated:</span>
                <span style={{ fontWeight: 900, color: "#991b1b", fontSize: 20 }}>₹{fmtINR(donation.amount)}/-</span>
              </div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Status</span><StatusBadge status={donation.status} /></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Payment Method</span><span style={detailValStyle}>{donation.paymentMethod?.toUpperCase()}</span></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Payment Mode</span><span style={detailValStyle}>{donation.paymentMode || "Online"}</span></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Gateway Txn ID</span><span style={{ ...detailValStyle, fontFamily: "monospace", fontSize: 11 }}>{donation.paymentId || "—"}</span></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Bank Ref No</span><span style={{ ...detailValStyle, fontFamily: "monospace", fontSize: 11 }}>{donation.bankRefNo || "—"}</span></div>
              <div style={detailRowStyle}><span style={detailLabelStyle}>Date & Time</span><span style={detailValStyle}>{dateStr}</span></div>
            </section>

            <section style={cardSectionStyle}>
              <p style={cardSectionTitleStyle}>Receipt & SMS Notifications</p>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>SMS Status</span>
                <span style={{ ...detailValStyle, color: donation.smsSent ? "#16a34a" : "#d97706", fontWeight: 700 }}>
                  {donation.smsSent ? "✓ Delivered to mobile" : "Pending / Not sent"}
                </span>
              </div>
              {donation.smsSentAt && (
                <div style={detailRowStyle}><span style={detailLabelStyle}>SMS Sent At</span><span style={detailValStyle}>{new Date(donation.smsSentAt).toLocaleTimeString()}</span></div>
              )}
            </section>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "16px 22px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={handleResend}
            disabled={resending}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8,
              background: "#fff", border: "1.5px solid #cbd5e1",
              fontSize: 12.5, fontWeight: 600, color: "#334155",
              cursor: resending ? "wait" : "pointer",
            }}
          >
            <Send size={13} color="#64748b" />
            {resending ? "Sending SMS..." : "Resend Receipt Link SMS"}
          </button>

          <button
            onClick={handleDownloadPavati}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: "#991b1b", border: "none",
              fontSize: 12.5, fontWeight: 700, color: "#fff",
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Download Official Pāvatī
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Main Manage Donations Page ───────────────────────────────────────────────
export default function ManageDonations() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, revenue: 0, todayRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Donations and Stats
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        apiClient.get("/donations", {
          params: {
            search: search || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            page,
            limit: 25,
          },
        }),
        apiClient.get("/donations/stats"),
      ]);

      const listData = listRes?.data || listRes;
      const statsData = statsRes?.data || statsRes;

      setDonations(listData.donations || []);
      setTotalPages(listData.totalPages || 1);
      setStats(statsData || { total: 0, confirmed: 0, revenue: 0, todayRevenue: 0 });
    } catch (err) {
      console.error("Error loading donations:", err);
      toast.error("Failed to load donations from server");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Resend SMS handler
  const handleResendSMS = async (id) => {
    await apiClient.post(`/donations/${id}/resend-sms`);
    fetchData();
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (donations.length === 0) {
      toast.info("No donations available to export.");
      return;
    }

    const headers = [
      "Donation No", "Date", "Donor Name", "Phone", "Email", "Address",
      "PAN Number", "Amount (INR)", "Status", "Payment Method", "Payment Mode",
      "Transaction ID", "Bank Ref No", "SMS Sent"
    ];

    const rows = donations.map(d => [
      `"${d.donationNo}"`,
      `"${new Date(d.createdAt).toLocaleDateString("en-IN")}"`,
      `"${d.donorName || ""}"`,
      `"${d.donorPhone || ""}"`,
      `"${d.donorEmail || ""}"`,
      `"${(d.donorAddress || "").replace(/"/g, '""')}"`,
      `"${d.panNumber || ""}"`,
      d.amount || 0,
      `"${d.status || ""}"`,
      `"${d.paymentMethod || ""}"`,
      `"${d.paymentMode || ""}"`,
      `"${d.paymentId || ""}"`,
      `"${d.bankRefNo || ""}"`,
      `"${d.smsSent ? "Yes" : "No"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mumbaicha_raja_donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("✅ Donations exported to CSV successfully!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1200 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🪔</span>
            <h1 className="a-page-title" style={{ margin: 0 }}>Donation Register (देणगी नोंदणी)</h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--a-muted)", marginTop: 3 }}>
            Monitor live devotee offerings, payment methods, transaction records, and Pāvatī receipts.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleExportCSV}
            className="a-btn a-btn-ghost"
            style={{ fontSize: 12, gap: 6, border: "1px solid #cbd5e1", background: "#fff" }}
          >
            <FileSpreadsheet size={14} color="#059669" /> Export Excel/CSV
          </button>
          <button
            onClick={fetchData}
            className="a-btn a-btn-ghost"
            style={{ fontSize: 12, gap: 6 }}
          >
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="a-stat">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#991b1b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={22} color="#fff" fill="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--a-muted)", fontWeight: 500 }}>Total Devotee Donations</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "var(--a-text)" }}>{stats.total.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="a-stat">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IndianRupee size={22} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--a-muted)", fontWeight: 500 }}>Total Collections (₹)</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#059669" }}>₹{fmtINR(stats.revenue)}</p>
          </div>
        </div>

        <div className="a-stat">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={22} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--a-muted)", fontWeight: 500 }}>Today's Offerings (₹)</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#d97706" }}>₹{fmtINR(stats.todayRevenue)}</p>
          </div>
        </div>

        <div className="a-stat">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={22} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--a-muted)", fontWeight: 500 }}>Confirmed (Paid)</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "var(--a-text)" }}>{stats.confirmed.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="a-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by Donor Name, Phone, Txn ID, or Donation No..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8,
              border: "1.5px solid #e2e8f0", fontSize: 12.5, outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} color="#64748b" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0",
              fontSize: 12.5, outline: "none", background: "#fff", cursor: "pointer",
            }}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donations Data Table */}
      <div className="a-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--a-border)", background: "#f8fafc" }}>
                {["Donation No", "Date", "Devotee Details", "Amount", "Method & Mode", "Txn / Ref ID", "Status", "SMS", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                    Loading donations...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                    No donations match your filter criteria.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 700, color: "#991b1b", whiteSpace: "nowrap" }}>
                      {d.donationNo}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#64748b", whiteSpace: "nowrap", fontSize: 11.5 }}>
                      {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 14px", minWidth: 160 }}>
                      <p style={{ fontWeight: 700, color: "#0f172a" }}>{d.donorName}</p>
                      <p style={{ fontSize: 11, color: "#64748b" }}>+91 {d.donorPhone}</p>
                      {d.donorAddress && (
                        <p style={{ fontSize: 10.5, color: "#94a3b8", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.donorAddress}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 900, color: "#991b1b", whiteSpace: "nowrap", fontSize: 14 }}>
                      ₹{fmtINR(d.amount)}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#334155" }}>
                        {d.paymentMethod?.toUpperCase()}
                      </span>
                      {d.paymentMode && (
                        <p style={{ fontSize: 10, color: "#64748b", textTransform: "capitalize" }}>{d.paymentMode}</p>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>
                      {d.paymentId || "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={d.status} />
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      {d.smsSent ? (
                        <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✓ Sent</span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setSelectedDonation(d)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 6,
                          background: "#fff", border: "1.5px solid #e2e8f0",
                          fontSize: 12, fontWeight: 600, color: "#334155",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={12} color="#64748b" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: 12, color: "var(--a-muted)" }}>Page {page} of {totalPages}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={paginationBtnStyle}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={paginationBtnStyle}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal View */}
      {selectedDonation && (
        <DonationDetailModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onResendSMS={handleResendSMS}
        />
      )}
    </div>
  );
}

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modalOverlayStyle = {
  position: "fixed", inset: 0, zIndex: 100,
  background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};

const modalContainerStyle = {
  background: "#fff", borderRadius: 16, width: "100%", maxWidth: 760,
  maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,.2)",
  display: "flex", flexDirection: "column",
};

const closeBtnStyle = {
  width: 30, height: 30, borderRadius: "50%", background: "#f1f5f9",
  border: "none", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};

const cardSectionStyle = {
  background: "#f8fafc", borderRadius: 12, padding: "14px 16px",
  border: "1px solid #e2e8f0",
};

const cardSectionTitleStyle = {
  fontSize: 11, fontWeight: 800, textTransform: "uppercase",
  letterSpacing: ".06em", color: "#64748b", marginBottom: 10,
};

const detailRowStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  padding: "4px 0", fontSize: 12.5,
};

const detailLabelStyle = { color: "#64748b", fontWeight: 500 };
const detailValStyle = { color: "#0f172a", fontWeight: 700, textAlign: "right" };

const paginationBtnStyle = {
  padding: "5px 12px", borderRadius: 6, border: "1px solid #cbd5e1",
  background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
};
