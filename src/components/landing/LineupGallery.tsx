import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Music2,
  Mic2,
  Drum,
  Play,
  Clock,
  Users,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────── */

const GALLERY_SLIDES = [
  {
    id: "concert",
    src: "/gallery/concert.png",
    label: "The Main Stage",
    sub: "Where legends are made",
  },
  {
    id: "dj",
    src: "/gallery/dj.png",
    label: "DJ Set — EVOLVE",
    sub: "Electronic & House",
  },
  {
    id: "band",
    src: "/gallery/band.png",
    label: "The Night Triad",
    sub: "Rock & Indie",
  },
  {
    id: "venue",
    src: "/gallery/venue.png",
    label: "The Electric Arcade",
    sub: "Downtown District",
  },
];

const ARTISTS = [
  {
    id: 1,
    name: "The Opening",
    genre: "Doors & Intro",
    time: "6:00 PM",
    icon: Users,
    headliner: false,
    description:
      "Doors open. Settle into the vibe, and grab your complimentary drinks as we kickoff.",
    set: "30 min",
    fans: "Welcome",
  },
  {
    id: 2,
    name: "Slow Melodies",
    genre: "Acoustic Set",
    time: "6:30 PM",
    icon: Music2,
    headliner: false,
    description:
      "A soulful acoustic journey to set the mood for the evening.",
    set: "45 min",
    fans: "Pace Build",
  },
  {
    id: 3,
    name: "The Crowd Jam",
    genre: "Hit Anthems",
    time: "7:15 PM",
    icon: Mic2,
    headliner: true,
    description:
      "The energy picks up. Sing along to your favorite crowd anthems.",
    set: "60 min",
    fans: "High Energy",
  },
  {
    id: 4,
    name: "Open Mic & Vibe",
    genre: "Interactive",
    time: "8:15 PM",
    icon: Drum,
    headliner: false,
    description:
      "Open mic sessions, dance breaks, and engaging fun activities.",
    set: "60 min",
    fans: "Interactive",
  },
  {
    id: 5,
    name: "Power Finale",
    genre: "The Crescendo",
    time: "9:15 PM",
    icon: Play,
    headliner: true,
    description:
      "Closing the night with high-voltage bangers and rhythmic power.",
    set: "45 min",
    fans: "Bangers",
  },
];

/* ─── Dot Button ────────────────────────────────────────── */
function DotButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full transition-all duration-300 ${
        active ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
      }`}
    />
  );
}

/* ─── Gallery Carousel ──────────────────────────────────── */
function GalleryCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    autoplayRef.current = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [emblaApi]);

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-[2rem] border border-white/5" ref={emblaRef}>
        <div className="flex">
          {GALLERY_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="relative flex-none w-full aspect-[4/3] md:aspect-[21/9]"
            >
              <img
                src={slide.src}
                alt={slide.label}
                className="w-full h-full object-cover"
              />
              {/* Subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              {/* Label */}
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                <p className="text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">
                  {slide.sub}
                </p>
                <h3 className="text-white text-xl md:text-3xl font-black font-heading uppercase">{slide.label}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-10 flex items-center gap-2">
        {scrollSnaps.map((_, i) => (
          <DotButton
            key={i}
            active={i === selectedIndex}
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Artist Card ───────────────────────────────────────── */
function ArtistCard({ artist }: { artist: (typeof ARTISTS)[0] }) {
  const Icon = artist.icon;
  return (
    <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] glass-card flex flex-col p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(245,158,11,0.1)] border-white/5 hover:border-amber-500/30">
      {/* Decorative Waveform in background */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
          <path d="M0 30C10 30 15 10 25 10C35 10 40 50 50 50C60 50 65 20 75 20C85 20 90 40 100 40C110 40 115 30 125 30" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
        </svg>
      </div>

      {/* Headliner badge */}
      {artist.headliner && (
        <div className="absolute top-8 right-8">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            Main Act
          </span>
        </div>
      )}

      <div className="mb-auto relative z-10">
        {/* Icon & EQ */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 glow-gold">
            <Icon className="w-6 h-6 text-amber-400" />
          </div>
          {/* EQ Bars */}
          <div className="flex items-end gap-1 h-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="w-1 bg-amber-500/40 rounded-full eq-bar" 
                style={{ animationDelay: `${i * 0.2}s`, height: `${40 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </div>

        <h3 className={`text-3xl font-black mb-2 font-heading uppercase tracking-tighter ${artist.headliner ? 'text-gold text-glow-gold' : 'text-white'}`}>
          {artist.name}
        </h3>
        <p className="text-xs font-black text-amber-500/60 uppercase tracking-[0.3em] mb-6">{artist.genre}</p>
        <p className="text-neutral-400 leading-relaxed font-medium text-sm">
          {artist.description}
        </p>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-6 md:gap-8 pt-8 md:pt-10 mt-8 md:mt-10 border-t border-white/5 relative z-10">
        <div className="flex flex-col gap-1.5">
           <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Time</span>
           <span className="text-sm font-black text-white font-heading">/ {artist.time}</span>
        </div>
        <div className="flex flex-col gap-1.5">
           <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Set</span>
           <span className="text-sm font-black text-white font-heading">{artist.set}</span>
        </div>
        <div className="flex flex-col gap-1.5 ml-auto text-right">
           <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Vibe</span>
           <span className="text-sm font-black text-amber-400 font-heading">{artist.fans}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Tabs ──────────────────────────────────────────────── */
type Tab = "lineup" | "gallery";

/* ─── Main Export ───────────────────────────────────────── */
export function LineupGallery() {
  return (
    <section id="lineup" className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-600 mb-4">
              Moments
            </p>
            <h2 className="text-5xl font-black tracking-tighter text-white font-heading uppercase leading-none">
              Gallery.
            </h2>
          </div>
        </div>

        {/* Content */}
        {/* Content */}
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-in fade-in duration-700 flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md px-12 py-16 text-center">
            <span className="text-5xl">📸</span>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
              Photos Coming Soon
            </h3>
            <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
              Event photos will appear here after our first musical night. 
            </p>
            <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
              Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}