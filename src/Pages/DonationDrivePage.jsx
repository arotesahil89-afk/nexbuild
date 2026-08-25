import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Heart, ShieldCheck, ChevronRight, User, Mail, Phone, MapPin,
  CheckCircle2, Award, Landmark, FileText, Copy, Check,
  Upload, ImagePlus, X as XIcon, Send, AlertCircle, Lock, RefreshCw, Download
} from "lucide-react";
import { causes as causesData, presetAmounts, impactStats } from "../data/donationData";
import apiClient from "../services/apiService";
import { downloadDonationReceipt } from "../utils/marathiReceipt";

const fmtINR = (n) => Number(n || 0).toLocaleString("en-IN");

/* ─── Bank / UPI details ─── */
const BANK = {
  upiId:   "mumbaicharaja@upi",
  bank:    "Bank of Baroda",
  account: "33380100002204",
  ifsc:    "BARB0LALBAU",
  holder:  "Lalbaug Sarvajanik Utsav Mandal Trust",
};

/* ─── Field ─── */
const Field = ({ icon: Icon, label, error, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
    <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${
      error
        ? "border-red-400 bg-red-50"
        : "border-gray-100 bg-gray-50 focus-within:border-[#B91C1C] focus-within:bg-white"
    }`}>
      <span className="pl-3.5 text-gray-400 shrink-0"><Icon size={16} /></span>
      {children}
    </div>
    {error && <p className="text-xs text-red-500 mt-1 pl-1 font-medium">{error}</p>}
  </div>
);

/* ─── Copy button ─── */
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="ml-2 p-1 rounded text-gray-400 hover:text-[#B91C1C] transition shrink-0"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

const DonationDrivePage = () => {
  const { t } = useTranslation("donate");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const causes = causesData.map((c) => ({
    ...c,
    title: t(`causes.${c.id}.title`, { defaultValue: c.title }),
    desc:  t(`causes.${c.id}.desc`,  { defaultValue: c.desc }),
  }));

  const presets = presetAmounts.map((a) => ({
    ...a,
    label: t(`presets.${a.value}`, { defaultValue: a.label }),
  }));

  const [cause,    setCause]    = useState(causes[0].id);
  const [preset,   setPreset]   = useState(501);
  const [custom,   setCustom]   = useState("");
  const [form,     setForm]     = useState({ name: "", email: "", phone: "", address: "" });
  const [disclaimer, setDisclaimer] = useState(true);
  const [errors,   setErrors]   = useState({});
  const [step,     setStep]     = useState("form"); // 'form', 'confirm', 'otp-modal', 'redirecting', 'done'
  const [pageAlert, setPageAlert] = useState(null);

  // OTP & Payment state
  const [otp, setOtp] = useState("");
  const [otpSessionToken, setOtpSessionToken] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [devOtpHint, setDevOtpHint] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [successData, setSuccessData] = useState(null);
  const hasDownloadedRef = useRef(false);

  /* ── Offline Receipt upload state ── */
  const [receipt,       setReceipt]       = useState(null);
  const [receiptName,   setReceiptName]   = useState("");
  const [receiptPhone,  setReceiptPhone]  = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [receiptSent,   setReceiptSent]   = useState(false);
  const [receiptErr,    setReceiptErr]    = useState({});
  const [isDragging,    setIsDragging]    = useState(false);

  // Check URL query parameters for return from CCAvenue
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      const donationNo = searchParams.get("donationNo") || "";
      const amt = searchParams.get("amount") || "";
      const txnId = searchParams.get("txnId") || "";
      const donorNameParam = searchParams.get("donorName") || form.name || "Devotee";

      setSuccessData({
        donationNo,
        amount: amt,
        txnId,
        donorName: donorNameParam,
      });
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (status === "failure") {
      const msg = searchParams.get("message") || "Payment was cancelled or unsuccessful";
      setPageAlert({ type: "error", text: msg });
    }
  }, [searchParams]);

  // Auto download Marathi Pavati on Success
  useEffect(() => {
    if (step === "done" && successData && !hasDownloadedRef.current) {
      hasDownloadedRef.current = true;
      const timer = setTimeout(() => {
        downloadDonationReceipt({
          donationNo: successData.donationNo,
          donorName: successData.donorName || form.name || "देणगीदार",
          donorPhone: form.phone,
          donorAddress: form.address,
          amount: Number(successData.amount) || finalAmount || 501,
          txnId: successData.txnId || successData.donationNo || "",
          paymentMode: "CCAvenue Online / UPI",
          bankRefNo: "",
          date: new Date(),
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, successData]);

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (step === "otp-modal" && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const handleFilePick = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setReceiptErr((e) => ({ ...e, file: "File must be under 5 MB" })); return; }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setReceiptErr((e) => ({ ...e, file: "Only images or PDF allowed" })); return;
    }
    setReceiptErr((e) => ({ ...e, file: undefined }));
    setReceipt({ file, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
  };

  const handleReceiptSubmit = () => {
    const e = {};
    if (!receiptName.trim())                        e.name   = "Enter your name";
    if (!/^[6-9]\d{9}$/.test(receiptPhone))         e.phone  = "Enter a valid 10-digit mobile";
    if (!receiptAmount || Number(receiptAmount) < 1) e.amount = "Enter the amount you paid";
    if (!receipt)                                    e.file   = "Upload your payment screenshot";
    setReceiptErr(e);
    if (Object.keys(e).length === 0) setReceiptSent(true);
  };

  const finalAmount   = custom ? Number(custom) : preset;
  const selectedCause = causes.find((c) => c.id === cause);

  const validate = (f, amt) => {
    const e = {};
    if (!f.name.trim() || f.name.trim().length < 2) e.name  = t("errorName", { defaultValue: "Please enter your full name" });
    if (!/^[6-9]\d{9}$/.test(f.phone))              e.phone = t("errorPhone", { defaultValue: "Enter a valid 10-digit mobile" });
    if (!f.address.trim() || f.address.trim().length < 5) e.address = "Please enter your complete address (min 5 characters)";
    if (f.email && f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = t("errorEmail", { defaultValue: "Enter a valid email" });
    if (!amt || Number(amt) < 1)                     e.amount = t("errorAmountEmpty", { defaultValue: "Enter amount" });
    if (Number(amt) > 500000)                        e.amount = t("errorAmountMax", { defaultValue: "Max amount is ₹5,00,000" });
    if (!disclaimer)                                 e.disclaimer = "Please accept the terms to proceed";
    return e;
  };

  const set      = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setPhone = (e)   => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));

  const handleReview = () => {
    const e = validate(form, finalAmount);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep("confirm");
    }
  };

  // Trigger Phone OTP dispatch
  const handleProceedToOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await apiClient.post("/donations/send-otp", { phone: form.phone });
      setOtpTimer(60);
      const payload = res?.data || res;
      if (payload?.otpSessionToken) {
        setOtpSessionToken(payload.otpSessionToken);
      }
      if (payload?.devOtpHint) {
        setDevOtpHint(payload.devOtpHint);
      }
      setStep("otp-modal");
    } catch (err) {
      console.error("Failed to send OTP:", err);
      const msg = err.response?.data?.error || err.message || "Failed to send verification code";
      setPageAlert({ type: "error", text: msg });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await apiClient.post("/donations/send-otp", { phone: form.phone });
      setOtpTimer(60);
      const payload = res?.data || res;
      if (payload?.otpSessionToken) {
        setOtpSessionToken(payload.otpSessionToken);
      }
      if (payload?.devOtpHint) {
        setDevOtpHint(payload.devOtpHint);
      }
    } catch (err) {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and redirect to CCAvenue
  const handleVerifyAndPayCCAvenue = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const verifyRes = await apiClient.post("/donations/verify-otp", {
        phone: form.phone,
        otp,
        otpSessionToken,
      });

      const token = verifyRes?.data?.verificationToken || "verified";
      setVerificationToken(token);

      // Launch CCAvenue form redirection
      setStep("redirecting");

      const initRes = await apiClient.post("/donations/initiate", {
        donorName: form.name,
        donorPhone: form.phone,
        donorAddress: form.address,
        donorEmail: form.email || undefined,
        amount: finalAmount,
        disclaimerAccepted: true,
        cause: selectedCause?.title || "शतक महोत्सवी निधी (Centenary Celebration Fund)",
        verificationToken: token,
      });

      const paymentData = initRes?.data || initRes;

      if (paymentData?.actionUrl && paymentData?.encRequest && paymentData?.accessCode) {
        const formEl = document.createElement("form");
        formEl.method = "POST";
        formEl.action = paymentData.actionUrl;

        const encInput = document.createElement("input");
        encInput.type = "hidden";
        encInput.name = "encRequest";
        encInput.value = paymentData.encRequest;
        formEl.appendChild(encInput);

        const accessInput = document.createElement("input");
        accessInput.type = "hidden";
        accessInput.name = "access_code";
        accessInput.value = paymentData.accessCode;
        formEl.appendChild(accessInput);

        document.body.appendChild(formEl);
        formEl.submit();
      } else {
        throw new Error("Invalid payment gateway parameters received");
      }
    } catch (err) {
      console.error("Donation initiation error:", err);
      setStep("otp-modal");
      const msg = err.response?.data?.error || err.message || "OTP verification or payment initiation failed";
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleManualPavatiDownload = () => {
    downloadDonationReceipt({
      donationNo: successData?.donationNo,
      donorName: successData?.donorName || form.name || "देणगीदार",
      donorPhone: form.phone,
      donorAddress: form.address,
      amount: Number(successData?.amount) || finalAmount || 501,
      txnId: successData?.txnId || successData?.donationNo || "",
      paymentMode: "CCAvenue Online / UPI",
      bankRefNo: "",
      date: new Date(),
    });
  };

  /* ── Cause & amount selector (reused on mobile below form) ── */
  const CauseAmountPanel = () => (
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
        {t("whereTitle", { defaultValue: "Where your donation goes" })}
      </p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {causes.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCause(c.id)}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              cause === c.id
                ? "border-[#B91C1C] bg-red-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <span className="text-2xl block mb-1.5">{c.emoji}</span>
            <p className={`text-sm font-bold leading-tight ${cause === c.id ? "text-[#B91C1C]" : "text-gray-800"}`}>
              {c.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
          </button>
        ))}
      </div>

      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
        {t("amountTitle", { defaultValue: "Select Amount" })}
      </p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {presets.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => { setPreset(a.value); setCustom(""); setErrors((e) => ({ ...e, amount: undefined })); }}
            className={`rounded-2xl border-2 py-4 text-center transition ${
              preset === a.value && !custom
                ? "border-[#B91C1C] bg-red-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <p className={`font-extrabold text-base ${preset === a.value && !custom ? "text-[#B91C1C]" : "text-gray-800"}`}>
              ₹{fmtINR(a.value)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{a.label}</p>
          </button>
        ))}
      </div>

      <div className={`flex items-center border-2 rounded-2xl px-4 py-3.5 transition-colors ${
        custom
          ? "border-[#B91C1C] bg-red-50"
          : errors.amount
          ? "border-red-400 bg-red-50"
          : "border-gray-100 bg-white focus-within:border-[#B91C1C]"
      }`}>
        <span className="text-gray-400 font-semibold mr-2 text-base">₹</span>
        <input
          type="number"
          min="1"
          max="500000"
          placeholder={t("customPlaceholder", { defaultValue: "Or enter custom amount" })}
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setErrors((er) => ({ ...er, amount: undefined })); }}
          className="w-full outline-none bg-transparent text-base text-gray-800 placeholder:text-gray-400"
        />
      </div>
      {errors.amount && <p className="text-sm text-red-500 mt-2 pl-1">{errors.amount}</p>}

      {/* 80G notice */}
      <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-5">
        <FileText size={18} className="text-yellow-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-yellow-800">{t("taxTitle", { defaultValue: "80G Tax Exemption" })}</p>
          <p className="text-sm text-yellow-700 mt-1 leading-relaxed">{t("taxBody", { defaultValue: "All donations to Lalbaug Sarvajanik Utsav Mandal are eligible for 50% tax deduction under Section 80G." })}</p>
        </div>
      </div>

      {/* Trust row */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { icon: Award,       lk: "trust1Label", sk: "trust1Sub", defL: "Est. 1928", defS: "98 Years Legacy" },
          { icon: ShieldCheck, lk: "trust2Label", sk: "trust2Sub", defL: "80G Certified", defS: "Tax Deductible" },
          { icon: Landmark,    lk: "trust3Label", sk: "trust3Sub", defL: "Govt. Regd.", defS: "Trust A-2236" },
        ].map(({ icon: Icon, lk, sk, defL, defS }) => (
          <div key={lk} className="flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl py-4 px-2 shadow-sm">
            <Icon size={20} className="text-[#B91C1C] mb-2" />
            <p className="text-xs font-bold text-gray-800 leading-tight">{t(lk, { defaultValue: defL })}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t(sk, { defaultValue: defS })}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen pb-16 w-full overflow-x-hidden">

      {/* ── Page header ── */}
      <div className="pt-24 pb-6 px-4 sm:px-6 md:px-10 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
          <span>{t("breadHome", { defaultValue: "Home" })}</span>
          <ChevronRight size={14} />
          <span className="text-[#B91C1C] font-semibold">{t("breadDonate", { defaultValue: "Donate" })}</span>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#B91C1C] flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
            <Heart size={26} className="text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {t("pageTitle", { defaultValue: "Donate to Mumbai Cha Raja" })}
            </h1>
            <p className="text-gray-500 text-base mt-2 max-w-xl leading-relaxed">
              {t("pageSubtitle", { defaultValue: "Support our social initiatives, educational drives, and grand Ganeshotsav celebrations." })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Alert Bar ── */}
      {pageAlert && (
        <div className="px-4 sm:px-6 md:px-10 w-full max-w-6xl mx-auto mb-6">
          <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm font-semibold flex-1">{pageAlert.text}</p>
            <button onClick={() => setPageAlert(null)}><XIcon size={16} /></button>
          </div>
        </div>
      )}

      {/* ── Devotional banner ── */}
      <div className="relative w-full overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-700 to-rose-800" />
        <div className="absolute -left-16 -top-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative w-full px-4 sm:px-10 py-10 max-w-6xl mx-auto">
          {/* Mantra */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-yellow-300 text-lg">🪔</span>
            <p className="text-yellow-300 font-extrabold text-base sm:text-2xl tracking-wide sm:tracking-widest text-center"
               style={{ fontFamily: "'Noto Serif Devanagari', serif" }}>
              गणपती बाप्पा मोरया
            </p>
            <span className="text-yellow-300 text-lg">🪔</span>
          </div>

          {/* Quote */}
          <p className="text-white/85 text-center text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto mb-7 italic px-2">
            "Every offering, however small, made with a pure heart, is accepted by Bappa.
            Your donation is a <span className="text-yellow-300 font-bold not-italic">seva</span> — an act of devotion."
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {impactStats.map((s) => (
              <div key={s.label}
                className="text-center bg-white/10 border border-white/20 rounded-2xl py-3 px-2">
                <p className="text-xl sm:text-3xl font-extrabold text-yellow-300 leading-none">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-white/70 mt-1.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-5 text-white/40 text-[10px] tracking-widest">
            🌸 EST. 1928 · LALBAUG, MUMBAI 🌸
          </p>
        </div>
      </div>

      {/* ── Main 2-column grid ── */}
      <div className="px-4 sm:px-6 md:px-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-10">

        {/* LEFT — cause + amount (hidden on mobile, shown after form) */}
        <div className="hidden lg:block">
          <CauseAmountPanel />
        </div>

        {/* RIGHT — form / confirm / otp / done */}
        <div className="w-full min-w-0">
          <AnimatePresence mode="wait">

            {/* ── Form ── */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 w-full min-w-0"
              >
                {/* Mobile-only cause + amount above */}
                <div className="lg:hidden bg-white rounded-3xl shadow-sm border border-gray-100 p-4 w-full">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("whereTitle", { defaultValue: "Where your donation goes" })}</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-5 snap-x snap-mandatory"
                       style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {causes.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCause(c.id)}
                        className={`snap-start shrink-0 w-28 rounded-2xl border-2 p-3 text-center transition ${
                          cause === c.id ? "border-[#B91C1C] bg-red-50" : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <span className="text-2xl block mb-1.5">{c.emoji}</span>
                        <p className={`text-xs font-bold leading-tight ${cause === c.id ? "text-[#B91C1C]" : "text-gray-700"}`}>
                          {c.title}
                        </p>
                      </button>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("amountTitle", { defaultValue: "Select Amount" })}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {presets.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => { setPreset(a.value); setCustom(""); setErrors((e) => ({ ...e, amount: undefined })); }}
                        className={`rounded-2xl border-2 py-3 text-center transition ${
                          preset === a.value && !custom ? "border-[#B91C1C] bg-red-50" : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <p className={`font-extrabold text-sm ${preset === a.value && !custom ? "text-[#B91C1C]" : "text-gray-800"}`}>
                          ₹{fmtINR(a.value)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{a.label}</p>
                      </button>
                    ))}
                  </div>
                  <div className={`flex items-center border-2 rounded-xl px-3 py-3 transition-colors ${
                    custom ? "border-[#B91C1C] bg-red-50" : errors.amount ? "border-red-400 bg-red-50" : "border-gray-100 bg-gray-50 focus-within:border-[#B91C1C]"
                  }`}>
                    <span className="text-gray-400 font-semibold mr-2 text-sm">₹</span>
                    <input
                      type="number" min="1" max="500000"
                      placeholder={t("customPlaceholder", { defaultValue: "Custom amount" })}
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setErrors((er) => ({ ...er, amount: undefined })); }}
                      className="w-full outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Details card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 w-full">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900">{t("formTitle", { defaultValue: "Your Details" })}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{t("formSubtitle", { defaultValue: "Enter details for your 80G tax exemption receipt" })}</p>
                    {finalAmount ? (
                      <div className="flex items-center gap-2 mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        <Heart size={14} className="text-[#B91C1C] shrink-0" fill="#B91C1C" />
                        <p className="text-xs text-gray-500">{t("donatingLabel", { defaultValue: "Donating to" })} <span className="font-semibold text-gray-700">{selectedCause?.title}</span></p>
                        <p className="text-base font-extrabold text-[#B91C1C] ml-auto">₹{fmtINR(finalAmount)}</p>
                      </div>
                    ) : null}
                  </div>

                  <Field icon={User} label={t("labelName", { defaultValue: "Full Name" })} error={errors.name}>
                    <input
                      className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 font-medium"
                      placeholder={t("placeholderName", { defaultValue: "As per PAN card" })}
                      value={form.name}
                      onChange={set("name")}
                      autoComplete="name"
                    />
                  </Field>

                  <Field icon={Phone} label={t("labelPhone", { defaultValue: "Mobile Number" })} error={errors.phone}>
                    <span className="pl-2 pr-2 text-xs font-semibold text-gray-400 border-r border-gray-200 mr-1 py-3">+91</span>
                    <input
                      className="flex-1 px-2 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 tracking-wide font-medium"
                      placeholder={t("placeholderPhone", { defaultValue: "10-digit mobile" })}
                      value={form.phone}
                      onChange={setPhone}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </Field>

                  <Field icon={MapPin} label="Address (पत्ता)" error={errors.address}>
                    <input
                      className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 font-medium"
                      placeholder="Residential / Billing Address"
                      value={form.address}
                      onChange={set("address")}
                    />
                  </Field>

                  <Field icon={Mail} label={t("labelEmail", { defaultValue: "Email Address (Optional)" })} error={errors.email}>
                    <input
                      className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 font-medium"
                      placeholder={t("placeholderEmail", { defaultValue: "For digital receipt copy" })}
                      value={form.email}
                      onChange={set("email")}
                      inputMode="email"
                      autoComplete="email"
                    />
                  </Field>

                  {/* Disclaimer Checkbox */}
                  <div className="mb-4 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={disclaimer}
                        onChange={(e) => setDisclaimer(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-[#B91C1C] rounded border-gray-300 focus:ring-[#B91C1C]"
                      />
                      <span className="text-xs text-gray-500 leading-tight">
                        I confirm that this contribution is made voluntarily out of devotion to Lalbaug Sarvajanik Utsav Mandal for trust welfare activities.
                      </span>
                    </label>
                    {errors.disclaimer && <p className="text-xs text-red-500 mt-1 pl-6">{errors.disclaimer}</p>}
                  </div>

                  <div className="flex items-center gap-2 mb-5">
                    <ShieldCheck size={13} className="text-green-600 shrink-0" />
                    <p className="text-xs text-gray-400">{t("secureNote", { defaultValue: "100% secure · 256-bit encrypted · Tax deductible" })}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReview}
                    disabled={!finalAmount}
                    className="w-full bg-[#B91C1C] hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-base cursor-pointer"
                  >
                    <Heart size={17} fill="white" />
                    {t("reviewBtn", { defaultValue: "Review Details" })} — ₹{finalAmount ? fmtINR(finalAmount) : "—"}
                    <ChevronRight size={17} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Confirm Step ── */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#B91C1C] font-semibold transition cursor-pointer"
                  >
                    <ChevronRight size={15} className="rotate-180" /> {t("editDetails", { defaultValue: "Edit Details" })}
                  </button>
                  <h3 className="text-base font-bold text-gray-900">{t("confirmTitle", { defaultValue: "Confirm Donation" })}</h3>
                  <div className="w-20" />
                </div>

                <div className="p-5 sm:p-6">
                  {/* Amount hero */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4 mb-4">
                    <span className="text-3xl">{selectedCause?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{t("causeLabel", { defaultValue: "Selected Cause" })}</p>
                      <p className="font-bold text-gray-900 truncate">{selectedCause?.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{t("amountLabel", { defaultValue: "Amount" })}</p>
                      <p className="text-2xl font-extrabold text-[#B91C1C]">₹{fmtINR(finalAmount)}</p>
                    </div>
                  </div>

                  {/* Donor details */}
                  <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 mb-4">
                    {[
                      { label: t("labelName", { defaultValue: "Name" }),   value: form.name },
                      { label: t("labelPhone", { defaultValue: "Phone" }),  value: `+91 ${form.phone}` },
                      { label: "Address",                                   value: form.address },
                      { label: t("labelEmail", { defaultValue: "Email" }),  value: form.email || "Not provided" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-gray-500 font-medium shrink-0 mr-3">{label}</span>
                        <span className="text-sm font-semibold text-gray-800 text-right break-all">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
                    <FileText size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-yellow-700 leading-relaxed">
                      Official Marathi Pāvatī & SMS receipt will be sent directly to <strong>+91 {form.phone}</strong> upon payment confirmation.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={handleProceedToOtp}
                    className="w-full bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-base cursor-pointer"
                  >
                    {otpLoading ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Heart size={17} fill="white" />
                        {t("donateBtn", { defaultValue: "Proceed to Donate" })} — ₹{fmtINR(finalAmount)}
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                    🔒 CCAvenue Payment Gateway · PCI-DSS Level 1 · 256-bit SSL
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── OTP Modal ── */}
            {step === "otp-modal" && (
              <motion.div
                key="otp-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <ShieldCheck size={32} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">Verify Mobile Number</h3>
                <p className="text-xs text-gray-500 mb-5">
                  Enter the 6-digit verification code sent to <br />
                  <strong className="text-gray-800">+91 {form.phone}</strong>
                </p>

                {devOtpHint && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800">
                    ⚡ <strong>Development OTP Hint:</strong> <span className="font-mono font-bold tracking-widest">{devOtpHint}</span>
                  </div>
                )}

                {otpError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-600 font-medium">
                    {otpError}
                  </div>
                )}

                <div className="mb-6">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full text-center tracking-[0.6em] text-2xl font-bold py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none focus:border-[#B91C1C] focus:bg-white transition"
                  />
                </div>

                <button
                  type="button"
                  disabled={otpLoading || otp.length !== 6}
                  onClick={handleVerifyAndPayCCAvenue}
                  className="w-full bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-40"
                >
                  {otpLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Verify & Pay ₹{fmtINR(finalAmount)}
                    </>
                  )}
                </button>

                <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => { setStep("confirm"); setOtp(""); }}
                    className="text-gray-400 hover:text-gray-700 font-medium cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    disabled={otpTimer > 0 || otpLoading}
                    onClick={handleResendOtp}
                    className={`font-bold cursor-pointer ${
                      otpTimer > 0 ? "text-gray-400" : "text-[#B91C1C] hover:underline"
                    }`}
                  >
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Redirecting Spinner ── */}
            {step === "redirecting" && (
              <motion.div
                key="redirecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#B91C1C] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-200">
                  <Lock size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Connecting to CCAvenue</h3>
                <p className="text-xs text-gray-400 mb-6">
                  Please wait while we redirect you to the secure payment page...
                </p>
                <RefreshCw size={32} className="animate-spin text-[#B91C1C] mx-auto mb-4" />
                <p className="text-[11px] text-gray-400">Do not refresh or close this browser window.</p>
              </motion.div>
            )}

            {/* ── Success / Done Step ── */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100"
                >
                  <CheckCircle2 size={52} className="text-green-500" strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{t("doneTitle", { defaultValue: "Thank You for Your Donation! 🙏" })}</h3>
                <p className="text-base text-gray-500 mb-6 leading-relaxed">
                  {t("doneThanks", {
                    name:   successData?.donorName || form.name || "Devotee",
                    amount: fmtINR(successData?.amount || finalAmount),
                    cause:  selectedCause?.title,
                    defaultValue: `Thank you, ${successData?.donorName || form.name || "Devotee"}! Your contribution has been gratefully received.`
                  })}
                </p>
                <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-6">
                  {successData?.donationNo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Donation No</span>
                      <span className="font-mono font-bold text-gray-800">{successData.donationNo}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t("causeLabel", { defaultValue: "Cause" })}</span>
                    <span className="font-semibold text-gray-800">{selectedCause?.emoji} {selectedCause?.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t("doneAmount", { defaultValue: "Amount Paid" })}</span>
                    <span className="font-semibold text-gray-800">₹{fmtINR(successData?.amount || finalAmount)}</span>
                  </div>
                  {successData?.txnId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Transaction ID</span>
                      <span className="font-mono font-semibold text-gray-800">{successData.txnId}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 mb-6 text-xs text-left">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <p>SMS containing your official Pāvatī receipt download link has been dispatched to your mobile.</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleManualPavatiDownload}
                    className="w-full bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-2xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-100"
                  >
                    <Download size={18} /> Download Official Marathi Pāvatī (PDF)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate("/donate-now", { replace: true });
                      setStep("form");
                      setForm({ name: "", email: "", phone: "", address: "" });
                      setCustom("");
                      setPreset(501);
                      setSuccessData(null);
                    }}
                    className="w-full border-2 border-[#B91C1C] text-[#B91C1C] font-bold py-3.5 rounded-2xl hover:bg-red-50 transition text-sm cursor-pointer"
                  >
                    {t("doAgainBtn", { defaultValue: "Make Another Donation" })}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── Direct Payment Section ── */}
      <div className="px-4 sm:px-6 md:px-10 w-full max-w-6xl mx-auto mt-12">
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or pay directly</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">UPI & Bank Transfer</h2>
          <p className="text-sm text-gray-500 mt-1">No account needed. Scan or transfer directly to our mandal.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">

          {/* QR Code */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center">
            <p className="text-sm font-bold text-gray-700 mb-4">Scan to Pay via UPI</p>
            <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center mb-4 overflow-hidden">
              <img
                src="/images/donation-qr.png"
                alt="Donation QR Code"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden flex-col items-center justify-center text-center p-4">
                <p className="text-3xl mb-2">📱</p>
                <p className="text-xs text-gray-400">QR code coming soon</p>
                <p className="text-xs text-gray-400 mt-1">Use UPI ID below</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full">
              <p className="text-sm font-mono text-gray-700 flex-1 truncate">{BANK.upiId}</p>
              <CopyBtn text={BANK.upiId} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Works with GPay · PhonePe · Paytm · Any UPI app</p>
          </div>

          {/* Bank details */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-5">Bank Transfer / NEFT / RTGS</p>
            <div className="space-y-4">
              {[
                { label: "Account Holder", value: BANK.holder },
                { label: "Bank",           value: BANK.bank },
                { label: "Account No.",    value: BANK.account },
                { label: "IFSC Code",      value: BANK.ifsc },
                { label: "Account Type",   value: "Savings" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                  <CopyBtn text={value} />
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                📲 After transfer, upload your payment screenshot below to get your 80G receipt.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Receipt Upload Section ── */}
      <div className="px-4 sm:px-6 md:px-10 w-full max-w-6xl mx-auto mt-8">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
              <Upload size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Upload Payment Receipt</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Already paid via UPI or bank transfer? Upload your screenshot to get your 80G receipt.
              </p>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">

              {/* Upload form */}
              {!receiptSent && (
                <motion.div
                  key="upload-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid sm:grid-cols-2 gap-6"
                >
                  {/* Left — file drop zone */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Payment Screenshot / Receipt
                    </p>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFilePick(e.dataTransfer.files[0]); }}
                      onClick={() => document.getElementById("receipt-file-input").click()}
                      className={`relative cursor-pointer border-2 border-dashed rounded-2xl transition-colors flex flex-col items-center justify-center text-center min-h-[200px] ${
                        receiptErr.file
                          ? "border-red-300 bg-red-50"
                          : isDragging
                          ? "border-blue-400 bg-blue-50"
                          : receipt
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <input
                        id="receipt-file-input"
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFilePick(e.target.files[0])}
                      />

                      {receipt ? (
                        <div className="relative w-full h-full p-3">
                          {receipt.preview ? (
                            <img
                              src={receipt.preview}
                              alt="Receipt preview"
                              className="w-full h-44 object-contain rounded-xl"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-44">
                              <FileText size={40} className="text-blue-400 mb-2" />
                              <p className="text-sm font-semibold text-gray-700">{receipt.file.name}</p>
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setReceipt(null); }}
                            className="absolute top-4 right-4 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50"
                          >
                            <XIcon size={14} className="text-gray-500" />
                          </button>
                          <p className="text-xs text-green-600 font-semibold text-center mt-2">✓ File ready to submit</p>
                        </div>
                      ) : (
                        <div className="p-6">
                          <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-3">
                            <ImagePlus size={26} className="text-gray-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-600">
                            {isDragging ? "Drop it here!" : "Tap to upload or drag & drop"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · Max 5 MB</p>
                        </div>
                      )}
                    </div>
                    {receiptErr.file && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle size={12} /> {receiptErr.file}
                      </p>
                    )}
                  </div>

                  {/* Right — donor details */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Your Details
                    </p>

                    {/* Name */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <div className={`flex items-center border-2 rounded-xl overflow-hidden ${receiptErr.name ? "border-red-400 bg-red-50" : "border-gray-100 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white"}`}>
                        <span className="pl-3 text-gray-400"><User size={16} /></span>
                        <input
                          className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                          placeholder="As it appears on bank account"
                          value={receiptName}
                          onChange={(e) => setReceiptName(e.target.value)}
                        />
                      </div>
                      {receiptErr.name && <p className="text-xs text-red-500 mt-1 pl-1">{receiptErr.name}</p>}
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                      <div className={`flex items-center border-2 rounded-xl overflow-hidden ${receiptErr.phone ? "border-red-400 bg-red-50" : "border-gray-100 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white"}`}>
                        <span className="pl-3 text-gray-400"><Phone size={16} /></span>
                        <span className="pl-2 pr-1.5 text-xs font-semibold text-gray-400 border-r border-gray-200 mr-1 py-3">+91</span>
                        <input
                          className="flex-1 px-2 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                          placeholder="10-digit mobile"
                          value={receiptPhone}
                          onChange={(e) => setReceiptPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          inputMode="numeric"
                        />
                      </div>
                      {receiptErr.phone && <p className="text-xs text-red-500 mt-1 pl-1">{receiptErr.phone}</p>}
                    </div>

                    {/* Amount */}
                    <div className="mb-5">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Amount Paid (₹)</label>
                      <div className={`flex items-center border-2 rounded-xl overflow-hidden ${receiptErr.amount ? "border-red-400 bg-red-50" : "border-gray-100 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white"}`}>
                        <span className="pl-4 text-gray-400 font-semibold text-sm">₹</span>
                        <input
                          type="number"
                          className="flex-1 px-2 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                          placeholder="e.g. 501"
                          value={receiptAmount}
                          onChange={(e) => setReceiptAmount(e.target.value)}
                          inputMode="numeric"
                        />
                      </div>
                      {receiptErr.amount && <p className="text-xs text-red-500 mt-1 pl-1">{receiptErr.amount}</p>}
                    </div>

                    <button
                      onClick={handleReceiptSubmit}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-100"
                    >
                      <Send size={16} />
                      Submit Receipt for Verification
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2.5">
                      🔒 Your receipt is securely handled · 80G sent within 24 hours
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Success state */}
              {receiptSent && (
                <motion.div
                  key="upload-success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5 shadow-lg shadow-green-100"
                  >
                    <CheckCircle2 size={44} className="text-green-500" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">Receipt Submitted! 🙏</h3>
                  <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
                    Thank you, <strong>{receiptName}</strong>! We've received your payment receipt for{" "}
                    <strong>₹{Number(receiptAmount).toLocaleString("en-IN")}</strong>.
                    Your 80G certificate will be sent to your mobile within 24 hours.
                  </p>
                  <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 w-full max-w-xs mb-6">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Name</span><span className="font-semibold">{receiptName}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Mobile</span><span className="font-semibold">+91 {receiptPhone}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Amount</span><span className="font-semibold text-[#B91C1C]">₹{Number(receiptAmount).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Status</span><span className="text-green-600 font-semibold">Under verification</span></div>
                  </div>
                  <button
                    onClick={() => { setReceiptSent(false); setReceipt(null); setReceiptName(""); setReceiptPhone(""); setReceiptAmount(""); }}
                    className="text-sm text-blue-600 font-semibold hover:underline"
                  >
                    Submit another receipt
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DonationDrivePage;
