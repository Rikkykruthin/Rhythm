import { useEffect, useState } from "react";

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-05-23T18:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto px-4">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-full aspect-square rounded-2xl md:rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-white tracking-tighter relative z-10 transition-transform group-hover:scale-110">
              {item.value.toString().padStart(2, "0")}
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </div>
          <span className="mt-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
