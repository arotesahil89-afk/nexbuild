import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import apiClient from "../services/apiService";
import { downloadMarathiReceipt, downloadDonationReceipt } from "../utils/marathiReceipt";

export default function PavatiDownloadPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isDonation, setIsDonation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    async function fetchPavatiData() {
      try {
        setLoading(true);
        let res = null;
        let isDon = false;
        
        // If ID starts with DON-, query donations endpoint directly
        if (id && id.startsWith("DON-")) {
          isDon = true;
          try {
            res = await apiClient.get(`/donations/pavati/${id}`);
          } catch (e) {
            res = null;
          }
        }
        
        // If not found or not DON-, try orders first, then donations
        if (!res || !res.success || !res.data) {
          try {
            res = await apiClient.get(`/orders/pavati/${id}`);
            isDon = false;
          } catch (e) {
            res = null;
          }
        }

        if (!res || !res.success || !res.data) {
          try {
            res = await apiClient.get(`/donations/pavati/${id}`);
            isDon = true;
          } catch (e) {
            res = null;
          }
        }

        if (res && res.success && res.data) {
          const d = res.data;
          setIsDonation(isDon || !!d.donationNo);
          setOrder({
            ...d,
            orderNo: d.orderNo || d.donationNo,
            donationNo: d.donationNo,
            customerName: d.customerName || d.donorName,
            donorName: d.donorName || d.customerName,
            donorPhone: d.donorPhone || d.customerPhone,
            donorAddress: d.donorAddress || d.deliveryAddress,
            totalAmount: d.totalAmount || d.amount,
            unitPrice: d.unitPrice || d.amount,
            quantity: d.quantity || 1,
            productName: d.productName || d.cause || "शतक महोत्सवी निधीकरिता",
            paymentMode: d.paymentMode || "CCAvenue Online",
            bankRefNo: d.bankRefNo,
            createdAt: d.createdAt,
          });
        } else {
          setError("पावती माहिती सापडली नाही (Pavati not found)");
        }
      } catch (err) {
        console.error("Failed to fetch Pavati details:", err);
        setError(err.message || "पावती लोड करण्यात अडचण आली (Error loading Pavati)");
      } finally {
        setLoading(false);
      }
    }
    fetchPavatiData();
  }, [id]);

  useEffect(() => {
    if (order && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const unitPrice = order.unitPrice || 330;
      const quantity = order.quantity || 1;
      const subtotal = unitPrice * quantity;

      const timer = setTimeout(() => {
        if (isDonation || order.donationNo) {
          downloadDonationReceipt({
            donationNo: order.donationNo || order.orderNo,
            donorName: order.donorName || order.customerName || "देणगीदार",
            donorPhone: order.donorPhone,
            donorAddress: order.donorAddress,
            amount: subtotal || order.amount,
            txnId: order.paymentId || order.donationNo || "",
            paymentMode: order.paymentMode || "CCAvenue Online",
            bankRefNo: order.bankRefNo,
            date: order.createdAt,
          });
        } else {
          downloadMarathiReceipt({
            receiptNo: order.orderNo?.replace(/\D/g, "").slice(-4) || "1",
            customerName: order.customerName || "",
            amount: subtotal,
            txnId: order.paymentId || order.orderNo || "",
            productName: order.productName || "शतक महोत्सवी निधीकरिता",
            quantity: quantity,
          });
        }
        setDownloaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [order, isDonation]);

  const handleManualDownload = () => {
    if (!order) return;
    const unitPrice = order.unitPrice || 330;
    const quantity = order.quantity || 1;
    const subtotal = unitPrice * quantity;

    if (isDonation || order.donationNo) {
      downloadDonationReceipt({
        donationNo: order.donationNo || order.orderNo,
        donorName: order.donorName || order.customerName || "देणगीदार",
        donorPhone: order.donorPhone,
        donorAddress: order.donorAddress,
        amount: subtotal || order.amount,
        txnId: order.paymentId || order.donationNo || "",
        paymentMode: order.paymentMode || "CCAvenue Online",
        bankRefNo: order.bankRefNo,
        date: order.createdAt,
      });
    } else {
      downloadMarathiReceipt({
        receiptNo: order.orderNo?.replace(/\D/g, "").slice(-4) || "1",
        customerName: order.customerName || "",
        amount: subtotal,
        txnId: order.paymentId || order.orderNo || "",
        productName: order.productName || "शतक महोत्सवी निधीकरिता",
        quantity: quantity,
      });
    }
  };

  const fmtINR = (n) => Number(n).toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 pt-28">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-red-100 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Top Gold/Red accent strip */}
        <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-[#B91C1C] via-yellow-400 to-[#B91C1C]" />

        {loading ? (
          <div className="py-12 text-gray-500">
            <RefreshCw size={36} className="animate-spin text-[#B91C1C] mx-auto mb-4" />
            <p className="font-bold text-gray-800 text-base">अधिकृत पावती तयार होत आहे...</p>
            <p className="text-xs text-gray-400 mt-1">कृपया थोडा वेळ वाट पहा (Generating your Pavati)</p>
          </div>
        ) : error ? (
          <div className="py-8">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">पावती उपलब्ध नाही</h2>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-block bg-[#B91C1C] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-red-800 transition"
            >
              मुख्य पानावर जा (Go to Home)
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 mt-2">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-xl font-black text-gray-900 leading-tight">
              लालबाग सार्वजनिक उत्सव मंडळ, गणेशगल्ली
            </h2>
            <p className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider mt-1">
              || मुंबईचा राजा || 🙏
            </p>

            <div className="my-6 bg-amber-50/50 rounded-2xl p-4 border border-amber-100 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-amber-100 pb-2">
                <span className="text-gray-500 font-medium">पावती क्र. (Receipt No)</span>
                <span className="font-bold text-gray-900 font-mono">{order.orderNo}</span>
              </div>
              <div className="flex justify-between border-b border-amber-100 pb-2">
                <span className="text-gray-500 font-medium">नाव (Devotee Name)</span>
                <span className="font-bold text-gray-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-amber-100 pb-2">
                <span className="text-gray-500 font-medium">देणगी रक्कम (Amount)</span>
                <span className="font-extrabold text-[#B91C1C] text-sm">₹{fmtINR(order.unitPrice * order.quantity)}/-</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500 font-medium">व्यवहार क्र. (Txn ID)</span>
                  <span className="font-bold text-gray-700 font-mono text-[11px] select-all">{order.paymentId}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-6 font-medium">
              {downloaded
                ? "✓ आपली अधिकृत पावती डाउनलोड झाली आहे."
                : "आपली पावती PDF डाउनलोड होत आहे..."}
            </p>

            <button
              onClick={handleManualDownload}
              className="w-full bg-[#B91C1C] hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-2xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-100"
            >
              <Download size={18} /> पावती पुन्हा डाउनलोड करा (Download Pavati)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
