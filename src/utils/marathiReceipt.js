/**
 * MarathiReceipt.jsx
 * Generates a Marathi-style pāvatī (पावती) PDF matching the
 * Lalbaug Sarvajanik Utsav Mandal physical receipt design.
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a number to Marathi word form (up to 9999) */
function amountToMarathiWords(num) {
  const ones = [
    "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ",
    "दहा", "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा",
    "अठरा", "एकोणीस",
  ];
  const tens = [
    "", "", "वीस", "तीस", "चाळीस", "पन्नास", "साठ", "सत्तर", "ऐंशी", "नव्वद",
  ];

  if (num === 0) return "शून्य";

  let words = "";
  if (num >= 1000) {
    words += ones[Math.floor(num / 1000)] + " हजार ";
    num %= 1000;
  }
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + "शे ";
    num %= 100;
  }
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  if (num > 0) words += ones[num] + " ";
  return words.trim();
}

/** Convert digits to Marathi numerals */
function toMarathiDigits(n) {
  const map = { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
                 "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" };
  return String(n).split("").map(d => map[d] || d).join("");
}

/** Format today's date as DD/MM/YYYY in Marathi digits */
function todayMarathi() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return toMarathiDigits(`${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`);
}

// ── Receipt HTML Builder ──────────────────────────────────────────────────────

function buildReceiptHTML({ receiptNo, customerName, amount, txnId, productName, quantity }) {
  const amountInWords = amountToMarathiWords(Math.round(amount));
  const marathiAmount = toMarathiDigits(Math.round(amount));
  const marathiReceiptNo = toMarathiDigits(receiptNo || "1");
  const date = todayMarathi();

  return `
    <div id="marathi-receipt" style="
      width: 700px;
      min-height: 360px;
      background: #fffdf5;
      font-family: 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif;
      position: relative;
      padding: 0;
      box-sizing: border-box;
      border: 4px solid #8b1a1a;
      outline: 2px solid #c0a060;
      outline-offset: -8px;
    ">
      <!-- Corner ornaments -->
      <div style="position:absolute;top:6px;left:6px;width:22px;height:22px;border-top:3px solid #8b1a1a;border-left:3px solid #8b1a1a;"></div>
      <div style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-top:3px solid #8b1a1a;border-right:3px solid #8b1a1a;"></div>
      <div style="position:absolute;bottom:6px;left:6px;width:22px;height:22px;border-bottom:3px solid #8b1a1a;border-left:3px solid #8b1a1a;"></div>
      <div style="position:absolute;bottom:6px;right:6px;width:22px;height:22px;border-bottom:3px solid #8b1a1a;border-right:3px solid #8b1a1a;"></div>

      <!-- Inner border decorative strip top -->
      <div style="background:repeating-linear-gradient(90deg,#8b1a1a 0,#8b1a1a 6px,transparent 6px,transparent 10px);height:5px;margin:14px 14px 0;opacity:0.35;"></div>

      <!-- Top Meta Row -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 22px 0;">
        <span style="font-size:11px;color:#555;">स्थापना १९२८</span>
        <span style="font-size:13px;color:#8b1a1a;font-weight:bold;letter-spacing:1px;">|| श्री गजानन प्रसन्न ||</span>
        <span style="font-size:11px;color:#555;">नोंदणी क्र. ए-२२३६</span>
      </div>

      <!-- Header Row: Logo + Title -->
      <div style="display:flex;align-items:center;padding:4px 20px 4px;">
        <!-- Ganesh emblem placeholder -->
        <div style="width:60px;height:60px;flex-shrink:0;border:2px solid #8b1a1a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin-right:14px;background:#fff8ee;">🙏</div>
        <div style="flex:1;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#8b1a1a;line-height:1.2;letter-spacing:0.5px;">लालबाग सार्वजनिक उत्सव मंडळ, गणेशगल्ली</div>
          <div style="font-size:12px;color:#333;margin-top:2px;">लालबाग, मुंबई – ४०००१२.</div>
          <div style="font-size:17px;font-weight:bold;color:#8b1a1a;margin-top:3px;letter-spacing:1px;">|| मुंबईचा राजा || 👑</div>
        </div>
      </div>

      <!-- Decorative divider -->
      <div style="margin:4px 18px;height:2px;background:linear-gradient(90deg,transparent,#8b1a1a,#c0a060,#8b1a1a,transparent);opacity:0.5;"></div>

      <!-- Receipt No + Date -->
      <div style="display:flex;justify-content:space-between;padding:6px 28px;">
        <div style="font-size:13.5px;color:#111;">
          <span style="font-weight:bold;">पावती क्र. :</span>
          <span style="font-size:20px;font-weight:900;color:#000;margin-left:8px;">${marathiReceiptNo}</span>
        </div>
        <div style="font-size:13.5px;color:#111;">
          <span style="font-weight:bold;">दिनांक :</span>
          <span style="margin-left:6px;">${date}</span>
        </div>
      </div>

      <!-- Name row -->
      <div style="padding:2px 28px 6px;font-size:14px;color:#111;display:flex;align-items:flex-end;gap:6px;">
        <span style="font-weight:bold;white-space:nowrap;">श्री./श्रीमती</span>
        <span style="flex:1;border-bottom:1px dotted #333;padding-bottom:1px;font-weight:700;font-size:15px;color:#000;">${customerName}</span>
      </div>

      <!-- Main donation text -->
      <div style="padding:4px 28px 6px;font-size:13.5px;color:#111;line-height:1.7;">
        यांजकडून <strong>${productName || 'शतक महोत्सवी निधीकरिता'}</strong> देणगी रुपये <strong>${amountInWords} मात्र</strong> सादर पोहोचले.
      </div>

      <!-- UPI row -->
      <div style="padding:2px 28px 8px;display:flex;align-items:center;gap:10px;font-size:13px;color:#111;">
        <span>व्यवहार क्र. / UPI No.:</span>
        <div style="border:1.5px solid #555;padding:3px 16px;border-radius:4px;min-width:200px;font-family:monospace;font-size:12px;letter-spacing:0.5px;color:#222;">${txnId || ''}</div>
      </div>

      <!-- Inner border decorative strip -->
      <div style="background:repeating-linear-gradient(90deg,#8b1a1a 0,#8b1a1a 6px,transparent 6px,transparent 10px);height:5px;margin:0 14px;opacity:0.35;"></div>

      <!-- Footer Row: Amount + Thank you + Signatories -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 22px 10px;">
        <div style="border:2px solid #333;padding:5px 14px;border-radius:3px;display:flex;align-items:baseline;gap:6px;">
          <span style="font-size:13px;font-weight:bold;color:#111;">रुपये</span>
          <span style="font-size:22px;font-weight:900;color:#000;">${marathiAmount}/-</span>
        </div>
        <div style="font-size:14px;font-weight:bold;color:#8b1a1a;text-align:center;">धन्यवाद!</div>
      </div>

      <!-- Signatory row -->
      <div style="display:flex;justify-content:space-around;padding:4px 24px 12px;font-size:12px;color:#333;text-align:center;">
        <div style="border-top:1px solid #555;padding-top:4px;min-width:80px;">अध्यक्ष</div>
        <div style="border-top:1px solid #555;padding-top:4px;min-width:80px;">सरचिटणीस</div>
        <div style="border-top:1px solid #555;padding-top:4px;min-width:80px;">खजिनदार</div>
        <div style="border-top:1px solid #555;padding-top:4px;min-width:80px;">प्राप्तकर्ता</div>
      </div>

      <!-- Bottom decorative strip -->
      <div style="background:repeating-linear-gradient(90deg,#8b1a1a 0,#8b1a1a 6px,transparent 6px,transparent 10px);height:5px;margin:0 14px 10px;opacity:0.35;"></div>
    </div>
  `;
}

// ── Main Export ───────────────────────────────────────────────────────────────

export async function downloadMarathiReceipt({ receiptNo, customerName, amount, txnId, productName, quantity }) {
  // 1. Create a temporary off-screen container
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    z-index: -1;
  `;
  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700;900&display=swap" rel="stylesheet">
    ${buildReceiptHTML({ receiptNo, customerName, amount, txnId, productName, quantity })}
  `;
  document.body.appendChild(container);

  // 2. Wait for fonts to load
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 300));

  const target = container.querySelector("#marathi-receipt");

  // 3. Capture with html2canvas
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fffdf5",
    logging: false,
  });

  document.body.removeChild(container);

  // 4. Build PDF (landscape A5-ish)
  const imgData = canvas.toDataURL("image/png");
  const imgW = canvas.width / 2;
  const imgH = canvas.height / 2;

  const pdf = new jsPDF({
    orientation: imgW > imgH ? "landscape" : "portrait",
    unit: "px",
    format: [imgW, imgH],
  });

  pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
  pdf.save(`MCR-Pavati-${receiptNo || Date.now()}.pdf`);
}
