import React from "react";

const STATS = [
  { value: "5 Curated", label: "Gold-Standard Sheets", detail: "Blind 75 · NeetCode · Striver" },
  { value: "1,200+", label: "Pattern Problems", detail: "Indexed by algorithmic pattern" },
  { value: "4 Core", label: "CS Fundamentals", detail: "OS · DBMS · Networks · OOPs" },
  { value: "100%", label: "Atomic Progress", detail: "Zero lost checks, instant sync" },
];

const MetricsStrip = () => {
  return (
    <div className="relative mx-auto max-w-5xl w-full rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden transform-gpu">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07]">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="p-6 sm:p-7 flex flex-col justify-center text-left group hover:bg-white/[0.02] transition-colors"
          >
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
