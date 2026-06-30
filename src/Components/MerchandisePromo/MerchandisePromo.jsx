import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Sparkles, Star } from "lucide-react";
import "./MerchandisePromo.css";

const MerchandisePromo = () => {
  const { t } = useTranslation("merchandise");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
    navigate("/merchandise");
  };

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
                    src="/images/merch/tee-angle.jpg"
                    alt="Mumbaicha Raja T-Shirt"
                    className="merch-promo-img"
                  />
                </div>
              </div>

              {/* Right Side: Product Details & CTA */}
              <div className="merch-promo-info-sec">
                <div className="merch-promo-tag">LIMITED FESTIVE LAUNCH</div>
                <h2 className="merch-promo-title">{t("promoTitle", "Official Merchandise Is Live!")}</h2>
                <p className="merch-promo-desc">
                  {t("promoTagline", "Get your Mumbaicha Raja Heritage Grey Polo T-Shirt. Limited stock available for Ganeshotsav!")}
                </p>

                {/* Pricing and Review */}
                <div className="merch-promo-price-review">
                  <div className="merch-promo-price">
                    <span className="merch-promo-price-new">₹799</span>
                    <span className="merch-promo-price-old">₹1099</span>
                    <span className="merch-promo-discount">27% OFF</span>
                  </div>
                  <div className="merch-promo-rating">
                    <div className="merch-promo-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#eab308" stroke="none" />
                      ))}
                    </div>
                    <span className="merch-promo-rating-text">4.9 (412+)</span>
                  </div>
                </div>

                {/* Features strip */}
                <ul className="merch-promo-features">
                  <li>✨ Premium 100% bio-washed cotton</li>
                  <li>✨ Golden Ganpati crest embroidery</li>
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
