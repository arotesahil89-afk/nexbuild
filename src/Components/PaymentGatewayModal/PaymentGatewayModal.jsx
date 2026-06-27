import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle2, Lock, ChevronLeft, AlertCircle,
  MapPin, Wifi, Store,
} from "lucide-react";
import { loadRazorpay, openRazorpayCheckout } from "../../utils/loadRazorpay";

const fmtINR = (n) => Number(n).toLocaleString("en-IN");

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
}) => {
  const [step,     setStep]     = useState("idle");
  const [mode,     setMode]     = useState("online");
  const [loadErr,  setLoadErr]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [payData,  setPayData]  = useState(null);

  const deliveryCharge = mode === "online" ? (customer?.shippingCharge || 0) : 0;
  const baseTotal      = amount + deliveryCharge;
  const fee            = computeFee(mode, baseTotal, showCod);
  const total          = baseTotal + fee;
  const scrollRef = useRef(null);

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
    }
  }, [open]);

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
        setPayData(data);
        setStep("success");
        onSuccess?.(data);
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
    const data = { method: "pickup", amount: total, txnId: "MR" + Date.now() };
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
          onClick={step === "idle" ? handleClose : undefined}
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
                      <span className="font-bold text-gray-900">₹{fmtINR(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Method</span>
                      <span className="font-semibold text-gray-800">
                        {payData?.method === "pickup" ? "Pay at Pickup" : "Online Payment"}
                      </span>
                    </div>
                    {payData?.txnId && payData.method !== "pickup" && (
                      <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
                        <span>Reference ID</span>
                        <span className="font-mono text-gray-600">{payData.txnId}</span>
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
