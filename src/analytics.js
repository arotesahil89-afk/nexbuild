// src/analytics.js
export const trackPageView = (url) => {
  if (typeof window.gtag === "function") {
    window.gtag("config", "G-3LY38LCFFE", {
      page_path: url,
    });
  } else {
    console.warn("gtag not loaded yet.");
  }
};
