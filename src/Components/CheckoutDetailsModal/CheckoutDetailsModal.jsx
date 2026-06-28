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
  const [form,   setForm]   = useState({ name: "", email: "", phone: "", address: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const [pinLoading, setPinLoading] = useState(false);
  const [pinDetails, setPinDetails] = useState(null); 
  const [pinError, setPinError] = useState("");

  if (!open) return null;

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const formatPhone = (e) =>
    setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm(p => ({ ...p, pincode: val }));
    setPinError("");
    setPinDetails(null);

    if (val.length === 6) {
      setPinLoading(true);
      try {
        const res = await apiClient.get(`/shipping/pincode/${val}`);
        const data = res.data || res;
        if (data.deliveryAvailable) {
          setPinDetails(data);
        } else {
          setPinError("Delivery is not available for this location.");
        }
      } catch (err) {
        setPinError("Failed to check delivery serviceability.");
      } finally {
        setPinLoading(false);
      }
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name  = "Please enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit mobile number";
    
    if (!form.pincode || form.pincode.length !== 6) {
      e.pincode = "Enter a valid 6-digit pincode";
    } else if (!pinDetails) {
      e.pincode = pinError || "Check pincode serviceability first";
    }

    if (!form.address.trim() || form.address.trim().length < 10)
      e.address = "Please enter your full shipping address (min 10 characters)";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate() && pinDetails) {
      onContinue({
        ...form,
        shippingCharge: pinDetails.deliveryCharge,
        pincodeDetails: pinDetails
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
                      placeholder="6-digit delivery pincode"
                      value={form.pincode}
                      onChange={handlePincodeChange}
                      inputMode="numeric"
                      maxLength={6}
                    />
                    {pinLoading && (
                      <span className="pr-3.5 text-gray-400"><RefreshCw size={14} className="animate-spin" /></span>
                    )}
                  </div>
                  {errors.pincode && <p className="text-xs text-red-500 mt-1 pl-1">{errors.pincode}</p>}
                </div>

                {/* Serviceability Banner */}
                {pinDetails && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-4 text-xs">
                    <p className="font-bold text-emerald-800">✓ Delivery Available to {pinDetails.city}, {pinDetails.state}!</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-emerald-700">
                      <div>Shipping charge: <span className="font-bold text-emerald-800">₹{pinDetails.deliveryCharge}</span></div>
                      <div>Delivery est: <span className="font-bold text-emerald-800">{pinDetails.estimatedDelivery}</span></div>
                    </div>
                  </div>
                )}

                {pinError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 mb-4 text-xs">
                    <p className="font-bold text-rose-800">✗ Delivery is not available for this location.</p>
                    <p className="text-rose-600 mt-1">Please try another delivery pincode or select self-pickup options.</p>
                  </div>
                )}

                <Field icon={MapPin} label="Shipping Address" error={errors.address}>
                  <textarea
                    className="flex-1 px-3 py-2 bg-transparent outline-none text-sm placeholder:text-gray-400 resize-none h-16"
                    placeholder="Complete Street / Building Address"
                    value={form.address}
                    onChange={set("address")}
                    autoComplete="street-address"
                  />
                </Field>

                <div className="flex items-center gap-1.5 mt-1">
                  <ShieldCheck size={13} className="text-green-600 shrink-0" />
                  <p className="text-[11px] text-gray-400">Your details are encrypted and never shared</p>
                </div>
              </div>

              {/* ── 3. Shipping & Pickup Notice (bottom) ── */}
              <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-800">Shipping / Pickup Options</p>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                    We deliver across India via DTDC. Self-pickup is also available at the Mandal Office, Lalbaug.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-5 pt-3 border-t border-gray-100 shrink-0">
            <button
              onClick={handleContinue}
              disabled={!pinDetails}
              className={`w-full font-bold py-4 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-base text-white ${
                pinDetails
                  ? "bg-[#B91C1C] hover:bg-red-800 active:bg-red-900 shadow-red-100"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
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
