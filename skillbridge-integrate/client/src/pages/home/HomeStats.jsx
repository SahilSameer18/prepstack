import React, { useRef, useState, useEffect } from "react";

const useCountUp = (target, duration = 1400, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
};

const STATS = [
  {
    value: 12000,
    suffix: "+",
    label: "Profiles Audited",
    sublabel: "and counting",
    color: "#ff6662",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    format: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v,
  },
  {
    value: 96,
    suffix: ".4%",
    label: "Match Accuracy",
    sublabel: "AI precision scoring",
    color: "#34d399",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    format: (v) => v,
  },
  {
    value: 10,
    suffix: "-Day",
    label: "Prep Roadmap",
    sublabel: "structured & tailored",
    color: "#818cf8",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    format: (v) => v,
  },
  {
    value: 100,
    suffix: "%",
    label: "ATS Compliant",
    sublabel: "export-ready PDFs",
    color: "#fbbf24",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    format: (v) => v,
  },
];

const StatCard = ({ stat, index, visible }) => {
  const count = useCountUp(stat.value, 1400, visible);
  const displayed = stat.format(count);

  return (
    <div
      className="group relative flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-500"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${stat.color}10 0%, transparent 70%)`,
        }}
      />

      {/* Icon ring */}
      <div
        className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `${stat.color}12`,
          border: `1px solid ${stat.color}25`,
          color: stat.color,
        }}
      >
        {stat.icon}
      </div>

      {/* Number */}
      <div className="flex items-baseline gap-0.5 mb-2">
        <span
          className="text-4xl font-black tracking-tight"
          style={{ color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {displayed}
        </span>
        <span
          className="text-xl font-bold"
          style={{ color: stat.color }}
        >
          {stat.suffix}
        </span>
      </div>

      <p className="text-sm font-semibold text-white/80 mb-1">{stat.label}</p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{stat.sublabel}</p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-16 h-px transition-all duration-500 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
      />
    </div>
  );
};

const HomeStats = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8 relative" style={{ background: "#080808" }}>
      {/* Divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-10" style={{ background: "linear-gradient(180deg, transparent, rgba(255,102,98,0.4))" }} />

      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>
            Trusted by Ambitious Engineers
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeStats;
