import React, { useState, useEffect } from "react";
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

const fmtINR = (n) => Number(n).toLocaleString("en-IN");

const computeFee = (mode, amount, showCod) => {
  if (!showCod) return 0;
  if (mode === "pickup") return 19;
  return Math.round(amount * 0.02);
};

/* ── Invoice/Receipt SVG generator ────────────────────── */
const generateInvoiceSVG = (payData, customer, orderDetails, paidAmt) => {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const txnId = payData?.txnId || payData?.razorpay_payment_id || "N/A";
  const paymentMethod = payData?.method === "pickup" ? "Pay at Pickup" : "Online Payment";
  const paymentStatus = payData?.method === "pickup" ? "RESERVED" : "PAID";

  const name = customer?.name || "Devotee";
  const email = customer?.email || "N/A";
  const phone = customer?.phone || "N/A";
  const address = customer?.address || "";
  const pincode = customer?.pincode || "";

  const title = orderDetails?.productName || "Mumbaicha Raja Order";
  const items = orderDetails?.sizes || [];
  const unitPrice = orderDetails?.price || paidAmt;
  const shipping = customer?.shippingCharge || 0;
  
  const fee = computeFee(payData?.method || "online", paidAmt - shipping, true);
  const subtotal = items.reduce((sum, item) => sum + (unitPrice * item.qty), 0) || (paidAmt - shipping - fee);
  const total = subtotal + shipping + fee;

  let itemRowsY = 460;
  let itemRowsHTML = "";
  if (items.length > 0) {
    items.forEach((item, idx) => {
      const y = itemRowsY + idx * 35;
      itemRowsHTML += `
        <text x="50" y="${y}" font-family="sans-serif" font-size="13" fill="#334155">${title}</text>
        <text x="380" y="${y}" font-family="sans-serif" font-size="13" fill="#334155" text-anchor="middle">${item.size}</text>
        <text x="480" y="${y}" font-family="sans-serif" font-size="13" fill="#334155" text-anchor="middle">${item.qty}</text>
        <text x="600" y="${y}" font-family="sans-serif" font-size="13" fill="#334155" text-anchor="end">₹${unitPrice.toLocaleString("en-IN")}</text>
        <text x="750" y="${y}" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="end">₹${(unitPrice * item.qty).toLocaleString("en-IN")}</text>
        <line x1="50" y1="${y + 10}" x2="750" y2="${y + 10}" stroke="#e2e8f0" stroke-width="1" />
      `;
    });
    itemRowsY += items.length * 35 + 10;
  } else {
    itemRowsHTML = `
      <text x="50" y="${itemRowsY}" font-family="sans-serif" font-size="13" fill="#334155">${title}</text>
      <text x="380" y="${itemRowsY}" font-family="sans-serif" font-size="13" fill="#334155" text-anchor="middle">N/A</text>
      <text x="480" y="${itemRowsY}" font-family="sans-serif" font-size="13" fill="#334155" text-anchor="middle">1</text>
      <text x="600" y="${itemRowsY}" font-family="sans-serif" font-size="13" fill="#334155" text-anchor="end">₹${subtotal.toLocaleString("en-IN")}</text>
      <text x="750" y="${itemRowsY}" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="end">₹${subtotal.toLocaleString("en-IN")}</text>
      <line x1="50" y1="${itemRowsY + 10}" x2="750" y2="${itemRowsY + 10}" stroke="#e2e8f0" stroke-width="1" />
    `;
    itemRowsY += 40;
  }

  const summaryY = itemRowsY + 30;

  return `
<svg width="800" height="1000" viewBox="0 0 800 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="1000" fill="white"/>
  <rect x="15" y="15" width="770" height="970" rx="10" stroke="#B91C1C" stroke-width="4"/>
  <rect x="23" y="23" width="754" height="954" rx="6" stroke="#D4AF37" stroke-width="2" stroke-dasharray="6 4"/>
  <rect x="30" y="30" width="740" height="120" fill="#B91C1C" rx="4"/>
  <circle cx="100" cy="90" r="45" fill="white" fill-opacity="0.1"/>
  <path d="M100 65 L108 80 L123 82 L112 93 L115 108 L100 100 L85 108 L88 93 L77 82 L92 80 Z" fill="#D4AF37"/>
  <text x="400" y="80" font-family="sans-serif" font-size="34" font-weight="900" fill="white" text-anchor="middle" letter-spacing="2">MUMBAI CHA RAJA</text>
  <text x="400" y="112" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FEF08A" text-anchor="middle" letter-spacing="1.5">LALBAUG, MUMBAI · ESTD. 1928 · OFFICIAL RECEIPT</text>
  <path d="M 30 180 Q 50 180 50 200" stroke="#D4AF37" stroke-width="3" fill="none"/>
  <path d="M 770 180 Q 750 180 750 200" stroke="#D4AF37" stroke-width="3" fill="none"/>
  <text x="400" y="195" font-family="sans-serif" font-size="22" font-weight="800" fill="#B91C1C" text-anchor="middle">ORDER INVOICE &amp; CONFIRMATION</text>
  <line x1="300" y1="205" x2="500" y2="205" stroke="#D4AF37" stroke-width="2"/>
  <rect x="50" y="230" width="330" height="150" fill="#F8FAFC" rx="8" stroke="#E2E8F0" stroke-width="1"/>
  <text x="70" y="260" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748B">ORDER INFORMATION</text>
  <text x="70" y="290" font-family="sans-serif" font-size="13" fill="#64748B">Date:</text>
  <text x="180" y="290" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">${dateStr}</text>
  <text x="70" y="315" font-family="sans-serif" font-size="13" fill="#64748B">Transaction ID:</text>
  <text x="180" y="315" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">${txnId}</text>
  <text x="70" y="340" font-family="sans-serif" font-size="13" fill="#64748B">Payment Method:</text>
  <text x="180" y="340" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">${paymentMethod}</text>
  <text x="70" y="365" font-family="sans-serif" font-size="13" fill="#64748B">Status:</text>
  <rect x="180" y="352" width="85" height="18" rx="4" fill="${paymentStatus === "PAID" ? "#DCFCE7" : "#FEF3C7"}"/>
  <text x="222.5" y="365" font-family="sans-serif" font-size="11" font-weight="bold" fill="${paymentStatus === "PAID" ? "#166534" : "#92400E"}" text-anchor="middle">${paymentStatus}</text>
  <rect x="420" y="230" width="330" height="150" fill="#F8FAFC" rx="8" stroke="#E2E8F0" stroke-width="1"/>
  <text x="440" y="260" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748B">CUSTOMER DETAILS</text>
  <text x="440" y="290" font-family="sans-serif" font-size="13" fill="#64748B">Name:</text>
  <text x="510" y="290" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">${name}</text>
  <text x="440" y="315" font-family="sans-serif" font-size="13" fill="#64748B">Phone:</text>
  <text x="510" y="315" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">+91 ${phone}</text>
  <text x="440" y="340" font-family="sans-serif" font-size="13" fill="#64748B">Email:</text>
  <text x="510" y="340" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">${email}</text>
  <text x="440" y="365" font-family="sans-serif" font-size="13" fill="#64748B">Address:</text>
  <text x="510" y="365" font-family="sans-serif" font-size="11" fill="#475569">${address ? address.substring(0, 30) + (address.length > 30 ? '...' : '') : 'N/A'}${pincode ? ' - ' + pincode : ''}</text>
  <rect x="50" y="410" width="700" height="35" fill="#475569" rx="4"/>
  <text x="60" y="432" font-family="sans-serif" font-size="12" font-weight="bold" fill="white">Item Description</text>
  <text x="380" y="432" font-family="sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">Size</text>
  <text x="480" y="432" font-family="sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">Qty</text>
  <text x="600" y="432" font-family="sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="end">Unit Price</text>
  <text x="740" y="432" font-family="sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="end">Total</text>
  <g font-family="sans-serif">
    ${itemRowsHTML}
  </g>
  <g font-family="sans-serif" font-size="13" fill="#475569">
    <text x="530" y="${summaryY}">Subtotal:</text>
    <text x="750" y="${summaryY}" font-weight="bold" fill="#334155" text-anchor="end">₹${subtotal.toLocaleString("en-IN")}</text>
    <text x="530" y="${summaryY + 25}">Shipping / Delivery:</text>
    <text x="750" y="${summaryY + 25}" font-weight="bold" fill="#334155" text-anchor="end">₹${shipping.toLocaleString("en-IN")}</text>
    <text x="530" y="${summaryY + 50}">Fees:</text>
    <text x="750" y="${summaryY + 50}" font-weight="bold" fill="#334155" text-anchor="end">₹${fee.toLocaleString("en-IN")}</text>
    <line x1="530" y1="${summaryY + 65}" x2="750" y2="${summaryY + 65}" stroke="#cbd5e1" stroke-width="1.5" />
    <text x="530" y="${summaryY + 90}" font-size="18" font-weight="bold" fill="#B91C1C">Grand Total:</text>
    <text x="750" y="${summaryY + 90}" font-size="20" font-weight="900" fill="#B91C1C" text-anchor="end">₹${total.toLocaleString("en-IN")}</text>
  </g>
  <line x1="50" y1="880" x2="750" y2="880" stroke="#D4AF37" stroke-width="1" />
  <text x="400" y="910" font-family="sans-serif" font-size="18" font-weight="800" fill="#B91C1C" text-anchor="middle">Ganpati Bappa Morya! 🙏</text>
  <text x="400" y="930" font-family="sans-serif" font-size="12" fill="#64748B" text-anchor="middle">Thank you for your support. All proceeds go directly to Mandal social welfare funds.</text>
  <text x="400" y="948" font-family="sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Ganesh Galli Mandal Office, Lalbaug, Mumbai - 400 012 · Tel: +91 Mandal Office</text>
</svg>
  `;
};

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
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const [pinLoading, setPinLoading] = useState(false);
  const [pinDetails, setPinDetails] = useState(null);
  const [pinError, setPinError] = useState("");

  const [step, setStep] = useState("idle"); // idle, redirecting, cod-confirm, success
  const [payMode, setPayMode] = useState("online");
  const [progress, setProgress] = useState(0);
  const [payData, setPayData] = useState(null);
  const [paidAmount, setPaidAmount] = useState(0);

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
      e.name = "Please enter your full name";
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
      e.address = "Please enter your shipping address (min 10 characters)";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrderToBackend = async (paymentMethod, paymentId, finalTotal) => {
    try {
      const sizeSummary = items.map(item => `${item.size}: ${item.qty}`).join(", ");
      await apiClient.post('/orders', {
        customerName:  form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        address:       form.address,
        pincode:       form.pincode,
        shippingCharge:paymentMethod === 'pickup' ? 0 : pinDetails.deliveryCharge,
        productName:   productName,
        size:          sizeSummary,
        quantity:      totalQty,
        unitPrice:     product.price,
        totalAmount:   finalTotal,
        paymentMethod,
        paymentId,
      });
      toast.success("Order saved to Mandal Database.");
    } catch (err) {
      console.error("Database sync failed:", err);
      toast.warning("Payment complete, but database failed to save. Please show your invoice to the Mandal office.");
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
        shippingCharge: pinDetails.deliveryCharge
      },
      onSuccess: async (data) => {
        setPaidAmount(finalTotal);
        const finalData = { ...data, method: "online", amount: finalTotal };
        setPayData(finalData);
        setStep("success");
        await submitOrderToBackend("online", data.razorpay_payment_id, finalTotal);
      },
      onDismiss: () => setStep("idle"),
    });
  };

  const handlePayOnline = () => {
    if (validate() && pinDetails) {
      setPayMode("online");
      const deliveryCharge = pinDetails.deliveryCharge || 0;
      const baseTotal = subtotal + deliveryCharge;
      const fee = computeFee("online", baseTotal, true);
      const total = baseTotal + fee;
      startOnlinePayment(total);
    }
  };

  const handlePayPickup = () => {
    if (validate() && pinDetails) {
      setPayMode("pickup");
      setStep("cod-confirm");
    }
  };

  const confirmPickupReservation = async () => {
    const deliveryCharge = 0; // No delivery charge for pickup
    const baseTotal = subtotal + deliveryCharge;
    const fee = computeFee("pickup", baseTotal, true);
    const total = baseTotal + fee;

    const txnId = "MR" + Date.now();
    setPaidAmount(total);
    const finalData = { method: "pickup", amount: total, txnId };
    setPayData(finalData);
    setStep("success");
    await submitOrderToBackend("pickup", txnId, total);
  };

  // Receipt Download
  const downloadInvoice = () => {
    try {
      const orderDetails = {
        productName,
        sizes: items,
        price: product.price
      };
      const svgString = generateInvoiceSVG(payData, { ...form, shippingCharge: pinDetails?.deliveryCharge || 0 }, orderDetails, paidAmount);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const DOMURL = window.URL || window.webkitURL || window;
      const svgUrl = DOMURL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.src = svgUrl;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 1000;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        
        canvas.toBlob((blob) => {
          const pngUrl = DOMURL.createObjectURL(blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `mumbai-cha-raja-invoice-${payData?.txnId || payData?.razorpay_payment_id || Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          DOMURL.revokeObjectURL(pngUrl);
        }, "image/png");
        DOMURL.revokeObjectURL(svgUrl);
      };
      image.onerror = () => {
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `mumbai-cha-raja-invoice-${payData?.txnId || payData?.razorpay_payment_id || Date.now()}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
    } catch (err) {
      console.error("Failed to download receipt:", err);
    }
  };

  useEffect(() => {
    if (step === "success" && payData && product) {
      const timer = setTimeout(() => {
        downloadInvoice();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step, payData, product]);

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
    const delivery = payMode === "online" ? (pinDetails?.deliveryCharge || 0) : 0;
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
              {payData.method === "pickup"
                ? "Your merchandise reservation is successful. Please pick up and pay at the Ganesh Galli Mandal Office."
                : "Thank you for purchasing! Your official invoice has been downloaded successfully."}
            </p>

            <div className="bg-amber-50/30 rounded-2xl p-5 border border-amber-100/50 mt-8 mb-8 text-left space-y-3.5">
              <div className="flex justify-between items-center text-xs text-amber-800 font-bold uppercase tracking-wider border-b border-amber-100/50 pb-2.5">
                <span>Receipt Summary</span>
                <span className="text-[#B91C1C]">{payData.method === "pickup" ? "RESERVED" : "PAID"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Transaction ID</span>
                <span className="font-bold text-gray-800 font-mono select-all">{payData.txnId || payData.razorpay_payment_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Payment Mode</span>
                <span className="font-bold text-gray-800">{payData.method === "pickup" ? "Pay at Pickup" : "Online Payment"}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-dashed border-amber-200">
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
                Continue Shopping
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
              Enter your shipping details below. Delivery will be handled via DTDC.
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
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 text-xs sm:text-sm">
                  <p className="font-bold text-emerald-800 flex items-center gap-1">
                    ✓ Delivery Available to {pinDetails.city}, {pinDetails.state}!
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-emerald-700 font-medium">
                    <div>Shipping charge: <span className="font-extrabold text-emerald-950">₹{pinDetails.deliveryCharge}</span></div>
                    <div>Delivery est: <span className="font-extrabold text-emerald-950">{pinDetails.estimatedDelivery}</span></div>
                  </div>
                </div>
              )}

              {pinError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 text-xs sm:text-sm">
                  <p className="font-bold text-rose-800">✗ Delivery is not available for this location.</p>
                  <p className="text-rose-600 mt-1.5 leading-relaxed">
                    Please try another delivery pincode or contact support for help.
                  </p>
                </div>
              )}

              <Field icon={MapPin} label="Shipping Address" error={errors.address}>
                <textarea
                  className="flex-1 px-3.5 py-2.5 bg-transparent outline-none text-sm placeholder:text-gray-400 resize-none h-20"
                  placeholder="Complete Street / Building Address"
                  value={form.address}
                  onChange={set("address")}
                  autoComplete="street-address"
                />
              </Field>

              <div className="flex items-center gap-1.5 pt-2">
                <ShieldCheck size={14} className="text-green-600 shrink-0" />
                <p className="text-xs text-gray-400">Your details are encrypted and never shared</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            {step === "idle" && (
              <div className="mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Pay Online Button */}
                  <button
                    onClick={handlePayOnline}
                    disabled={!pinDetails}
                    className={`flex-1 font-bold py-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-sm text-white ${
                      pinDetails
                        ? "bg-[#B91C1C] hover:bg-red-800 active:bg-red-900 shadow-red-100 cursor-pointer"
                        : "bg-gray-300 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <Lock size={15} /> Pay Online (UPI/Card)
                  </button>

                  {/* Pay at Pickup Button */}
                  <button
                    onClick={handlePayPickup}
                    disabled={!pinDetails}
                    className={`flex-1 font-bold py-4 rounded-2xl transition border-2 flex items-center justify-center gap-2 text-sm ${
                      pinDetails
                        ? "border-gray-200 bg-white hover:bg-gray-50 text-gray-700 active:bg-gray-100 cursor-pointer"
                        : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Store size={15} /> Pay at Pickup (Cash)
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
                {/* Switch breakdown totals based on active hovered mode */}
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-500">Items Subtotal</span>
                  <span className="text-gray-800">₹{subtotal}</span>
                </div>
                
                {payMode === "online" && (
                  <>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-gray-500">Delivery charges</span>
                      <span className="text-gray-800">
                        {pinDetails ? `₹${pinDetails.deliveryCharge}` : <span className="text-xs text-gray-400 font-normal italic">Enter pincode first</span>}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-gray-500">Gateway fee (2%)</span>
                      <span className="text-gray-800">
                        {pinDetails ? `+ ₹${computeFee("online", subtotal + pinDetails.deliveryCharge, true)}` : <span className="text-xs text-gray-400 font-normal italic">Enter pincode first</span>}
                      </span>
                    </div>
                  </>
                )}

                {payMode === "pickup" && (
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-500">Booking fee (self-pickup)</span>
                    <span className="text-gray-800">+ ₹19</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-gray-900">Total payable</span>
                    <span className="text-[10px] text-gray-400 font-semibold italic">
                      {payMode === "online" ? "Selected: Pay Online" : "Selected: Pay at Pickup"}
                    </span>
                  </div>
                  <span className="text-[#B91C1C] font-black text-xl">
                    ₹{pinDetails ? getBreakdownTotal() : subtotal}
                  </span>
                </div>

                <div className="flex justify-center gap-4 pt-2 text-[10px] font-bold text-gray-400">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={payMode === "online"} onChange={() => setPayMode("online")} className="accent-[#B91C1C]" /> Show Online details
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={payMode === "pickup"} onChange={() => setPayMode("pickup")} className="accent-[#B91C1C]" /> Show Pickup details
                  </label>
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
