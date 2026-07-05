import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle2, Lock, ChevronLeft, AlertCircle,
  MapPin, Wifi, Store, Download,
} from "lucide-react";
import { loadRazorpay, openRazorpayCheckout } from "../../utils/loadRazorpay";
import { jsPDF } from "jspdf";

const fmtINR = (n) => Number(n).toLocaleString("en-IN");

// generateInvoiceSVG removed (PDF generation is now handled client-side using jsPDF)

/* ── Fee rules ──────────────────────────────────────────
   Online  → 2% of order amount (Razorpay gateway charge)
   Pickup  → ₹19 flat booking / reservation fee
   Donation (showCod=false) → no extra fee, trust absorbs it
   ──────────────────────────────────────────────────────── */
const computeFee = (mode, amount, showCod) => {
  if (!showCod) return 0;                        // donations: no fee
  if (mode === "pickup") return 19;              // ₹19 booking fee
  return Math.round(amount * 0.02);             // 2% gateway fee
};

const PaymentGatewayModal = ({
  open,
  onClose,
  amount,
  title      = "Complete Payment",
  onSuccess,
  showCod    = false,
  customer   = null,
  orderDetails = null,
}) => {
  const [step,     setStep]     = useState("idle");
  const [mode,     setMode]     = useState("online");
  const [loadErr,  setLoadErr]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [payData,  setPayData]  = useState(null);
  const [paidAmount, setPaidAmount] = useState(0);

  const deliveryCharge = 0;
  const baseTotal      = amount;
  const fee            = computeFee(mode, baseTotal, showCod);
  const total          = baseTotal + fee;
  const scrollRef = useRef(null);
  const hasDownloadedRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  useEffect(() => {
    if (!open) {
      setStep("idle");
      setMode("online");
      setLoadErr(false);
      setProgress(0);
      setPayData(null);
      setPaidAmount(0);
      hasDownloadedRef.current = false;
    }
  }, [open]);

  const downloadInvoice = () => {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "/images/logo-removebg-preview.png";

      const generatePDF = (img) => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        // ── Color Palette ──
        const RED    = [185, 28, 28];
        const GOLD   = [212, 175, 55];
        const DARK   = [15, 23, 42];
        const GREY   = [100, 116, 139];
        const LGREY  = [180, 188, 198];
        const GREEN  = [22, 163, 74];
        const WHITE  = [255, 255, 255];

        // Helper: format currency without ₹ symbol (jsPDF built-in fonts don't support it)
        const fmt = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

        /* ════════════════════════════════════════
           HEADER BANNER
        ════════════════════════════════════════ */
        // Header banner — taller for bigger logo
        doc.setFillColor(...RED);
        doc.rect(0, 0, 210, 54, "F");

        // Gold accent line
        doc.setFillColor(...GOLD);
        doc.rect(0, 54, 210, 2, "F");

        // White circle backdrop for logo
        doc.setFillColor(255, 255, 255);
        doc.circle(29, 27, 22, "F");

        // Circular logo — large, centred in header
        if (img) {
          try { doc.addImage(img, "PNG", 8, 6, 42, 42); }
          catch (e) { console.warn("Logo failed:", e); }
        }

        // Mandal name & address (right of logo)
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

        // Gold ORDER INVOICE box (top-right) — compact
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.6);
        doc.rect(143, 16, 54, 18, "D");

        doc.setTextColor(...WHITE);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("ORDER INVOICE", 170, 22, { align: "center" });

        const refId     = payData?.txnId || payData?.razorpay_payment_id || "PICKUP" + Date.now().toString().slice(-6);
        const txnDisplay = ("#TXN" + refId.toUpperCase()).slice(0, 16);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...GOLD);
        doc.text(txnDisplay, 170, 29, { align: "center" });

        /* ════════════════════════════════════════
           META INFO SECTION (two columns)
        ════════════════════════════════════════ */
        let metaY = 62;

        // ── Left Column ──
        const LC = 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("INVOICE DATE", LC, metaY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
        doc.text(dateStr, LC, metaY + 5.5);

        metaY += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("TIME", LC, metaY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
        doc.text(timeStr, LC, metaY + 5.5);

        metaY += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("ORDER ID", LC, metaY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...RED);
        const orderId = "#ORD" + refId.slice(-6).toUpperCase();
        doc.text(orderId, LC, metaY + 6);

        // ── Vertical divider ──
        doc.setDrawColor(220, 225, 232);
        doc.setLineWidth(0.4);
        doc.line(108, 58, 108, 110);

        // ── Right Column ──
        const RC = 115;
        let rcY = 62;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("PAYMENT STATUS", RC, rcY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...GREEN);
        doc.text("[PAID ONLINE] Successful", RC, rcY + 5.5);

        rcY += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("PAYMENT METHOD", RC, rcY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...DARK);
        doc.text("Razorpay Online (UPI/Card)", RC, rcY + 5.5);

        rcY += 13;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...LGREY);
        doc.text("CUSTOMER DETAILS", RC, rcY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...DARK);
        doc.text(customer?.name || "Devotee", RC, rcY + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GREY);
        doc.text(`Phone: +91 ${customer?.phone || "-"}`, RC, rcY + 10.5);
        doc.text(`Email: ${customer?.email || "-"}`, RC, rcY + 15);

        // Billing address
        let bottomY = Math.max(100, rcY + 20);
        if (customer?.address) {
          doc.setFontSize(8);
          const addrLines = doc.splitTextToSize(`Billing Address: ${customer.address}${customer.pincode ? ", " + customer.pincode : ""}`, 82);
          doc.text(addrLines, RC, rcY + 20);
          bottomY = Math.max(bottomY, rcY + 20 + addrLines.length * 4);
        }

        /* ════════════════════════════════════════
           HORIZONTAL SEPARATOR
        ════════════════════════════════════════ */
        const sepY = bottomY + 4;
        doc.setDrawColor(220, 225, 232);
        doc.setLineWidth(0.4);
        doc.line(15, sepY, 195, sepY);

        /* ════════════════════════════════════════
           ORDER INVOICE TITLE + STAMP
        ════════════════════════════════════════ */
        const titleY = sepY + 12;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(...RED);
        doc.text("Order Invoice", 15, titleY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...GREY);
        doc.text("Official Merchandise Store  -  Ganeshotsav 2026", 15, titleY + 6);

        // (stamp removed)

        // Red separator below title
        doc.setDrawColor(...RED);
        doc.setLineWidth(0.7);
        doc.line(15, titleY + 10, 195, titleY + 10);

        /* ════════════════════════════════════════
           ITEMS TABLE
        ════════════════════════════════════════ */
        const tblY = titleY + 14;

        // Table header
        doc.setFillColor(254, 242, 242);
        doc.rect(15, tblY, 180, 9, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...RED);
        doc.text("#",           19,  tblY + 6);
        doc.text("DESCRIPTION", 28,  tblY + 6);
        doc.text("INVOICE ID / ITEM ID", 110,  tblY + 6);
        doc.text("AMOUNT",     192,  tblY + 6, { align: "right"  });

        // Rows
        const sizes    = Object.entries(orderDetails?.sizes || {}).filter(([, q]) => q > 0);
        const unitPrice = orderDetails?.basePrice || 0;
        let rowY = tblY + 9;
        let serial = 1;

        // Expand sizes into individual items list
        const expandedItems = [];
        sizes.forEach(([sz, qty]) => {
          for (let i = 0; i < qty; i++) {
            expandedItems.push({
              size: sz,
              index: i + 1
            });
          }
        });

        // Determine font size and row height dynamically to avoid overflowing the A4 page
        const rowHeight = expandedItems.length > 10 ? 8 : 13;
        const itemFontSize = expandedItems.length > 10 ? 7.5 : 9;

        expandedItems.forEach((expandedItem) => {
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
          const prodName = doc.splitTextToSize(orderDetails.productName, 75);
          doc.text(prodName, 28, rowY + (rowHeight * 0.5 + 0.5));

          doc.setFont("helvetica", "normal");
          doc.setFontSize(itemFontSize);
          doc.setTextColor(...DARK);
          // E.g., ORD123456-S-01
          const itemId = `${orderId.replace('#', '')}-${expandedItem.size}-${String(expandedItem.index).padStart(2, '0')}`;
          doc.text(itemId, 110, rowY + (rowHeight * 0.5 + 1.5));
          doc.text(fmt(unitPrice), 192, rowY + (rowHeight * 0.5 + 1.5), { align: "right" });

          rowY += rowHeight;
          serial++;
        });

        const shipping    = 0;
        const subtotal    = paidAmount - fee;
        const summaryX    = 140;

        rowY += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...GREY);
        doc.text("Subtotal",        summaryX, rowY);
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "bold");
        doc.text(fmt(subtotal),     192, rowY, { align: "right" });

        rowY += 7;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GREY);
        doc.text("Convenience Fee", summaryX, rowY);
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "bold");
        doc.text(fmt(Number(fee.toFixed(2))), 192, rowY, { align: "right" });

        rowY += 5;
        // Red total line
        doc.setDrawColor(...RED);
        doc.setLineWidth(0.7);
        doc.line(15, rowY, 195, rowY);

        rowY += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...DARK);
        doc.text("TOTAL PAID", summaryX, rowY);
        doc.setTextColor(...RED);
        doc.text(fmt(paidAmount), 192, rowY, { align: "right" });

        // Draw collection/delivery box depending on selection
        rowY += 10;
        const deliveryMethod = customer?.deliveryMethod || orderDetails?.deliveryMethod || "pickup";
        if (deliveryMethod === "home") {
          doc.setFillColor(239, 246, 255); // light blue (blue-50)
          doc.setDrawColor(59, 130, 246);  // border blue (blue-500)
          doc.setLineWidth(0.3);
          doc.rect(15, rowY, 180, 16, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(29, 78, 216); // blue-700
          doc.text("HOME DELIVERY SERVICE REQUESTED:", 19, rowY + 5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(30, 58, 138); // blue-900
          doc.text("To coordinate delivery, please contact Mandal Coordinator: +91 99999 99989.", 19, rowY + 9);
          doc.text("Please share a copy of this digital invoice to verify your order and confirm delivery address.", 19, rowY + 13);
        } else {
          doc.setFillColor(254, 251, 238); // light amber
          doc.setDrawColor(245, 158, 11);   // border amber
          doc.setLineWidth(0.3);
          doc.rect(15, rowY, 180, 16, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(180, 83, 9);    // amber-800
          doc.text("COLLECTION POINT (SELF-PICKUP):", 19, rowY + 5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(120, 53, 4);    // amber-950
          doc.text("Please collect your items from Mandal Office: Ganesh Galli, Lalbaug, Mumbai - 400 012.", 19, rowY + 9);
          doc.text("Present a copy of this receipt at the counter to verify your payment and retrieve your order.", 19, rowY + 13);
        }

        /* ════════════════════════════════════════
           FOOTER NOTE
        ════════════════════════════════════════ */
        rowY += 22;
        doc.setDrawColor(220, 225, 232);
        doc.setLineWidth(0.3);
        doc.line(15, rowY, 195, rowY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GREY);
        doc.text("Thank you for your support. All proceeds go to Mandal community welfare.", 15, rowY + 6);
        doc.text("Queries? Visit us at Lalbaug, Mumbai or email: info@mumbaicharaja.co", 15, rowY + 11);

        doc.save(`mumbaicha-raja-invoice-${orderId}.pdf`);
      };

      logoImg.onload  = () => generatePDF(logoImg);
      logoImg.onerror = () => generatePDF(null);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };


  useEffect(() => {
    if (step === "success" && payData && orderDetails) {
      if (hasDownloadedRef.current) return;
      hasDownloadedRef.current = true;
      const timer = setTimeout(() => {
        downloadInvoice();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step !== "success") {
      hasDownloadedRef.current = false;
    }
  }, [step, payData, orderDetails]);

  if (!open) return null;

  const startOnlinePayment = async () => {
    setStep("redirecting");
    setProgress(0);
    setLoadErr(false);

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 14 + 6;
      setProgress(Math.min(p, 88));
    }, 120);

    const ok = await loadRazorpay();
    clearInterval(iv);
    setProgress(100);

    if (!ok) {
      setLoadErr(true);
      setStep("idle");
      return;
    }

    await new Promise((r) => setTimeout(r, 350));

    openRazorpayCheckout({
      total,
      method: null,
      title,
      customer,
      onSuccess: (data) => {
        const amt = total;
        setPaidAmount(amt);
        const finalData = { ...data, amount: amt };
        setPayData(finalData);
        setStep("success");
        onSuccess?.(finalData);
      },
      onDismiss: () => setStep("idle"),
    });
  };

  const handleContinue = () => {
    if (mode === "pickup") {
      setStep("cod-confirm");
    } else {
      startOnlinePayment();
    }
  };

  const confirmPickup = () => {
    const amt = total;
    setPaidAmount(amt);
    const data = { method: "pickup", amount: amt, txnId: "MR" + Date.now() };
    setPayData(data);
    setStep("success");
    onSuccess?.(data);
  };

  const handleClose = () => {
    setStep("idle");
    setPayData(null);
    onClose?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* ── Redirecting fullscreen overlay ── */}
        <AnimatePresence>
          {step === "redirecting" && (
            <motion.div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#B91C1C] flex items-center justify-center mb-5 shadow-xl shadow-red-200">
                <Lock size={28} className="text-white" />
              </div>
              <p className="font-extrabold text-gray-900 text-lg mb-1">Opening secure payment</p>
              <p className="text-sm text-gray-400 mb-8">Mumbaicha Raja · Official</p>
              <div className="w-72 h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-[#B91C1C] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              </div>
              <p className="text-xs text-gray-400">Connecting to Razorpay…</p>
              <div className="absolute bottom-8 flex items-center gap-1.5 text-xs text-gray-300">
                <Lock size={11} /> 256-bit SSL · PCI-DSS Level 1
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main panel ── */}
        {step !== "redirecting" && (
          <motion.div
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            {/* mobile handle */}
            <div className="flex justify-center pt-3 sm:hidden shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
              {step === "cod-confirm" && (
                <button
                  onClick={() => setStep("idle")}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-1">
                  <Lock size={10} className="text-green-500" /> Secure Payment
                </p>
                <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
              </div>
              {step !== "success" && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">Total</p>
                    <p className="text-base font-extrabold text-[#B91C1C]">₹{fmtINR(total)}</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-y-auto" ref={scrollRef}>

              {/* ══ IDLE — choose method ══ */}
              {step === "idle" && (
                <div className="p-4 pt-3">
                  {/* Fee breakdown */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-500">Order amount</span>
                      <span className="font-semibold text-gray-800">₹{fmtINR(amount)}</span>
                    </div>
                    {mode === "online" && deliveryCharge > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Delivery charges</span>
                        <span className="font-semibold text-gray-800">₹{fmtINR(deliveryCharge)}</span>
                      </div>
                    )}
                    {showCod && fee > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-400">
                          {mode === "pickup"
                            ? "Booking fee (self-pickup)"
                            : "Gateway fee (2%)"}
                        </span>
                        <span className="text-gray-500">+ ₹{fmtINR(fee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2.5 mt-1">
                      <span className="font-bold text-gray-800">Total payable</span>
                      <span className="text-lg font-extrabold text-[#B91C1C]">₹{fmtINR(total)}</span>
                    </div>
                  </div>

                  {loadErr && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
                      <AlertCircle size={14} className="text-red-500 shrink-0" />
                      <p className="text-xs text-red-600">Could not load payment gateway. Check your connection and try again.</p>
                    </div>
                  )}

                  {showCod ? (
                    <>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Choose how to pay
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        {/* Online */}
                        <button
                          onClick={() => setMode("online")}
                          className={`flex flex-col items-center text-center border-2 rounded-2xl p-3 transition ${
                            mode === "online"
                              ? "border-[#B91C1C] bg-red-50"
                              : "border-gray-100 bg-gray-50 hover:border-gray-200"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                            mode === "online" ? "bg-[#B91C1C] text-white" : "bg-white text-[#B91C1C] border border-gray-100"
                          }`}>
                            <Wifi size={18} />
                          </div>
                          <p className={`font-bold text-sm ${mode === "online" ? "text-[#B91C1C]" : "text-gray-800"}`}>
                            Pay Online
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">UPI · Card · Net Banking</p>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1.5 ${
                            mode === "online" ? "border-[#B91C1C]" : "border-gray-200"
                          }`}>
                            {mode === "online" && <div className="w-2 h-2 rounded-full bg-[#B91C1C]" />}
                          </div>
                        </button>

                        {/* Pickup */}
                        <button
                          onClick={() => setMode("pickup")}
                          className={`flex flex-col items-center text-center border-2 rounded-2xl p-3 transition ${
                            mode === "pickup"
                              ? "border-amber-500 bg-amber-50"
                              : "border-gray-100 bg-gray-50 hover:border-gray-200"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                            mode === "pickup" ? "bg-amber-500 text-white" : "bg-white text-amber-500 border border-gray-100"
                          }`}>
                            <Store size={18} />
                          </div>
                          <p className={`font-bold text-sm ${mode === "pickup" ? "text-amber-700" : "text-gray-800"}`}>
                            Pay at Pickup
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Cash · Mandal Office</p>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1.5 ${
                            mode === "pickup" ? "border-amber-500" : "border-gray-200"
                          }`}>
                            {mode === "pickup" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Donation — no choice, just online */
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                        <Lock size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-800">100% Secure Payment</p>
                        <p className="text-xs text-green-700">UPI · Card · Net Banking via Razorpay</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ COD CONFIRM ══ */}
              {step === "cod-confirm" && (
                <div className="p-4">
                  {/* Compact header row */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Store size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">Reserve your order</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Bring <span className="font-bold text-gray-700">₹{fmtINR(total)}</span> cash · includes ₹19 booking fee
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl divide-y divide-amber-200">
                    <div className="flex items-start gap-2.5 p-3">
                      <span className="text-base shrink-0">📍</span>
                      <div>
                        <p className="text-xs font-bold text-amber-800">Pickup Location</p>
                        <p className="text-xs text-amber-700 mt-0.5">Ganesh Galli Mandal Office, Lalbaug, Mumbai – 400 012</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3">
                      <span className="text-base shrink-0">🕐</span>
                      <div>
                        <p className="text-xs font-bold text-amber-800">Office Hours</p>
                        <p className="text-xs text-amber-700 mt-0.5">11 AM – 8 PM · All days during Ganeshotsav 2025</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3">
                      <span className="text-base shrink-0">📋</span>
                      <div>
                        <p className="text-xs font-bold text-amber-800">Note</p>
                        <p className="text-xs text-amber-700 mt-0.5">Cash only · Reserved 48 hrs · Bring confirmation email</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ SUCCESS ══ */}
              {step === "success" && (
                <div className="flex flex-col items-center text-center p-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-5 shadow-lg shadow-green-100"
                  >
                    <CheckCircle2 size={52} className="text-green-500" strokeWidth={1.5} />
                  </motion.div>

                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                    {payData?.method === "pickup" ? "Order Reserved! 🎉" : "Payment Successful! 🙏"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    {payData?.method === "pickup"
                      ? "Your order is reserved for 48 hours. Pay cash when you collect from the Mandal office."
                      : "Confirmed! Ganpati Bappa Morya! 🙏"}
                  </p>

                  <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount {payData?.method === "pickup" ? "to pay" : "paid"}</span>
                      <span className="font-bold text-gray-900">₹{fmtINR(paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Method</span>
                      <span className="font-semibold text-gray-800">
                        {payData?.method === "pickup" ? "Pay at Pickup" : "Online Payment"}
                      </span>
                    </div>
                    {(payData?.txnId || payData?.razorpay_payment_id) && (
                      <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
                        <span>{payData.method === "pickup" ? "Reservation ID" : "Transaction ID"}</span>
                        <span className="font-mono text-gray-600">{payData.txnId || payData.razorpay_payment_id}</span>
                      </div>
                    )}
                    {customer?.name && (
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Name</span>
                        <span className="text-gray-600">{customer.name}</span>
                      </div>
                    )}
                  </div>

                  {customer?.email && (
                    <p className="text-xs text-gray-400 mb-2">
                      📩 Confirmation sent to <span className="font-semibold text-gray-600">{customer.email}</span>
                    </p>
                  )}

                  {orderDetails && (
                    <button
                      type="button"
                      onClick={downloadInvoice}
                      className="mb-4 flex items-center justify-center gap-1.5 px-4 py-2.5 border-2 border-[#B91C1C] text-[#B91C1C] hover:bg-red-50 active:bg-red-100 font-bold rounded-2xl transition text-sm w-full cursor-pointer"
                    >
                      <Download size={14} /> Download Receipt
                    </button>
                  )}

                  {(customer?.deliveryMethod === "home" || orderDetails?.deliveryMethod === "home") ? (
                    <p className="text-xs text-blue-600 font-semibold">
                      🚚 Home Delivery Requested · Contact Mandal Coordinator (99999 99989)
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 font-semibold">
                      📍 Collect from Ganesh Galli Mandal, Lalbaug · 11 AM – 8 PM
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer CTA ── */}
            {step !== "redirecting" && (
              <div className="p-5 pt-3 border-t border-gray-100 shrink-0">
                {step === "idle" && (
                  <>
                    <button
                      onClick={handleContinue}
                      className={`w-full font-bold py-4 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-base text-white ${
                        showCod && mode === "pickup"
                          ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100"
                          : "bg-[#B91C1C] hover:bg-red-800 shadow-red-100"
                      }`}
                    >
                      <Lock size={16} />
                      {showCod && mode === "pickup"
                        ? `Reserve · Pay ₹${fmtINR(total)} at Office`
                        : `Pay ₹${fmtINR(total)} Securely`}
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                      <Lock size={10} />
                      {showCod && mode === "pickup"
                        ? "No online transaction · Cash at Mandal office"
                        : "Razorpay · PCI-DSS Level 1 · 256-bit SSL"}
                    </p>
                  </>
                )}

                {step === "cod-confirm" && (
                  <button
                    onClick={confirmPickup}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-amber-100 flex items-center justify-center gap-2 text-base"
                  >
                    <MapPin size={18} /> Confirm Reservation
                  </button>
                )}

                {step === "success" && (
                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition text-base"
                  >
                    Done
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentGatewayModal;
