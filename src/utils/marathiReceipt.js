/**
 * MarathiReceipt.js
 * Generates a Marathi-style pāvatī (पावती) PDF matching the
 * Lalbaug Sarvajanik Utsav Mandal physical receipt design.
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a number to Marathi word form (up to 99999) */
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
  let n = Math.round(num);
  let words = "";

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    words += amountToMarathiWords(thousands) + " हजार ";
    n %= 1000;
  }
  if (n >= 100) {
    words += ones[Math.floor(n / 100)] + "शे ";
    n %= 100;
  }
  if (n >= 20) {
    words += tens[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  if (n > 0) words += ones[n] + " ";
  return words.trim();
}

/** Convert digits to Marathi numerals */
function toMarathiDigits(n) {
  const map = { "0":"०","1":"१","2":"२","3":"३","4":"४","5":"५","6":"६","7":"७","8":"८","9":"९" };
  return String(n).split("").map(d => map[d] || d).join("");
}

/** Format today's date as DD/MM/YYYY in Marathi digits */
function todayMarathi() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return toMarathiDigits(`${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`);
}

// ── Receipt HTML Builder ──────────────────────────────────────────────────────

function buildReceiptHTML({ receiptNo, customerName, amount, txnId, productName }) {
  const amountInWords = amountToMarathiWords(Math.round(amount));
  const marathiAmount = toMarathiDigits(Math.round(amount));
  const marathiReceiptNo = toMarathiDigits(receiptNo || "1");
  const date = todayMarathi();

  // Logo path — served from public folder
  const logoUrl = window.location.origin + "/images/logo-removebg-preview.png";

  return `
    <div id="marathi-receipt" style="
      width: 720px;
      background: #fffdf5;
      font-family: 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif;
      position: relative;
      padding: 0;
      box-sizing: border-box;
      border: 5px solid #8b1a1a;
    ">
      <!-- Outer decorative outline -->
      <div style="
        position: absolute;
        inset: 8px;
        border: 1.5px solid #c0a060;
        pointer-events: none;
        z-index: 0;
      "></div>

      <!-- Corner bracket: top-left -->
      <div style="position:absolute;top:5px;left:5px;width:24px;height:24px;border-top:3px solid #8b1a1a;border-left:3px solid #8b1a1a;z-index:2;"></div>
      <!-- Corner bracket: top-right -->
      <div style="position:absolute;top:5px;right:5px;width:24px;height:24px;border-top:3px solid #8b1a1a;border-right:3px solid #8b1a1a;z-index:2;"></div>
      <!-- Corner bracket: bottom-left -->
      <div style="position:absolute;bottom:5px;left:5px;width:24px;height:24px;border-bottom:3px solid #8b1a1a;border-left:3px solid #8b1a1a;z-index:2;"></div>
      <!-- Corner bracket: bottom-right -->
      <div style="position:absolute;bottom:5px;right:5px;width:24px;height:24px;border-bottom:3px solid #8b1a1a;border-right:3px solid #8b1a1a;z-index:2;"></div>

      <!-- Content wrapper (above gold border) -->
      <div style="position:relative;z-index:1;padding:16px 24px 0;">

        <!-- Top Meta Row -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:11px;color:#666;">स्थापना १९२८</span>
          <span style="font-size:13px;color:#8b1a1a;font-weight:bold;letter-spacing:1px;">|| श्री गजानन प्रसन्न ||</span>
          <span style="font-size:11px;color:#666;">नोंदणी क्र. ए-२२३६</span>
        </div>

        <!-- Header Row: Logo + Title -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px;">
          <img
            src="${logoUrl}"
            alt="Lalbaug Logo"
            style="width:64px;height:64px;object-fit:contain;flex-shrink:0;border-radius:50%;"
            crossorigin="anonymous"
          />
          <div style="flex:1;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:#8b1a1a;line-height:1.25;letter-spacing:0.3px;">
              लालबाग सार्वजनिक उत्सव मंडळ, गणेशगल्ली
            </div>
            <div style="font-size:12px;color:#444;margin-top:3px;">लालबाग, मुंबई – ४०००१२.</div>
            <div style="font-size:16px;font-weight:bold;color:#8b1a1a;margin-top:4px;letter-spacing:0.5px;">
              || मुंबईचा राजा ||
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div style="height:2px;background:linear-gradient(90deg,transparent 0%,#8b1a1a 20%,#c0a060 50%,#8b1a1a 80%,transparent 100%);margin:6px 0;opacity:0.6;"></div>

        <!-- Receipt No + Date -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 4px 6px;">
          <div style="font-size:14px;color:#111;">
            <span style="font-weight:bold;">पावती क्र. :</span>
            <span style="font-size:22px;font-weight:900;color:#000;margin-left:8px;">${marathiReceiptNo}</span>
          </div>
          <div style="font-size:14px;color:#111;">
            <span style="font-weight:bold;">दिनांक :</span>
            <span style="margin-left:8px;font-size:14px;">${date}</span>
          </div>
        </div>

        <!-- Name row -->
        <div style="display:flex;align-items:flex-end;gap:6px;padding:4px 4px 10px;font-size:14px;color:#111;border-bottom:1px dotted #aaa;">
          <span style="font-weight:bold;white-space:nowrap;flex-shrink:0;">श्री./श्रीमती</span>
          <span style="
            flex:1;
            font-weight:800;
            font-size:15px;
            color:#000;
            border-bottom:1px dotted #333;
            padding-bottom:2px;
            min-height:20px;
            display:block;
          ">${customerName || ''}</span>
        </div>

        <!-- Divider dot line -->
        <div style="border-top:1px dotted #bbb;margin:0 0 8px;"></div>

        <!-- Main text -->
        <div style="font-size:13.5px;color:#111;line-height:1.8;padding:0 4px 8px;">
          यांजकडून <strong>${productName || 'शतक महोत्सवी निधीकरिता'}</strong> देणगी रुपये
          <strong>${amountInWords} मात्र</strong> सादर पोहोचले.
        </div>

        <!-- UPI row -->
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#111;padding:0 4px 12px;">
          <span style="white-space:nowrap;">व्यवहार क्र. / UPI No. :</span>
          <div style="
            border:1.5px solid #777;
            padding:4px 18px;
            border-radius:4px;
            flex:1;
            font-family:monospace;
            font-size:12px;
            letter-spacing:0.5px;
            color:#222;
            min-height:22px;
          ">${txnId || ''}</div>
        </div>

      </div>

      <!-- Decorative strip before footer -->
      <div style="
        height:5px;
        margin:0 16px;
        background: repeating-linear-gradient(90deg, #8b1a1a 0, #8b1a1a 7px, transparent 7px, transparent 11px);
        opacity:0.3;
      "></div>

      <!-- Footer: Amount + Dhanyavad -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 28px 8px;position:relative;z-index:1;">
        <div style="
          border:2px solid #222;
          padding:6px 18px;
          border-radius:3px;
          display:inline-flex;
          align-items:baseline;
          gap:8px;
        ">
          <span style="font-size:13px;font-weight:bold;color:#111;">रुपये</span>
          <span style="font-size:24px;font-weight:900;color:#000;letter-spacing:1px;">${marathiAmount}/-</span>
        </div>
        <div style="font-size:16px;font-weight:bold;color:#8b1a1a;">धन्यवाद!</div>
      </div>

      <!-- Signatory row -->
      <div style="
        display:flex;
        justify-content:space-around;
        padding:6px 24px 16px;
        font-size:12px;
        color:#333;
        text-align:center;
        position:relative;z-index:1;
      ">
        <div style="border-top:1px solid #555;padding-top:5px;min-width:90px;">अध्यक्ष</div>
        <div style="border-top:1px solid #555;padding-top:5px;min-width:90px;">सरचिटणीस</div>
        <div style="border-top:1px solid #555;padding-top:5px;min-width:90px;">खजिनदार</div>
        <div style="border-top:1px solid #555;padding-top:5px;min-width:90px;">प्राप्तकर्ता</div>
      </div>

      <!-- Bottom decorative strip -->
      <div style="
        height:5px;
        margin:0 16px 12px;
        background: repeating-linear-gradient(90deg, #8b1a1a 0, #8b1a1a 7px, transparent 7px, transparent 11px);
        opacity:0.3;
        position:relative;z-index:1;
      "></div>
    </div>
  `;
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {string|number} params.receiptNo  - Receipt / order number
 * @param {string}        params.customerName
 * @param {number}        params.amount     - SUBTOTAL only (no gateway fees)
 * @param {string}        params.txnId      - CCAvenue tracking_id or Razorpay payment_id
 * @param {string}        params.productName
 */
export async function downloadMarathiReceipt({ receiptNo, customerName, amount, txnId, productName }) {
  // 1. Build off-screen container
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700;900&display=swap" rel="stylesheet">
    ${buildReceiptHTML({ receiptNo, customerName, amount, txnId, productName })}
  `;
  document.body.appendChild(container);

  // 2. Wait for fonts + images
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 600));

  const target = container.querySelector("#marathi-receipt");

  // 3. Capture
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#fffdf5",
    logging: false,
  });

  document.body.removeChild(container);

  // 4. Build PDF
  const imgData = canvas.toDataURL("image/png");
  const pxW = canvas.width / 2;
  const pxH = canvas.height / 2;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [pxW, pxH],
  });
  pdf.addImage(imgData, "PNG", 0, 0, pxW, pxH);
  pdf.save(`MCR-Pavati-${receiptNo || Date.now()}.pdf`);
}
