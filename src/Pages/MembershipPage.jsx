import React, { useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "../Components/HeroSection/HeroSection";
import PaymentGatewayModal from "../Components/PaymentGatewayModal/PaymentGatewayModal";
import {
  memberTypes,
  demoMember,
  previousOutstanding,
  currentDuesTotal,
  grandTotal,
} from "../data/membershipData";

const FeeTable = ({ title, rows, columns }) => (
  <div className="overflow-x-auto mb-4">
    <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
        <tr>
          {columns.map((c) => (
            <th key={c} className="text-left px-3 py-2 font-semibold">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  </div>
);

const MembershipPage = () => {
  const [memberType, setMemberType] = useState(memberTypes[0].id);
  const [lookup, setLookup] = useState("");
  const [member, setMember] = useState(null);
  const [payScope, setPayScope] = useState("all");
  const [payOpen, setPayOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (lookup.trim().toUpperCase() === demoMember.id) {
      setMember(demoMember);
      setError("");
    } else {
      setMember(null);
      setError("No record found. Try the demo ID: LSUM-2024-0842");
    }
  };

  const payAmount = payScope === "prev" ? previousOutstanding : grandTotal;

  return (
    <>
      <HeroSection
        title="Member Services — Fee Payment"
        subtitle="Select your membership type and manage your annual fees & contributions"
        backgroundImage=""
        height="50vh"
      />

      <section className="py-12 px-4 md:px-10 max-w-6xl mx-auto">
        <h3 className="text-xl font-bold text-[#B91C1C] mb-1">Select Your Membership Type</h3>
        <p className="text-sm text-gray-500 mb-4">Choose the category that applies to you</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {memberTypes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMemberType(m.id)}
              className={`rounded-xl border-2 p-4 text-center transition ${
                memberType === m.id ? "border-[#B91C1C] bg-red-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-2">{m.emoji}</div>
              <div className="text-sm font-bold text-gray-800">{m.title}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{m.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Lookup */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-8">
          <h4 className="font-bold text-gray-800 mb-1">🔍 Find Your Member Record</h4>
          <p className="text-sm text-gray-500 mb-4">Enter your Member ID or registered mobile number</p>
          <div className="flex gap-3 flex-wrap">
            <input
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="Member ID (e.g. LSUM-2024-0842) or mobile"
              className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#B91C1C]"
            />
            <button
              onClick={handleSearch}
              className="bg-[#B91C1C] hover:bg-red-800 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Search →
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          <p className="text-xs text-gray-400 mt-3">
            Demo: try <code className="bg-gray-100 px-1.5 py-0.5 rounded">LSUM-2024-0842</code>
          </p>
        </div>

        {member && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 shadow-lg rounded-2xl p-6 md:p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[#B91C1C] text-white flex items-center justify-center font-bold text-lg">
                {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-800">{member.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Member ID: {member.id} · Ward: {member.ward} · Since {member.since}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Member Since</div>
                <div className="text-xl font-bold text-[#B91C1C]">{2026 - member.since} yrs</div>
              </div>
            </div>

            {/* Outstanding alert */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <div className="font-bold text-sm text-yellow-800">Previous Year Outstanding Found</div>
                <div className="text-xs text-yellow-700 mt-0.5">
                  ₹{previousOutstanding.toLocaleString("en-IN")} from 2024–25 is still unpaid.
                </div>
              </div>
              <div className="text-lg font-bold text-red-600">₹{previousOutstanding.toLocaleString("en-IN")}</div>
            </div>

            {/* Previous dues */}
            <h5 className="font-bold text-sm text-yellow-800 mb-2">PREVIOUS YEAR — Outstanding Dues 2024–25</h5>
            <FeeTable
              columns={["Fee Type", "Description", "Due Date", "Fine", "Total", "Status"]}
              rows={member.previousDues.map((d) => (
                <tr key={d.type} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{d.type}</td>
                  <td className="px-3 py-2 text-gray-500">{d.desc}</td>
                  <td className="px-3 py-2 text-gray-500">{d.due}</td>
                  <td className="px-3 py-2 text-yellow-700">{d.fine ? `+₹${d.fine}` : "—"}</td>
                  <td className="px-3 py-2 font-bold">₹{d.total}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                        d.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            />

            {/* Current dues */}
            <h5 className="font-bold text-sm text-[#B91C1C] mb-2 mt-6">CURRENT YEAR — Fee Schedule 2025–26</h5>
            <FeeTable
              columns={["Fee Type", "Description", "Due Date", "Amount", "Status"]}
              rows={member.currentDues.map((d) => (
                <tr key={d.type} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{d.type}</td>
                  <td className="px-3 py-2 text-gray-500">{d.desc}</td>
                  <td className="px-3 py-2 text-gray-500">{d.due}</td>
                  <td className="px-3 py-2 font-bold">₹{d.amount}</td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            />

            {/* Grand total */}
            <div className="bg-[#1a1a1a] text-white rounded-xl p-5 flex items-center justify-between my-6">
              <div>
                <div className="text-sm text-white/70">Grand Total — All Pending Dues</div>
                <div className="text-xs text-white/40 mt-1">
                  Previous ₹{previousOutstanding.toLocaleString("en-IN")} + Current ₹{currentDuesTotal.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-3xl font-extrabold text-yellow-400">₹{grandTotal.toLocaleString("en-IN")}</div>
            </div>

            {/* Pay scope selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setPayScope("prev")}
                className={`rounded-xl border-2 p-4 text-center transition ${
                  payScope === "prev" ? "border-[#B91C1C] bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="text-sm font-semibold text-gray-700">Pay Previous Year Only</div>
                <div className="text-xl font-bold text-yellow-700 mt-1">₹{previousOutstanding.toLocaleString("en-IN")}</div>
              </button>
              <button
                onClick={() => setPayScope("all")}
                className={`rounded-xl border-2 p-4 text-center transition ${
                  payScope === "all" ? "border-[#B91C1C] bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="text-sm font-semibold text-[#B91C1C]">Pay All Dues — Recommended</div>
                <div className="text-xl font-bold text-[#B91C1C] mt-1">₹{grandTotal.toLocaleString("en-IN")}</div>
              </button>
            </div>

            <button
              onClick={() => setPayOpen(true)}
              className="w-full bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition"
            >
              Pay ₹{payAmount.toLocaleString("en-IN")} Now 🙏
            </button>
          </motion.div>
        )}
      </section>

      <PaymentGatewayModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        amount={payAmount}
        title="Membership Dues"
      />
    </>
  );
};

export default MembershipPage;
