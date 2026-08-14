import React from "react";
import { Link } from "react-router-dom";

export default function CicdPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          CI/CD LIVE
        </div>
        <h1 className="text-3xl font-extrabold text-amber-400">
          hello from cicd
        </h1>
        <p className="text-slate-400 text-sm">
          Option B: Cloud CI Build & Dist Deployment Verified 🚀
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2 rounded-xl transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
