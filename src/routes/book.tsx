import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CreditCard, Music, ShieldCheck, Tag } from "lucide-react";
import { apiPost } from "@/lib/api";

export const Route = createFileRoute("/book")({
  component: BookCheckout,
});

function BookCheckout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const TICKET_PRICE = 299;
  const CONVENIENCE_FEE = 7;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate({ to: "/login" });
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const perTicketTotal = TICKET_PRICE + CONVENIENCE_FEE;
      const amount = qty * perTicketTotal * 100;

      const orderData = await apiPost<any>("/create-order", {
        name: user.name,
        phone: user.phone,
        email: user.email,
        qty,
        amount,
      });

      const options = {
        key: orderData.razorpay_key_id, // Use the dynamically returned key ID
        amount: orderData.amount,
        currency: "INR",
        name: "JamNights",
        description: "Entry Pass Booking",
        order_id: orderData.id,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#f59e0b" },
        handler: async function (response: any) {
          try {
            await apiPost("/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking: {
                name: user.name,
                phone: user.phone,
                email: user.email,
                qty,
                total_amount: amount,
                user_id: user.id,
              },
            });
            navigate({ to: "/profile" });
          } catch (err: any) {
            setError(err.message || "Payment verification failed.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Could not initiate checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-foreground flex items-center justify-center p-6 selection:bg-primary/20 relative font-sans overflow-hidden">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-in fade-in zoom-in duration-700 relative z-10">
        {/* Checkout details */}
        <div className="glass-card p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden bg-white/[0.02]">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 blur-[80px]" />
          
          <div className="flex items-center gap-4 mb-12">
            <Link to="/" className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]" title="Back to Home">
              <Music className="w-6 h-6 text-black" />
            </Link>
            <h1 className="text-4xl font-black font-heading uppercase tracking-tighter text-gold">Checkout.</h1>
          </div>

          <div className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 ml-1">Guest Identification</label>
              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 ring-1 ring-white/5">
                <p className="font-heading font-black text-2xl uppercase tracking-tight text-white">{user.name}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-neutral-400">{user.email}</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-neutral-400">{user.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 ml-1">Select Quantity</label>
              <div className="flex items-center gap-8 p-3 rounded-[2rem] bg-white/[0.03] border border-white/10 w-fit">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white hover:text-black transition-all text-2xl font-black shadow-lg"
                >-</button>
                <span className="w-10 text-center text-3xl font-black font-heading text-white">{qty}</span>
                <button 
                  onClick={() => setQty(Math.min(10, qty + 1))}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white hover:text-black transition-all text-2xl font-black shadow-lg"
                >+</button>
              </div>
            </div>
            
            {error && <div className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em] bg-red-500/10 p-5 rounded-2xl border border-red-500/20 animate-pulse">{error}</div>}
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass-card p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col h-full ring-1 ring-white/20 bg-black/40">
          <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/20 blur-[100px] -z-10" />
          
          <h2 className="text-2xl font-black mb-12 flex items-center gap-4 font-heading uppercase tracking-tighter relative z-10">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-amber-400" />
            </div>
            Order Summary
          </h2>

          <div className="space-y-8 mb-16 relative z-10 flex-1">
            <div className="flex justify-between items-center pb-8 border-b border-white/5 border-dashed">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Entry Pass</span>
              <span className="font-black text-white font-heading text-xl">₹ {qty * TICKET_PRICE}</span>
            </div>
            <div className="flex justify-between items-center pb-8 border-b border-white/5 border-dashed">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Convenience Fee</span>
              <span className="font-black text-white font-heading text-xl">₹ {qty * CONVENIENCE_FEE}</span>
            </div>
            <div className="flex justify-between items-center text-white pt-6">
              <div className="space-y-1">
                <span className="font-black uppercase tracking-[0.4em] text-[10px] text-amber-500/60 block">Total Payable</span>
                <span className="text-5xl text-white font-black font-heading tracking-tighter text-gold">₹{qty * (TICKET_PRICE + CONVENIENCE_FEE)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:scale-[1.02] hover:brightness-110 transition-all flex items-center justify-center gap-4 group shadow-[0_20px_40px_rgba(245,158,11,0.3)] active:scale-[0.98] disabled:opacity-50 relative z-10 glow-gold"
          >
            {loading ? "Synchronizing..." : (
              <>
                Confirm & Pay <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
          
          <p className="flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 mt-10 relative z-10">
            <ShieldCheck className="w-4 h-4 text-neutral-700" /> Secure SSL Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
