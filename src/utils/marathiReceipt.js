/**
 * MarathiReceipt.js
 * Generates:
 * 1. downloadMarathiReceipt — Official Merchandise / Order Pāvatī (Untouched)
 * 2. downloadDonationReceipt — Official Mandal Donation Pāvatī matching physical receipt PDF
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a number to Marathi word form (up to 999999) */
export function amountToMarathiWords(num) {
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

  if (n >= 100000) {
    const lakhs = Math.floor(n / 100000);
    words += amountToMarathiWords(lakhs) + " लाख ";
    n %= 100000;
  }
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
export function toMarathiDigits(n) {
  const map = { "0":"०","1":"१","2":"२","3":"३","4":"४","5":"५","6":"६","7":"७","8":"८","9":"९" };
  return String(n).split("").map(d => map[d] || d).join("");
}

/** Format date as DD/MM/YYYY in Marathi digits */
export function formatMarathiDate(d = new Date()) {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  const pad = n => String(n).padStart(2, "0");
  return toMarathiDigits(`${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. MERCHANDISE PĀVATĪ (UNTOUCHED — FOR ORDERS & T-SHIRTS)
// ══════════════════════════════════════════════════════════════════════════════

function buildMerchandiseReceiptHTML({ receiptNo, customerName, amount, txnId, productName }) {
  const amountInWords = amountToMarathiWords(Math.round(amount));
  const marathiAmount = toMarathiDigits(Math.round(amount));
  const marathiReceiptNo = toMarathiDigits(receiptNo || "1");
  const date = formatMarathiDate();

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
      <div style="position: absolute; inset: 8px; border: 1.5px solid #c0a060; pointer-events: none; z-index: 0;"></div>
      <div style="position:absolute;top:5px;left:5px;width:24px;height:24px;border-top:3px solid #8b1a1a;border-left:3px solid #8b1a1a;z-index:2;"></div>
      <div style="position:absolute;top:5px;right:5px;width:24px;height:24px;border-top:3px solid #8b1a1a;border-right:3px solid #8b1a1a;z-index:2;"></div>
      <div style="position:absolute;bottom:5px;left:5px;width:24px;height:24px;border-bottom:3px solid #8b1a1a;border-left:3px solid #8b1a1a;z-index:2;"></div>
      <div style="position:absolute;bottom:5px;right:5px;width:24px;height:24px;border-bottom:3px solid #8b1a1a;border-right:3px solid #8b1a1a;z-index:2;"></div>

      <div style="position:relative;z-index:1;padding:16px 24px 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:11px;color:#666;">स्थापना १९२८</span>
          <span style="font-size:13px;color:#8b1a1a;font-weight:bold;letter-spacing:1px;">|| श्री गजानन प्रसन्न ||</span>
          <span style="font-size:11px;color:#666;">नोंदणी क्र. ए-२२३६</span>
        </div>

        <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px;">
          <img src="${logoUrl}" alt="Lalbaug Logo" style="width:64px;height:64px;object-fit:contain;flex-shrink:0;border-radius:50%;" crossorigin="anonymous" />
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

        <div style="height:2px;background:linear-gradient(90deg,transparent 0%,#8b1a1a 20%,#c0a060 50%,#8b1a1a 80%,transparent 100%);margin:6px 0;opacity:0.6;"></div>

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

        <div style="display:flex;align-items:flex-end;gap:6px;padding:4px 4px 10px;font-size:14px;color:#111;border-bottom:1px dotted #aaa;">
          <span style="font-weight:bold;white-space:nowrap;flex-shrink:0;">श्री./श्रीमती</span>
          <span style="flex:1;font-weight:800;font-size:15px;color:#000;border-bottom:1px dotted #333;padding-bottom:2px;min-height:20px;display:block;">${customerName || ''}</span>
        </div>

        <div style="border-top:1px dotted #bbb;margin:0 0 8px;"></div>

        <div style="font-size:13.5px;color:#111;line-height:1.8;padding:0 4px 8px;">
          यांजकडून <strong>${productName || 'शतक महोत्सवी निधीकरिता'}</strong> देणगी रुपये
          <strong>${amountInWords} मात्र</strong> सादर पोहोचले.
        </div>

        <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#111;padding:0 4px 12px;">
          <span style="white-space:nowrap;">व्यवहार क्र. / UPI No. :</span>
          <div style="border:1.5px solid #777;padding:4px 18px;border-radius:4px;flex:1;font-family:monospace;font-size:12px;letter-spacing:0.5px;color:#222;min-height:22px;">${txnId || ''}</div>
        </div>
      </div>

      <div style="height:5px;margin:0 16px;background: repeating-linear-gradient(90deg, #8b1a1a 0, #8b1a1a 7px, transparent 7px, transparent 11px);opacity:0.3;"></div>

      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 28px 8px;position:relative;z-index:1;">
        <div style="border:2px solid #222;padding:6px 18px;border-radius:3px;display:inline-flex;align-items:baseline;gap:8px;">
          <span style="font-size:13px;font-weight:bold;color:#111;">रुपये</span>
          <span style="font-size:24px;font-weight:900;color:#000;letter-spacing:1px;">${marathiAmount}/-</span>
        </div>
        <div style="font-size:16px;font-weight:bold;color:#8b1a1a;">धन्यवाद!</div>
      </div>

      <div style="display:flex;justify-content:space-around;padding:6px 24px 16px;font-size:12px;color:#333;text-align:center;position:relative;z-index:1;">
        <div style="border-top:1px solid #555;padding-top:5px;min-width:90px;">अध्यक्ष</div>
        <div style="border-top:1px solid #555;padding-top:5px;min-width:90px;">सरचिटणीस</div>
        <div style="border-top:1px solid #555;padding-top:5px;min-width:90px;">खजिनदार</div>
        <div style="border-top:1px solid #555;padding-top:5px;min-width:90px;">प्राप्तकर्ता</div>
      </div>

      <div style="height:5px;margin:0 16px 12px;background: repeating-linear-gradient(90deg, #8b1a1a 0, #8b1a1a 7px, transparent 7px, transparent 11px);opacity:0.3;position:relative;z-index:1;"></div>
    </div>
  `;
}

export async function downloadMarathiReceipt({ receiptNo, customerName, amount, txnId, productName }) {
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700;900&display=swap" rel="stylesheet">
    ${buildMerchandiseReceiptHTML({ receiptNo, customerName, amount, txnId, productName })}
  `;
  document.body.appendChild(container);

  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 600));

  const target = container.querySelector("#marathi-receipt");
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#fffdf5",
    logging: false,
  });

  document.body.removeChild(container);

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


// ══════════════════════════════════════════════════════════════════════════════
// 2. OFFICIAL DONATION PĀVATĪ (MATCHING MANDAL PHYSICAL RECEIPT PDF 100%)
// ══════════════════════════════════════════════════════════════════════════════

function buildDonationReceiptHTML({
  donationNo,
  donorName,
  donorPhone,
  donorAddress,
  amount,
  txnId,
  paymentMode,
  bankRefNo,
  date,
}) {
  const cleanAmount = Math.round(Number(amount) || 0);
  const marathiAmount = toMarathiDigits(cleanAmount);
  const marathiWords = amountToMarathiWords(cleanAmount);
  const formattedDate = formatMarathiDate(date || new Date());
  const displayDonationNo = donationNo || "DON-20260825-001";
  const displayTxnId = txnId || donationNo || "—";
  const displayPaymentMode = paymentMode || "CCAvenue Online / UPI";
  const displayBank = bankRefNo || "Online Gateway";

  return `
    <div id="donation-receipt-canvas" style="
      width: 1080px;
      min-height: 680px;
      background: #fbfbf9;
      font-family: 'Noto Sans Devanagari', 'Mangal', 'Segoe UI', Arial, sans-serif;
      position: relative;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
    ">

      <!-- ── Outer Soft Card Container with Rounded Border ── -->
      <div style="
        width: 100%;
        background: #ffffff;
        border: 1.5px solid #dcdcdc;
        border-radius: 20px;
        box-shadow: 0 12px 36px rgba(0,0,0,0.08);
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        gap: 14px;
      ">

        <!-- ── Left Artwork Banner ── -->
        <div style="
          width: 245px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 30%, #fed7aa 70%, #fdba74 100%);
          border: 2px solid #ea580c;
          border-radius: 14px;
          padding: 18px 12px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-align: center;
          position: relative;
          box-sizing: border-box;
        ">
          <!-- Top Sunburst Ornament: विश्वविक्रमी मुंबईचा राजा -->
          <div style="
            width: 88px; height: 88px; border-radius: 50%;
            background: radial-gradient(circle, #b91c1c 0%, #7f1d1d 100%);
            color: #ffffff;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(185,28,28,0.35);
            border: 3px solid #fde047;
            position: relative;
          ">
            <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: #fef08a;">विश्वविक्रमी</span>
            <span style="font-size: 13.5px; font-weight: 900; color: #ffffff; margin-top: 1px;">मुंबईचा राजा</span>
          </div>

          <!-- Middle Calligraphy: वारी चुकायाची नाही! -->
          <div style="margin: 18px 0; text-align: center;">
            <div style="
              font-size: 34px; font-weight: 900; color: #166534;
              line-height: 1.15; letter-spacing: -0.5px;
              text-shadow: 1px 1px 0px #fff;
            ">
              वारी<br/>चुकायाची<br/>नाही!
            </div>
            <!-- Lotus Motif -->
            <div style="font-size: 28px; margin-top: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
              🪷
            </div>
          </div>

          <!-- Bottom: Warkari Procession Banner -->
          <div style="
            width: 100%; padding: 8px 6px;
            background: rgba(255,255,255,0.85);
            border-radius: 10px; border: 1.5px dashed #ea580c;
            font-size: 11px; font-weight: 800; color: #c2410c;
            letter-spacing: 0.2px;
          ">
            🚩 वारकरी पालखी सोहळा 🚩
          </div>
        </div>

        <!-- ── Center Main Receipt Section ── -->
        <div style="
          flex: 1;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        ">
          <div>
            <!-- Top Meta Line: Estd & Reg -->
            <div style="display:flex; justify-content:space-between; align-items:center; font-size: 12px; color: #334155; font-weight: 700; margin-bottom: 2px;">
              <span>स्थापना १९२८</span>
              <span style="font-size: 15px; font-weight: 900; color: #991b1b;">॥ श्री ॥</span>
              <span>नोंदणी क्र. ए ७२३६</span>
            </div>

            <!-- Mandal Title Header -->
            <div style="text-align: center; margin-top: 2px;">
              <h1 style="
                margin: 0; font-size: 25px; font-weight: 900; color: #991b1b;
                letter-spacing: -0.3px; line-height: 1.2;
              ">
                लालबाग सार्वजनिक उत्सव मंडळ,गणेशगल्ली
              </h1>
              <p style="margin: 2px 0 0; font-size: 13px; font-weight: 700; color: #334155;">
                लालबाग, मुंबई ४०००१२.
              </p>
              <p style="
                margin: 4px 0 0; font-size: 22px; font-weight: 900; color: #991b1b;
                letter-spacing: 1px;
              ">
                ॥ मुंबईचा राजा ॥
              </p>
            </div>

            <!-- Header Divider -->
            <div style="height: 1.5px; background: #cbd5e1; margin: 8px 0 10px;"></div>

            <!-- Form Row 1: Pavati No & Date -->
            <div style="display:flex; justify-content:space-between; align-items:center; font-size: 14px; margin-bottom: 9px;">
              <div style="display:flex; align-items:center; gap: 6px;">
                <span style="font-weight: 700; color: #0f172a;">पावती क्र. :</span>
                <span style="font-family: monospace; font-size: 16px; font-weight: 900; color: #991b1b; letter-spacing: 0.5px;">${displayDonationNo}</span>
              </div>
              <div style="display:flex; align-items:center; gap: 6px;">
                <span style="font-weight: 700; color: #0f172a;">दिनांक :</span>
                <span style="font-weight: 800; font-size: 14.5px; color: #0f172a;">${formattedDate}</span>
              </div>
            </div>

            <!-- Form Row 2: Devotee Name -->
            <div style="display:flex; align-items:flex-end; font-size: 14px; margin-bottom: 9px;">
              <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-right: 6px;">श्री. / श्रीमती</span>
              <div style="
                flex: 1; border-bottom: 1.5px dotted #334155;
                padding: 0 8px 2px; font-weight: 800; font-size: 15px; color: #0f172a;
              ">
                ${donorName || "देणगीदार"}
              </div>
              <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-left: 6px;">यांजकडून</span>
            </div>

            <!-- Form Row 3: Address -->
            <div style="display:flex; align-items:flex-end; font-size: 14px; margin-bottom: 9px;">
              <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-right: 6px;">पत्ता</span>
              <div style="
                flex: 1; border-bottom: 1.5px dotted #334155;
                padding: 0 8px 2px; font-weight: 600; font-size: 13.5px; color: #1e293b;
              ">
                ${donorAddress || "मुंबई"}
              </div>
            </div>

            <!-- Form Row 4: Phone & Unique Txn ID -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size: 13.5px; margin-bottom: 11px;">
              <div style="display:flex; align-items:flex-end; flex: 1; margin-right: 14px;">
                <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-right: 6px;">मोबाईल</span>
                <div style="flex: 1; border-bottom: 1.5px dotted #334155; padding: 0 8px 2px; font-weight: 800; font-family: monospace;">
                  +91 ${donorPhone || "—"}
                </div>
              </div>
              <div style="display:flex; align-items:flex-end; flex: 1.2;">
                <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-right: 6px;">युनिक आय डी क्र.</span>
                <div style="flex: 1; border-bottom: 1.5px dotted #334155; padding: 0 8px 2px; font-weight: 700; font-family: monospace; font-size: 12px; color: #1e293b;">
                  ${displayTxnId}
                </div>
              </div>
            </div>

            <!-- ── 4-Column Table ── -->
            <table style="
              width: 100%; border-collapse: collapse; text-align: center;
              font-size: 13px; margin-bottom: 10px; border: 2px solid #991b1b;
            ">
              <thead>
                <tr style="background: #991b1b; color: #ffffff;">
                  <th colspan="2" style="border: 1px solid #7f1d1d; padding: 5px; font-weight: 800; width: 25%;">वर्गणी</th>
                  <th colspan="2" style="border: 1px solid #7f1d1d; padding: 5px; font-weight: 800; width: 25%;">देणगी</th>
                  <th colspan="2" style="border: 1px solid #7f1d1d; padding: 5px; font-weight: 800; width: 25%;">जाहिरात</th>
                  <th colspan="2" style="border: 1px solid #7f1d1d; padding: 5px; font-weight: 800; width: 25%;">एकूण</th>
                </tr>
                <tr style="background: #fef2f2; color: #991b1b; font-size: 11.5px; font-weight: 700;">
                  <th style="border: 1px solid #991b1b; padding: 3px;">रु.</th>
                  <th style="border: 1px solid #991b1b; padding: 3px;">पै.</th>
                  <th style="border: 1px solid #991b1b; padding: 3px;">रु.</th>
                  <th style="border: 1px solid #991b1b; padding: 3px;">पै.</th>
                  <th style="border: 1px solid #991b1b; padding: 3px;">रु.</th>
                  <th style="border: 1px solid #991b1b; padding: 3px;">पै.</th>
                  <th style="border: 1px solid #991b1b; padding: 3px;">रु.</th>
                  <th style="border: 1px solid #991b1b; padding: 3px;">पै.</th>
                </tr>
              </thead>
              <tbody>
                <tr style="height: 36px; font-size: 15px; font-weight: 800; color: #0f172a;">
                  <td style="border: 1px solid #991b1b;">—</td>
                  <td style="border: 1px solid #991b1b;">—</td>
                  <td style="border: 1px solid #991b1b; color: #991b1b; font-size: 17px;">${marathiAmount}</td>
                  <td style="border: 1px solid #991b1b; color: #991b1b;">००</td>
                  <td style="border: 1px solid #991b1b;">—</td>
                  <td style="border: 1px solid #991b1b;">—</td>
                  <td style="border: 1px solid #991b1b; color: #991b1b; font-size: 18px;">${marathiAmount}</td>
                  <td style="border: 1px solid #991b1b; color: #991b1b;">००</td>
                </tr>
              </tbody>
            </table>

            <!-- Form Row 5: Amount in Words -->
            <div style="display:flex; align-items:flex-end; font-size: 14px; margin-bottom: 9px;">
              <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-right: 6px;">अक्षरी रुपये</span>
              <div style="
                flex: 1; border-bottom: 1.5px dotted #334155;
                padding: 0 8px 2px; font-weight: 800; font-size: 14.5px; color: #991b1b;
              ">
                ${marathiWords} रुपये फक्त
              </div>
              <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-left: 6px;">साभार मिळाले.</span>
            </div>

            <!-- Form Row 6: Mode & Bank -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size: 13px; margin-bottom: 10px;">
              <div style="display:flex; align-items:flex-end; flex: 1; margin-right: 14px;">
                <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-right: 6px;">धनादेश / UPI</span>
                <div style="flex: 1; border-bottom: 1.5px dotted #334155; padding: 0 8px 2px; font-weight: 700; color: #1e293b;">
                  ${displayPaymentMode}
                </div>
              </div>
              <div style="display:flex; align-items:flex-end; flex: 1;">
                <span style="font-weight: 700; color: #0f172a; white-space: nowrap; margin-right: 6px;">बँक</span>
                <div style="flex: 1; border-bottom: 1.5px dotted #334155; padding: 0 8px 2px; font-weight: 700; color: #1e293b;">
                  ${displayBank}
                </div>
              </div>
            </div>
          </div>

          <!-- ── Signatures & Footer Row ── -->
          <div>
            <div style="
              display:flex; justify-content:space-between; text-align:center;
              font-size: 11.5px; font-weight: 700; color: #0f172a; padding: 8px 0 4px;
              border-top: 1px solid #cbd5e1;
            ">
              <div>
                <p style="margin: 0; font-weight: 800;">श्री. किरण प्र. तावडे</p>
                <p style="margin: 2px 0 0; font-size: 10.5px; color: #64748b;">अध्यक्ष</p>
              </div>
              <div>
                <p style="margin: 0; font-weight: 800;">श्री. स्वप्निल सु. परब</p>
                <p style="margin: 2px 0 0; font-size: 10.5px; color: #64748b;">सरचिटणीस</p>
              </div>
              <div>
                <p style="margin: 0; font-weight: 800;">श्री. नितेश का. महाडेश्वर</p>
                <p style="margin: 2px 0 0; font-size: 10.5px; color: #64748b;">खजिनदार</p>
              </div>
              <div>
                <p style="margin: 0; font-weight: 800; color: #15803d;">✓ संगणकीय अधिकृत पावती</p>
                <p style="margin: 2px 0 0; font-size: 10.5px; color: #64748b;">प्राप्तकर्ता</p>
              </div>
            </div>

            <!-- Mandatory Footer Note -->
            <div style="
              text-align: center; font-size: 11px; font-weight: 800;
              color: #0f172a; padding-top: 5px; border-top: 1px solid #cbd5e1;
            ">
              टीप : मंडळाच्या विविध उपक्रमांचा लाभ घेण्यासाठी पावती दाखवणे आवश्यक आहे.
            </div>
          </div>

        </div>

        <!-- ── Right Artwork Section (Centenary Year 98 & QR) ── -->
        <div style="
          width: 185px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 45%, #fde68a 100%);
          border: 2px solid #d97706;
          border-radius: 14px;
          padding: 16px 10px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-align: center;
          box-sizing: border-box;
        ">
          <!-- 98 Centennial Emblem Logo -->
          <div>
            <div style="
              width: 66px; height: 66px; border-radius: 50%;
              background: radial-gradient(circle, #991b1b 0%, #7f1d1d 100%);
              color: #fde047; margin: 0 auto 6px;
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              font-size: 22px; font-weight: 900; border: 2.5px solid #fbbf24;
              box-shadow: 0 4px 10px rgba(153,27,27,0.3);
            ">
              <span>९८</span>
            </div>
            <div style="font-size: 17px; font-weight: 900; color: #991b1b; line-height: 1.15;">
              शतक<br/>महोत्सवी
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 2px;">
              वर्षाकडे वाटचाल
            </div>
          </div>

          <!-- Red Pill Badge: गणेशोत्सव २०२६ -->
          <div style="
            background: #b91c1c; color: #ffffff;
            padding: 4px 12px; border-radius: 99px;
            font-size: 11.5px; font-weight: 900; letter-spacing: 0.5px;
            margin: 6px 0;
            box-shadow: 0 2px 6px rgba(185,28,28,0.25);
          ">
            गणेशोत्सव २०२६
          </div>

          <!-- QR Code and Link Info -->
          <div>
            <p style="margin: 0 0 5px; font-size: 11px; font-weight: 800; color: #0f172a;">
              अधिक माहितीकरिता
            </p>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://mumbaicharaja.co"
              alt="Mandal QR Code"
              style="width: 86px; height: 86px; border-radius: 8px; border: 1.5px solid #d97706; background: #fff; padding: 2px;"
              crossorigin="anonymous"
            />
          </div>
        </div>

      </div>

    </div>
  `;
}

/**
 * Downloads official Donation Pāvatī PDF with the exact name: <DonationNo>.pdf
 */
export async function downloadDonationReceipt({
  donationNo,
  donorName,
  donorPhone,
  donorAddress,
  amount,
  txnId,
  paymentMode,
  bankRefNo,
  date,
}) {
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
  container.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    ${buildDonationReceiptHTML({
      donationNo,
      donorName,
      donorPhone,
      donorAddress,
      amount,
      txnId,
      paymentMode,
      bankRefNo,
      date,
    })}
  `;
  document.body.appendChild(container);

  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 600));

  const target = container.querySelector("#donation-receipt-canvas");
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL("image/png");
  const pxW = canvas.width / 2;
  const pxH = canvas.height / 2;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [pxW, pxH],
  });
  pdf.addImage(imgData, "PNG", 0, 0, pxW, pxH);

  // Exact requested file name: DON-YYYYMMDD-005.pdf
  const filename = donationNo ? `${donationNo}.pdf` : `DON-${Date.now()}.pdf`;
  pdf.save(filename);
}
