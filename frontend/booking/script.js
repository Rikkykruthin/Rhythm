(() => {
  const cfg = window.JAM_CONFIG;
  const ev = cfg.EVENT;

  // Populate event meta
  document.getElementById("ev-date").textContent = ev.date;
  document.getElementById("ev-time").textContent = ev.time;
  const venue = document.getElementById("ev-venue");
  venue.textContent = ev.venue;
  venue.href = ev.mapsUrl;
  document.getElementById("ev-price").textContent = `₹${ev.price}`;

  const formCard = document.getElementById("form-card");
  const ticketCard = document.getElementById("ticket-card");
  const form = document.getElementById("book-form");
  const totalEl = document.getElementById("total-amt");
  const qtyInput = form.querySelector('input[name="qty"]');
  totalEl.textContent = `₹${(1 * ev.price * 1.0236).toFixed(2)}`;

  document.getElementById("open-book").addEventListener("click", () => {
    formCard.classList.remove("hidden");
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Quantity stepper
  form.querySelectorAll(".qty button").forEach((b) => {
    b.addEventListener("click", () => {
      const delta = parseInt(b.dataset.q, 10);
      let v = parseInt(qtyInput.value, 10) + delta;
      v = Math.max(1, Math.min(10, v));
      qtyInput.value = v;
      totalEl.textContent = `₹${(v * ev.price * 1.0236).toFixed(2)}`;
    });
  });

  // Submit -> create order -> Razorpay UPI -> verify -> ticket
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("pay-btn");
    const data = Object.fromEntries(new FormData(form));
    data.qty = parseInt(data.qty, 10);

    if (!/^[0-9]{10}$/.test(data.phone)) return alert("Enter a valid 10-digit phone");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return alert("Enter a valid email");

    btn.disabled = true;
    btn.querySelector("span").textContent = "Creating order...";

    try {
      const orderRes = await fetch(`${cfg.BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          qty: data.qty,
          amount: Math.round(data.qty * ev.price * 1.0236 * 100), // paise
        }),
      });
      if (!orderRes.ok) {
        const errData = await orderRes.json();

        if (errData.error && errData.error.includes("Sold Out")) {
          alert(" Tickets Sold Out");
          btn.disabled = true;
          btn.querySelector("span").textContent = "Sold Out";
          return;
        }

        throw new Error(errData.error || "Order creation failed");
      }
      const order = await orderRes.json();
      btn.querySelector("span").textContent = "Pay & Book";

      const rzp = new Razorpay({
        key: cfg.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.id,
        name: "Jam Nights",
        description: `${data.qty} ticket(s)`,
        prefill: { name: data.name, email: data.email, contact: data.phone },
        theme: { color: "#f4c34a", backdrop_color: "#06070f" },
        // UPI ONLY
        method: { 
          upi: true,
          card: true
        },
        
        handler: async (resp) => {
          btn.disabled = true;
          btn.querySelector("span").textContent = "Verifying...";
          try {
            const verifyRes = await fetch(`${cfg.BACKEND_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                booking: {
                  name: data.name,
                  phone: data.phone,
                  email: data.email,
                  qty: data.qty,
                  total_amount: Math.round(data.qty * ev.price * 1.0236), // rupees as integer
                },
              }),
            });
            
            console.log("Verify response status:", verifyRes.status);
            const v = await verifyRes.json();
            console.log("Verify response data:", v);
            
            if (!verifyRes.ok) {
              console.error("Verification failed:", v);
              throw new Error(v.error || "Verification failed");
            }
            if (!v.ok) {
              console.error("Verification not ok:", v);
              throw new Error(v.error || "Verification failed");
            }
            showTicket({
              name: data.name,
              phone: data.phone,
              qty: data.qty,
              total: parseFloat((data.qty * ev.price * 1.0236).toFixed(2)),
              ticket_id: v.ticket_id,
            });
          } catch (err) {
            console.error("Payment verification error:", err);
            console.error("Error details:", err.message, err.stack);
            alert(`Payment verification failed: ${err.message}\n\nPlease contact support with your payment details.`);
            btn.disabled = false;
            btn.querySelector("span").textContent = "Pay & Book";
          }
        },
        modal: {
          ondismiss: () => {
            btn.disabled = false;
            btn.querySelector("span").textContent = "Pay & Book";
          },
        },
      });
      rzp.on("payment.failed", () => {
        alert("Payment failed. Please try again.");
        btn.disabled = false;
        btn.querySelector("span").textContent = "Pay & Book";
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Could not start payment. Check your connection.");
      btn.disabled = false;
      btn.querySelector("span").textContent = "Pay & Book";
    }
  });

  function showTicket({ name, phone, qty, total, ticket_id }){
    console.log("=== SHOWING TICKET ===");
    console.log("Data:", { name, phone, qty, total, ticket_id });
    
    document.getElementById("t-name").textContent = name;
    document.getElementById("t-qty").textContent = qty;
    document.getElementById("t-total").textContent = `₹${total}`;
    document.getElementById("t-id").textContent = ticket_id;

    const qrEl = document.getElementById("qr");
    qrEl.innerHTML = "Generating QR code...";
    
    const qrPayload = {
      ticket_id: ticket_id,
      name: name,
      phone: phone || "N/A",
      qty: qty
    };
    
    console.log("QR Payload:", qrPayload);
    console.log("QR Payload JSON:", JSON.stringify(qrPayload));
    
    // Function to generate QR with retry
    function generateQR(retries = 0) {
      console.log("Attempting to generate QR, attempt:", retries + 1);
      console.log("QRCode type:", typeof QRCode);
      
      // Check if QRCode library is loaded
      if (typeof QRCode === 'undefined') {
        if (retries < 5) {
          console.log("QRCode not ready, retrying in 200ms...");
          setTimeout(() => generateQR(retries + 1), 200);
          return;
        }
        console.error("QRCode library not loaded after 5 retries!");
        qrEl.innerHTML = '<p style="color:#ff9a9a;padding:20px;font-size:14px;">QR Code library failed to load.<br>Your ticket ID: <strong>' + ticket_id + '</strong></p>';
        return;
      }
      
      console.log("Generating QR code...");
      try {
        qrEl.innerHTML = "";
        // Using QRCode.js library
        new QRCode(qrEl, {
          text: JSON.stringify(qrPayload),
          width: 176,
          height: 176,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
        console.log("✅ QR code generated successfully!");
      } catch (err) {
        console.error("QR generation error:", err);
        qrEl.innerHTML = '<p style="color:#ff9a9a;padding:20px;font-size:12px;">QR generation failed: ' + err.message + '<br>Your ticket ID: <strong>' + ticket_id + '</strong></p>';
      }
    }
    
    // Start QR generation
    generateQR();

    formCard.classList.add("hidden");
    ticketCard.classList.remove("hidden");
    ticketCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.getElementById("dl-btn").addEventListener("click", async () => {
    const node = document.querySelector(".ticket");
    const canvas = await html2canvas(node, { backgroundColor: "#06070f", scale: 2 });
    const link = document.createElement("a");
    link.download = `jam-nights-${document.getElementById("t-id").textContent}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
})();
