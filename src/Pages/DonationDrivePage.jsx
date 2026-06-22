import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Heart, ShieldCheck, ChevronRight, User, Mail, Phone,
  CheckCircle2, Award, Landmark, FileText, Copy, Check,
  Upload, ImagePlus, X as XIcon, Send, AlertCircle,
} from "lucide-react";
import PaymentGatewayModal from "../Components/PaymentGatewayModal/PaymentGatewayModal";
import { causes as causesData, presetAmounts, impactStats } from "../data/donationData";

const fmtINR = (n) => Number(n).toLocaleString("en-IN");

/* ─── Bank / UPI details ─── */
const BANK = {
  upiId:   "mumbaicharaja@upi",          // ← replace with real UPI ID
  bank:    "State Bank of India",
  account: "XXXX XXXX XXXX 1928",        // ← replace with real account
  ifsc:    "SBIN0000001",                // ← replace with real IFSC
  holder:  "Mumbaicha Raja Mandal Trust",
};

/* ─── Field ─── */
const Field = ({ icon: Icon, label, error, children }) => (
  <div className="mb-5">
    <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{label}</label>
    <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${
      error
        ? "border-red-400 bg-red-50"
        : "border-gray-100 bg-gray-50 focus-within:border-[#B91C1C] focus-within:bg-white"
    }`}>
      <span className="pl-4 text-gray-400 shrink-0"><Icon size={18} /></span>
      {children}
    </div>
    {error && <p className="text-sm text-red-500 mt-1.5 pl-1">{error}</p>}
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

/* ─── Page ─── */
const DonationDrivePage = () => {
  const { t } = useTranslation("donate");

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
  const [form,     setForm]     = useState({ name: "", email: "", phone: "" });
  const [errors,   setErrors]   = useState({});
  const [payOpen,  setPayOpen]  = useState(false);
  const [customer, setCustomer] = useState(null);
  const [step,     setStep]     = useState("form");

  /* ── Receipt upload state ── */
  const [receipt,       setReceipt]       = useState(null);   // { file, preview }
  const [receiptName,   setReceiptName]   = useState("");
  const [receiptPhone,  setReceiptPhone]  = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [receiptSent,   setReceiptSent]   = useState(false);
  const [receiptErr,    setReceiptErr]    = useState({});
  const [isDragging,    setIsDragging]    = useState(false);

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
    if (!f.name.trim() || f.name.trim().length < 2) e.name  = t("errorName");
    if (!/^\S+@\S+\.\S+$/.test(f.email))            e.email = t("errorEmail");
    if (!/^[6-9]\d{9}$/.test(f.phone))              e.phone = t("errorPhone");
    if (!amt || Number(amt) < 1)                     e.amount = t("errorAmountEmpty");
    if (Number(amt) > 500000)                        e.amount = t("errorAmountMax");
    return e;
  };

  const set      = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setPhone = (e)   => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));

  const handleReview = () => {
    const e = validate(form, finalAmount);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setCustomer({ ...form });
      setStep("confirm");
    }
  };

  const handlePaymentSuccess = () => { setPayOpen(false); setStep("done"); };

  /* ── Cause & amount selector (reused on mobile below form) ── */
  const CauseAmountPanel = () => (
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
        {t("whereTitle")}
      </p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {causes.map((c) => (
          <button
            key={c.id}
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
        {t("amountTitle")}
      </p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {presets.map((a) => (
          <button
            key={a.value}
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
          placeholder={t("customPlaceholder")}
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
          <p className="text-sm font-bold text-yellow-800">{t("taxTitle")}</p>
          <p className="text-sm text-yellow-700 mt-1 leading-relaxed">{t("taxBody")}</p>
        </div>
      </div>

      {/* Trust row */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { icon: Award,       lk: "trust1Label", sk: "trust1Sub" },
          { icon: ShieldCheck, lk: "trust2Label", sk: "trust2Sub" },
          { icon: Landmark,    lk: "trust3Label", sk: "trust3Sub" },
        ].map(({ icon: Icon, lk, sk }) => (
          <div key={lk} className="flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl py-4 px-2 shadow-sm">
            <Icon size={20} className="text-[#B91C1C] mb-2" />
            <p className="text-xs font-bold text-gray-800 leading-tight">{t(lk)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t(sk)}</p>
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
          <span>{t("breadHome")}</span>
          <ChevronRight size={14} />
          <span className="text-[#B91C1C] font-semibold">{t("breadDonate")}</span>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#B91C1C] flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
            <Heart size={26} className="text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {t("pageTitle")}
            </h1>
            <p className="text-gray-500 text-base mt-2 max-w-xl leading-relaxed">
              {t("pageSubtitle")}
            </p>
          </div>
        </div>
      </div>

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

          {/* Stats grid — 2 cols on mobile, 4 on sm+ */}
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

        {/* RIGHT — form / confirm / done (shows FIRST on mobile) */}
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
                {/* ── Mobile-only: cause + amount ABOVE the details card ── */}
                <div className="lg:hidden bg-white rounded-3xl shadow-sm border border-gray-100 p-4 w-full">
                  {/* Cause selector */}
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("whereTitle")}</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-5 snap-x snap-mandatory"
                       style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {causes.map((c) => (
                      <button
                        key={c.id}
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

                  {/* Amount presets */}
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("amountTitle")}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {presets.map((a) => (
                      <button
                        key={a.value}
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
                      placeholder={t("customPlaceholder")}
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setErrors((er) => ({ ...er, amount: undefined })); }}
                      className="w-full outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400"
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-red-500 mt-1.5 pl-1">{errors.amount}</p>}
                </div>

                {/* ── Details card ── */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 w-full">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900">{t("formTitle")}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{t("formSubtitle")}</p>
                    {finalAmount ? (
                      <div className="flex items-center gap-2 mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        <Heart size={14} className="text-[#B91C1C] shrink-0" fill="#B91C1C" />
                        <p className="text-xs text-gray-500">{t("donatingLabel")}</p>
                        <p className="text-base font-extrabold text-[#B91C1C] ml-auto">₹{fmtINR(finalAmount)}</p>
                      </div>
                    ) : null}
                  </div>

                  <Field icon={User} label={t("labelName")} error={errors.name}>
                    <input
                      className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                      placeholder={t("placeholderName")}
                      value={form.name}
                      onChange={set("name")}
                      autoComplete="name"
                    />
                  </Field>
                  <Field icon={Phone} label={t("labelPhone")} error={errors.phone}>
                    <span className="pl-2 pr-2 text-xs font-semibold text-gray-400 border-r border-gray-200 mr-1 py-3">+91</span>
                    <input
                      className="flex-1 px-2 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 tracking-wide"
                      placeholder={t("placeholderPhone")}
                      value={form.phone}
                      onChange={setPhone}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </Field>
                  <Field icon={Mail} label={t("labelEmail")} error={errors.email}>
                    <input
                      className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                      placeholder={t("placeholderEmail")}
                      value={form.email}
                      onChange={set("email")}
                      inputMode="email"
                      autoComplete="email"
                    />
                  </Field>

                  <div className="flex items-center gap-2 mb-5">
                    <ShieldCheck size={13} className="text-green-600 shrink-0" />
                    <p className="text-xs text-gray-400">{t("secureNote")}</p>
                  </div>

                  <button
                    onClick={handleReview}
                    disabled={!finalAmount}
                    className="w-full bg-[#B91C1C] hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-base"
                  >
                    <Heart size={17} fill="white" />
                    {t("reviewBtn")} — ₹{finalAmount ? fmtINR(finalAmount) : "—"}
                    <ChevronRight size={17} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Confirm ── */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Confirm header bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setStep("form")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#B91C1C] font-semibold transition"
                  >
                    <ChevronRight size={15} className="rotate-180" /> {t("editDetails")}
                  </button>
                  <h3 className="text-base font-bold text-gray-900">{t("confirmTitle")}</h3>
                  <div className="w-20" /> {/* spacer */}
                </div>

                <div className="p-5 sm:p-6">
                  {/* Amount hero */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4 mb-4">
                    <span className="text-3xl">{selectedCause?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{t("causeLabel")}</p>
                      <p className="font-bold text-gray-900 truncate">{selectedCause?.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{t("amountLabel")}</p>
                      <p className="text-2xl font-extrabold text-[#B91C1C]">₹{fmtINR(finalAmount)}</p>
                    </div>
                  </div>

                  {/* Donor details */}
                  <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 mb-4">
                    {[
                      { label: t("labelName"),  value: customer?.name },
                      { label: t("labelPhone"), value: `+91 ${customer?.phone}` },
                      { label: t("labelEmail"), value: customer?.email },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-gray-500 font-medium shrink-0 mr-3">{label}</span>
                        <span className="text-sm font-semibold text-gray-800 text-right break-all">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* 80G note */}
                  <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
                    <FileText size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-yellow-700 leading-relaxed">
                      80G receipt will be emailed to <strong className="break-all">{customer?.email}</strong> within 24 hours.
                    </p>
                  </div>

                  <button
                    onClick={() => setPayOpen(true)}
                    className="w-full bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-base"
                  >
                    <Heart size={17} fill="white" />
                    {t("donateBtn")} — ₹{fmtINR(finalAmount)}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                    🔒 Razorpay · PCI-DSS Level 1 · 256-bit SSL
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Success ── */}
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
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{t("doneTitle")}</h3>
                <p className="text-base text-gray-500 mb-6 leading-relaxed">
                  {t("doneThanks", {
                    name:   customer?.name,
                    amount: fmtINR(finalAmount),
                    cause:  selectedCause?.title,
                  })}
                </p>
                <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t("causeLabel")}</span>
                    <span className="font-semibold text-gray-800">{selectedCause?.emoji} {selectedCause?.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t("doneAmount")}</span>
                    <span className="font-semibold text-gray-800">₹{fmtINR(finalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t("doneReceipt", { email: "" }).replace(/\{\{email\}\}/g, "").trim()}</span>
                    <span className="font-semibold text-gray-800 text-right max-w-[55%] truncate">{customer?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">80G</span>
                    <span className="font-semibold text-gray-800">{t("done80g")}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setStep("form"); setForm({ name: "", email: "", phone: "" }); setCustom(""); setPreset(501); }}
                  className="w-full border-2 border-[#B91C1C] text-[#B91C1C] font-bold py-4 rounded-2xl hover:bg-red-50 transition text-base"
                >
                  {t("doAgainBtn")}
                </button>
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
              {/* Replace src with real QR image: /images/donation-qr.png */}
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
                📲 After transfer, WhatsApp your payment screenshot to get your 80G receipt.
                We verify within 24 hours.
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

              {/* ── Upload form ── */}
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

              {/* ── Success state ── */}
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

      <PaymentGatewayModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        amount={finalAmount}
        title={`${t("breadDonate")} — ${selectedCause?.title}`}
        showCod={false}
        customer={customer}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default DonationDrivePage;
