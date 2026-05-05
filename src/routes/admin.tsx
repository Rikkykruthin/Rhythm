import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Shield, CheckCircle2, CircleDashed, Users, CreditCard } from "lucide-react";
import { apiPost } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [pin, setPin] = useState("");
  const [authedPin, setAuthedPin] = useState(""); // saves PIN after login for refreshing 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchStats = async (adminPin: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiPost<{ ok: boolean; tickets: any[] }>(
        "/admin/stats",
        { pin: adminPin }
      );
      setTickets(data.tickets);
      setIsAuthenticated(true);
      setAuthedPin(adminPin); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(pin);
  };

  const handleRefresh = () => {
    fetchStats(authedPin); // uses the saved PIN, not the empty input
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-neutral-50 selection:bg-purple-500/30">
        <div className="w-full max-w-sm p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl relative text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
          <p className="text-neutral-400 mb-8 text-sm">Enter the admin PIN to access the dashboard.</p>
          
          {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 py-2 rounded-lg">{error}</p>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-center tracking-widest font-mono text-lg placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = tickets.reduce((acc, t) => acc + (t.total_amount || 0), 0) / 100;
  const totalSold = tickets.reduce((acc, t) => acc + (t.qty || 0), 0);
  const attendedCount = tickets.filter(t => t.scanned).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-purple-500/30 font-sans p-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-white/10 pb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">System Dashboard</h1>
              <p className="text-neutral-400 text-sm">JamNights Admin Console</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/scanner"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              Launch Scanner
            </Link>
           <button 
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </header>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-4xl font-black mb-1">₹ {totalRevenue.toLocaleString()}</h3>
            <p className="text-neutral-400 text-sm font-medium">Total Revenue</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-4xl font-black mb-1">{totalSold}</h3>
            <p className="text-neutral-400 text-sm font-medium">Tickets Sold</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-fuchsia-500/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-fuchsia-400" />
              </div>
            </div>
            <h3 className="text-4xl font-black mb-1">{attendedCount}</h3>
            <p className="text-neutral-400 text-sm font-medium">Groups Attended</p>
          </div>
        </div>

        {/* Attendees List */}
        <h2 className="text-xl font-bold mb-6">Recent Bookings</h2>
        <div className="glass-panel border border-white/10 bg-white/[0.02] backdrop-blur-lg rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-neutral-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket ID</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Qty</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-neutral-300">{t.ticket_id}</td>
                    <td className="px-6 py-4 font-medium">{t.name}</td>
                    <td className="px-6 py-4 text-neutral-400">
                      <div>{t.email}</div>
                      <div className="text-xs">{t.phone}</div>
                    </td>
                    <td className="px-6 py-4">{t.qty}</td>
                    <td className="px-6 py-4">
                      {t.scanned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Attended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-500/20 text-neutral-400 text-xs font-semibold border border-neutral-500/30">
                          <CircleDashed className="w-3.5 h-3.5" /> Yet to come
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
