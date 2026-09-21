import React from 'react';

const PLACEMENT_DEBRIEFS = [
  {
    name: "Arjun Mehta",
    role: "SDE-1",
    company: "Amazon",
    companyColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    round: "Bar Raiser + Graph Round",
    text: "The atomic progress sync on Blind 75 and NeetCode kept me disciplined for 45 straight days. In my Round 2, I was asked an altered Word Ladder problem that mapped directly to the graph patterns I practiced here.",
    stats: "75 Solved · 100% Core",
  },
  {
    name: "Sneha Kapoor",
    role: "Systems Engineer",
    company: "Microsoft",
    companyColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    round: "OS Internals & Concurrency",
    text: "Most candidates bomb the low-level CS round. The synthesized OS notes on mutex spinlocks and deadlock conditions covered the exact memory isolation question my interviewer pressed me on.",
    stats: "OS & DBMS Mastered",
  },
  {
    name: "Rohan Nair",
    role: "Backend Engineer",
    company: "Swiggy",
    companyColor: "text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/20",
    round: "System Design Spec",
    text: "Instead of building another generic to-do clone, I built the distributed rate limiter spec from the AI Projects section. The interview panel spent the entire 45 minutes digging into my Redis token-bucket tradeoffs.",
    stats: "High-Throughput Project",
  },
  {
    name: "Tanvi Saxena",
    role: "SDE Intern",
    company: "Google",
    companyColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    round: "DSA Hard + DP Round",
    text: "The pattern-based progression saved me easily 80 hours compared to wading blindly through LeetCode discuss threads. Having everything under one cohesive workspace made all the difference.",
    stats: "150 Solved · SDE Track",
  },
];

const Testimonial = () => {
  return (
    <section className="relative">
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
        <p className="text-xs font-mono uppercase tracking-widest text-[#ffa116] font-semibold mb-3">
          Candidate Case Studies
        </p>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Structured for <span className="text-[#ffa116]">top engineering rounds</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Realistic preparation strategies and interview debriefs mapped directly to PrepStack's core curricula.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {PLACEMENT_DEBRIEFS.map((item, i) => (
          <div
            key={i}
            className="p-7 sm:p-8 rounded-2xl titanium-card text-left flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent group-hover:via-[#ffa116]/30 transition-all" />
            <div>
              {/* Header: Company & Round */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-display text-xs font-bold px-2.5 py-1 rounded-md border ${item.companyColor}`}
                  >
                    {item.company}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-400">
                    {item.role}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline-block">
                  {item.round}
                </span>
              </div>

              {/* Quote */}
              <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                "{item.text}"
              </p>
            </div>

            {/* Candidate info & stats footer */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <h4 className="font-display text-sm font-bold text-white group-hover:text-[#ffa116] transition-colors">
                  {item.name}
                </h4>
                <p className="font-mono text-[11px] text-zinc-500">{item.stats}</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                Interview Case Study
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonial;