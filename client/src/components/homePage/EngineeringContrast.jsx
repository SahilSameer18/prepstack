import React from "react";
import { FiCheck, FiX, FiLayers, FiAlertTriangle, FiZap } from "react-icons/fi";

const COMPARISON_ROWS = [
  {
    feature: "Problem Tracking",
    legacy: "Scattered spreadsheets, manual Notion checklists abandoned after 10 days",
    prepstack: "Atomic DB synchronization across Blind 75, NeetCode 150, and Striver SDE",
    latency: "Real-time",
  },
  {
    feature: "Pattern Progression",
    legacy: "Random 500+ LeetCode question grind without understanding underlying heuristics",
    prepstack: "Pattern taxonomy: Two Pointers → Sliding Window → Topo Sort → Dynamic Programming",
    latency: "Curated 75",
  },
  {
    feature: "System Architecture",
    legacy: "Generic clone projects (Netflix clone, to-do list) that recruiters immediately skip",
    prepstack: "Production blueprints: Rate limiters, distributed WAL caches, p99 latency SLAs",
    latency: "FAANG Bar",
  },
  {
    feature: "CS Fundamentals",
    legacy: "Dry, fragmented academic slides without interview focus or memory diagrams",
    prepstack: "OS virtual memory, DBMS B-Trees, TCP handshakes, and exact FAANG debriefs",
    latency: "High-Signal",
  },
];

const EngineeringContrast = () => {
  return (
    <section className="relative text-left">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink/[0.03] border border-ink/[0.1] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--ink)_12%,transparent)] mb-4">
          <FiLayers className="text-xs text-brand" />
          <span className="text-xs font-ui uppercase tracking-widest text-brand font-semibold">
            System Architecture Contrast
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-fg tracking-tight leading-tight mb-4">
          Why serious engineers choose <span className="text-brand">PrepStack</span>
        </h2>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          Interview preparation shouldn't require 15 browser tabs, forgotten Google spreadsheets, and unguided grind.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {/* ── The Fragmented Grind ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-card border border-bad-solid/20 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-bad-solid/30 to-transparent" />

          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink/[0.06]">
              <div className="flex items-center gap-2 text-xs font-ui text-bad font-semibold">
                <FiAlertTriangle className="text-sm" />
                Fragmented Legacy Grind
              </div>
              <span className="text-xs font-ui text-muted px-2 py-0.5 rounded bg-bad-solid/10 border border-bad-solid/20">
                Low Conversion
              </span>
            </div>

            <ul className="space-y-4 text-sm text-muted">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-bad-solid/10 border border-bad-solid/20 text-bad flex items-center justify-center shrink-0 mt-0.5">
                  <FiX className="text-xs" />
                </div>
                <span>Jumping across 20+ disconnected YouTube playlists with zero persistent progress tracking.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-bad-solid/10 border border-bad-solid/20 text-bad flex items-center justify-center shrink-0 mt-0.5">
                  <FiX className="text-xs" />
                </div>
                <span>Unmaintained spreadsheets and Notion templates that get abandoned by day 10.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-bad-solid/10 border border-bad-solid/20 text-bad flex items-center justify-center shrink-0 mt-0.5">
                  <FiX className="text-xs" />
                </div>
                <span>Building generic clone projects (to-do lists, weather apps) that recruiters immediately skip past.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-bad-solid/10 border border-bad-solid/20 text-bad flex items-center justify-center shrink-0 mt-0.5">
                  <FiX className="text-xs" />
                </div>
                <span>Memorizing textbook theory without understanding real-world concurrency, deadlocks, or database indexes.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-ink/[0.06] flex items-center justify-between font-ui text-xs text-muted">
            <span>Friction: Context switching &amp; zero persistence</span>
            <span className="text-bad font-ui text-xs bg-bad-solid/10 px-2 py-0.5 rounded border border-bad-solid/20">
              High Friction
            </span>
          </div>
        </div>

        {/* ── The PrepStack Pipeline ── */}
        <div className="p-6 sm:p-8 rounded-2xl titanium-card relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle top specular horizon */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink/[0.08]">
              <div className="flex items-center gap-2 text-xs font-ui uppercase tracking-wider text-brand font-semibold">
                <FiZap className="text-sm text-brand" />
                The PrepStack Pipeline
              </div>
              <span className="text-xs font-ui font-semibold bg-brand/10 px-2 py-0.5 rounded border border-brand/25 text-brand">
                Engineered High-Signal
              </span>
            </div>

            <ul className="space-y-4 text-sm text-fg-2">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-brand/15 border border-brand/30 text-brand flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_color-mix(in_srgb,var(--brand)_30%,transparent)]">
                  <FiCheck className="text-xs" />
                </div>
                <span>Unified dashboard syncing every solved problem atomically across Blind 75, NeetCode, and Striver.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-brand/15 border border-brand/30 text-brand flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_color-mix(in_srgb,var(--brand)_30%,transparent)]">
                  <FiCheck className="text-xs" />
                </div>
                <span>Curated algorithmic pattern progression (Two Pointers &rarr; Sliding Window &rarr; Graph &rarr; DP).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-brand/15 border border-brand/30 text-brand flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_color-mix(in_srgb,var(--brand)_30%,transparent)]">
                  <FiCheck className="text-xs" />
                </div>
                <span>AI system architect generating production blueprints with latency specs, schemas, and indexing tradeoffs.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-brand/15 border border-brand/30 text-brand flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_color-mix(in_srgb,var(--brand)_30%,transparent)]">
                  <FiCheck className="text-xs" />
                </div>
                <span>Synthesized OS, DBMS, Networks, OOPs and System Design notes with exact interview question debriefs.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-ink/[0.08] flex items-center justify-between font-ui text-xs text-brand">
            <span>Advantage: Atomic DB sync &amp; structured patterns</span>
            <span className="font-bold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20 text-xs">
              Single Source of Truth
            </span>
          </div>
        </div>
      </div>

      {/* ── Architectural Diff Breakdown ── */}
      <div className="mt-8 max-w-5xl mx-auto rounded-2xl titanium-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ink/[0.08] bg-card flex items-center justify-between">
          <span className="font-ui text-xs text-fg-3 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Feature-by-Feature Benchmark
          </span>
          <span className="font-ui text-xs text-muted">Linear Architecture Standard</span>
        </div>
        <div className="divide-y divide-ink/[0.06]">
          {COMPARISON_ROWS.map((row, idx) => (
            <div key={idx} className="p-4 sm:p-5 grid sm:grid-cols-12 gap-3 sm:gap-6 items-center hover:bg-ink/[0.02] transition-colors">
              <div className="sm:col-span-3">
                <span className="font-display font-bold text-sm text-fg">{row.feature}</span>
                <span className="block font-code text-xs text-brand mt-0.5">{row.latency}</span>
              </div>
              <div className="sm:col-span-4 text-xs text-muted flex items-start gap-2">
                <FiX className="text-bad text-xs shrink-0 mt-0.5" />
                <span>{row.legacy}</span>
              </div>
              <div className="sm:col-span-5 text-xs text-fg-2 flex items-start gap-2">
                <FiCheck className="text-brand text-xs shrink-0 mt-0.5" />
                <span className="font-medium">{row.prepstack}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EngineeringContrast;
