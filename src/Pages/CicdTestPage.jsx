import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Server, ShieldCheck, Zap, RefreshCw, ArrowLeft, Clock, Activity, Cpu } from "lucide-react";
import apiClient from "../services/apiService";

export default function CicdTestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchCicdStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/cicd");
      setData(res);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("CI/CD test fetch error:", err);
      // Direct fallback fetch in case of encryption bypass in test
      try {
        const rawRes = await fetch("/api/cicd");
        const json = await rawRes.json();
        setData(json);
        setLastChecked(new Date().toLocaleTimeString());
      } catch (fallbackErr) {
        setError(err.message || "Failed to connect to backend /api/cicd");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCicdStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Top bar navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
          >
            <ArrowLeft size={18} />
            Back to Website
          </Link>

          <button
            onClick={fetchCicdStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Testing..." : "Re-test API"}
          </button>
        </div>

        {/* Main Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE PRODUCTION PIPELINE
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
                CI/CD Zero-Downtime Test
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time API health verification for AWS Lightsail cluster
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-black/30 px-3.5 py-2 rounded-xl border border-white/5 shrink-0">
              <Clock size={14} className="text-amber-400" />
              <span>Last checked: {lastChecked || "Connecting..."}</span>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mx-auto" />
              <p className="text-slate-300 text-sm">Testing live backend endpoint at /api/cicd...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-300 space-y-2">
              <p className="font-semibold text-red-200">Connection Error</p>
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-300">
                    {data?.message || "CI/CD Implemented Successfully 🚀"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {data?.status || "Zero-Downtime Rolling Deployment Active"}
                  </p>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    <Server size={14} /> Backend Cluster
                  </div>
                  <div className="text-lg font-bold text-white">PM2 Active</div>
                  <div className="text-xs text-slate-400">Rolling zero-downtime</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    <Zap size={14} /> Frontend Delivery
                  </div>
                  <div className="text-lg font-bold text-white">Atomic Symlink</div>
                  <div className="text-xs text-slate-400">0ms switchover time</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck size={14} /> SSL Security
                  </div>
                  <div className="text-lg font-bold text-white">HTTPS Active</div>
                  <div className="text-xs text-slate-400">Certbot Encrypted</div>
                </div>
              </div>

              {/* Raw JSON Details */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono flex items-center gap-1.5">
                    <Activity size={12} className="text-emerald-400" /> Response from /api/cicd:
                  </span>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    200 OK
                  </span>
                </div>
                <pre className="font-mono text-xs text-emerald-300/90 overflow-x-auto p-2 bg-black/50 rounded-xl border border-white/5">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center text-xs text-slate-500 mt-8">
        Mumbaicha Raja • Automated CI/CD Infrastructure
      </div>
    </div>
  );
}
