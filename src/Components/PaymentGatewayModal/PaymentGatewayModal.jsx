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

  const deliveryCharge = mode === "online" ? (customer?.shippingCharge || 0) : 0;
  const baseTotal      = amount + deliveryCharge;
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
      logoImg.src = "/images/logo - img.png";
      
      const generatePDF = (img) => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        
        const redColor = [185, 28, 28]; // #B91C1C
        const goldColor = [212, 175, 55]; // #D4AF37
        const darkColor = [15, 23, 42]; // #0F172A
        const greyColor = [100, 116, 139]; // #64748B
        const lightGreyColor = [156, 163, 175]; // #9CA3AF

        // ── Header Background ──
        doc.setFillColor(...redColor);
        doc.rect(0, 0, 210, 42, "F");

        // ── Gold Line ──
        doc.setFillColor(...goldColor);
        doc.rect(0, 42, 210, 1.5, "F");

        // ── Title & Logo ──
        if (img) {
          try {
            doc.addImage(img, "PNG", 12, 9, 22, 22);
          } catch (e) {
            console.warn("Could not add logo to PDF:", e);
          }
        }

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Lalbaug Sarvajanik Utsav Mandal", 38, 15);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(230, 230, 230);
        doc.text("MumbaichaRaja | Ganesh Galli, Lalbaug,", 38, 21);
        doc.text("Mumbai—400 012", 38, 25);
        doc.text("mumbaicharaja.co | Est. 1928", 38, 31);

        // ── Header Box (Right) ──
        doc.setDrawColor(...goldColor);
        doc.setLineWidth(0.5);
        doc.rect(135, 12, 60, 18, "D");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("ORDER INVOICE", 165, 18, { align: "center" });

        const refId = payData?.txnId || payData?.razorpay_payment_id || "pickup-" + Date.now().toString().slice(-6);
        const txnIdStr = `#TXN${refId.toUpperCase().slice(-10)}`;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(...goldColor);
        doc.text(txnIdStr, 165, 24, { align: "center" });

        // ── Metadata Table (Date, Time, Order ID, Payment Info, Customer Details) ──
        // Left Column
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...lightGreyColor);
        doc.text("INVOICE DATE", 15, 53);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        const dateFormatted = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });
        doc.text(dateFormatted, 15, 58);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...lightGreyColor);
        doc.text("TIME", 15, 66);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        const timeFormatted = new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
        doc.text(timeFormatted, 15, 71);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...lightGreyColor);
        doc.text("ORDER ID", 15, 79);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...redColor);
        const orderIdFormatted = "#ORD" + refId.slice(-6).toUpperCase();
        doc.text(orderIdFormatted, 15, 84);

        // Vertical divider line in the middle
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.4);
        doc.line(105, 48, 105, 96);

        // Right Column
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...lightGreyColor);
        doc.text("PAYMENT STATUS", 115, 53);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(22, 163, 74); // emerald green
        doc.text("✓ PAID — Successful", 115, 58);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...lightGreyColor);
        doc.text("PAYMENT METHOD", 115, 66);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        doc.text(showCod ? "Pay at Office (Self-Pickup)" : "UPI / Digital Payment", 115, 71);

        // Customer Details Sub-section inside Right Column
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...lightGreyColor);
        doc.text("CUSTOMER DETAILS", 115, 79);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...darkColor);
        doc.text(customer?.name || "Devotee", 115, 84);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...greyColor);
        doc.text(`Phone: +91 ${customer?.phone || "—"}`, 115, 88);
        doc.text(`Email: ${customer?.email || "—"}`, 115, 92);
        
        let currentY = 104;
        if (!showCod && customer?.address) {
          const splitAddr = doc.splitTextToSize(`Address: ${customer.address}`, 80);
          doc.text(splitAddr, 115, 96);
          currentY = Math.max(104, 96 + splitAddr.length * 4);
        }

        // Horizontal Separator Line
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.4);
        doc.line(15, currentY, 195, currentY);

        currentY += 12;

        // ── Order Invoice Header & Stamp ──
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...redColor);
        doc.text("Order Invoice", 15, currentY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...greyColor);
        doc.text("Official Merchandise Store — Ganeshotsav 2026", 15, currentY + 5.5);

        // Draw Stamp
        const stampY = currentY + 1;
        doc.setDrawColor(...redColor);
        doc.setLineWidth(0.6);
        doc.circle(172, stampY, 11, "D");
        
        doc.setTextColor(...redColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.5);
        doc.text("PAYMENT", 172, stampY - 3.5, { align: "center" });
        doc.text("CONFIRMED", 172, stampY - 0.5, { align: "center" });
        
        doc.setLineWidth(0.3);
        doc.line(164, stampY + 1.2, 180, stampY + 1.2);
        
        const dateStampStr = new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }).toUpperCase();
        doc.setFontSize(5);
        doc.text(dateStampStr, 172, stampY + 4.5, { align: "center" });

        // Red separator line below Order Invoice header
        doc.setDrawColor(...redColor);
        doc.setLineWidth(0.6);
        doc.line(15, currentY + 12, 195, currentY + 12);

        // ── Order Summary Table ──
        const tableY = currentY + 16;
        doc.setFillColor(254, 242, 242); // #FEF2F2 (light pink)
        doc.rect(15, tableY, 180, 8, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...redColor);
        doc.text("#", 18, tableY + 5.5);
        doc.text("DESCRIPTION", 28, tableY + 5.5);
        doc.text("QTY", 125, tableY + 5.5, { align: "center" });
        doc.text("SIZE", 145, tableY + 5.5, { align: "center" });
        doc.text("RATE", 165, tableY + 5.5, { align: "center" });
        doc.text("AMOUNT", 188, tableY + 5.5, { align: "center" });

        let itemY = tableY + 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85); // Slate-700
        
        const selectedSizes = Object.entries(orderDetails?.sizes || {});
        const basePrice = orderDetails?.basePrice || 0;
        let serialNo = 1;

        selectedSizes.forEach(([sz, qty]) => {
          if (qty > 0) {
            // Draw row separator line
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.3);
            doc.line(15, itemY + 12, 195, itemY + 12);

            // Serial
            doc.text(serialNo.toString(), 18, itemY + 6);
            
            // Description & details subtext
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...darkColor);
            doc.text(orderDetails.productName, 28, itemY + 5);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...greyColor);
            doc.text(`Size: ${sz}  ·  Qty: ${qty}`, 28, itemY + 9);
            
            // Restore normal font size & color
            doc.setFontSize(9.5);
            doc.setTextColor(51, 65, 85);
            
            // Qty, Size, Rate, Amount
            doc.text(qty.toString(), 125, itemY + 6, { align: "center" });
            doc.text(sz, 145, itemY + 6, { align: "center" });
            doc.text(`₹${basePrice}`, 165, itemY + 6, { align: "center" });
            doc.text(`₹${basePrice * qty}`, 188, itemY + 6, { align: "center" });
            
            serialNo += 1;
            itemY += 12;
          }
        });

        // Shipping row if shipping fee applies
        if (!showCod && orderDetails?.shippingCost > 0) {
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.3);
          doc.line(15, itemY + 12, 195, itemY + 12);

          doc.text(serialNo.toString(), 18, itemY + 6);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...darkColor);
          doc.text("Shipping & Handling Charge", 28, itemY + 5);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...greyColor);
          doc.text("DTDC Mock Delivery", 28, itemY + 9);

          doc.setFontSize(9.5);
          doc.setTextColor(51, 65, 85);
          
          doc.text("1", 125, itemY + 6, { align: "center" });
          doc.text("—", 145, itemY + 6, { align: "center" });
          doc.text(`₹${orderDetails.shippingCost}`, 165, itemY + 6, { align: "center" });
          doc.text(`₹${orderDetails.shippingCost}`, 188, itemY + 6, { align: "center" });
          
          itemY += 12;
        }

        // Draw summary values
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...greyColor);
        
        doc.text("Subtotal", 165, itemY + 8, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkColor);
        doc.text(`₹${orderDetails?.shippingCost ? paidAmount - orderDetails.shippingCost - fee : paidAmount - fee}`, 188, itemY + 8, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...greyColor);
        doc.text("Convenience Fee", 165, itemY + 15, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkColor);
        doc.text(`₹${fee.toFixed(2)}`, 188, itemY + 15, { align: "right" });
        
        // Final total line
        doc.setDrawColor(...redColor);
        doc.setLineWidth(0.6);
        doc.line(15, itemY + 21, 195, itemY + 21);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // dark slate
        doc.text("TOTAL PAID", 165, itemY + 28, { align: "right" });
        doc.setTextColor(...redColor); // red total
        doc.text(`₹${paidAmount}`, 188, itemY + 28, { align: "right" });

        // Save the document
        doc.save(`mumbaicha-raja-receipt-${refId}.pdf`);
      };

      logoImg.onload = () => {
        generatePDF(logoImg);
      };
      logoImg.onerror = () => {
        generatePDF(null);
      };
    } catch (err) {
      console.error("Failed to generate and download PDF receipt:", err);
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

                  <p className="text-xs text-amber-600 font-semibold">
                    📍 Collect from Ganesh Galli Mandal, Lalbaug · 11 AM – 8 PM
                  </p>
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
