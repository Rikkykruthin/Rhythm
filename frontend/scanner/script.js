(() => {
  const cfg = window.JAM_CONFIG;

  const pinCard = document.getElementById("pin-card");
  const scanCard = document.getElementById("scan-card");
  const status = document.getElementById("status");

  let scanner = null;
  let busy = false;

  // 🔊 Beep
  const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

  // =========================
  // 🔐 PIN LOGIN
  // =========================
  document.getElementById("pin-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const v = document.getElementById("pin").value.trim();

    if (v !== cfg.ADMIN_PIN) {
      alert("❌ Incorrect PIN");
      return;
    }

    pinCard.classList.add("hidden");
    scanCard.classList.remove("hidden");

    startScanner();
  });

  // =========================
  // 🔁 SCAN NEXT
  // =========================
  document.getElementById("rescan").addEventListener("click", async () => {
    busy = false;
    setStatus("warn", "Ready", "Scan next ticket");

    if (scanner) {
      try {
        await scanner.resume();
      } catch (_) {
        // If resume fails, restart fully
        try { await scanner.stop(); } catch (_) {}
        scanner = null;
        startScanner();
      }
    }
  });

  // =========================
  // 🎨 STATUS UI
  // =========================
  function setStatus(kind, text, sub = "") {
    status.className = `status ${kind}`;
    status.innerHTML = `<h2>${text}</h2>${sub ? `<p>${sub}</p>` : ""}`;

    document.body.classList.remove("flash-ok", "flash-bad");
    if (kind === "ok") document.body.classList.add("flash-ok");
    if (kind === "bad") document.body.classList.add("flash-bad");
  }

  // =========================
  // 🧠 EXTRACT TICKET ID
  // =========================
  function extractTicketId(decoded) {
    try {
      const obj = JSON.parse(decoded);
      if (obj.ticket_id) return obj.ticket_id;
    } catch (_) {}

    try {
      const url = new URL(decoded);
      const tid = url.searchParams.get("tid");
      if (tid) return tid;
    } catch (_) {}

    const m = decoded.match(/LJ-[A-Z0-9]+/i);
    return m ? m[0].toUpperCase() : decoded.trim();
  }

  // =========================
  // 📷 START SCANNER — Android-safe
  // =========================
  async function startScanner() {
    setStatus("warn", "Starting camera...", "");

    // Always destroy old instance before creating new one
    if (scanner) {
      try { await scanner.stop(); } catch (_) {}
      scanner = null;
    }

    // Clear the reader div completely (Android needs this)
    const readerEl = document.getElementById("reader");
    readerEl.innerHTML = "";

    try {
      scanner = new Html5Qrcode("reader");

      // Use .start() directly — this is the correct method for mobile
      // render() is for the UI widget, start() is for programmatic use
      await scanner.start(
        { facingMode: "environment" },  // rear camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScan,       // success callback
        () => {}      // error callback (silent — fires constantly while scanning)
      );

      setStatus("ok", "Camera Ready", "Point at QR code");

    } catch (err) {
      console.error("Camera start error:", err);

      // Android sometimes needs a short delay before retrying
      // This handles the "Camera already in use" race condition
      if (err && err.toString().includes("Camera")) {
        setStatus("warn", "Retrying camera...", "");
        setTimeout(() => startScanner(), 1500);
        return;
      }

      setStatus("bad", "Camera Failed", "Reload page & allow camera");
    }
  }

  // =========================
  // 🎯 ON SCAN
  // =========================
  async function onScan(decoded) {
    if (busy) return;
    busy = true;

    beep.play().catch(() => {});

    const tid = extractTicketId(decoded);
    setStatus("warn", "Checking...", tid);

    // Pause scanner immediately to prevent duplicate scans
    try { await scanner.pause(true); } catch (_) {}

    try {
      const res = await fetch(`${cfg.BACKEND_URL}/scan-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: tid, pin: cfg.ADMIN_PIN }),
      });

      const data = await res.json();

      if (!data.found) {
        setStatus("bad", "INVALID", "Ticket not found");
      } else if (data.previous_status === "used") {
        setStatus("warn", "ALREADY USED", `${data.name} · ${data.qty} pax`);
      } else if (data.previous_status === "cancelled") {
        setStatus("bad", "CANCELLED", data.name);
      } else if (data.previous_status === "paid") {
        setStatus("ok", "✓ VALID", `${data.name} · ${data.qty} pax`);
      } else {
        setStatus("bad", "INVALID", `Status: ${data.previous_status}`);
      }

    } catch (err) {
      console.error(err);
      setStatus("bad", "ERROR", "Network error — check connection");
    }

    // Allow next scan after 3 seconds
    setTimeout(() => {
      busy = false;
    }, 3000);
  }
})();