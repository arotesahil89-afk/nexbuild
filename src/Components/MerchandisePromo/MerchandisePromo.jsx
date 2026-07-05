import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Sparkles, Star } from "lucide-react";
import useMerchandiseLoader from "../../loaders/useMerchandiseLoader";
import "./MerchandisePromo.css";

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

const MerchandisePromo = () => {
  const { t, i18n } = useTranslation("merchandise");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { products, loading } = useMerchandiseLoader();

  // Find the official polo product (mr-polo-2025)
  const polo = products.find(p => p.id === "mr-polo-2025") || products[0];

  useEffect(() => {
    // Small delay before showing modal for better UX feel
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleShopNow = () => {
    handleClose();
    if (polo) {
      const slug = getProductSlug(polo) || "mumbaicha-raja-official-polo-heritage-grey";
      navigate(`/merchandise/${slug}`);
    } else {
      navigate("/merchandise");
    }
  };

  if (loading || !polo) return null;

  // Resolve dynamic strings
  const name = polo.nameKey
    ? t(polo.nameKey)
    : (polo.name?.[i18n.language] || polo.name?.en || polo.name || "");
  const tagline = polo.taglineKey
    ? t(polo.taglineKey)
    : (polo.tagline?.[i18n.language] || polo.tagline?.en || polo.tagline || "");

  const highlights = Array.isArray(polo.highlights)
    ? polo.highlights.map(h => typeof h === "string" && (h.startsWith("highlights.") || h.includes(".")) ? t(h) : h)
    : (polo.highlights?.[i18n.language] || polo.highlights?.en || []);

  const discount = polo.oldPrice ? Math.round(((polo.oldPrice - polo.price) / polo.oldPrice) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="merch-promo-overlay">
          {/* Backdrop Blur overlay */}
          <motion.div
            className="merch-promo-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            className="merch-promo-modal"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
          >
            {/* Close Button */}
            <button className="merch-promo-close-btn" onClick={handleClose} aria-label="Close promotion">
              <X size={20} />
            </button>

            <div className="merch-promo-content">
              {/* Left Side: Product Image & Spotlight */}
              <div className="merch-promo-image-sec">
                <div className="merch-promo-spotlight">
                  <span className="merch-promo-badge">
                    <Sparkles size={12} className="text-yellow-400 animate-pulse animate-duration-1000" />
                    {t("badge", "OFFICIAL 2025 EDITION")}
                  </span>
                  <img
                    src={polo.image || "/images/merch/tee-angle.jpg"}
                    alt={name}
                    className="merch-promo-img"
                  />
                </div>
              </div>

              {/* Right Side: Product Details & CTA */}
              <div className="merch-promo-info-sec">
                <div className="merch-promo-tag">LIMITED FESTIVE LAUNCH</div>
                <h2 className="merch-promo-title">{name}</h2>
                <p className="merch-promo-desc">{tagline}</p>

                {/* Pricing and Review */}
                <div className="merch-promo-price-review">
                  <div className="merch-promo-price">
                    <span className="merch-promo-price-new">₹{polo.price}</span>
                    {polo.oldPrice && <span className="merch-promo-price-old">₹{polo.oldPrice}</span>}
                    {discount > 0 && <span className="merch-promo-discount">{discount}% OFF</span>}
                  </div>
                  <div className="merch-promo-rating">
                    <div className="merch-promo-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#eab308" stroke="none" />
                      ))}
                    </div>
                    <span className="merch-promo-rating-text">{polo.rating || 4.9} ({polo.reviews || 412}+)</span>
                  </div>
                </div>

                {/* Features strip */}
                <ul className="merch-promo-features">
                  {(highlights || []).map((text, idx) => (
                    <li key={idx}>✨ {text}</li>
                  ))}
                </ul>

                {/* CTA Buttons */}
                <div className="merch-promo-actions">
                  <button className="merch-promo-btn-primary" onClick={handleShopNow}>
                    <ShoppingBag size={18} />
                    <span>{t("promoCta", "Shop Merchandise")}</span>
                  </button>
                  <button className="merch-promo-btn-secondary" onClick={handleClose}>
                    {t("promoDismiss", "Explore Website")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MerchandisePromo;
