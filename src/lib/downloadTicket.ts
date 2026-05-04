import QRCode from "qrcode";

interface TicketData {
  ticket_id: string;
  name: string;
  qty: number;
  total_amount: number;
  created_at: string;
  scanned?: boolean;
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
}

/** Draw rounded rectangle helper */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function downloadTicketAsPDF(ticket: TicketData, user: UserData) {
  const W = 1000;
  const H = 400;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ─── 1. LOAD BACKGROUND ──────────────────────────────────────────
  const bgImg = new Image();
  await new Promise<void>((res) => {
    bgImg.onload = () => res();
    bgImg.src = "/concert_bg.png";
  });

  ctx.save();
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.clip();
  ctx.drawImage(bgImg, 0, 0, W, H);
  ctx.fillStyle = "rgba(0,0,0,0.4)"; // Darken for readability
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // ─── 2. MAIN BRANDING (Centered Section) ───────────────────────
  const MAIN_X = (W - 260) / 2; // Middle of the left section
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  
  // Header Branding
  ctx.font = "bold 14px sans-serif";
  ctx.letterSpacing = "6px";
  ctx.globalAlpha = 0.6;
  ctx.fillText("ONE NIGHT. ONE BEAT.", MAIN_X, 85);
  ctx.globalAlpha = 1.0;

  ctx.font = "900 82px sans-serif";
  ctx.letterSpacing = "-3px";
  ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
  ctx.shadowBlur = 20;
  ctx.fillText("JAMNIGHTS.", MAIN_X, 160);
  ctx.shadowBlur = 0;
  ctx.letterSpacing = "0px";

  // ─── 3. GUEST NAME (Centerpiece) ────────────────────────────────
  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = "#f59e0b";
  ctx.letterSpacing = "4px";
  ctx.fillText("OFFICIAL PASS HOLDER", MAIN_X, 220);

  ctx.font = "bold 38px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(ticket.name.toUpperCase(), MAIN_X, 265);

  // ─── 4. DATA GRID (Main Info) ───────────────────────────────────
  const info = [
    { label: "QUANTITY", val: `${ticket.qty} ENTRANCE` },
    { label: "TOTAL PAID", val: `₹ ${(ticket.total_amount / 100).toLocaleString("en-IN")}` },
    { label: "VENUE", val: "BAATKHAANA" },
    { label: "TIME", val: "6:00 PM" }
  ];

  const colW = 150;
  const startX = MAIN_X - (colW * 1.5);
  
  info.forEach((item, i) => {
    const ix = startX + (i * colW);
    const iy = H - 60;
    
    // Label
    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.letterSpacing = "1.5px";
    ctx.fillText(item.label, ix, iy - 10);
    
    // Value
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.letterSpacing = "0px";
    ctx.fillText(item.val, ix, iy + 15);
  });

  // ─── 5. THE STUB (Right Section) ────────────────────────────────
  const STUB_CENTER = W - 130;
  
  // Separator Line
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W - 260, 40);
  ctx.lineTo(W - 260, H - 40);
  ctx.stroke();

  // QR Code
  const QR_SIZE = 140;
  const QR_X = STUB_CENTER - (QR_SIZE / 2);
  const QR_Y = 60;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, QR_X - 6, QR_Y - 6, QR_SIZE + 12, QR_SIZE + 12, 12);
  ctx.fill();

  try {
    const qrDataURL = await QRCode.toDataURL(ticket.ticket_id, {
      width: QR_SIZE,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });
    const qrImg = new Image();
    await new Promise<void>((res, rej) => {
      qrImg.onload = () => res();
      qrImg.onerror = rej;
      qrImg.src = qrDataURL;
    });
    ctx.drawImage(qrImg, QR_X, QR_Y, QR_SIZE, QR_SIZE);
  } catch (e) { console.error(e); }

  // Stub Text
  ctx.textAlign = "center";
  ctx.font = "bold 12px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.letterSpacing = "2px";
  ctx.fillText("MAY 23, 2026", STUB_CENTER, H - 100);
  
  ctx.font = "900 32px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.letterSpacing = "-1px";
  ctx.fillText("JAMNIGHTS", STUB_CENTER, H - 60);

  // ─── 6. FINAL EXPORT ────────────────────────────────────────────
  const imgData = canvas.toDataURL("image/png", 1.0);
  const link = document.createElement("a");
  link.download = `JamNights_Official_Ticket_${ticket.ticket_id.substring(0,8)}.png`;
  link.href = imgData;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
