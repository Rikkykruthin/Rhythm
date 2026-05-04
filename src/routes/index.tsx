import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Music, Music2, Mic, Headphones, Drum, Disc, Radio, Guitar, Piano, Speaker, CassetteTape, Calendar, MapPin, ArrowRight, Star, Ticket, User as UserIcon, LogOut, Mail, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LineupGallery } from "../components/landing/LineupGallery";
import { Countdown } from "../components/landing/Countdown";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ── Decorative Elements ────────────────────────────────── */
function DecorativeAmbient() {
  const icons = [Music, Music2, Headphones, Drum, Disc, Radio, Mic, Guitar, Piano, Speaker, CassetteTape];
  
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Calculate grid-based positions to prevent clumping
  const gridRows = isMobile ? 8 : 12;
  const gridCols = isMobile ? 2 : 4;
  const scatteredElements = [];
  
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const iconIndex = (r * gridCols + c) % icons.length;
      const Icon = icons[iconIndex];
      const size = 18 + Math.random() * 25;
      
      scatteredElements.push(
        <Icon 
          key={`icon-${r}-${c}`}
          className="absolute animate-float text-amber-500/30"
          style={{
            top: `${(r / gridRows) * 100 + (Math.random() * 8)}%`,
            left: `${(c / gridCols) * 100 + (Math.random() * 20)}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${7 + Math.random() * 10}s`,
            opacity: 0.15 + (Math.random() * 0.15),
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      );
    }
  }
  
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Cinematic Stage Spotlights */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[100%] h-[150%] bg-gradient-to-br from-amber-500/[0.04] to-transparent skew-x-[-25deg] animate-pulse-slow" />
        <div className="absolute -top-[20%] right-[0%] w-[80%] h-[150%] bg-gradient-to-bl from-amber-500/[0.03] to-transparent skew-x-[25deg] animate-pulse-slow delay-1000" />
      </div>

      {/* Dynamic Starry Field (Orangish Amber Only) */}
      {[...Array(200)].map((_, i) => {
        const orangeShades = ["#f59e0b", "#fb923c", "#d97706", "#ea580c"];
        const color = orangeShades[i % orangeShades.length];
        const size = Math.random() > 0.8 ? 3 : Math.random() > 0.4 ? 1.5 : 0.8;
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
              opacity: 0.15 + Math.random() * 0.4
            }}
          />
        );
      })}

      {/* Floating Ember Particles (Upward Drift) - Brighter */}
      {[...Array(40)].map((_, i) => (
        <div 
          key={`ember-${i}`}
          className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_12px_#fbbf24]"
          style={{
            bottom: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `ember-float ${8 + Math.random() * 8}s linear infinite`,
            animationDelay: `${Math.random() * 15}s`,
            opacity: 0.3 + Math.random() * 0.3
          }}
        />
      ))}

      {/* Grid-Distributed Musical Flow */}
      {scatteredElements}
    </div>
  );
}

function Index() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden font-sans selection:bg-primary/20 relative">
      <DecorativeAmbient />
      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-5xl group">
        {/* Floating BACKGROUND Musical Elements (Behind the glass) */}
        <div className="absolute inset-0 -z-10 overflow-visible pointer-events-none opacity-40">
           <Disc className="absolute -top-12 left-[10%] w-8 h-8 text-amber-500/20 animate-spin-slow" />
           <Drum className="absolute -bottom-16 left-[40%] w-6 h-6 text-amber-600/10 animate-float" />
           <Radio className="absolute -top-10 right-[30%] w-5 h-5 text-amber-400/20 animate-float-delayed" />
           <Headphones className="absolute -bottom-12 right-[10%] w-7 h-7 text-amber-500/10 animate-float" />
        </div>

        {/* Floating FOREGROUND Musical Elements (In front of glass) */}
        <div className="absolute inset-0 z-20 overflow-visible pointer-events-none">
          {/* Pulsing Dots (Stage Lights) */}
          <div className="absolute top-0 -left-6 w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_15px_#f59e0b,0_0_30px_#f59e0b]" />
          <div className="absolute -top-4 right-1/3 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse delay-500 shadow-[0_0_20px_#f59e0b]" />
          <div className="absolute bottom-0 left-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse delay-1000 shadow-[0_0_15px_#f59e0b]" />
          <div className="absolute -bottom-4 -right-6 w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-700 shadow-[0_0_20px_#f59e0b,0_0_40px_#f59e0b]" />
          
          {/* Floating Notes & Tools */}
          <Music className="absolute -top-8 left-[25%] w-5 h-5 text-amber-400/40 animate-float opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:-translate-y-6" />
          <Music2 className="absolute -bottom-12 right-[20%] w-6 h-6 text-amber-500/50 animate-float-delayed opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:translate-y-6" />
          <Mic className="absolute top-1/2 -right-10 -translate-y-1/2 w-6 h-6 text-amber-400/40 animate-pulse opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:translate-x-4" />
          <Headphones className="absolute top-1/2 -left-12 -translate-y-1/2 w-5 h-5 text-amber-500/30 animate-float opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:-translate-x-4" />
        </div>

        <div className="flex items-center justify-between px-6 md:px-8 h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_rgba(245,158,11,0.15)] relative overflow-hidden group/inner">
          {/* Animated Background Glow (Sweep effect) */}
          <div className="absolute top-0 left-0 w-48 h-full bg-gradient-to-r from-transparent via-amber-500/15 to-transparent skew-x-[-20deg] -translate-x-full group-hover:translate-x-[500%] transition-transform duration-[2500ms] ease-in-out" />
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group/logo relative z-10">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center glow-gold group-hover/logo:scale-110 transition-transform relative">
              <Music className="w-5 h-5 text-black" />
              {/* Micro Pulse around logo */}
              <div className="absolute inset-0 rounded-xl bg-white animate-ping opacity-20 scale-75" />
            </div>
            <span className="text-2xl font-black tracking-tighter font-heading uppercase text-white group-hover/logo:text-gold transition-colors">JamNights</span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-12 relative z-10">
            {[["Gallery", "#gallery"], ["About", "#about"]].map(([label, href]) => (
              <a 
                key={label}
                href={href} 
                className="text-neutral-400 hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] font-black relative group/link"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all group-hover/link:w-full" />
              </a>
            ))}
            
            {isLoggedIn ? (
              <div className="flex items-center gap-6 border-l border-white/10 pl-6">
                <Link to="/profile" className="text-neutral-300 hover:text-white flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
                  <UserIcon className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleLogout} className="text-neutral-500 hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-neutral-300 hover:text-white uppercase tracking-widest text-[10px] font-black">
                Log In
              </Link>
            )}

            <Link
              to="/book"
              className="px-8 py-3 rounded-2xl bg-white text-black hover:bg-amber-400 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105"
            >
              Get Pass <Ticket className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 relative z-10 hover:bg-white/10 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`absolute top-20 left-0 right-0 md:hidden transition-all duration-300 transform ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col gap-4 px-4 pb-4 border-b border-white/5">
              {[["Gallery", "#gallery"], ["About", "#about"]].map(([label, href]) => (
                <a 
                  key={label}
                  href={href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-neutral-400 hover:text-white transition-all uppercase tracking-[0.3em] text-xs font-black"
                >
                  {label}
                </a>
              ))}
            </div>
            
            <div className="flex flex-col gap-6 px-4">
              {isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <Link to="/profile" className="text-neutral-300 hover:text-white flex items-center gap-2 uppercase tracking-widest text-xs font-black">
                    <UserIcon className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="text-neutral-500 hover:text-red-400 flex items-center gap-2 uppercase tracking-widest text-xs font-black">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-neutral-300 hover:text-white uppercase tracking-widest text-xs font-black">
                  Log In
                </Link>
              )}

              <Link
                to="/book"
                className="px-8 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
              >
                Get Pass <Ticket className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Glow Line underneath pill */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-[1px] glow-line opacity-0 group-hover:opacity-100 transition-opacity" />
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-16 lg:pt-40 lg:pb-24 px-6 overflow-hidden">
        {/* Subtle glow background element */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/10 blur-[150px] -z-10 animate-pulse-slow" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-200 text-[10px] font-black uppercase tracking-[0.4em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Star className="w-3 h-3 text-amber-400 fill-amber-500" /> May 23rd, 2026 • Baatkhaana, Miyapur
          </div>

          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-0.5 leading-[0.85] font-heading uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000 text-gold text-glow-gold">
              JAMNIGHTS
            </h1>
            <h2 className="text-2xl md:text-4xl lg:text-7xl font-black tracking-tighter mb-6 leading-[0.85] font-heading uppercase animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 text-white/95">
              ONE NIGHT. ONE BEAT.
            </h2>
          </div>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium tracking-wide opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
             A cozy jam where crowd becomes the chorus.
          </p>

          <div className="mb-14 animate-in fade-in zoom-in duration-1000 delay-500">
            <Countdown />
          </div>

          <div className="flex items-center justify-center">
            <Link
              to="/book"
              className="group relative px-14 py-6 rounded-2xl bg-white text-black font-black text-xl transition-all hover:scale-[1.05] active:scale-[0.95] shadow-[0_20px_50px_rgba(255,255,255,0.15)] flex items-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">SECURE PASS</span> 
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
          
          <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-left leading-none">
             {/* Large Card */}
             <div className="md:col-span-2 glass-card p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-end group transition-all relative overflow-hidden h-48 md:h-64">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -z-10 group-hover:bg-amber-500/20 transition-colors" />
                <Calendar className="w-8 h-8 md:w-10 md:h-10 text-amber-400 mb-6 md:mb-8 group-hover:scale-110 transition-transform origin-left animate-float" />
                <h3 className="text-2xl md:text-3xl font-black font-heading mb-2 uppercase tracking-tighter">Save the Date</h3>
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">May 23, 2026 • 6:00 PM onwards</p>
             </div>
             {/* Small Card 1 */}
             <div className="md:col-span-1 glass-card p-10 rounded-[2.5rem] flex flex-col justify-end group transition-all relative overflow-hidden h-64">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl -z-10" />
                <MapPin className="w-10 h-10 text-amber-400 mb-8 group-hover:scale-110 transition-transform origin-left animate-float-delayed" />
                <h3 className="text-xl font-black font-heading mb-2 uppercase tracking-tighter">Venue</h3>
                <a href="https://maps.app.goo.gl/jUxsDrtfibGVvWV28" target="_blank" className="text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Baatkhaana, Miyapur</a>
             </div>
             {/* Small Card 2 */}
             <div className="md:col-span-1 glass-card p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-end group transition-all relative overflow-hidden h-48 md:h-64">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl -z-10" />
                <Music className="w-8 h-8 md:w-10 md:h-10 text-white mb-6 md:mb-8 group-hover:scale-110 transition-transform origin-left animate-float" />
                <h3 className="text-xl font-black font-heading mb-2 uppercase tracking-tighter">Vibe</h3>
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">Acoustics & <br />Power Bangers</p>
             </div>
          </div>
        </div>
      </section>

      {/* ── Lineup ────────────────────────────────────────── */}
      <div className="py-12 border-y border-white/5 bg-white/[0.01]">
        <LineupGallery />
      </div>

      {/* ── Visualizer Strip ───────────────────────────────── */}
      <div className="h-16 flex items-end justify-center gap-1.5 overflow-hidden opacity-20 pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i} 
            className="w-1.5 bg-amber-500 rounded-full eq-bar" 
            style={{ 
              height: `${20 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 2}s`
            }} 
          />
        ))}
      </div>

      {/* ── About strip ─────────────────────────────────────── */}
      <section
        id="about"
        className="py-32 px-6 border-t border-white/5 bg-black relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-amber-500/50 mb-12">
            The JamNights Experience
          </p>
          <p className="text-neutral-400 text-xl leading-relaxed max-w-2xl mx-auto font-medium mb-20 tracking-wide">
            Jam Nights is a space built for people who love music, not just to listen, but to feel, share, and be part of it.
          </p>
          <p className="text-neutral-400 text-xl leading-relaxed max-w-2xl mx-auto font-medium mb-20 tracking-wide">
            We started with a simple idea: not everyone needs to be a performer to experience the joy of music. Whether you're someone who sings in the shower, hums along in the car, or just enjoys being around good music and good people, Jam Nights is for you. 
          </p>
          <div className="">
            <Link
              to="/book"
              className="inline-flex items-center gap-4 px-14 py-6 rounded-2xl bg-white text-black font-black uppercase tracking-[0.3em] hover:bg-amber-400 transition-all text-sm shadow-[0_25px_60px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              Get Your Pass <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-5xl mx-auto border-t border-white/10 pt-24">
            {/* Instagram Card */}
            <a 
              href="https://www.instagram.com/jam.nights" 
              target="_blank" 
              className="glass-card p-8 rounded-[2rem] group transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-gold">
                <Music className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Instagram</p>
              <p className="text-white font-black font-heading uppercase text-sm tracking-tight transition-colors">@jam.nights</p>
            </a>

            {/* Email Card */}
            <a 
              href="mailto:jamnights23@gmail.com" 
              className="glass-card p-8 rounded-[2rem] group transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-gold">
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Inquiries</p>
              <p className="text-white font-black font-heading uppercase text-sm tracking-tight transition-colors">jamnights23@gmail.com</p>
            </a>

            {/* Support Card */}
            <div className="glass-card p-8 rounded-[2rem] group transition-all">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-gold">
                <UserIcon className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Support</p>
              <div className="space-y-1">
                <p className="text-white font-black font-heading uppercase text-sm tracking-tight transition-colors">9063925506</p>
                <p className="text-white font-black font-heading uppercase text-sm tracking-tight transition-colors">9398417077</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-black border-t border-white/5 py-24 px-6 relative overflow-hidden">
        {/* Large stylized background branding */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.02] font-heading uppercase pointer-events-none select-none">
          JamNights
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="h-16 w-16 rounded-[1.5rem] bg-neutral-900 flex items-center justify-center mb-8 glow-gold border border-white/5">
              <Music className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-5xl font-black font-heading uppercase tracking-tighter text-white mb-4 text-glow-gold">
              JamNights
            </h2>
            <p className="text-neutral-500 font-bold uppercase tracking-[0.4em] text-xs">Live. Laugh. Jam</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 border-y border-white/5 py-16">
            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-[11px]">Event Details</h4>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed uppercase tracking-tighter">
                May 23, 2026<br /> 6:00 PM – Midnight<br />Baatkhaana, Miyapur
              </p>
            </div>
            <div className="space-y-6 md:text-right">
              <h4 className="text-white font-black uppercase tracking-widest text-[11px]">Quick Links</h4>
              <div className="flex flex-col md:items-end gap-3">
                {[["Home", "/"], ["Gallery", "#gallery"], ["About", "#about"], ["Contact", "#about"]].map(([label, href]) => (
                  <a key={label} href={href} className="text-neutral-500 hover:text-amber-500 transition-colors uppercase tracking-[0.2em] text-[10px] font-black">{label}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="h-1 w-12 bg-amber-500/20 rounded-full" />
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Baatkhaana Rooftop</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
