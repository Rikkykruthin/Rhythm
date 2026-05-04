import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Music, Music2, LogOut, Ticket as TicketIcon, Download, Loader2, Headphones, Drum, Disc, Radio, Mic, Guitar, Piano, Speaker, CassetteTape } from "lucide-react";
import QRCode from "qrcode";
import { downloadTicketAsPDF } from "@/lib/downloadTicket";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function TicketQR({ text }: { text: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(text, {
      width: 100,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setSrc).catch(console.error);
  }, [text]);

  if (!src) return <div className="w-[72px] h-[72px] bg-white/10 animate-pulse rounded-lg" />;
  return <img src={src} alt="Ticket QR" className="w-[72px] h-[72px] rounded-lg border border-white/10 shadow-lg" />;
}

/* ── Decorative Elements (Matching Landing) ──────────────── */
function DecorativeAmbient() {
  const icons = [Music, Music2, Headphones, Drum, Disc, Radio, Mic, Guitar, Piano, Speaker, CassetteTape];
  
  return (
    <div className="absolute inset-x-0 top-0 h-full z-0 pointer-events-none overflow-hidden select-none">
      {/* Dynamic Starry Field (Orangish Amber) */}
      {[...Array(60)].map((_, i) => {
        const orangeShades = ["#f59e0b", "#fb923c", "#d97706", "#ea580c"];
        const color = orangeShades[i % orangeShades.length];
        const size = Math.random() > 0.8 ? 2.5 : 1;
        return (
          <div 
            key={`dot-${i}`}
            className="absolute rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              boxShadow: `0 0 ${size * 5}px ${color}`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
              opacity: 0.15 + Math.random() * 0.3
            }}
          />
        );
      })}

      {/* Floating Musical Flow */}
      {[...Array(15)].map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
          <Icon 
            key={`icon-${i}`}
            className="absolute animate-float text-amber-500/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              animationDelay: `${Math.random() * 12}s`,
              opacity: 0.05 + Math.random() * 0.1
            }}
          />
        );
      })}
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) { navigate({ to: "/login" }); return; }
    setUser(JSON.parse(storedUser));

    apiGet<{ ok: boolean; tickets: any[] }>("/auth/my-tickets", token)
      .then((d) => { if (d.ok) setTickets(d.tickets); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate({ to: "/login" });
  };

  const handleDownload = async (ticket: any) => {
    setDownloadingId(ticket.ticket_id);
    try {
      await downloadTicketAsPDF(ticket, user);
    } catch (e) {
      console.error("Image generation failed:", e);
    } finally {
      setDownloadingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-foreground font-sans relative overflow-x-hidden">
      <DecorativeAmbient />
      
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Music className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tighter font-heading uppercase italic">JamNights</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto relative z-10">
        {/* VIP User header */}
        <div className="relative group mb-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass-card rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-5xl font-black text-black shrink-0 font-heading shadow-[0_0_40px_rgba(245,158,11,0.3)] rotate-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Premium Member</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 font-heading uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
                {user.name}
              </h1>
              <p className="text-neutral-400 font-medium text-lg flex flex-wrap justify-center md:justify-start gap-4">
                <span>{user.email}</span>
                {user.phone && (
                  <>
                    <span className="text-white/20 hidden md:block">|</span>
                    <span>{user.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 px-4 gap-6">
          <div>
            <h2 className="text-4xl font-black font-heading uppercase tracking-tighter text-white mb-2">
              Ticket Vault
            </h2>
            <p className="text-neutral-500 text-sm font-medium">Your collection of elite event passes</p>
          </div>
          <div className="px-6 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
             <span className="text-lg font-black text-amber-500">{tickets.length}</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-3">Verified Passes</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <div className="text-neutral-500 font-black uppercase tracking-widest text-xs">Accessing Vault…</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-32 rounded-[3.5rem] border-2 border-dashed border-white/5 bg-white/[0.02]">
            <p className="text-xl text-neutral-500 font-black uppercase tracking-widest mb-10">No active passes found.</p>
            <Link
              to="/"
              className="inline-flex px-12 py-5 rounded-2xl bg-amber-500 text-black font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="group relative flex flex-col min-h-[380px] rounded-[2.5rem] bg-gradient-to-br from-neutral-900 to-black border border-white/5 p-8 overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-2xl"
              >
                {/* Background Texture/glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Stub Cutouts */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black border border-white/10 z-10"></div>
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black border border-white/10 z-10"></div>

                {/* Header Side */}
                <div className="flex items-start justify-between mb-8 pb-8 border-b border-white/10 border-dashed">
                  <div className="flex items-center gap-6">
                    <div className="bg-white p-1 rounded-2xl shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                      <TicketQR text={ticket.ticket_id} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-amber-500 uppercase mb-2">Prestige Pass</p>
                      <h3 className="text-3xl font-black font-heading text-white tracking-tighter uppercase leading-none">
                        {ticket.ticket_id.substring(0, 8)}...
                      </h3>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${
                    ticket.scanned ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-amber-500 text-black"
                  }`}>
                    {ticket.scanned ? "Void" : "Active"}
                  </div>
                </div>

                {/* Details Side */}
                <div className="grid grid-cols-2 gap-y-8 mb-10">
                  {[
                    { label: "GUEST NAME", value: ticket.name },
                    { label: "UNIT COUNT", value: `${ticket.qty} ENTRANCE` },
                    { label: "PAYMENT", value: `₹ ${(ticket.total_amount / 100).toLocaleString("en-IN")}` },
                    { label: "DATE ISSUED", value: new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                  ].map((item) => (
                    <div key={item.label}>
                      <span className="block text-[9px] font-black text-neutral-600 tracking-widest mb-2">{item.label}</span>
                      <span className="block text-base font-bold text-neutral-200 uppercase tracking-tight">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Side (Action) */}
                <div className="mt-auto">
                  <button
                    onClick={() => handleDownload(ticket)}
                    disabled={downloadingId === ticket.ticket_id}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] hover:bg-amber-500 hover:text-black transition-all duration-500 disabled:opacity-40 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {downloadingId === ticket.ticket_id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Minting VIP Pass…</>
                    ) : (
                      <><Download className="w-5 h-5" /> Download VIP Pass</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

