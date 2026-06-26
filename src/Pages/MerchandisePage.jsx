import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Star, Check, ShieldCheck, Truck, Plus, Minus, ShoppingBag, X,
  ChevronRight, Heart, Sparkles, Ruler, AlertCircle, Award,
  Users, BadgeCheck, Phone,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../services/apiService";
import PaymentGatewayModal from "../Components/PaymentGatewayModal/PaymentGatewayModal";
import CheckoutDetailsModal from "../Components/CheckoutDetailsModal/CheckoutDetailsModal";
import { featuredProduct as P } from "../data/merchData";

const MAX_QTY = 5;
const LOW_STOCK_THRESHOLD = 50;

/* ─── Size Guide Modal ─── */
const SIZE_CHART = [
  { size: "S",   chest: "36–38\"", length: "27\"", shoulder: "16.5\"" },
  { size: "M",   chest: "38–40\"", length: "28\"", shoulder: "17.5\"" },
  { size: "L",   chest: "40–42\"", length: "29\"", shoulder: "18.5\"" },
  { size: "XL",  chest: "42–44\"", length: "30\"", shoulder: "19.5\"" },
  { size: "XXL", chest: "44–46\"", length: "31\"", shoulder: "20.5\"" },
];

const SizeGuideModal = ({ open, onClose, activeSize }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[110] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar for mobile */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-[#B91C1C]" />
              <h3 className="font-bold text-gray-900">Size Guide</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
              <X size={16} />
            </button>
          </div>

          {/* Table */}
          <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#B91C1C] text-white text-xs uppercase tracking-wide">
                  <th className="py-2.5 px-3 text-left font-semibold">Size</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Chest</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Length</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((row, i) => (
                  <tr
                    key={row.size}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                      row.size === activeSize ? "bg-red-50 font-semibold" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center gap-1.5">
                      {row.size}
                      {row.size === activeSize && (
                        <span className="text-[9px] bg-[#B91C1C] text-white px-1.5 py-0.5 rounded-full">Selected</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-600">{row.chest}</td>
                    <td className="py-2.5 px-3 text-center text-gray-600">{row.length}</td>
                    <td className="py-2.5 px-3 text-center text-gray-600">{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-gray-400 mb-5">Tip: If between sizes, size up for a relaxed fit</p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Trust Badges Strip ─── */
const TRUST_ITEMS = [
  { icon: Award,      label: "96 Years Legacy",      sub: "Est. 1928, Ganesh Galli" },
  { icon: BadgeCheck, label: "Official Store",        sub: "Verified Mandal Merchandise" },
  { icon: Users,      label: "10,000+ Devotees",      sub: "Trust the community" },
  { icon: ShieldCheck,label: "Secure Checkout",       sub: "UPI · Card · Pay-at-Pickup" },
];

const TrustStrip = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
    {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
      <div key={label} className="flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center mb-2">
          <Icon size={18} />
        </div>
        <p className="text-xs font-bold text-gray-800 leading-tight">{label}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
      </div>
    ))}
  </div>
);

/* ─── Page ─── */
const MerchandisePage = () => {
  const { t } = useTranslation("merchandise");

  const [active, setActive]           = useState(0);
  const [selectQty, setSelectQty]     = useState({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
  const [sizeGuideOpen, setSizeGuide] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payOpen, setPayOpen]         = useState(false);
  const [customer, setCustomer]       = useState(null);

  const name     = t("productName");
  const discount = P.oldPrice ? Math.round(((P.oldPrice - P.price) / P.oldPrice) * 100) : 0;

  const totalQty = Object.values(selectQty).reduce((a, b) => a + b, 0);
  const orderTotal = P.price * totalQty;

  const handleSizeQtyChange = (s, q) => {
    if (q < 0) return;
    const stock = P.stock[s] ?? 999;
    if (q > stock) q = stock;

    const newSelectQty = { ...selectQty, [s]: q };
    const newTotalQty = Object.values(newSelectQty).reduce((a, b) => a + b, 0);
    if (newTotalQty > 50) {
      toast.warning("Maximum total limit is 50 T-Shirts per order.", { position: "top-center" });
      return;
    }
    setSelectQty(newSelectQty);
  };

  const handleOrder = () => setDetailsOpen(true);

  const handleDetailsContinue = (form) => {
    setCustomer(form);
    setDetailsOpen(false);
    setPayOpen(true);
  };

  const handlePaymentSuccess = async (payData) => {
    try {
      const paymentMethod = payData?.method === 'pickup' ? 'pickup' : 'online';
      const selectedSizes = Object.entries(selectQty).filter(([_, q]) => q > 0);
      const sizeSummary = selectedSizes.map(([s, q]) => `${s}: ${q}`).join(", ");

      await apiClient.post('/orders', {
        customerName:  customer?.name  || '',
        customerEmail: customer?.email || '',
        customerPhone: customer?.phone || '',
        productName:   name,
        size:          sizeSummary,
        quantity:      totalQty,
        unitPrice:     P.price,
        totalAmount:   orderTotal,
        paymentMethod,
        paymentId:     payData?.txnId || payData?.razorpay_payment_id || null,
      });

      toast.success(
        paymentMethod === 'pickup'
          ? '📦 Order reserved! See you at the Mandal office.'
          : '✅ Order confirmed! Check your email for details.',
        { position: 'top-center', autoClose: 5000 }
      );
    } catch (err) {
      console.error('Failed to save order:', err);
      toast.warning(
        '⚠️ Order placed but could not be saved. Please contact the Mandal office.',
        { position: 'top-center', autoClose: 6000 }
      );
    } finally {
      setCustomer(null);
      setSelectQty({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
    }
  };

  const highlights = [
    t("highlights.fabric"),
    t("highlights.embroidery"),
    t("highlights.trim"),
    t("highlights.badge"),
  ];

  const orderSummaryJsx = (
    <div className="bg-gray-50 rounded-xl p-4 mb-2">
      <p className="text-xs font-semibold text-gray-500 mb-2">{t("orderSummary")}</p>
      <div className="space-y-1.5 max-h-36 overflow-y-auto">
        {Object.entries(selectQty)
          .filter(([_, q]) => q > 0)
          .map(([s, q]) => (
            <div key={s} className="flex justify-between text-sm text-gray-700">
              <span>{name} ({s}) × {q}</span>
              <span className="font-semibold">₹{P.price * q}</span>
            </div>
          ))}
      </div>
      <div className="flex justify-between text-sm font-bold text-[#B91C1C] mt-2 pt-2 border-t border-gray-200">
        <span>{t("total")}</span>
        <span>₹{orderTotal}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen pb-28 sm:pb-0">
      {/* Breadcrumb */}
      <div className="pt-24 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>{t("breadcrumbHome")}</span>
          <ChevronRight size={13} />
          <span className="text-[#B91C1C] font-semibold">{t("breadcrumbStore")}</span>
        </div>
      </div>

      {/* Product hero */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

        {/* ── Gallery ── */}
        <div className="lg:sticky lg:top-24 self-start">
          {/* Main image */}
          <div className="relative group rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-gray-100 shadow-sm">
            <span className="absolute top-4 left-4 z-10 bg-[#B91C1C] text-white text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
              <Sparkles size={11} /> {t("badge")}
            </span>
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={P.gallery[active].src}
                alt={name}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full aspect-square object-contain p-6 sm:p-8 transition-transform duration-700 group-hover:scale-110"
              />
            </AnimatePresence>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
            {P.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-gray-50 transition ${
                  active === i
                    ? "border-[#B91C1C] ring-2 ring-red-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img src={g.src} alt="" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>

          {/* Trust strip — shown below gallery on desktop */}
          <div className="hidden lg:block">
            <TrustStrip />
          </div>
        </div>

        {/* ── Info ── */}
        <div>
          <span className="inline-block bg-yellow-100 text-yellow-800 text-[11px] font-bold tracking-wide px-3 py-1 rounded-full mb-3">
            {t("limitedNote")}
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{name}</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">{t("tagline")}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex text-yellow-400">
              {[0,1,2,3,4].map((i) => <Star key={i} size={15} fill="currentColor" strokeWidth={0} />)}
            </div>
            <span className="text-sm text-gray-500">
              {t("rating", { rating: P.rating, count: P.reviews })}
            </span>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-end gap-3">
            <span className="text-4xl font-extrabold text-[#B91C1C]">₹{P.price}</span>
            {P.oldPrice && <span className="text-lg text-gray-400 line-through mb-1">₹{P.oldPrice}</span>}
            {discount > 0 && (
              <span className="mb-1.5 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{t("priceNote")}</p>

          {/* Color swatch */}
          <div className="mt-5 flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-full border-2 border-[#B91C1C] ring-2 ring-offset-2 ring-red-100"
              style={{ backgroundColor: P.color }}
            />
            <span className="text-sm font-medium text-gray-600">Heritage Grey</span>
          </div>

          {/* ── Size selector ── */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-sm font-bold text-gray-800">{t("selectSize")}</span>
              <button
                onClick={() => setSizeGuide(true)}
                className="text-xs text-[#B91C1C] font-semibold flex items-center gap-1 hover:underline"
              >
                <Ruler size={13} /> {t("sizeGuide")}
              </button>
            </div>

            <div className="space-y-2.5">
              {P.sizes.map((s) => {
                const stock = P.stock[s] ?? 999;
                const soldOut = stock === 0;
                const sizeQty = selectQty[s] || 0;
                return (
                  <div key={s} className="flex items-center justify-between border border-gray-100 rounded-xl p-3 bg-white hover:border-[#B91C1C]/20 transition shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-red-50 text-[#B91C1C] font-bold text-sm flex items-center justify-center">
                        {s}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-gray-800">Size {s}</span>
                        {soldOut ? (
                          <p className="text-[11px] text-red-500 font-semibold leading-none mt-0.5">Sold Out</p>
                        ) : stock < LOW_STOCK_THRESHOLD ? (
                          <p className="text-[11px] text-orange-500 font-semibold leading-none mt-0.5">Only {stock} left</p>
                        ) : (
                          <p className="text-[11px] text-green-600 font-medium leading-none mt-0.5">In Stock</p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector for this specific size */}
                    {!soldOut && (
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9">
                        <button
                          type="button"
                          onClick={() => handleSizeQtyChange(s, sizeQty - 1)}
                          className="px-3 hover:bg-gray-50 active:bg-gray-100 h-full text-gray-600 flex items-center justify-center border-none bg-transparent"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 text-center font-bold text-sm text-gray-800">{sizeQty}</span>
                        <button
                          type="button"
                          onClick={() => handleSizeQtyChange(s, sizeQty + 1)}
                          disabled={totalQty >= 50 || sizeQty >= stock}
                          className="px-3 hover:bg-gray-50 active:bg-gray-100 h-full text-gray-600 disabled:opacity-30 flex items-center justify-center border-none bg-transparent"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalQty >= 50 && (
              <p className="text-xs text-orange-600 mt-2 font-semibold text-center">
                Maximum limit of 50 total t-shirts reached
              </p>
            )}
          </div>

          {/* ── CTA (desktop only — mobile has sticky bar) ── */}
          <div className="hidden sm:block mt-7">
            <button
              onClick={handleOrder}
              disabled={totalQty === 0}
              className="w-full bg-[#B91C1C] hover:bg-red-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-red-200 flex items-center justify-center gap-2 text-base"
            >
              <ShoppingBag size={20} /> {totalQty > 0 ? `${t("buyNow")} (${totalQty}) — ₹${orderTotal.toLocaleString("en-IN")}` : "Select Quantity"}
            </button>
            <p className="text-xs text-gray-400 mt-2.5 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-green-600" /> {t("secureNote")}
            </p>
          </div>

          {/* Pickup card */}
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Truck size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">{t("pickupTitle")}</p>
              <p className="text-xs text-amber-700 mt-0.5">{t("pickupBody")}</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="mt-6">
            <p className="text-sm font-bold text-gray-800 mb-3">{t("highlightsTitle")}</p>
            <ul className="space-y-2.5">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust strip — mobile, shown in info column */}
          <div className="lg:hidden mt-6">
            <TrustStrip />
          </div>
        </div>
      </section>

      {/* ── See Every Angle ── */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{t("anglesTitle")}</h2>
          <p className="text-gray-500 text-sm mt-2">{t("anglesSub")}</p>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mt-4 rounded-full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {P.angles.map((a, i) => (
            <motion.div
              key={a.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              onClick={() => {
                const idx = P.gallery.findIndex((g) => g.src === a.src);
                if (idx !== -1) setActive(idx);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-white border border-gray-100 shadow-sm cursor-pointer"
            >
              <img
                src={a.src}
                alt={t(`angles.${a.key}`)}
                className="w-full aspect-square object-contain p-3 sm:p-5 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent p-2.5 sm:p-3">
                <span className="text-white text-xs sm:text-sm font-semibold">{t(`angles.${a.key}`)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Details + Specs ── */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto pb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t("descriptionTitle")}</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{t("descriptionBody")}</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t("specsTitle")}</h3>
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {[
              ["material", "materialValue"],
              ["fit",      "fitValue"],
              ["collar",   "collarValue"],
              ["care",     "careValue"],
            ].map(([k, v], i) => (
              <div key={k} className={`grid grid-cols-3 text-sm ${i % 2 ? "bg-white" : "bg-gray-50"}`}>
                <span className="px-4 py-3 font-semibold text-gray-600">{t(`specs.${k}`)}</span>
                <span className="px-4 py-3 col-span-2 text-gray-800">{t(`specs.${v}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mandal Trust Banner ── */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto pb-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#7f1d1d] via-[#B91C1C] to-[#991b1b] rounded-3xl p-7 sm:p-10 text-white shadow-2xl">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-yellow-400/10 rounded-full" />

          <div className="relative text-center">
            {/* Mandal badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
              <Award size={15} className="text-yellow-300" />
              <span className="text-xs font-bold tracking-wide text-yellow-100">GANESH GALLI MANDAL · EST. 1928</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold mb-2">{t("causeTitle")}</h3>
            <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto">{t("causeBody")}</p>

            {/* Trust stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
              {[
                { num: "96",    label: "Years of\nDevotion" },
                { num: "10L+",  label: "Annual\nVisitors" },
                { num: "100%",  label: "Proceeds to\nCommunity" },
              ].map(({ num, label }) => (
                <div key={num} className="text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-yellow-300">{num}</p>
                  <p className="text-white/70 text-[11px] mt-0.5 whitespace-pre-line leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Help line */}
            <div className="mt-7 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <Phone size={14} className="text-yellow-300" />
              <span className="text-xs text-white/90 font-medium">Queries? Contact Mandal office · Ganesh Galli, Lalbaug</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky bottom CTA (mobile only) ── */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">
              {Object.entries(selectQty)
                .filter(([_, q]) => q > 0)
                .map(([s, q]) => `${s}: ${q}`)
                .join(", ") || "No items selected"}
            </p>
            <p className="text-lg font-extrabold text-[#B91C1C] leading-none mt-0.5">
              ₹{orderTotal.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={handleOrder}
            disabled={totalQty === 0}
            className="flex-shrink-0 bg-[#B91C1C] hover:bg-red-800 active:bg-red-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-red-200 flex items-center gap-2 transition"
          >
            <ShoppingBag size={18} /> {t("buyNow")}
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuide(false)}
        activeSize={Object.keys(selectQty).find(s => selectQty[s] > 0) || "L"}
      />

      <CheckoutDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onContinue={handleDetailsContinue}
        summary={orderSummaryJsx}
      />

      <PaymentGatewayModal
        open={payOpen}
        onClose={() => { setPayOpen(false); handlePaymentSuccess(); }}
        amount={orderTotal}
        title="Merchandise Order"
        showCod
        customer={customer}
        onSuccess={handlePaymentSuccess}
      />

      <ToastContainer />
    </div>
  );
};

export default MerchandisePage;
