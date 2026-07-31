import React, { useEffect, useState, useCallback, useRef } from "react";
import apiClient from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import { downloadMarathiReceipt } from "../../utils/marathiReceipt";
import {
  Search, RefreshCw, Download, ChevronUp, ChevronDown,
  ChevronsUpDown, CheckCircle2, XCircle, PackageCheck,
  Clock, ShoppingBag, IndianRupee, ChevronDown as DropIcon,
  Eye, X, Trash2, Truck, Home
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "all",                 label: "All Orders"  },
  { value: "pending",             label: "Payment Pending" },
  { value: "confirmed",           label: "Payment Confirm" },
  { value: "partially_picked_up", label: "Partially Picked Up" },
  { value: "picked_up",           label: "Picked Up"   },
];

const STATUS_CFG = {
  pending:             { label: "Payment Pending",     bg: "#fffbeb", text: "#b45309", icon: Clock },
  confirmed:           { label: "Payment Confirm",     bg: "#eff6ff", text: "#1d4ed8", icon: CheckCircle2 },
  partially_picked_up: { label: "Partially Picked Up", bg: "#fef3c7", text: "#d97706", icon: Clock },
  picked_up:           { label: "Picked Up",           bg: "#f0fdf4", text: "#15803d", icon: PackageCheck },
  cancelled:           { label: "Cancelled",           bg: "#fef2f2", text: "#b91c1c", icon: XCircle },
};

const PAYMENT_LABELS = {
  online: "Online", pickup: "Pay at Pickup",
  card: "Card", upi: "UPI", cod: "COD",
};

// ─── Amount Calculation Helper ────────────────────────────────────────────────
const calculateOrderTotals = (order) => {
  const dbTotal = order.totalAmount || 0;
  const baseSubtotal = (order.unitPrice || 0) * (order.quantity || 1);
  if (dbTotal === baseSubtotal) {
    let fee = 0;
    if (order.paymentMethod === 'pickup') fee = 19;
    else fee = Math.ceil(baseSubtotal * 0.0236);
    return { subtotal: baseSubtotal, fee, total: baseSubtotal + fee };
  }
  const fee = dbTotal - baseSubtotal;
  return { subtotal: baseSubtotal, fee, total: dbTotal };
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
const StatusBadge = ({ status, deliveryMethod }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = c.icon;
  let label = c.label;
  if (deliveryMethod === "home") {
    if (status === "picked_up") label = "Delivered";
    else if (status === "partially_picked_up") label = "Partially Delivered";
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text, whiteSpace: "nowrap",
    }}>
      <Icon size={11} />{label}
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
      let label = STATUS_CFG[status]?.label;
      if (order.deliveryMethod === 'home') {
        if (status === 'picked_up') label = 'Delivered';
        else if (status === 'partially_picked_up') label = 'Partially Delivered';
      }
      toast.success(`✅ Status → ${label}`);
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
            let label = cfg.label;
            if (order.deliveryMethod === 'home') {
              if (val === 'picked_up') label = 'Delivered';
              else if (val === 'partially_picked_up') label = 'Partially Delivered';
            }
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
                {label}
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
const OrderDetailModal = ({ order, onClose, onStatusChange }) => {
  const [localItems, setLocalItems] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    let itemsArr = [];
    if (order.items) {
      if (Array.isArray(order.items)) {
        itemsArr = order.items;
      } else if (typeof order.items === 'string') {
        try {
          itemsArr = JSON.parse(order.items);
        } catch (e) {
          itemsArr = [];
        }
      }
    }

    const parsedItems = [];
    const orderNo = order.orderNo;
    const shouldPrecheckAll = order.status !== 'picked_up';

    if (itemsArr && itemsArr.length > 0) {
      itemsArr.forEach(item => {
        parsedItems.push({
          ...item,
          status: shouldPrecheckAll ? 'picked_up' : item.status
        });
      });
    } else if (order.size) {
      const parts = order.size.split(',').map(p => p.trim());
      parts.forEach(part => {
        const match = part.match(/^([^:]+):\s*(\d+)$/);
        if (match) {
          const sz = match[1];
          const qty = parseInt(match[2], 10);
          for (let i = 0; i < qty; i++) {
            parsedItems.push({
              id: `${orderNo}-${sz}-${String(i + 1).padStart(2, '0')}`,
              size: sz,
              status: 'picked_up',
            });
          }
        } else {
          const qty = Number(order.quantity) || 1;
          for (let i = 0; i < qty; i++) {
            parsedItems.push({
              id: `${orderNo}-${order.size}-${String(i + 1).padStart(2, '0')}`,
              size: order.size,
              status: 'picked_up',
            });
          }
        }
      });
    }
    setLocalItems(parsedItems);
  }, [order]);

  const toggleItemStatus = (itemId) => {
    setLocalItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: item.status === 'picked_up' ? 'pending' : 'picked_up' } : item
    ));
  };

  const getOriginalStatus = (itemId) => {
    let originalItems = [];
    if (order.items) {
      if (Array.isArray(order.items)) {
        originalItems = order.items;
      } else if (typeof order.items === 'string') {
        try {
          originalItems = JSON.parse(order.items);
        } catch (e) {
          originalItems = [];
        }
      }
    }
    const found = originalItems.find(i => i.id === itemId);
    return found ? found.status : 'pending';
  };

  const hasChanges = (() => {
    let originalItems = [];
    if (order.items) {
      if (Array.isArray(order.items)) {
        originalItems = order.items;
      } else if (typeof order.items === 'string') {
        try {
          originalItems = JSON.parse(order.items);
        } catch (e) {
          originalItems = [];
        }
      }
    }
    return JSON.stringify(localItems) !== JSON.stringify(originalItems);
  })();

  const anyNewPickups = localItems.some((item, idx) => {
    let originalItems = [];
    if (order.items) {
      if (Array.isArray(order.items)) {
        originalItems = order.items;
      } else if (typeof order.items === 'string') {
        try {
          originalItems = JSON.parse(order.items);
        } catch (e) {
          originalItems = [];
        }
      }
    }
    const originalItem = originalItems[idx];
    const wasPending = !originalItem || originalItem.status === 'pending';
    return item.status === 'picked_up' && wasPending;
  });

  const handleSendOtp = async () => {
    setUpdating(true);
    try {
      const res = await apiClient.post(`/orders/${order.id}/send-otp`);
      toast.success("✅ SMS OTP sent to customer successfully!");
      setOtpSent(true);
      if (res.data && res.data.otp) {
        setDevOtpHint(res.data.otp);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to send OTP";
      toast.error(`❌ ${errMsg}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDelivery = async () => {
    // If no new pickups, we can just save changes directly
    if (!anyNewPickups) {
      await performStatusUpdate();
      return;
    }

    if (!otpSent) {
      toast.error("⚠️ Please send the verification OTP first");
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      toast.error("⚠️ Please enter the 6-digit verification code");
      return;
    }
    await performStatusUpdate(otpCode);
  };

  const performStatusUpdate = async (otpVal = undefined) => {
    setUpdating(true);
    try {
      // Determine overall status based on items
      const allPickedUp = localItems.every(item => item.status === 'picked_up');
      const anyPickedUp = localItems.some(item => item.status === 'picked_up');
      let status = 'confirmed';
      if (allPickedUp) status = 'picked_up';
      else if (anyPickedUp) status = 'partially_picked_up';

      const res = await apiClient.patch(`/orders/${order.id}/status`, {
        status,
        items: localItems,
        otp: otpVal
      });

      // Update in parent list
      onStatusChange(order.id, status, res.data?.notes, localItems);

      // Update local order data
      order.items = localItems;
      order.status = status;

      toast.success("✅ Delivery status updated successfully!");
      setOtpSent(false);
      setOtpCode("");
      setDevOtpHint("");
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to update delivery status";
      toast.error(`❌ ${errMsg}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await apiClient.post(`/orders/${order.id}/verify-payment`);
      if (res && res.data && res.data.success) {
        setVerificationResult(res.data.data);
        toast.success("💳 Payment verification complete!");
      } else {
        toast.error("❌ Failed to verify payment.");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      const errMsg = err.response?.data?.error || "Error connecting to verification service.";
      toast.error(`❌ ${errMsg}`);
    } finally {
      setVerifying(false);
    }
  };

  const getAmountBreakdown = () => calculateOrderTotals(order);

  const handleDownloadPavati = (ord) => {
    try {
      const targetOrder = ord || order;
      if (!targetOrder) return;
      const unitPrice = targetOrder.unitPrice || 330;
      const quantity = targetOrder.quantity || 1;
      const subtotal = unitPrice * quantity;
      downloadMarathiReceipt({
        receiptNo: targetOrder.orderNo?.replace(/\D/g, "").slice(-4) || "1",
        customerName: targetOrder.customerName || "",
        amount: subtotal,
        txnId: targetOrder.paymentId || targetOrder.id || "",
        productName: targetOrder.productName || "शतक महोत्सवी निधीकरिता",
        quantity: quantity,
      });
      toast.success("पावती यशस्वीरित्या डाउनलोड झाली!");
    } catch (err) {
      console.error("Failed to download Pavati:", err);
      toast.error("Failed to generate Pavati PDF");
    }
  };

  const downloadInvoicePDF = (order) => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const RED    = [185, 28, 28];
      const GOLD   = [212, 175, 55];
      const DARK   = [15, 23, 42];
      const GREY   = [100, 116, 139];
      const LGREY  = [180, 188, 198];
      const GREEN  = [22, 163, 74];
      const WHITE  = [255, 255, 255];

      const fmt = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

      // Header Banner
      doc.setFillColor(...RED);
      doc.rect(0, 0, 210, 54, "F");

      doc.setFillColor(...GOLD);
      doc.rect(0, 54, 210, 2, "F");

      doc.setFillColor(255, 255, 255);
      doc.circle(29, 27, 22, "F");

      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "/images/logo-removebg-preview.png";

      logoImg.onload = () => {
        try { doc.addImage(logoImg, "PNG", 8, 6, 42, 42); } catch (e) {}
        buildPDFBody();
      };
      logoImg.onerror = () => {
        buildPDFBody();
      };

      const buildPDFBody = () => {
        doc.setTextColor(...WHITE);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text("Lalbaug Sarvajanik Utsav Mandal", 57, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(230, 230, 230);
        doc.text("MumbaichaRaja  |  Ganesh Galli, Lalbaug,", 57, 25);
        doc.text("Mumbai - 400 012", 57, 31);
        doc.text("mumbaicharaja.co  |  Est. 1928", 57, 37);



        let metaY = 62;

        // Left Column
        const LC = 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("INVOICE DATE", LC, metaY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
        doc.text(dateStr, LC, metaY + 5.5);

        metaY += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("TIME", LC, metaY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        const timeStr = new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
        doc.text(timeStr, LC, metaY + 5.5);

        metaY += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("ORDER NO", LC, metaY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...RED);
        doc.text(order.orderNo, LC, metaY + 6);

        // Vertical divider
        doc.setDrawColor(220, 225, 232);
        doc.setLineWidth(0.4);
        doc.line(108, 58, 108, 110);

        // Right Column
        const RC = 115;
        let rcY = 62;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("PAYMENT STATUS", RC, rcY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...GREEN);
        const isOnline = order.paymentMethod !== 'pickup';
        doc.text(isOnline ? "[PAID ONLINE] Successful" : "[CASH ON PICKUP] Confirmed", RC, rcY + 5.5);

        rcY += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("PAYMENT METHOD", RC, rcY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...DARK);
        doc.text(isOnline ? "Razorpay Online (UPI/Card)" : "Cash / UPI at Counter", RC, rcY + 5.5);

        rcY += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("CUSTOMER DETAILS", RC, rcY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...DARK);
        doc.text(order.customerName, RC, rcY + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GREY);
        doc.text(`Phone: +91 ${order.customerPhone}`, RC, rcY + 10.5);
        doc.text(`Email: ${order.customerEmail}`, RC, rcY + 15);

        let bottomY = Math.max(100, rcY + 20);
        if (order.address) {
          doc.setFontSize(8);
          const addrLines = doc.splitTextToSize(`Billing Address: ${order.address}${order.pincode ? ", " + order.pincode : ""}`, 82);
          doc.text(addrLines, RC, rcY + 20);
          bottomY = Math.max(bottomY, rcY + 20 + addrLines.length * 4);
        }

        const sepY = bottomY + 4;
        doc.setDrawColor(220, 225, 232);
        doc.setLineWidth(0.4);
        doc.line(15, sepY, 195, sepY);

        const titleY = sepY + 12;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(...RED);
        doc.text("Order Invoice", 15, titleY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...GREY);
        doc.text("Official Merchandise Store  -  Ganeshotsav 2026", 15, titleY + 6);

        doc.setDrawColor(...RED);
        doc.setLineWidth(0.7);
        doc.line(15, titleY + 10, 195, titleY + 10);

        const tblY = titleY + 14;

        // Table Header
        doc.setFillColor(254, 242, 242);
        doc.rect(15, tblY, 180, 9, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...RED);
        doc.text("#",           19,  tblY + 6);
        doc.text("DESCRIPTION", 28,  tblY + 6);
        doc.text("INVOICE ID / ITEM ID", 110,  tblY + 6);
        doc.text("AMOUNT",     192,  tblY + 6, { align: "right"  });

        let rowY = tblY + 9;
        let serial = 1;

        // Retrieve and render individual items
        let itemsList = [];
        if (localItems && localItems.length > 0) {
          itemsList = localItems;
        } else {
          // Fallback parsing if localItems not populated
          if (order.size) {
            const parts = order.size.split(',').map(p => p.trim());
            parts.forEach(part => {
              const match = part.match(/^([^:]+):\s*(\d+)$/);
              if (match) {
                const sz = match[1];
                const qty = parseInt(match[2], 10);
                for (let i = 0; i < qty; i++) {
                  itemsList.push({
                    id: `${order.orderNo}-${sz}-${String(i + 1).padStart(2, '0')}`,
                    size: sz
                  });
                }
              } else {
                const qty = Number(order.quantity) || 1;
                for (let i = 0; i < qty; i++) {
                  itemsList.push({
                    id: `${order.orderNo}-${order.size}-${String(i + 1).padStart(2, '0')}`,
                    size: order.size
                  });
                }
              }
            });
          }
        }

        const rowHeight = itemsList.length > 10 ? 8 : 13;
        const itemFontSize = itemsList.length > 10 ? 7.5 : 9;

        const breakdown = getAmountBreakdown();
        const unitPrice = breakdown.subtotal / itemsList.length;

        itemsList.forEach((item) => {
          doc.setDrawColor(235, 238, 242);
          doc.setLineWidth(0.3);
          doc.line(15, rowY + rowHeight, 195, rowY + rowHeight);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(itemFontSize);
          doc.setTextColor(...DARK);
          doc.text(String(serial), 19, rowY + (rowHeight * 0.5 + 1.5));

          doc.setFont("helvetica", "bold");
          doc.setFontSize(itemFontSize);
          doc.setTextColor(...DARK);
          const prodName = doc.splitTextToSize(order.productName, 75);
          doc.text(prodName, 28, rowY + (rowHeight * 0.5 + 0.5));

          doc.setFont("helvetica", "normal");
          doc.setFontSize(itemFontSize);
          doc.setTextColor(...DARK);
          doc.text(item.id, 110, rowY + (rowHeight * 0.5 + 1.5));
          doc.text(fmt(unitPrice), 192, rowY + (rowHeight * 0.5 + 1.5), { align: "right" });

          rowY += rowHeight;
          serial++;
        });

        rowY += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...GREY);
        doc.text("Subtotal",        140, rowY);
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "bold");
        doc.text(fmt(breakdown.subtotal),     192, rowY, { align: "right" });

        rowY += 7;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GREY);
        doc.text("Convenience Fee", 140, rowY);
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "bold");
        doc.text(fmt(breakdown.fee), 192, rowY, { align: "right" });

        rowY += 5;
        doc.setDrawColor(...RED);
        doc.setLineWidth(0.7);
        doc.line(15, rowY, 195, rowY);

        rowY += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...DARK);
        doc.text("TOTAL PAID", 140, rowY);
        doc.setTextColor(...RED);
        doc.text(fmt(breakdown.total), 192, rowY, { align: "right" });

        rowY += 10;
        const deliveryMethod = order.deliveryMethod || "pickup";
        if (deliveryMethod === "home") {
          doc.setFillColor(239, 246, 255);
          doc.setDrawColor(59, 130, 246);
          doc.setLineWidth(0.3);
          doc.rect(15, rowY, 180, 16, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(29, 78, 216);
          doc.text("HOME DELIVERY SERVICE REQUESTED:", 19, rowY + 5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(30, 58, 138);
          doc.text("To coordinate delivery, please contact Mandal Coordinator: +91 99999 99989.", 19, rowY + 9);
          doc.text("Please share a copy of this digital invoice to verify your order and confirm delivery address.", 19, rowY + 13);
        } else {
          doc.setFillColor(254, 251, 238);
          doc.setDrawColor(245, 158, 11);
          doc.setLineWidth(0.3);
          doc.rect(15, rowY, 180, 16, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(180, 83, 9);
          doc.text("COLLECTION POINT (SELF-PICKUP):", 19, rowY + 5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(120, 53, 4);
          doc.text("Collect at: Ganesh Galli Mandal Office, Lalbaug, Mumbai - 400012.", 19, rowY + 9);
          doc.text("Present this Invoice order details to the Counter Coordinator to claim your items.", 19, rowY + 13);
        }

        doc.save(`invoice-${order.orderNo}.pdf`);
      };
    } catch (e) {
      toast.error("❌ Failed to generate invoice PDF");
    }
  };

  if (!order) return null;

  const breakdown = getAmountBreakdown();

  return (
    <div onClick={onClose} style={modalOverlayStyle}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          width: "100%",
          maxWidth: 800,
          maxHeight: "90dvh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e2e8f0",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>Order Details Dashboard</p>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{order.orderNo}</p>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={14} color="#64748b" />
          </button>
        </div>
        <div style={{ padding: "22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px" }}>
          {/* Left Column: Customer and Order info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Customer Details */}
            <section style={cardSectionStyle}>
              <p style={cardSectionTitleStyle}>Customer Details</p>
              <Row label="Name"  value={order.customerName} />
              <Row label="Phone" value={`+91 ${order.customerPhone}`} />
              {order.customerEmail && order.customerEmail !== 'no-email@example.com' && (
                <Row label="Email" value={order.customerEmail} mono />
              )}
              {order.address && <Row label="Address" value={order.address} />}
              {order.pincode && <Row label="Pincode" value={order.pincode} />}
            </section>

            {/* Order Details */}
            <section style={cardSectionStyle}>
              <p style={cardSectionTitleStyle}>Order Information</p>
              <Row label="Product"      value={order.productName} />
              <Row label="Size"         value={order.size} />
              <Row label="Unit Price"   value={`₹${order.unitPrice?.toLocaleString("en-IN")}`} />
              <Row label="Item Amount"  value={`₹${breakdown.subtotal.toLocaleString("en-IN")}`} />
              <Row label="Convenience Fee" value={`₹${breakdown.fee.toLocaleString("en-IN")}`} />
              <Row label="Total Paid"   value={`₹${breakdown.total.toLocaleString("en-IN")}`} bold red />
              <Row label="Delivery Method" value={order.deliveryMethod === "home" ? "Home Delivery" : "Mandal Pickup"} />
              <Row label="Payment Method"  value={PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} />
              {order.paymentId && <Row label="Transaction ID"  value={order.paymentId} mono small />}
              <Row label="Order Date"   value={new Date(order.createdAt).toLocaleString("en-IN")} />
            </section>

            {/* Actions Section */}
            <section style={cardSectionStyle}>
              <p style={cardSectionTitleStyle}>Documents</p>
              {/* English Download Invoice PDF — commented out
              <button
                onClick={() => downloadInvoicePDF(order)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  background: "#0f172a", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", transition: "opacity .15s", marginTop: 4
                }}
              >
                <Download size={14} /> Download Invoice PDF
              </button>
              */}
              <button
                onClick={() => handleDownloadPavati(order)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  background: "#8b1a1a", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", transition: "opacity .15s", marginTop: 4
                }}
              >
                <Download size={14} /> पावती डाउनलोड करा (Download Pavati)
              </button>
            </section>

            {/* Payment Verification Widget */}
            {order.paymentMethod !== 'pickup' && (
              <section style={cardSectionStyle}>
                <p style={cardSectionTitleStyle}>Payment Verification</p>
                {verificationResult ? (
                  <div style={{
                    padding: 12,
                    background: verificationResult.verified ? "#f0fdf4" : "#fef2f2",
                    borderRadius: 8,
                    border: `1px solid ${verificationResult.verified ? "#bbf7d0" : "#fecaca"}`
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      color: verificationResult.verified ? "#166534" : "#991b1b"
                    }}>
                      {verificationResult.verified ? "✓ Razorpay Verified Successful" : "✗ Verification Failed / Unpaid"}
                    </div>
                    <p style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
                      Status: <strong style={{ color: verificationResult.verified ? "#15803d" : "#b91c1c" }}>{verificationResult.status?.toUpperCase()}</strong>
                    </p>
                    <p style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                      Mode: {verificationResult.mode === 'simulated' ? 'Test/Simulation Mode' : 'Live Gateway'}
                    </p>
                    
                    {verificationResult.details && (
                      <div style={{ fontSize: 10.5, color: "#334155", marginTop: 8, borderTop: "1px solid #e2e8f0", paddingTop: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                          <span>Gateway ID:</span>
                          <span style={{ fontFamily: "monospace", fontSize: 10 }}>{verificationResult.paymentId}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                          <span>Amount:</span>
                          <strong>₹{verificationResult.details.amount}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                          <span>Method:</span>
                          <span style={{ textTransform: "uppercase" }}>{verificationResult.details.method}</span>
                        </div>
                      </div>
                    )}
                    {verificationResult.message && (
                      <p style={{ fontSize: 10, color: "#b45309", marginTop: 6, fontStyle: "italic" }}>
                        💡 {verificationResult.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleVerifyPayment}
                    disabled={verifying}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      width: "100%", padding: "8px 12px", borderRadius: 8,
                      background: "#2563eb", color: "#fff", border: "none", fontSize: 12, fontWeight: 700,
                      cursor: verifying ? "not-allowed" : "pointer", opacity: verifying ? 0.75 : 1
                    }}
                  >
                    Verify Razorpay Payment
                  </button>
                )}
              </section>
            )}
          </div>

          {/* Right Column: Checklist and OTP process */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Individual Items Checklist */}
            {localItems.length > 0 && (
              <section style={cardSectionStyle}>
                <p style={cardSectionTitleStyle}>
                  {order.deliveryMethod === 'home' ? "Items Checklist (Partial Delivery)" : "Items Checklist (Partial Pickup)"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {localItems.map((item) => {
                    const wasAlreadyGiven = getOriginalStatus(item.id) === 'picked_up';
                    return (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: wasAlreadyGiven ? "#f8fafc" : "#fff", borderRadius: 8, border: "1px solid #e2e8f0", opacity: wasAlreadyGiven ? 0.75 : 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={item.status === 'picked_up'}
                            onChange={() => toggleItemStatus(item.id)}
                            disabled={updating || wasAlreadyGiven}
                            style={{ cursor: wasAlreadyGiven ? "not-allowed" : "pointer", width: 15, height: 15 }}
                          />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontFamily: "monospace" }}>{item.id}</span>
                            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Size: {item.size}</span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: wasAlreadyGiven ? '#15803d' : (item.status === 'picked_up' ? '#2563eb' : '#b45309'),
                          background: wasAlreadyGiven ? '#f0fdf4' : (item.status === 'picked_up' ? '#eff6ff' : '#fffbeb'),
                          padding: "2px 8px", borderRadius: 99
                        }}>
                          {wasAlreadyGiven 
                            ? (order.deliveryMethod === 'home' ? 'Already Delivered' : 'Already Given') 
                            : (item.status === 'picked_up' 
                               ? (order.deliveryMethod === 'home' ? 'To Deliver' : 'To Give') 
                               : 'Pending')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {anyNewPickups && (
                  <div style={{ marginTop: 12, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: 10 }}>
                    {!otpSent ? (
                      <div>
                        <p style={{ fontSize: 12, color: "#475569", marginBottom: 8, fontWeight: 500 }}>
                          {order.deliveryMethod === 'home' 
                            ? `Verification is required for delivery. Send a 6-digit verification code to the customer's phone (+91 ${order.customerPhone}).` 
                            : `Verification is required for pickup. Send a 6-digit verification code to the customer's phone (+91 ${order.customerPhone}).`}
                        </p>
                        <button
                          onClick={handleSendOtp}
                          disabled={updating}
                          style={{
                            width: "100%", padding: "8px 12px", borderRadius: 6,
                            background: "#0f172a", color: "#fff", border: "none", fontSize: 12, fontWeight: 700,
                            cursor: updating ? "not-allowed" : "pointer"
                          }}
                        >
                          {updating ? "Sending OTP..." : "📲 Send SMS OTP"}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Enter 6-Digit SMS OTP</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 842105"
                          style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, textAlign: "center", letterSpacing: "0.2em", fontWeight: 700, background: "#fff" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, margin: 0 }}>
                            OTP has been sent to +91 {order.customerPhone}.
                          </p>
                          <button
                            onClick={handleSendOtp}
                            disabled={updating}
                            style={{ background: "none", border: "none", color: "#2563eb", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}
                          >
                            Resend OTP
                          </button>
                        </div>
                        {devOtpHint && (
                          <div style={{ marginTop: 8, padding: "6px 10px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, fontSize: 11, color: "#b45309", fontWeight: 600 }}>
                            💡 Dev Mode OTP Hint: <strong style={{ fontFamily: "monospace", fontSize: 12 }}>{devOtpHint}</strong> or master <strong style={{ fontFamily: "monospace", fontSize: 12 }}>123456</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSaveDelivery}
                  disabled={updating || !hasChanges || (anyNewPickups && !otpSent)}
                  style={{
                    width: "100%", marginTop: 12, padding: "8px 12px", borderRadius: 8,
                    background: "#991b1b", color: "#fff", border: "none", fontSize: 12.5, fontWeight: 700,
                    cursor: updating || !hasChanges || (anyNewPickups && !otpSent) ? "not-allowed" : "pointer",
                    opacity: updating || !hasChanges || (anyNewPickups && !otpSent) ? 0.6 : 1, transition: "opacity 0.15s"
                  }}
                >
                  {updating ? "Processing..." : (anyNewPickups ? (order.deliveryMethod === 'home' ? "Verify OTP & Confirm Delivery" : "Verify OTP & Confirm Pickup") : "Save Delivery Changes")}
                </button>


              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed", inset: 0, zIndex: 200,
  background: "transparent", display: "flex",
  alignItems: "center", justifyContent: "center", padding: 16,
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

// --- Animated Counter and Simple Stat Box Helpers ---------------------------
const AnimatedCounter = ({ value, duration = 400 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === undefined || value === null) return;
    const isCurrency = typeof value === 'string' && value.includes('₹');
    const numericStr = typeof value === 'string' 
      ? value.replace(/[^\d]/g, '') 
      : String(value);
    const end = parseInt(numericStr, 10);
    
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }

    let startTime = null;
    let animationFrameId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      const currentCount = Math.floor(progressRatio * end);
      
      if (isCurrency) {
        setCount(`₹${currentCount.toLocaleString('en-IN')}`);
      } else {
        setCount(currentCount);
      }

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <span>{count}</span>;
};

const SimpleStatBox = ({ label, value, color, loading }) => {
  const borderColors = {
    blue: "#bfdbfe",
    green: "#bbf7d0",
    amber: "#fde68a",
    purple: "#ddd6fe",
    gray: "#e2e8f0"
  };
  const textColors = {
    blue: "#1d4ed8",
    green: "#15803d",
    amber: "#b45309",
    purple: "#7c3aed",
    gray: "#374151"
  };
  const bgColors = {
    blue: "#eff6ff",
    green: "#f0fdf4",
    amber: "#fffbeb",
    purple: "#faf5ff",
    gray: "#f8fafc"
  };
  
  const borderColor = borderColors[color] || borderColors.gray;
  const textColor = textColors[color] || textColors.gray;
  const bgColor = bgColors[color] || bgColors.gray;

  return (
    <div style={{
      flex: "1 1 auto",
      minWidth: "90px",
      background: bgColor,
      border: `1.5px solid ${borderColor}`,
      borderRadius: "8px",
      padding: "5px 8px",
      display: "flex",
      flexDirection: "column",
      gap: "0px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
    }}>
      <span style={{ fontSize: "9px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: "1.2" }}>
        {label}
      </span>
      <span style={{ fontSize: "16px", fontWeight: "800", color: textColor, lineHeight: "1.2" }}>
        {loading ? "—" : <AnimatedCounter value={value} />}
      </span>
    </div>
  );
};


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
  const [stats,   setStats]   = useState({ total: 0, revenue: 0, pending: 0, confirmed: 0, pickedup: 0, homeDelivery: 0 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(["all"]);
  const [selectedDeliveries, setSelectedDeliveries] = useState(["all"]);
  const [dateFilter, setDateFilter] = useState("all"); // all, today, yesterday, custom
  const [customDate, setCustomDate] = useState("");    // YYYY-MM-DD for custom picker
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page,    setPage]    = useState(1);
  const [allOrdersForStats, setAllOrdersForStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Modals state
  const [detail,  setDetail]  = useState(null);       // order details modal
  
  const LIMIT = 50;

  const handleStatusToggle = (val) => {
    setPage(1);
    if (val === "all") {
      setSelectedStatuses(["all"]);
      return;
    }
    setSelectedStatuses((prev) => {
      const withoutAll = prev.filter(x => x !== "all");
      const exists = withoutAll.includes(val);
      const next = exists 
        ? withoutAll.filter(x => x !== val)
        : [...withoutAll, val];
      return next.length === 0 ? ["all"] : next;
    });
  };

  const handleDeliveryToggle = (val) => {
    setPage(1);
    if (val === "all") {
      setSelectedDeliveries(["all"]);
      return;
    }
    setSelectedDeliveries((prev) => {
      const withoutAll = prev.filter(x => x !== "all");
      const exists = withoutAll.includes(val);
      const next = exists 
        ? withoutAll.filter(x => x !== val)
        : [...withoutAll, val];
      return next.length === 0 ? ["all"] : next;
    });
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false, forceStats = false) => {
    if (!silent) setLoading(true);
    try {
      const promises = [
        apiClient.get("/orders", {
          params: { 
            status: selectedStatuses.includes("all") ? undefined : selectedStatuses.join(","), 
            deliveryMethod: selectedDeliveries.includes("all") ? undefined : selectedDeliveries.join(","),
            dateFilter,
            customDate: dateFilter === "custom" ? customDate : undefined,
            search: search || undefined, page, limit: LIMIT 
          },
        }),
        apiClient.get("/orders/stats")
      ];

      if (forceStats) {
        promises.push(apiClient.get("/orders", { params: { limit: 10000 } }));
      }

      const results = await Promise.all(promises);
      const o = results[0]?.data || results[0];
      const s = results[1]?.data || results[1];
      setOrders(o.orders || []);
      setTotal(o.total  || 0);
      setStats({
        total:       s.total    || 0,
        revenue:     s.revenue  || 0,
        pending:     s.pending  || 0,
        confirmed:   s.confirmed || 0,
        pickedup:    s.pickedup || 0,
        homeDelivery: s.homeDelivery || 0,
      });

      if (forceStats && results[2]) {
        const fullOrders = results[2]?.data?.orders || results[2]?.orders || [];
        setAllOrdersForStats(fullOrders);
        setStatsLoading(false);
      }
    } catch {
      if (!silent) toast.error("⚠️ Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [selectedStatuses, selectedDeliveries, dateFilter, customDate, search, page]);

  useEffect(() => {
    fetchOrders(false, allOrdersForStats.length === 0);
  }, [fetchOrders, allOrdersForStats.length]);

  // ── Sort (all filters are now applied server-side) ──
  const sorted = [...orders]
    .sort((a, b) => {
      let av = a[sortCol] ?? "", bv = b[sortCol] ?? "";
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return av < bv ? (sortDir === "asc" ? -1 : 1) : av > bv ? (sortDir === "asc" ? 1 : -1) : 0;
    });

  // Breakdown by delivery type
  const homeOrders   = allOrdersForStats.filter(o => o.deliveryMethod === "home");
  const pickupOrders = allOrdersForStats.filter(o => o.deliveryMethod !== "home");
  const homePending   = homeOrders.filter(o => o.status === "pending").length;
  const homeConfirmed = homeOrders.filter(o => o.status === "confirmed").length;
  const homePickedUp  = homeOrders.filter(o => o.status === "picked_up" || o.status === "partially_picked_up").length;
  const pickupPending   = pickupOrders.filter(o => o.status === "pending").length;
  const pickupConfirmed = pickupOrders.filter(o => o.status === "confirmed").length;
  const pickupPickedUp  = pickupOrders.filter(o => o.status === "picked_up" || o.status === "partially_picked_up").length;
  const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;

  const onSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  // ── Optimistic status update ───────────────────────────────────────────────
  const handleStatusChange = (id, status, notes, items) => {
    setOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      status,
      ...(notes !== undefined ? { notes } : {}),
      ...(items !== undefined ? { items } : {})
    } : o));
    // Load updated stats and full stats orders list
    Promise.all([
      apiClient.get("/orders/stats"),
      apiClient.get("/orders", { params: { limit: 10000 } })
    ]).then(([resStats, resOrders]) => {
      const s = resStats?.data || resStats;
      setStats({
        total:       s.total    || 0,
        revenue:     s.revenue  || 0,
        pending:     s.pending  || 0,
        confirmed:   s.confirmed || 0,
        pickedup:    s.pickedup || 0,
        homeDelivery: s.homeDelivery || 0,
      });
      const fullOrders = resOrders?.data?.orders || resOrders?.orders || [];
      setAllOrdersForStats(fullOrders);
      setStatsLoading(false);
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
      o.paymentId || "",
      o.deliveryMethod === 'home' && o.status === 'picked_up' 
        ? 'Delivered' 
        : o.deliveryMethod === 'home' && o.status === 'partially_picked_up' 
        ? 'Partially Delivered' 
        : STATUS_CFG[o.status]?.label || o.status
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
        .order-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="a-page-title" style={{ margin: 0 }}>Order Management</h1>
          <p style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>Live breakdown across all merchandise orders</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "#0f172a", border: "none", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
            <Download size={12}/> Export CSV
          </button>
          <button onClick={() => fetchOrders(false, true)} className="orders-reload" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "#fef2f2", border: "1.5px solid #fecaca", fontSize: 12, fontWeight: 700, color: "#991b1b", cursor: "pointer" }}>
            <RefreshCw size={12} style={{ animation: loading ? "spin .7s linear infinite" : "none" }}/> Reload
          </button>
        </div>
      </div>

      {/* Summary grid of simple boxes (Single line, scrollable if overflowing) */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap", overflowX: "auto", paddingBottom: "6px", marginBottom: "4px" }}>
        <SimpleStatBox label="Total Orders" value={stats.total} color="gray" loading={statsLoading} />
        <SimpleStatBox label="Total Revenue" value={fmt(stats.revenue)} color="green" loading={statsLoading} />
        
        <SimpleStatBox label="Home: Total" value={homeOrders.length} color="blue" loading={statsLoading} />
        <SimpleStatBox label="Home: Pending" value={homePending} color="amber" loading={statsLoading} />
        <SimpleStatBox label="Home: Confirmed" value={homeConfirmed} color="blue" loading={statsLoading} />
        <SimpleStatBox label="Home: Delivered" value={homePickedUp} color="green" loading={statsLoading} />

        <SimpleStatBox label="Pickup: Total" value={pickupOrders.length} color="purple" loading={statsLoading} />
        <SimpleStatBox label="Pickup: Pending" value={pickupPending} color="amber" loading={statsLoading} />
        <SimpleStatBox label="Pickup: Confirmed" value={pickupConfirmed} color="blue" loading={statsLoading} />
        <SimpleStatBox label="Pickup: Picked Up" value={pickupPickedUp} color="green" loading={statsLoading} />
      </div>

      {/* Filter panel (All items in one single line, scrollable) */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 12px", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "nowrap", overflowX: "auto", paddingBottom: "2px" }}>
          
          {/* Search box */}
          <div style={{ position: "relative", flex: "0 0 200px", minWidth: "150px" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input type="text" placeholder="Search name, phone..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "100%", paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6,
                border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, outline: "none",
                boxSizing: "border-box", background: "#f8fafc", transition: "border-color .15s" }}
              onFocus={e => { e.target.style.borderColor = "#991b1b"; e.target.style.background = "#fff"; }}
              onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
            />
          </div>

          <div style={{ width: 1, height: 18, background: "#cbd5e1", flexShrink: 0 }} />

          {/* Status filters */}
          <div style={{ display: "flex", gap: "4px", flexShrink: 0, alignItems: "center" }}>
            <span style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em", marginRight: "2px" }}>Status</span>
            {STATUSES.map(s => {
              const cfg = STATUS_CFG[s.value];
              const active = selectedStatuses.includes(s.value);
              return (
                <button key={s.value} className="filter-pill" onClick={() => handleStatusToggle(s.value)}
                  style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                    border: active ? "none" : "1.5px solid #e8e8e8", cursor: "pointer",
                    background: active ? "#991b1b" : (cfg ? cfg.bg : "#f8fafc"),
                    color: active ? "#fff" : (cfg ? cfg.text : "#64748b"),
                    boxShadow: active ? "0 2px 4px rgba(153,27,27,.2)" : "none" }}>{s.label}</button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 18, background: "#cbd5e1", flexShrink: 0 }} />

          {/* Delivery filters */}
          <div style={{ display: "flex", gap: "4px", flexShrink: 0, alignItems: "center" }}>
            <span style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em", marginRight: "2px" }}>Delivery</span>
            {[
              { v: "all", l: "All Delivery" },
              { v: "home", l: "🏠 Home" },
              { v: "pickup", l: "🏪 Pickup" }
            ].map(d => {
              const active = selectedDeliveries.includes(d.v);
              return (
                <button key={d.v} className="filter-pill" onClick={() => handleDeliveryToggle(d.v)}
                  style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                    border: active ? "none" : "1.5px solid #e8e8e8", cursor: "pointer",
                    background: active ? "#991b1b" : "#f8fafc",
                    color: active ? "#fff" : "#475569",
                    boxShadow: active ? "0 2px 4px rgba(153,27,27,.2)" : "none" }}>{d.l}</button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 18, background: "#cbd5e1", flexShrink: 0 }} />

          {/* Date filters */}
          <div style={{ display: "flex", gap: "4px", flexShrink: 0, alignItems: "center" }}>
            <span style={{ fontSize: "9px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em", marginRight: "2px" }}>Date</span>
            {[{ v: "all", l: "All" }, { v: "today", l: "Today" }, { v: "yesterday", l: "Yesterday" }].map(d => (
              <button key={d.v} className="filter-pill" onClick={() => { setDateFilter(d.v); setCustomDate(""); setPage(1); }}
                style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                  border: dateFilter === d.v && !customDate ? "none" : "1.5px solid #e8e8e8", cursor: "pointer",
                  background: dateFilter === d.v && !customDate ? "#0f172a" : "#f8fafc",
                  color: dateFilter === d.v && !customDate ? "#fff" : "#475569" }}>{d.l}</button>
            ))}
          </div>

          {/* Custom Date Pick */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
            background: customDate ? "#f0f9ff" : "#f8fafc",
            border: `1.5px solid ${customDate ? "#38bdf8" : "#e2e8f0"}`,
            borderRadius: 8, padding: "2px 8px",
          }}>
            <input type="date" value={customDate} max={new Date().toISOString().slice(0,10)}
              onChange={e => { setCustomDate(e.target.value); setDateFilter("custom"); setPage(1); }}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 11, fontWeight: 600, color: "#0f172a", cursor: "pointer" }}
            />
            {customDate && (
              <button onClick={() => { setCustomDate(""); setDateFilter("all"); }}
                style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}>
                <X size={11} />
              </button>
            )}
          </div>

          <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: "auto", marginRight: "4px" }}>
            {sorted.length} Order{sorted.length !== 1 ? "s" : ""}
          </span>

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
                <TH col="deliveryMethod">Delivery</TH>
                <TH col="totalAmount">Amount</TH>
                <TH col="paymentMethod">Payment</TH>
                <TH col="paymentId">PayU ID / Txn</TH>
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
                    <td colSpan={9} style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
                      <ShoppingBag size={36} style={{ margin: "0 auto 10px", opacity: .3 }} />
                      <p style={{ fontSize: 13 }}>No orders found — try adjusting filters</p>
                    </td>
                  </tr>
                )
                : sorted.map((order, i) => {
                  const isOnline = order.paymentMethod !== 'pickup';
                  return (
                    <tr
                      key={order.id}
                      className="order-row"
                      onClick={() => setDetail(order)}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        background: i % 2 === 0 ? "#fff" : "#fafafa",
                        cursor: "pointer",
                      }}
                    >
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
                      </td>

                      {/* Delivery */}
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        {order.deliveryMethod === "home" ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e0f2fe", borderRadius: 6, padding: "2.5px 8px", fontSize: 11, fontWeight: 700, color: "#0369a1" }}>
                            🚚 Home Delivery
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", borderRadius: 6, padding: "2.5px 8px", fontSize: 11, fontWeight: 700, color: "#b45309" }}>
                            📍 Pickup
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: "12px 14px", fontWeight: 800, color: "#991b1b", whiteSpace: "nowrap", fontSize: 13 }}>
                        ₹{calculateOrderTotals(order).total.toLocaleString("en-IN")}
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
                      </td>

                      {/* PayU ID / Txn */}
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11, color: "#475569", whiteSpace: "nowrap" }}>
                        {order.paymentId || <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={order.status} deliveryMethod={order.deliveryMethod} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
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
          onStatusChange={handleStatusChange}
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
