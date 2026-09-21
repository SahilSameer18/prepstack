import React from "react";

const STATS = [
  { value: "5 Curated", label: "Gold-Standard Sheets", detail: "Blind 75 · NeetCode · Striver" },
  { value: "1,200+", label: "Pattern Problems", detail: "Indexed by algorithmic pattern" },
  { value: "4 Core", label: "CS Fundamentals", detail: "OS · DBMS · Networks · OOPs" },
  { value: "100%", label: "Atomic Progress", detail: "Zero lost checks, instant sync" },
];

const MetricsStrip = () => {
  return (
    <div className="relative mx-auto max-w-5xl w-full rounded-2xl titanium-card overflow-hidden transform-gpu">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="p-6 sm:p-7 flex flex-col justify-center text-left group hover:bg-white/[0.025] transition-all duration-150"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]/80 group-hover:scale-125 transition-transform" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200 transition-colors">
                METRIC 0{i + 1}
              </span>
            </div>
            <span className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:text-[#ffa116] transition-colors mb-1">
              {stat.value}
            </span>
            <span className="font-display text-xs font-bold text-zinc-200 uppercase tracking-wider mb-1">
              {stat.label}
            </span>
            <span className="font-mono text-[11px] text-zinc-400 truncate">
              {stat.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsStrip;
