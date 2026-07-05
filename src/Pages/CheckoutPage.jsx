import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, User, Mail, Phone, MapPin, ShieldCheck,
  ChevronRight, HelpCircle, RefreshCw, ShoppingBag, Store, Lock, CheckCircle2, Download
} from "lucide-react";
import { loadRazorpay, openRazorpayCheckout } from "../utils/loadRazorpay";
import apiClient from "../services/apiService";
import useMerchandiseLoader from "../loaders/useMerchandiseLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";

const Confetti = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const colors = ["#B91C1C", "#FBBF24", "#34D399", "#60A5FA", "#EC4899"];
  const particles = Array.from({ length: 150 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * -50 - 10,
    size: Math.random() * 8 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
    rotation: Math.random() * 360,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0.3;
          }
        }
        .confetti-particle {
          position: absolute;
          animation: fall linear infinite;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}vh`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

const fmtINR = (n) => Number(n).toLocaleString("en-IN");

const computeFee = (mode, amount, showCod) => {
  if (!showCod) return 0;
  if (mode === "pickup") return 19;
  return Math.round(amount * 0.02);
};

/* ── Invoice/Receipt SVG generator ────────────────────── */


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

const getProductSlug = (prod) => {
  if (!prod) return "";
  if (prod.name?.en) {
    return prod.name.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  if (typeof prod.name === "string" && prod.name) {
    return prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  switch (prod.id) {
    case "mr-polo-2025":
      return "mumbaicha-raja-official-polo";
    case "mr-keychain-2025":
      return "mumbaicha-raja-official-keychain";
    case "mr-mug-2025":
      return "mumbaicha-raja-official-mug";
    case "mr-bag-2025":
      return "mumbaicha-raja-official-bag";
    default:
      return prod.id;
  }
};

const CheckoutPage = () => {
  const { t, i18n } = useTranslation("merchandise");
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, loading } = useMerchandiseLoader();

  const [product, setProduct] = useState(null);
  const [items, setItems] = useState([]); // Array of { size, qty }
  const [form, setForm] = useState({ name: "", email: "", phone: "", pincode: "", address: "" });
  const [errors, setErrors] = useState({});

  const [step, setStep] = useState("idle"); // idle, redirecting, cod-confirm, success
  const [payMode, setPayMode] = useState("online");
  const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // pickup, home
  const [progress, setProgress] = useState(0);
  const [payData, setPayData] = useState(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [createdOrder, setCreatedOrder] = useState(null);
  const hasDownloadedRef = useRef(false);

  useEffect(() => {
    if (step === "success") {
      window.scrollTo(0, 0);
    }
  }, [step]);

  // Parse items from search params: ?items=L:2,M:1
  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(p => getProductSlug(p) === slug || p.id === slug);
      if (found) {
        setProduct(found);
      } else {
        toast.error("Product not found");
        navigate("/merchandise");
        return;
      }

      const itemsStr = searchParams.get("items");
      if (itemsStr) {
        const parsed = itemsStr.split(",").map(part => {
          const [size, qty] = part.split(":");
          return { size, qty: parseInt(qty) || 1 };
        }).filter(item => item.qty > 0);
        setItems(parsed);
      } else {
        navigate(`/merchandise/${slug}`);
      }
    }
  }, [products, slug, searchParams, navigate]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const formatPhone = (e) =>
    setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Please enter your full name";
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

  const submitOrderToBackend = async (paymentMethod, paymentId, finalTotal) => {
    try {
      const sizeSummary = items.map(item => `${item.size}: ${item.qty}`).join(", ");
      const res = await apiClient.post('/orders', {
        customerName:  form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        address:       form.address,
        pincode:       form.pincode,
        shippingCharge:0,
        deliveryMethod:deliveryMethod,
        productName:   productName,
        size:          sizeSummary,
        quantity:      totalQty,
        unitPrice:     product.price,
        totalAmount:   finalTotal,
        paymentMethod,
        paymentId,
      });
      return res.data;
    } catch (err) {
      console.error("Database sync failed:", err);
      toast.warning("Payment complete, but database failed to save. Please show your invoice to the Mandal office.");
      return null;
    }
  };

  const startOnlinePayment = async (finalTotal) => {
    setStep("redirecting");
    setProgress(0);

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 12 + 8;
      setProgress(Math.min(p, 88));
    }, 100);

    const ok = await loadRazorpay();
    clearInterval(iv);
    setProgress(100);

    if (!ok) {
      setStep("idle");
      toast.error("Failed to load Razorpay SDK. Please check your network connection.");
      return;
    }

    await new Promise((r) => setTimeout(r, 300));

    openRazorpayCheckout({
      total: finalTotal,
      method: null,
      title: "Merchandise Checkout",
      customer: {
        ...form,
        shippingCharge: 0
      },
      onSuccess: async (data) => {
        setPaidAmount(finalTotal);
        const finalData = { ...data, method: "online", amount: finalTotal, deliveryMethod };
        setPayData(finalData);
        setStep("success");
        const orderInfo = await submitOrderToBackend("online", data.txnId, finalTotal);
        if (orderInfo) setCreatedOrder(orderInfo);
      },
      onDismiss: () => setStep("idle"),
    });
  };

  const handlePayOnline = () => {
    if (validate()) {
      setPayMode("online");
      const deliveryCharge = 0;
      const baseTotal = subtotal + deliveryCharge;
      const fee = computeFee("online", baseTotal, true);
      const total = baseTotal + fee;
      startOnlinePayment(total);
    }
  };

  const handlePayPickup = () => {
    if (validate()) {
      setPayMode("pickup");
      setStep("cod-confirm");
    }
  };

  const confirmPickupReservation = async () => {
    const deliveryCharge = 0;
    const baseTotal = subtotal + deliveryCharge;
    const fee = computeFee("pickup", baseTotal, true);
    const total = baseTotal + fee;

    const txnId = "MR" + Date.now();
    setPaidAmount(total);
    const finalData = { method: "pickup", amount: total, txnId, deliveryMethod: "pickup" };
    setPayData(finalData);
    setStep("success");
    const orderInfo = await submitOrderToBackend("pickup", txnId, total);
    if (orderInfo) setCreatedOrder(orderInfo);
  };

  // Receipt Download
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
        doc.setFillColor(...RED);
        doc.rect(0, 0, 210, 54, "F");

        doc.setFillColor(...GOLD);
        doc.rect(0, 54, 210, 2, "F");

        doc.setFillColor(255, 255, 255);
        doc.circle(29, 27, 22, "F");

        if (img) {
          try { doc.addImage(img, "PNG", 8, 6, 42, 42); }
          catch (e) { console.warn("Logo failed:", e); }
        }

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



        /* ════════════════════════════════════════
           META INFO SECTION (two columns)
        ════════════════════════════════════════ */
        let metaY = 62;

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
        doc.text("ORDER NO", LC, metaY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...RED);
        const orderIdDisplay = createdOrder?.orderNo || ("#ORD" + refId.slice(-6).toUpperCase());
        doc.text(orderIdDisplay, LC, metaY + 6);

        doc.setDrawColor(220, 225, 232);
        doc.setLineWidth(0.4);
        doc.line(108, 58, 108, 110);

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
        doc.text(form?.name || "Devotee", RC, rcY + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GREY);
        doc.text(`Phone: +91 ${form?.phone || "-"}`, RC, rcY + 10.5);
        doc.text(`Email: ${form?.email || "-"}`, RC, rcY + 15);

        let bottomY = Math.max(100, rcY + 20);
        if (form?.address) {
          doc.setFontSize(8);
          const addrLines = doc.splitTextToSize(`Billing Address: ${form.address}${form.pincode ? ", " + form.pincode : ""}`, 82);
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

        // Expand sizes into individual items list
        const expandedItems = [];
        items.forEach((item) => {
          for (let i = 0; i < item.qty; i++) {
            expandedItems.push({
              size: item.size,
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
          const prodName = doc.splitTextToSize(productName, 75);
          doc.text(prodName, 28, rowY + (rowHeight * 0.5 + 0.5));

          doc.setFont("helvetica", "normal");
          doc.setFontSize(itemFontSize);
          doc.setTextColor(...DARK);
          // E.g., MCR-20260704-004-S-01
          const itemId = `${orderIdDisplay.replace('#', '')}-${expandedItem.size}-${String(expandedItem.index).padStart(2, '0')}`;
          doc.text(itemId, 110, rowY + (rowHeight * 0.5 + 1.5));
          doc.text(fmt(product.price), 192, rowY + (rowHeight * 0.5 + 1.5), { align: "right" });

          rowY += rowHeight;
          serial++;
        });

        const shippingCost = 0;

        /* ════════════════════════════════════════
           SUMMARY SECTION
        ════════════════════════════════════════ */
        const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
        const subtotal = product.price * totalQty;
        const fee      = computeFee(payData?.method === "pickup" ? "pickup" : "online", subtotal + shippingCost, true);
        const summaryX = 140;

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
        doc.text(payData?.method === "pickup" ? "Booking Fee" : "Convenience Fee (2%)", summaryX, rowY);
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "bold");
        doc.text(fmt(fee), 192, rowY, { align: "right" });

        rowY += 5;
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
        if (payData?.deliveryMethod === "home") {
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

        doc.save(`mumbaicha-raja-invoice-${orderIdDisplay.replace('#', '')}.pdf`);
      };

      logoImg.onload  = () => generatePDF(logoImg);
      logoImg.onerror = () => generatePDF(null);
    } catch (err) {
      console.error("Failed to download receipt:", err);
    }
  };

  useEffect(() => {
    if (step === "success" && payData && product && createdOrder) {
      if (hasDownloadedRef.current) return;
      hasDownloadedRef.current = true;
      const timer = setTimeout(() => {
        downloadInvoice();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step !== "success") {
      hasDownloadedRef.current = false;
    }
  }, [step, payData, product, createdOrder]);

  if (loading || !product || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-semibold">
        <RefreshCw size={24} className="animate-spin mr-2 text-[#B91C1C]" />
        Loading checkout details...
      </div>
    );
  }

  const productName = product.nameKey ? t(product.nameKey) : (product.name?.[i18n.language] || product.name?.en || "");
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = product.price * totalQty;

  const getBreakdownTotal = () => {
    const delivery = 0;
    const base = subtotal + delivery;
    const fee = computeFee(payMode, base, true);
    return base + fee;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-24 md:pt-28">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Redirecting loader overlay */}
      {step === "redirecting" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <div className="w-16 h-16 rounded-2xl bg-[#B91C1C] flex items-center justify-center mb-5 shadow-xl shadow-red-200">
            <Lock size={28} className="text-white" />
          </div>
          <p className="text-base font-extrabold text-gray-800">Connecting to secure gateway...</p>
          <p className="text-xs text-gray-400 mt-1">Please do not refresh or press back</p>
          <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-[#B91C1C] rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Confirmation overlay for self-pickup */}
      {step === "cod-confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-gray-100 shadow-2xl">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Confirm Reservation</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              You are selecting **Pay at Pickup**. You will need to collect your items and complete payment in cash at the Ganesh Galli Mandal Office.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("idle")}
                className="flex-1 bg-gray-100 hover:bg-gray-200 font-bold py-3 rounded-xl transition text-gray-600 text-sm"
              >
                Go Back
              </button>
              <button
                onClick={confirmPickupReservation}
                className="flex-1 bg-[#B91C1C] hover:bg-red-800 font-bold py-3 rounded-xl transition text-white text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render either themed success layout or the standard checkout form */}
      {step === "success" && payData ? (
        <div className="max-w-xl mx-auto px-4">
          <Confetti />
          <div className="bg-white rounded-3xl border-2 border-red-100 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
            {/* Gold/Red accent line at top */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#B91C1C] via-yellow-400 to-[#B91C1C]" />
            
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 mt-4">
              <CheckCircle2 size={40} />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 leading-tight">Order Confirmed!</h2>
            <p className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
              Ganpati Bappa Morya! 🙏
            </p>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Thank you for purchasing! Your official invoice has been downloaded. Please refer to the collection or delivery details shown below.
            </p>

            {payData.deliveryMethod === "home" ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs sm:text-sm text-blue-800 mt-4 text-left">
                <p className="font-bold flex items-center gap-1">
                  🚚 Home Delivery Coordinator:
                </p>
                <p className="mt-1 font-medium text-blue-700 leading-relaxed">
                  After successful online payment, please contact the <strong>Mandal Coordinator (99999 99989)</strong> to coordinate shipping and delivery details.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-800 mt-4 text-left">
                <p className="font-bold flex items-center gap-1">
                  📍 Collect from Mandal:
                </p>
                <p className="mt-1 font-medium text-amber-700 leading-relaxed">
                  No home delivery is available for this option. After paying online, please collect your items from the <strong>Ganesh Galli Mandal Office, Lalbaug, Mumbai - 400 012</strong>.
                </p>
              </div>
            )}

            <div className="bg-amber-50/30 rounded-2xl p-5 border border-amber-100/50 mt-8 mb-8 text-left space-y-3.5">
              <div className="flex justify-between items-center text-xs text-amber-800 font-bold uppercase tracking-wider border-b border-amber-100/50 pb-2.5">
                <span>Receipt Summary</span>
                <span className="text-[#B91C1C]">PAID</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Transaction ID</span>
                <span className="font-bold text-gray-800 font-mono select-all">{payData.txnId || payData.razorpay_payment_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Delivery Mode</span>
                <span className="font-bold text-gray-800">{payData.deliveryMethod === "home" ? "Home Delivery Requested" : "Pickup at Mandal"}</span>
              </div>
              <div className="flex justify-between text-sm pt-2.5 border-t border-amber-100/50">
                <span className="text-gray-500 font-medium">Product Amount</span>
                <span className="font-bold text-gray-800">₹{fmtINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">
                  {payData.method === "pickup" ? "Mandal Reservation Fee" : "Convenience Fee (2%)"}
                </span>
                <span className="font-bold text-gray-800">₹{fmtINR(computeFee(payData.method, subtotal, true))}</span>
              </div>
              <div className="flex justify-between text-sm pt-1.5 border-t border-dashed border-amber-200">
                <span className="text-gray-950 font-bold">Total Amount</span>
                <span className="font-black text-xl text-[#B91C1C]">₹{fmtINR(paidAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <button
                onClick={downloadInvoice}
                className="w-full sm:flex-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold py-3.5 px-6 rounded-2xl transition text-amber-900 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={16} /> Download Invoice
              </button>
              <Link
                to="/merchandise"
                className="w-full sm:flex-1 bg-[#B91C1C] hover:bg-red-800 border-2 border-transparent font-bold py-3.5 px-6 rounded-2xl transition text-white text-sm flex items-center justify-center shadow-md shadow-red-100"
              >
                Browse More Products
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Breadcrumb link container under fixed navbar */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <Link to={`/merchandise/${slug}`} className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#B91C1C] hover:underline transition">
              <ArrowLeft size={14} /> Back to Product
            </Link>
          </div>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form details */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Complete Your Order</h2>
            <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4">
              Enter your contact details below to proceed with your order.
            </p>

            <div className="space-y-4">
              <Field icon={User} label="Full Name" error={errors.name}>
                <input
                  className="flex-1 px-3.5 py-3.5 bg-transparent outline-none text-sm placeholder:text-gray-400"
                  placeholder="As it should appear on receipt"
                  value={form.name}
                  onChange={set("name")}
                  autoComplete="name"
                />
              </Field>
              
              <Field icon={Phone} label="Mobile Number" error={errors.phone}>
                <span className="pl-2 pr-1.5 text-xs font-semibold text-gray-500 border-r border-gray-200 mr-1 py-3">+91</span>
                <input
                  className="flex-1 px-2 py-3.5 bg-transparent outline-none text-sm placeholder:text-gray-400 tracking-wide"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={formatPhone}
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </Field>
              
              <Field icon={Mail} label="Email Address" error={errors.email}>
                <input
                  className="flex-1 px-3.5 py-3.5 bg-transparent outline-none text-sm placeholder:text-gray-400"
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
                    className="flex-1 px-3.5 py-3.5 bg-transparent outline-none text-sm placeholder:text-gray-400 tracking-wide font-bold"
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
                  className="flex-1 px-3.5 py-2.5 bg-transparent outline-none text-sm placeholder:text-gray-400 resize-none h-20"
                  placeholder="Complete Address"
                  value={form.address}
                  onChange={set("address")}
                />
              </Field>

              {/* Radio buttons for delivery method */}
              <div className="mb-4 pt-1">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Receiving Option</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`flex items-center justify-center p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${
                      deliveryMethod === "pickup"
                        ? "border-[#B91C1C] bg-red-50/10 text-gray-900 font-bold"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    <span className="text-sm">Pickup at Mandal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("home")}
                    className={`flex items-center justify-center p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${
                      deliveryMethod === "home"
                        ? "border-[#B91C1C] bg-red-50/10 text-gray-900 font-bold"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    <span className="text-sm">Want delivery at home</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-2">
                <ShieldCheck size={14} className="text-green-600 shrink-0" />
                <p className="text-xs text-gray-400">Your details are encrypted and never shared</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            {step === "idle" && (
              <div className="mt-8 space-y-4">
                <div className="flex flex-col gap-4">
                  {/* Pay Online Button */}
                  <button
                    onClick={handlePayOnline}
                    className="w-full font-bold py-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-sm text-white bg-[#B91C1C] hover:bg-red-800 active:bg-red-900 shadow-red-100 cursor-pointer"
                  >
                    <Lock size={15} /> {deliveryMethod === "pickup" ? "Pay Online & Collect from Mandal" : "Pay Online & Request Home Delivery"}
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 font-semibold">
                  🔒 Secured by Razorpay · PCI-DSS Compliant
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-gray-500" />
                Order Summary
              </h3>
              
              <div className="flex gap-4 border-b border-gray-100 pb-4 mb-4">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                  <img src={product.image} alt={productName} className="w-16 h-16 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{productName}</h4>
                  <p className="text-xs text-[#B91C1C] font-semibold mt-0.5">₹{product.price}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Quantity: {totalQty}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2 mb-4 border-b border-gray-100 pb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-gray-600 font-medium">
                    <span>Size: <span className="font-bold text-gray-800">{item.size}</span></span>
                    <span>Qty: <span className="font-bold text-gray-800">{item.qty}</span></span>
                    <span>₹{product.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Costs Summary */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-500">Items Subtotal</span>
                  <span className="text-gray-800">₹{subtotal}</span>
                </div>
                
                {payMode === "online" && (
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-500">Gateway fee (2%)</span>
                    <span className="text-gray-800">
                      + ₹{computeFee("online", subtotal, true)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-gray-900">Total payable</span>
                    <span className="text-[10px] text-gray-400 font-semibold italic">
                      Selected: Pay Online & Collect from Mandal
                    </span>
                  </div>
                  <span className="text-[#B91C1C] font-black text-xl">
                    ₹{getBreakdownTotal()}
                  </span>
                </div>
              </div>
            </div>

            </div>
          </div>
        </main>
      </>
    )}
  </div>
);
};

export default CheckoutPage;
