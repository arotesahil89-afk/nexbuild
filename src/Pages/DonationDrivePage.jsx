import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Heart, ShieldCheck, ChevronRight, User, Mail, Phone, MapPin,
  CheckCircle2, Award, Landmark, FileText, AlertCircle, Lock, RefreshCw, Download,
  Check, Sparkles, HelpCircle
} from "lucide-react";
import { causes as causesData, presetAmounts, impactStats } from "../data/donationData";
import apiClient from "../services/apiService";
import { downloadDonationReceipt } from "../utils/marathiReceipt";

const fmtINR = (n) => Number(n || 0).toLocaleString("en-IN");

/* ─── Mobile-First Input Field ─── */
const Field = ({ icon: Icon, label, error, children }) => (
  <div className="mb-3.5 sm:mb-4">
    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    <div
      className={`flex items-center border-2 rounded-xl sm:rounded-2xl transition-all duration-200 ${
        error
          ? "border-red-400 bg-red-50/50"
          : "border-gray-200 bg-gray-50/60 focus-within:border-[#B91C1C] focus-within:bg-white focus-within:shadow-sm"
      }`}
    >
      <span className="pl-3.5 sm:pl-4 text-gray-400 shrink-0">
        <Icon size={18} className="text-gray-400" />
      </span>
      {children}
    </div>
    {error && (
      <p className="text-xs text-red-600 mt-1 pl-1 font-medium flex items-center gap-1">
        <AlertCircle size={13} className="shrink-0" />
        {error}
      </p>
    )}
  </div>
);

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

  const [cause, setCause] = useState(causes[0].id);
  const [preset, setPreset] = useState(501);
  const [custom, setCustom] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [disclaimer, setDisclaimer] = useState(true);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form"); // 'form', 'confirm', 'otp-modal', 'redirecting', 'done'
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const finalAmount = custom ? Number(custom) : preset;
  const selectedCause = causes.find((c) => c.id === cause);

  const validate = (f, amt) => {
    const e = {};
    if (!f.name.trim() || f.name.trim().length < 2) {
      e.name = t("errorName", { defaultValue: "Please enter your full name" });
    }
    if (!/^[6-9]\d{9}$/.test(f.phone)) {
      e.phone = t("errorPhone", { defaultValue: "Enter a valid 10-digit mobile number" });
    }
    if (!f.address.trim() || f.address.trim().length < 5) {
      e.address = "Please enter your complete address (min 5 characters)";
    }
    if (f.email && f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email)) {
      e.email = t("errorEmail", { defaultValue: "Enter a valid email address" });
    }
    if (!amt || Number(amt) < 1) {
      e.amount = t("errorAmountEmpty", { defaultValue: "Please enter or select an amount" });
    }
    if (Number(amt) > 500000) {
      e.amount = t("errorAmountMax", { defaultValue: "Maximum single donation is ₹5,00,000" });
    }
    if (!disclaimer) {
      e.disclaimer = "Please accept the voluntary offering terms to proceed";
    }
    return e;
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setPhone = (e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));

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
      setOtpError("Please enter the 6-digit OTP code");
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

  /* ── Reusable Cause & Amount UI Component ── */
  const CauseAndAmountSection = ({ isMobileCompact = false }) => (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Cause Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
            {t("whereTitle", { defaultValue: "1. Select Cause" })}
          </p>
          <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
            Choose where your seva goes
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {causes.map((c) => {
            const isSelected = cause === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCause(c.id)}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer min-h-[85px] sm:min-h-[100px] ${
                  isSelected
                    ? "border-[#B91C1C] bg-red-50/70 shadow-sm shadow-red-100 ring-1 ring-[#B91C1C]/20"
                    : "border-gray-200/90 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#B91C1C] rounded-full flex items-center justify-center">
                    <Check size={10} className="text-white stroke-[3]" />
                  </span>
                )}
                <span className="text-2xl sm:text-3xl mb-1 select-none">{c.emoji}</span>
                <p className={`text-xs sm:text-sm font-bold leading-tight ${isSelected ? "text-[#B91C1C]" : "text-gray-800"}`}>
                  {c.title}
                </p>
                {!isMobileCompact && (
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 line-clamp-1">{c.desc}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Amount Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
            {t("amountTitle", { defaultValue: "2. Choose Amount" })}
          </p>
        </div>

        {/* Preset Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
          {presets.map((a) => {
            const isSelected = preset === a.value && !custom;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => {
                  setPreset(a.value);
                  setCustom("");
                  setErrors((e) => ({ ...e, amount: undefined }));
                }}
                className={`py-3 sm:py-3.5 px-2 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer min-h-[64px] sm:min-h-[72px] flex flex-col items-center justify-center ${
                  isSelected
                    ? "border-[#B91C1C] bg-red-50/80 shadow-sm shadow-red-100 ring-1 ring-[#B91C1C]/20"
                    : "border-gray-200/90 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <p className={`font-black text-base sm:text-lg leading-tight ${isSelected ? "text-[#B91C1C]" : "text-gray-900"}`}>
                  ₹{fmtINR(a.value)}
                </p>
                <p className={`text-[10px] sm:text-xs mt-0.5 font-medium ${isSelected ? "text-red-700" : "text-gray-400"}`}>
                  {a.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Custom Amount Input */}
        <div
          className={`flex items-center border-2 rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:py-3 transition-all duration-200 ${
            custom
              ? "border-[#B91C1C] bg-red-50/50 shadow-sm"
              : errors.amount
              ? "border-red-400 bg-red-50/50"
              : "border-gray-200 bg-white focus-within:border-[#B91C1C] focus-within:shadow-sm"
          }`}
        >
          <span className="text-gray-500 font-bold mr-2 text-base sm:text-lg">₹</span>
          <input
            type="number"
            min="1"
            max="500000"
            inputMode="numeric"
            placeholder={t("customPlaceholder", { defaultValue: "Or enter custom amount (e.g. 2100)" })}
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setErrors((er) => ({ ...er, amount: undefined }));
            }}
            className="w-full outline-none bg-transparent text-base sm:text-base text-gray-900 placeholder:text-gray-400 font-semibold"
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-red-600 mt-1 pl-1 font-medium flex items-center gap-1">
            <AlertCircle size={13} className="shrink-0" />
            {errors.amount}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-orange-50/40 via-white to-gray-50 min-h-screen pb-16 w-full overflow-x-hidden">

      {/* ── Page Header & Breadcrumb ── */}
      <div className="pt-20 sm:pt-24 pb-4 sm:pb-6 px-4 sm:px-6 md:px-8 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3 sm:mb-4">
          <span onClick={() => navigate("/")} className="hover:text-gray-700 cursor-pointer">{t("breadHome", { defaultValue: "Home" })}</span>
          <ChevronRight size={12} />
          <span className="text-[#B91C1C] font-bold">{t("breadDonate", { defaultValue: "Online Donation" })}</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#B91C1C] to-red-700 flex items-center justify-center shrink-0 shadow-md shadow-red-200">
            <Heart size={24} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              {t("pageTitle", { defaultValue: "Online Donation / देणगी" })}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Lalbaug Sarvajanik Utsav Mandal · Ganeshgalli, Mumbai
            </p>
          </div>
        </div>
      </div>

      {/* ── Alert Bar (Errors/Notices) ── */}
      {pageAlert && (
        <div className="px-4 sm:px-6 md:px-8 w-full max-w-6xl mx-auto mb-4">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3 text-xs sm:text-sm">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <p className="font-semibold flex-1">{pageAlert.text}</p>
            <button onClick={() => setPageAlert(null)} className="p-1 hover:bg-red-100 rounded-lg">
              <span className="text-lg leading-none">&times;</span>
            </button>
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

      {/* ── Main Responsive Grid ── */}
      <div className="px-4 sm:px-6 md:px-8 w-full max-w-6xl mx-auto grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* ── DESKTOP LEFT SIDEBAR: Cause, Amount & Trust Details (Hidden on Mobile) ── */}
        <div className="hidden lg:block lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm">
            <CauseAndAmountSection isMobileCompact={false} />

            {/* 80G Information Card */}
            <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 mt-6">
              <FileText size={18} className="text-amber-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">80G Tax Exemption</p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  All donations are eligible for 50% tax deduction under Section 80G of the Income Tax Act.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2.5 mt-5">
              {[
                { icon: Award, label: "Est. 1928", sub: "98 Years" },
                { icon: ShieldCheck, label: "80G Certified", sub: "Tax Free" },
                { icon: Landmark, label: "Govt. Regd.", sub: "Trust A-7236" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center bg-gray-50/80 border border-gray-200/70 rounded-xl py-3 px-1.5">
                  <Icon size={16} className="text-[#B91C1C] mb-1" />
                  <p className="text-[11px] font-bold text-gray-800 leading-tight">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN / MOBILE MAIN: Flow Steps (Form, Confirm, OTP, Done) ── */}
        <div className="w-full lg:col-span-7 min-w-0">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Form ── */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 sm:space-y-6 w-full min-w-0"
              >
                {/* Mobile-Only Cause & Amount Card (Top on Mobile) */}
                <div className="lg:hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-sm">
                  <CauseAndAmountSection isMobileCompact={true} />
                </div>

                {/* Donor Details Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-gray-200/80 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 mb-4 sm:mb-5">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">
                        {t("formTitle", { defaultValue: "Donor Details / देणगीदाराचे नाव" })}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Required for official Marathi Pāvatī receipt
                      </p>
                    </div>

                    {/* Live Selected Amount Badge */}
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Offering</p>
                      <p className="text-lg sm:text-2xl font-black text-[#B91C1C] leading-tight">
                        ₹{fmtINR(finalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Input 1: Full Name */}
                  <Field icon={User} label={t("labelName", { defaultValue: "Full Name (नाव) *" })} error={errors.name}>
                    <input
                      className="w-full px-3 py-3 sm:py-3.5 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400 font-medium"
                      placeholder={t("placeholderName", { defaultValue: "Full Name as per ID" })}
                      value={form.name}
                      onChange={set("name")}
                      autoComplete="name"
                    />
                  </Field>

                  {/* Input 2: Mobile Phone */}
                  <Field icon={Phone} label={t("labelPhone", { defaultValue: "Mobile Number (मोबाईल क्र.) *" })} error={errors.phone}>
                    <span className="pl-2 pr-2 text-xs sm:text-sm font-bold text-gray-500 border-r border-gray-300 mr-1 py-3 select-none">
                      +91
                    </span>
                    <input
                      className="w-full px-2 py-3 sm:py-3.5 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400 font-medium tracking-wide"
                      placeholder="10-digit mobile"
                      value={form.phone}
                      onChange={setPhone}
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </Field>

                  {/* Input 3: Address */}
                  <Field icon={MapPin} label="Residential Address (पत्ता) *" error={errors.address}>
                    <input
                      className="w-full px-3 py-3 sm:py-3.5 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400 font-medium"
                      placeholder="Street, Area, City, Pin"
                      value={form.address}
                      onChange={set("address")}
                    />
                  </Field>

                  {/* Input 4: Email Address (Optional) */}
                  <Field icon={Mail} label={t("labelEmail", { defaultValue: "Email Address (Optional)" })} error={errors.email}>
                    <input
                      className="w-full px-3 py-3 sm:py-3.5 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400 font-medium"
                      placeholder="For digital receipt copy"
                      value={form.email}
                      onChange={set("email")}
                      inputMode="email"
                      autoComplete="email"
                    />
                  </Field>

                  {/* Voluntary Disclaimer Checkbox */}
                  <div className="pt-2 mb-5">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={disclaimer}
                        onChange={(e) => setDisclaimer(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-[#B91C1C] rounded border-gray-300 focus:ring-[#B91C1C] cursor-pointer"
                      />
                      <span className="text-xs text-gray-500 leading-relaxed">
                        I confirm that this contribution is made voluntarily out of devotion to Lalbaug Sarvajanik Utsav Mandal for charitable & social activities.
                      </span>
                    </label>
                    {errors.disclaimer && (
                      <p className="text-xs text-red-600 mt-1 pl-6 font-medium flex items-center gap-1">
                        <AlertCircle size={13} className="shrink-0" />
                        {errors.disclaimer}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={handleReview}
                    disabled={!finalAmount}
                    className="w-full bg-[#B91C1C] hover:bg-red-800 active:scale-[0.99] text-white font-black py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[50px]"
                  >
                    <Heart size={18} fill="white" />
                    <span>Proceed with Donation — ₹{fmtINR(finalAmount)}</span>
                    <ChevronRight size={18} />
                  </button>

                  <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5 font-medium">
                    <Lock size={12} className="text-emerald-600" />
                    Secured by 256-bit Encryption · Official Trust Receipt
                  </p>
                </div>

                {/* Mobile-Only Trust Badges Footer */}
                <div className="lg:hidden grid grid-cols-3 gap-2 pt-2">
                  {[
                    { icon: Award, label: "Est. 1928", sub: "98th Year" },
                    { icon: ShieldCheck, label: "80G Tax Free", sub: "Approved" },
                    { icon: Landmark, label: "Govt Regd.", sub: "Trust A-7236" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex flex-col items-center text-center bg-white border border-gray-200/80 rounded-xl py-3 px-1">
                      <Icon size={16} className="text-[#B91C1C] mb-1" />
                      <p className="text-[11px] font-bold text-gray-800 leading-tight">{label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Confirm Screen ── */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden"
              >
                {/* Clean Mobile-First Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-white">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 text-gray-700 text-xs font-bold transition cursor-pointer active:scale-95 shrink-0"
                  >
                    <ChevronRight size={14} className="rotate-180 text-gray-500" />
                    <span>{t("editDetails", { defaultValue: "Edit details" })}</span>
                  </button>

                  <div className="text-center px-2">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 tracking-tight leading-tight">
                      {t("confirmTitle", { defaultValue: "Confirm Donation" })}
                    </h3>
                  </div>

                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 text-[10px] font-bold text-[#B91C1C] border border-red-100 shrink-0">
                    Step 2/2
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Selected Cause & Amount Hero Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 via-red-50/50 to-orange-50/60 border border-red-100/90 p-4 mb-4 shadow-sm">
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-red-100 flex items-center justify-center shrink-0 text-2xl select-none">
                          {selectedCause?.emoji || "🙏"}
                        </div>
                        <div className="min-w-0">
                          <span className="inline-block text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider bg-red-100/70 px-2 py-0.5 rounded-md mb-0.5">
                            {t("causeLabel", { defaultValue: "Cause" })}
                          </span>
                          <p className="font-extrabold text-base sm:text-lg text-gray-900 truncate leading-tight">
                            {selectedCause?.title}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                          {t("amountLabel", { defaultValue: "Amount" })}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-[#B91C1C] tracking-tight leading-none">
                          ₹{fmtINR(finalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Donor Details Card — Structured Mobile-First Layout (Multi-language!) */}
                  <div className="bg-gray-50/80 rounded-2xl border border-gray-200/70 p-2.5 sm:p-3.5 mb-4 space-y-2">
                    {/* Name */}
                    <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 mt-0.5">
                        <User size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          {t("labelName", { defaultValue: "Full Name" })}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 break-words leading-snug mt-0.5">
                          {form.name}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Phone size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          {t("labelPhone", { defaultValue: "Mobile Number" })}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 tracking-wide leading-snug mt-0.5">
                          +91 {form.phone}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          {t("labelAddress", { defaultValue: "Address" })}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 break-words leading-snug mt-0.5">
                          {form.address}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    {form.email && (
                      <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Mail size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            {t("labelEmail", { defaultValue: "Email Address" })}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 break-all leading-snug mt-0.5">
                            {form.email}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SMS & Pāvatī Notice Box */}
                  <div className="flex items-start gap-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3 sm:p-3.5 mb-5 text-xs text-amber-900">
                    <div className="w-6 h-6 rounded-full bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={13} className="text-amber-800" />
                    </div>
                    <p className="leading-relaxed">
                      Official Marathi Pāvatī & SMS receipt will be sent directly to <strong className="text-gray-900 font-bold">+91 {form.phone}</strong> upon payment confirmation.
                    </p>
                  </div>

                  {/* High-Conversion Devotional CTA */}
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={handleProceedToOtp}
                    className="w-full bg-gradient-to-r from-[#B91C1C] via-red-700 to-[#991B1B] hover:from-red-700 hover:to-red-900 active:scale-[0.98] text-white font-black py-3.5 sm:py-4 px-6 rounded-2xl transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2.5 text-base cursor-pointer disabled:opacity-50 min-h-[52px]"
                  >
                    {otpLoading ? (
                      <>
                        <RefreshCw size={19} className="animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <Heart size={19} fill="white" className="shrink-0" />
                        <span>{t("donateBtn", { defaultValue: "Donate Securely" })} — ₹{fmtINR(finalAmount)}</span>
                        <ChevronRight size={18} className="shrink-0 opacity-80" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-400 text-center mt-3.5 flex items-center justify-center gap-1.5 font-medium">
                    <Lock size={12} className="text-emerald-600 shrink-0" />
                    <span>CCAvenue Payment Gateway · PCI-DSS Level 1 · 256-bit SSL</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: OTP Screen ── */}
            {step === "otp-modal" && (
              <motion.div
                key="otp-modal"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/80 p-5 sm:p-8 text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-red-100 shadow-sm">
                  <ShieldCheck size={30} />
                </div>

                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1">Verify Mobile Number</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5">
                  Enter the 6-digit OTP code sent to <br />
                  <strong className="text-gray-900 font-bold">+91 {form.phone}</strong>
                </p>

                {devOtpHint && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800">
                    ⚡ <strong>Test OTP Code:</strong>{" "}
                    <span className="font-mono font-black tracking-widest text-sm">{devOtpHint}</span>
                  </div>
                )}

                {otpError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-600 font-semibold flex items-center justify-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                {/* 6-Digit Mobile-Friendly OTP Input */}
                <div className="mb-5">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full text-center tracking-[0.5em] text-2xl sm:text-3xl font-black py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-[#B91C1C] focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="button"
                  disabled={otpLoading || otp.length !== 6}
                  onClick={handleVerifyAndPayCCAvenue}
                  className="w-full bg-[#B91C1C] hover:bg-red-800 active:scale-[0.99] text-white font-black py-4 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-40 min-h-[50px]"
                >
                  {otpLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Connecting to Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Verify & Pay ₹{fmtINR(finalAmount)}</span>
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("confirm");
                      setOtp("");
                    }}
                    className="text-gray-500 hover:text-gray-900 font-bold cursor-pointer py-1"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    disabled={otpTimer > 0 || otpLoading}
                    onClick={handleResendOtp}
                    className={`font-black cursor-pointer py-1 ${
                      otpTimer > 0 ? "text-gray-400" : "text-[#B91C1C] hover:underline"
                    }`}
                  >
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Redirecting Spinner ── */}
            {step === "redirecting" && (
              <motion.div
                key="redirecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/80 p-8 sm:p-12 text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#B91C1C] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
                  <Lock size={26} className="text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">
                  Connecting to CCAvenue
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Please wait while we redirect you to the secure payment checkout...
                </p>
                <RefreshCw size={32} className="animate-spin text-[#B91C1C] mx-auto mb-4" />
                <p className="text-[11px] text-gray-400">Do not refresh or close this browser window.</p>
              </motion.div>
            )}

            {/* ── Step 5: Success / Done Step ── */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/80 p-6 sm:p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, delay: 0.1 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg shadow-green-100"
                >
                  <CheckCircle2 size={46} className="text-green-600" strokeWidth={1.5} />
                </motion.div>

                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">
                  {t("doneTitle", { defaultValue: "Thank You for Your Seva! 🙏" })}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed">
                  Your donation has been confirmed successfully. May Mumbai Cha Raja bless you and your family.
                </p>

                {/* Summary Box */}
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left space-y-2.5 mb-5 border border-gray-200/70 text-xs sm:text-sm">
                  {successData?.donationNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Receipt No:</span>
                      <span className="font-mono font-black text-gray-900">{successData.donationNo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cause:</span>
                    <span className="font-bold text-gray-800">{selectedCause?.emoji} {selectedCause?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span className="font-black text-[#B91C1C] text-sm sm:text-base">
                      ₹{fmtINR(successData?.amount || finalAmount)}
                    </span>
                  </div>
                  {successData?.txnId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID:</span>
                      <span className="font-mono text-gray-700">{successData.txnId}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5 text-xs text-emerald-800 text-left">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <p>SMS containing your official Pāvatī receipt download link has been sent to your mobile.</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleManualPavatiDownload}
                    className="w-full bg-[#B91C1C] hover:bg-red-800 active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-xl sm:rounded-2xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-100 min-h-[48px]"
                  >
                    <Download size={18} />
                    <span>Download Official Marathi Pāvatī (PDF)</span>
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
                    className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition text-sm cursor-pointer min-h-[48px]"
                  >
                    Make Another Offering
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default DonationDrivePage;
