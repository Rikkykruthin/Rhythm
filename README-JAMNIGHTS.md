# Jam Nights

Premium event ticket booking system.

```
frontend/
  booking/   → public booking site (Netlify)
  scanner/   → admin-only QR scanner, PIN protected (Netlify, unlinked)
  verify/    → public ticket verify page (Netlify)
  assets/
backend/     → Node/Express API (Render)
```

## 1. Supabase
1. Create a project at supabase.com.
2. Open SQL editor → paste `backend/schema.sql` → run.
3. Copy **Project URL** and **service_role key** (Settings → API).

## 2. Backend (Render)
1. Push this repo to GitHub.
2. On Render → New → Web Service → pick the repo.
   - **Root directory:** `backend`
   - **Build:** `npm install`
   - **Start:** `npm start`
3. Add environment variables (see `backend/.env.example`):
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PIN` (default `230526`)
   - `ALLOWED_ORIGINS` (your Netlify URL, comma-separated)
4. Deploy. Copy the URL like `https://jam-nights.onrender.com`.

## 3. Frontend (Netlify)
1. New site → drag the `frontend/` folder, **or** connect the repo with publish dir = `frontend`.
2. Edit the three `config.js` files with your real values:
   - `frontend/booking/config.js` → Razorpay key id + backend URL
   - `frontend/verify/config.js` → backend URL
   - `frontend/scanner/config.js` → backend URL + admin PIN
3. Netlify will serve:
   - `/booking/` — booking site
   - `/verify/?tid=LJ-XXXXXX` — verify page (linked from QR)
   - `/scanner/` — admin scanner (do **not** link publicly)

## 4. Razorpay
- Use **test mode** keys first. Only UPI (GPay/PhonePe/Paytm/BHIM) is enabled in checkout — cards/netbanking/wallets are disabled in `frontend/booking/script.js`.
- Switch to **live keys** once verified.

## Flow
1. User fills form → `/create-order` (backend) → Razorpay UPI popup.
2. On success → `/verify-payment` (HMAC-SHA256 signature check) → booking saved → ticket id `LJ-XXXXXX` returned.
3. QR encodes `…/verify?tid=LJ-XXXXXX`.
4. Scanner (PIN-locked) → `/scan-ticket` atomically flips `paid → used`.
