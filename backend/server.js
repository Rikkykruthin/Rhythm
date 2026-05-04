// Jam Nights — Express backend (deploy to Render)
require('dotenv').config({ path: __dirname + '/.env' }); 
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const MAX_TICKETS = 75;

const {
  PORT = 8080,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_PIN = "230526",
  ALLOWED_ORIGINS = "https://jamnights.pages.dev,https://jamnights.netlify.app,http://localhost:3000",
  JWT_SECRET = "change-this-secret",
} = process.env;

const app = express();
app.use(express.json({ limit: "100kb" }));

const allowedOrigins = ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error("ENV VARIABLES NOT LOADED");
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function makeTicketId() {
  // LJ-XXXXXX (6 char base32-ish, no confusing chars)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `LJ-${s}`;
}

app.get("/", (_req, res) => res.json({ ok: true, service: "jam-nights" }));

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

// Register new user
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: "Email or phone already registered" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({ name, email, phone, password_hash })
      .select("id, name, email, phone")
      .single();

    if (error) {
      console.error("User creation error:", error);
      return res.status(500).json({ error: "Could not create user" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      ok: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login user
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      ok: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get user's bookings
app.get("/auth/my-tickets", authenticateToken, async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("ticket_id, name, qty, total_amount, status, scanned, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch bookings error:", error);
      return res.status(500).json({ error: "Could not fetch tickets" });
    }

    res.json({ ok: true, tickets: bookings || [] });
  } catch (err) {
    console.error("My tickets error:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// ============================================
// EXISTING BOOKING ENDPOINTS
// ============================================

app.post("/create-order", async (req, res) => {
  try {
    // 🔥 STEP 1: CHECK TOTAL TICKETS SOLD
    const { count, error: countError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
      return res.status(500).json({ error: "Server error" });
    }
    if (count >= MAX_TICKETS) {
      return res.status(400).json({
        error: "Tickets Sold Out 🚫",
      });
    }

    const { name, phone, email, qty, amount } = req.body || {};

    if (!name || !phone || !email || !qty || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (qty < 1 || qty > 10) {
      return res.status(400).json({ error: "Invalid qty" });
    }

    // 🔥 STEP 2: CHECK IF THIS BOOKING EXCEEDS LIMIT
    if (count + qty > MAX_TICKETS) {
      return res.status(400).json({
        error: `Only ${MAX_TICKETS - count} tickets left`,
      });
    }

    // Strictly requiring ₹306 per ticket (299 base + 7 convenience)
    const requiredAmount = 306 * qty * 100;
    if (amount < requiredAmount) {
      return res.status(400).json({ error: "Invalid amount. Required per ticket: ₹306" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `jam_${Date.now()}`,
      notes: { name, phone, email, qty: String(qty) },
    });

    res.json({
      ...order,
      razorpay_key_id: RAZORPAY_KEY_ID // Send key ID to frontend for the checkout modal
    });

  } catch (err) {
    console.error("CRITICAL ERROR in /create-order:");
    console.error(err);
    res.status(500).json({ 
      error: "Order creation failed internal server error", 
      details: err.message 
    });
  }
});

// 2. Verify payment signature, then save booking & generate ticket
app.post("/verify-payment", async (req, res) => {
  try {
    console.log("=== VERIFY PAYMENT REQUEST ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));
    
    // 🔥 FINAL SAFETY CHECK
    const { count, error } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Count error:", error);
      return res.status(500).json({
        ok: false,
        error: "Server error",
      });
    }
    console.log("Current bookings count:", count);
    
    if (count >= MAX_TICKETS) {
      return res.status(400).json({
        ok: false,
        error: "Tickets Sold Out 🚫",
      });
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking,
    } = req.body || {};
    
    console.log("Received booking data:", JSON.stringify(booking, null, 2));
    
    const qty = parseInt(booking?.qty || 1);
    if (count + qty > MAX_TICKETS) {
      return res.status(400).json({
        ok: false,
        error: `Only ${MAX_TICKETS - count} tickets left`,
      });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const expected = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Signature verification:");
    console.log("  Expected:", expected);
    console.log("  Received:", razorpay_signature);
    console.log("  Match:", expected === razorpay_signature);

    if (expected !== razorpay_signature) {
      console.error("Signature mismatch!");
      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    // Generate unique ticket id (retry on collision)
    let ticket_id;
    for (let i = 0; i < 5; i++) {
      const candidate = makeTicketId();
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("ticket_id", candidate)
        .maybeSingle();
      if (!existing) {
        ticket_id = candidate;
        break;
      }
    }
    if (!ticket_id) return res.status(500).json({ ok: false, error: "Ticket id generation failed" });

    const { error: insertError } = await supabase.from("bookings").insert({
      ticket_id,
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      qty: booking.qty,
      total_amount: booking.total_amount,
      razorpay_payment_id,
      status: "paid",
      user_id: booking.user_id || null,
    });
    if (insertError) {
      console.error("supabase insert error:", insertError);
      return res.status(500).json({ ok: false, error: "Could not save booking" });
    }
    
    console.log("✅ Booking saved successfully! Ticket ID:", ticket_id);
    
    res.json({
      ok: true,
      ticket_id,
      name: booking.name,
      phone: booking.phone,
      qty: booking.qty,
    });
  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ ok: false, error: "Verification failed" });
  }
});

// 3. Public verify (read-only) — used by /verify page
app.get("/verify-ticket/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("ticket_id, name, qty, total_amount, status")
      .eq("ticket_id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.json({ found: false });
    res.json({ found: true, ...data });
  } catch (err) {
    console.error("verify-ticket error:", err);
    res.status(500).json({ found: false, error: "Server error" });
  }
});

// 4. Scanner — atomically marks paid → used
app.post("/scan-ticket", async (req, res) => {
  try {
    const { ticket_id, pin } = req.body;

    if (pin !== process.env.ADMIN_PIN) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 🔍 Fetch ticket
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("ticket_id", ticket_id)
      .maybeSingle();

    if (error || !data) {
      return res.json({ found: false });
    }

    // ❌ Already scanned
    if (data.scanned) {
      return res.json({
        found: true,
        previous_status: "used",
        name: data.name,
        qty: data.qty,
        scanned_at: data.scanned_at
      });
    }

    // ❌ Not paid
    if (data.status !== "paid") {
      return res.json({
        found: true,
        previous_status: data.status,
        name: data.name
      });
    }

    // ✅ Mark as scanned
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        scanned: true,
        scanned_at: new Date().toISOString()
      })
      .eq("ticket_id", ticket_id);

    if (updateError) {
      return res.status(500).json({ error: "Update failed" });
    }

    return res.json({
      found: true,
      previous_status: "paid",
      name: data.name,
      qty: data.qty,
      scanned_at: new Date().toISOString()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin Stats
app.post("/admin/stats", async (req, res) => {
  try {
    const { pin } = req.body;
    if (pin !== process.env.ADMIN_PIN) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data: tickets, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
       return res.status(500).json({ error: "Database error" });
    }

    res.json({ ok: true, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Jam Nights backend on :${PORT}`);
});