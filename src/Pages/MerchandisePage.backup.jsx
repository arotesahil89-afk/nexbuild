import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Plus, Minus, Trash2, ShoppingCart, X } from "lucide-react";
import PaymentGatewayModal from "../Components/PaymentGatewayModal/PaymentGatewayModal";
import CheckoutDetailsModal from "../Components/CheckoutDetailsModal/CheckoutDetailsModal";
import { products } from "../data/merchData";

const ProductCard = ({ product, name, t, onAddToCart }) => {
  const [size, setSize] = useState(product.sizes[Math.floor(product.sizes.length / 2)]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition"
    >
      <div className="relative h-56 bg-gray-100">
        <img src={product.image} alt={name} className="w-full h-full object-cover" />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#B91C1C] text-white text-[11px] font-bold px-3 py-1 rounded-full">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 min-h-[40px]">{name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-[#B91C1C]">₹{product.price}</span>
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.oldPrice}</span>
          )}
        </div>
        <p className="text-xs font-semibold text-gray-500 mb-1">{t("selectSize")}</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold border transition ${
                size === s
                  ? "bg-[#B91C1C] text-white border-[#B91C1C]"
                  : "border-gray-300 text-gray-600 hover:border-[#B91C1C]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => onAddToCart(product, name, size)}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#7A1F1F] font-bold py-2.5 rounded-xl transition"
        >
          {t("addToCart")}
        </button>
      </div>
    </motion.div>
  );
};

const CartDrawer = ({ open, onClose, cart, onUpdateQty, onRemove, total, onCheckout, t }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          className="fixed inset-0 bg-black/40 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[81] shadow-2xl flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.25 }}
        >
          <div className="bg-[#B91C1C] text-white px-5 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart size={20} /> {t("yourCart")}
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">{t("cartEmpty")}</p>
            ) : (
              cart.map((item) => (
                <div key={item.key} className="flex gap-3 items-center border-b border-gray-100 py-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-500">{t("size")}: {item.size}</p>
                    <p className="text-sm font-bold text-[#B91C1C] mt-1">₹{item.price * item.qty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQty(item.key, item.qty - 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#B91C1C]"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.qty}</span>
                    <button
                      onClick={() => onUpdateQty(item.key, item.qty + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#B91C1C]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => onRemove(item.key)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">{t("total")}</span>
                <span className="text-2xl font-extrabold text-[#B91C1C]">₹{total}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition"
              >
                {t("proceedToCheckout")}
              </button>
            </div>
          )}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const MerchandisePage = () => {
  const { t } = useTranslation("merchandise");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [customer, setCustomer] = useState(null);

  const addToCart = (product, name, size) => {
    setCart((prev) => {
      const key = `${product.id}-${size}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) => (item.key === key ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, name, size, key, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (key, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    setCart((prev) => prev.map((item) => (item.key === key ? { ...item, qty } : item)));
  };

  const removeFromCart = (key) => setCart((prev) => prev.filter((item) => item.key !== key));

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    setDetailsOpen(true);
  };

  const handleDetailsContinue = (form) => {
    setCustomer(form);
    setDetailsOpen(false);
    setPayOpen(true);
  };

  const handlePaymentSuccess = () => {
    setCart([]);
    setCustomer(null);
  };

  return (
    <>
      <section className="pt-28 pb-12 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#B91C1C]">{t("pageTitle")}</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">{t("pageSubtitle")}</p>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mt-4 rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-6">{t("sectionTitle")}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("sectionSub")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} name={t(`products.${p.id}.name`)} t={t} onAddToCart={addToCart} />
          ))}
        </div>
      </section>

      {/* Floating cart button */}
      {cart.length > 0 && !cartOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#B91C1C] hover:bg-red-800 text-white rounded-full shadow-2xl px-5 py-4 flex items-center gap-2 font-bold"
        >
          <ShoppingCart size={20} />
          <span>{itemCount}</span>
          <span className="text-yellow-300">₹{total}</span>
        </motion.button>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        total={total}
        onCheckout={handleCheckout}
        t={t}
      />

      <CheckoutDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onContinue={handleDetailsContinue}
        summary={
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">ORDER SUMMARY ({itemCount} items)</p>
            {cart.map((item) => (
              <div key={item.key} className="flex justify-between text-sm text-gray-700 mb-1">
                <span>
                  {item.name} ({item.size}) × {item.qty}
                </span>
                <span className="font-semibold">₹{item.price * item.qty}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold text-[#B91C1C] mt-2 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        }
      />

      <PaymentGatewayModal
        open={payOpen}
        onClose={() => {
          setPayOpen(false);
          handlePaymentSuccess();
        }}
        amount={total}
        title="Merchandise Order"
        showCod
        mobile={customer?.phone}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default MerchandisePage;
