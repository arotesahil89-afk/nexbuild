import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, MapPin, ShieldCheck, ChevronRight, HelpCircle, RefreshCw } from "lucide-react";
import apiClient from "../../services/apiService";

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
    {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
  </div>
);

const CheckoutDetailsModal = ({ open, onClose, onContinue, summary }) => {
  const [form,   setForm]   = useState({ name: "", email: "", phone: "", pincode: "", address: "" });
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const formatPhone = (e) =>
    setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name  = "Please enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit mobile number";
    if (!form.pincode || !/^\d{6}$/.test(form.pincode))
      e.pincode = "Enter a valid 6-digit pincode";
    if (!form.address || form.address.trim().length < 5)
      e.address = "Enter a valid address (min 5 characters)";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onContinue({
        ...form,
        shippingCharge: 0
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile handle */}
          <div className="flex justify-center pt-3 sm:hidden shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Complete Your Order</h3>
              <p className="text-xs text-gray-400 mt-0.5">Confirmation sent to your email</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-200 transition"
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="p-5 space-y-5">

              {/* ── 1. Order Summary (top) ── */}
              {summary && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Order Summary</p>
                  {summary}
                </div>
              )}

              {/* ── 2. Your Details ── */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Your Details</p>
                
                <Field icon={User} label="Full Name" error={errors.name}>
                  <input
                    className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                    placeholder="As it should appear on receipt"
                    value={form.name}
                    onChange={set("name")}
                    autoComplete="name"
                  />
                </Field>
                
                <Field icon={Phone} label="Mobile Number" error={errors.phone}>
                  <span className="pl-2 pr-1.5 text-xs font-semibold text-gray-500 border-r border-gray-200 mr-1 py-3">+91</span>
                  <input
                    className="flex-1 px-2 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 tracking-wide"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={formatPhone}
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </Field>
                
                <Field icon={Mail} label="Email Address" error={errors.email}>
                  <input
                    className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                    placeholder="For order confirmation & receipt"
                    value={form.email}
                    onChange={set("email")}
                    inputMode="email"
                    autoComplete="email"
                  />
                </Field>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pincode</label>
                  <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${
                    errors.pincode
                      ? "border-red-400 bg-red-50"
                      : "border-gray-100 bg-gray-50 focus-within:border-[#B91C1C] focus-within:bg-white"
                  }`}>
                    <span className="pl-3.5 text-gray-400 shrink-0"><HelpCircle size={16} /></span>
                    <input
                      className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 tracking-wide font-bold"
                      placeholder="6-digit billing pincode"
                      value={form.pincode}
                      onChange={(e) => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                  {errors.pincode && <p className="text-xs text-red-500 mt-1 pl-1">{errors.pincode}</p>}
                </div>

                <Field icon={MapPin} label="Billing Address" error={errors.address}>
                  <textarea
                    className="flex-1 px-3 py-2 bg-transparent outline-none text-sm placeholder:text-gray-400 resize-none h-16"
                    placeholder="Complete Address"
                    value={form.address}
                    onChange={set("address")}
                  />
                </Field>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-4 font-medium">
                  📍 <strong>Self-Pickup:</strong> Collect from Mandal Office, Ganesh Galli, Lalbaug, Mumbai - 400 012. No home delivery is available.
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <ShieldCheck size={13} className="text-green-600 shrink-0" />
                  <p className="text-[11px] text-gray-400">Your details are encrypted and never shared</p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-5 pt-3 border-t border-gray-100 shrink-0">
            <button
              onClick={handleContinue}
              className="w-full font-bold py-4 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-base text-white bg-[#B91C1C] hover:bg-red-800 active:bg-red-900 shadow-red-100"
            >
              Continue to Payment <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutDetailsModal;
