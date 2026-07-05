// Dynamically load Razorpay checkout.js and resolve true/false.
// Only the public Key ID is used here — the Key Secret stays on the server.
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SLAq0dZtQOINXD";

export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Opens Razorpay checkout.
 * amount   — base amount in ₹ (before fees)
 * total    — amount + fees, passed to Razorpay (in ₹, converted to paise internally)
 * method   — "upi" | "card" | "netbanking"
 * customer — { name, email, phone }
 * onSuccess(response) / onDismiss()
 */
export const openRazorpayCheckout = ({ total, method, title, customer, onSuccess, onDismiss }) => {
  const methodMap = {
    upi:        { upi: 1, card: 0, netbanking: 0, wallet: 0 },
    card:       { card: 1, upi: 0, netbanking: 0, wallet: 0 },
    netbanking: { netbanking: 1, card: 0, upi: 0, wallet: 0 },
  };

  const options = {
    key:         RAZORPAY_KEY_ID,
    amount:      Math.round(total * 100), // paise
    currency:    "INR",
    name:        "Mumbaicha Raja",
    description: title,
    image:       "/images/logo-removebg-preview.png",
    prefill: {
      name:    customer?.name    || "",
      email:   customer?.email   || "",
      contact: customer?.phone   || "",
    },
    notes: {
      pickup: "Ganesh Galli Mandal Office, Lalbaug, Mumbai – 400 012",
    },
    theme:  { color: "#B91C1C" },
    modal:  { ondismiss: onDismiss, animation: true },
    
    handler: (response) =>
      onSuccess({
        txnId:   response.razorpay_payment_id,
        orderId: response.razorpay_order_id || null,
        method:  method || "online",
        amount:  total,
      }),
  };

  if (methodMap[method]) options.method = methodMap[method];

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", () => onDismiss());
  rzp.open();
};