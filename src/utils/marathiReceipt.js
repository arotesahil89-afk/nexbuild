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
  templateSrc,
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
  const cleanAmount = Math.round(Number(String(amount || 0).replace(/,/g, "")) || 0);
  const marathiAmount = toMarathiDigits(cleanAmount.toLocaleString("en-IN"));
  const marathiWords = amountToMarathiWords(cleanAmount);
  const formattedDate = formatMarathiDate(date || new Date());
  const displayDonationNo = donationNo || `DON-${Date.now()}`;
  const displayTxnId = txnId || donationNo || "—";
  const displayPaymentMode = paymentMode || "CCAvenue Online / UPI";
  const displayBank = bankRefNo || "Online Gateway";

  return `
    <div id="donation-receipt-canvas" style="
      width: 1684px;
      height: 1191px;
      position: relative;
      background: #ffffff;
      font-family: 'Noto Sans Devanagari', 'Mangal', 'Segoe UI', Arial, sans-serif;
      box-sizing: border-box;
      overflow: hidden;
    ">
      <!-- Master Template Background Image -->
      <img
        src="${templateSrc}"
        alt="Receipt Template"
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 1684px;
          height: 1191px;
          z-index: 0;
          pointer-events: none;
          display: block;
        "
        crossorigin="anonymous"
      />

      <!-- Dynamic Overlay Fields -->
      <div style="position: absolute; inset: 0; z-index: 1; pointer-events: none;">
        <!-- 1. पावती क्र. -->
        <div style="
          position: absolute;
          left: 680px;
          top: 486px;
          width: 380px;
          height: 34px;
          display: flex;
          align-items: center;
          font-size: 21px;
          font-weight: 800;
          font-family: 'Noto Sans Devanagari', monospace, sans-serif;
          color: #991b1b;
          letter-spacing: 0.5px;
          line-height: 1.2;
          overflow: visible;
        ">${displayDonationNo}</div>

        <!-- 2. दिनांक -->
        <div style="
          position: absolute;
          left: 1185px;
          top: 486px;
          width: 115px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          overflow: visible;
        ">${formattedDate}</div>

        <!-- 3. श्री. / श्रीमती ... यांजकडून -->
        <div style="
          position: absolute;
          left: 755px;
          top: 542px;
          width: 420px;
          height: 34px;
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          white-space: nowrap;
          line-height: 1.2;
          overflow: visible;
        ">${donorName || "देणगीदार"}</div>

        <!-- 4. पत्ता -->
        <div style="
          position: absolute;
          left: 655px;
          top: 594px;
          width: 635px;
          height: 32px;
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          line-height: 1.2;
          overflow: visible;
        ">${donorAddress || "—"}</div>

        <!-- 5. मोबाईल -->
        <div style="
          position: absolute;
          left: 675px;
          top: 638px;
          width: 235px;
          height: 32px;
          display: flex;
          align-items: center;
          font-size: 19px;
          font-weight: 700;
          color: #0f172a;
          font-family: monospace, sans-serif;
          letter-spacing: 0.5px;
          line-height: 1.2;
          overflow: visible;
        ">+91 ${donorPhone || "—"}</div>

        <!-- 6. आय डी क्र. -->
        <div style="
          position: absolute;
          left: 1135px;
          top: 638px;
          width: 155px;
          height: 32px;
          display: flex;
          align-items: center;
          font-size: 14.5px;
          font-weight: 700;
          color: #1e293b;
          font-family: monospace, sans-serif;
          white-space: nowrap;
          line-height: 1.2;
          overflow: visible;
        ">${displayTxnId}</div>

        <!-- 7. वर्गणी / देणगी / जाहिरात / एकूण Table Values -->
        <!-- वर्गणी (रु. पै.) -->
        <div style="
          position: absolute;
          left: 579px;
          top: 763px;
          width: 132px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #64748b;
          line-height: 1.2;
          overflow: visible;
        ">—</div>
        <div style="
          position: absolute;
          left: 711px;
          top: 763px;
          width: 44px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #64748b;
          line-height: 1.2;
          overflow: visible;
        ">—</div>

        <!-- देणगी (रु. पै.) -->
        <div style="
          position: absolute;
          left: 756px;
          top: 763px;
          width: 132px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          font-weight: 800;
          color: #991b1b;
          line-height: 1.2;
          overflow: visible;
        ">${marathiAmount}/-</div>
        <div style="
          position: absolute;
          left: 888px;
          top: 763px;
          width: 45px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 800;
          color: #991b1b;
          line-height: 1.2;
          overflow: visible;
        ">००</div>

        <!-- जाहिरात (रु. पै.) -->
        <div style="
          position: absolute;
          left: 933px;
          top: 763px;
          width: 132px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #64748b;
          line-height: 1.2;
          overflow: visible;
        ">—</div>
        <div style="
          position: absolute;
          left: 1065px;
          top: 763px;
          width: 45px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #64748b;
          line-height: 1.2;
          overflow: visible;
        ">—</div>

        <!-- एकूण (रु. पै.) -->
        <div style="
          position: absolute;
          left: 1110px;
          top: 763px;
          width: 132px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 900;
          color: #991b1b;
          line-height: 1.2;
          overflow: visible;
        ">${marathiAmount}/-</div>
        <div style="
          position: absolute;
          left: 1242px;
          top: 763px;
          width: 45px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 800;
          color: #991b1b;
          line-height: 1.2;
          overflow: visible;
        ">००</div>

        <!-- 8. अक्षरी रुपये ... साभार मिळाले. -->
        <div style="
          position: absolute;
          left: 725px;
          top: 800px;
          width: 420px;
          height: 34px;
          display: flex;
          align-items: center;
          font-size: 19px;
          font-weight: 800;
          color: #991b1b;
          white-space: nowrap;
          line-height: 1.2;
          overflow: visible;
        ">${marathiWords} रुपये फक्त</div>

        <!-- 9. धनादेश / UPI -->
        <div style="
          position: absolute;
          left: 755px;
          top: 854px;
          width: 260px;
          height: 34px;
          display: flex;
          align-items: center;
          font-size: 16.5px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          line-height: 1.2;
          overflow: visible;
        ">${displayPaymentMode}</div>

        <!-- 10. बँक -->
        <div style="
          position: absolute;
          left: 1135px;
          top: 854px;
          width: 155px;
          height: 34px;
          display: flex;
          align-items: center;
          font-size: 16.5px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          line-height: 1.2;
          overflow: visible;
        ">${displayBank}</div>

        <!-- 11. प्राप्तकर्ता (Digital Confirmation Seal) -->
        <div style="
          position: absolute;
          left: 1180px;
          top: 910px;
          width: 130px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          color: #15803d;
          letter-spacing: 0.3px;
          line-height: 1.2;
          overflow: visible;
        ">✓ संगणकीय पावती</div>
      </div>
    </div>
  `;
}

/** Preload template image as Data URL or verified image URL */
async function getReceiptTemplateDataUrl() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/images/donation_receipt_template.png`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Fallback if fetch fails
  }
  return url;
}

/**
 * Downloads official Donation Pāvatī PDF with the exact name: <DonationNo>.pdf
 * Perfectly matches physical receipt format master PDF
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
  email,
  donorEmail,
}) {
  try {
    const templateSrc = await getReceiptTemplateDataUrl();

    const container = document.createElement("div");
    container.style.cssText = "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
    container.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      ${buildDonationReceiptHTML({
        templateSrc,
        donationNo,
        donorName,
        donorPhone,
        donorAddress,
        amount,
        txnId,
        paymentMode,
        bankRefNo,
        date,
        email: email || donorEmail,
      })}
    `;
    document.body.appendChild(container);

    // Ensure fonts and template image are loaded
    await document.fonts.ready;
    const templateImgEl = container.querySelector("img");
    if (templateImgEl && !templateImgEl.complete) {
      await new Promise((resolve) => {
        templateImgEl.onload = resolve;
        templateImgEl.onerror = resolve;
        setTimeout(resolve, 800);
      });
    }
    await new Promise((r) => setTimeout(r, 200));

    const target = container.querySelector("#donation-receipt-canvas");
    const canvas = await html2canvas(target, {
      scale: 1, // Already high-res (1684 x 1191 px)
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL("image/png");

    // Output as standard A4 landscape matching the master template
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [841.89, 595.28],
    });
    pdf.addImage(imgData, "PNG", 0, 0, 841.89, 595.28, undefined, "FAST");

    // Exact requested file name: DON-YYYYMMDD-005.pdf
    const filename = donationNo ? `${donationNo}.pdf` : `DON-${Date.now()}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error("[Donation Receipt Generation Error]:", err);
    throw err;
  }
}
