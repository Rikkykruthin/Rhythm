import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Music, Mail, Lock } from "lucide-react";
import { apiPost } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiPost<{ token: string; user: Record<string, unknown> }>(
        "/auth/login",
        { email, password }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate({ to: "/profile" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 bg-dot-pattern">
      <nav className="p-8">
        <Link to="/" className="flex items-center gap-2.5 max-w-7xl mx-auto hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
            <Music className="w-4 h-4 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight font-heading uppercase">JamNights</span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md p-10 rounded-[2rem] glass-card shadow-2xl relative animate-in fade-in zoom-in duration-500">
          <h2 className="text-3xl font-black mb-2 font-heading uppercase tracking-tighter">Welcome Back.</h2>
          <p className="text-neutral-500 mb-10 text-sm font-medium">Enter your details to access your tickets.</p>

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-neutral-700 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-neutral-700 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-white text-black font-black py-4 rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-[0.2em] shadow-[0_10px_30px_rgba(255,255,255,0.05)] active:scale-[0.98]"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Don't have an account?{" "}
            <Link to="/register" className="text-white hover:underline transition-colors ml-1">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
