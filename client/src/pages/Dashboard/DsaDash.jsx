import React, { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCode,
  FiExternalLink,
  FiAward,
  FiStar,
} from "react-icons/fi";

// ── Sheet accent colors ────────────────────────────────────────────────────
const SHEET_META = {
  "blind-75": {
    accentColor: "#3b82f6",
    badge: "FAANG Core",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  },
  "neetcode-150": {
    accentColor: "#a855f7",
    badge: "Algorithms 150",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/25",
  },
  "striver-sde": {
    accentColor: "#ffa116",
    badge: "SDE Standard",
    badgeColor: "text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/25",
  },
  "striver-a2z": {
    accentColor: "#10b981",
    badge: "Foundational A2Z",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
  "love-babbar": {
    accentColor: "#ec4899",
    badge: "DSA 450",
    badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/25",
  },
};
const getSheetMeta = (slug) =>
  SHEET_META[slug] || {
    accentColor: "#ffa116",
    badge: "Curriculum",
    badgeColor: "text-zinc-300 bg-white/[0.04] border-white/[0.08]",
  };

// ── Skeleton ───────────────────────────────────────────────────────────────
const SkeletonDSACard = memo(() => (
  <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-28 rounded bg-white/[0.06]" />
      <div className="h-5 w-16 rounded-full bg-white/[0.06]" />
    </div>
    <div className="h-2 w-full rounded-full bg-white/[0.04]" />
    <div className="flex items-center justify-between">
      <div className="h-3 w-20 rounded bg-white/[0.06]" />
      <div className="h-3 w-12 rounded bg-white/[0.06]" />
    </div>
  </div>
));

// ── Mini circular progress ring ────────────────────────────────────────────
const MiniRing = memo(({ pct, color }) => {
  const r = 18,
    c = 2 * Math.PI * r;
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      className="-rotate-90 flex-shrink-0"
    >
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="3.5"
      />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        style={{
          transition: "stroke-dashoffset 0.6s ease",
        }}
      />
    </svg>
  );
});

// ── DSADash ────────────────────────────────────────────────────────────────
const DSADash = ({ dsaData, loading, stats }) => {
  return (
    <section className="mb-14 text-left">
      {/* Section heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/25 flex items-center justify-center">
            <FiCode className="text-[#ffa116] text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">DSA Practice Workspace</h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Curated interview question sets and algorithmic mastery tracking
            </p>
          </div>
        </div>
        <Link
          to="/dsa"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-colors self-start sm:self-auto min-h-[44px]"
        >
          <span>All Curricula</span>
          <FiExternalLink className="text-xs text-zinc-400" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonDSACard key={i} />)
          : dsaData.map(({ sheet, solved, total }) => {
              const meta = getSheetMeta(sheet.slug);
              const pct = total === 0 ? 0 : Math.round((solved / total) * 100);
              const remaining = total - solved;
              return (
                <div
                  key={sheet.slug}
                  className="relative"
                >
                  <Link
                    to={`/dsa/${sheet.slug}`}
                    className="group relative bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.2] rounded-2xl p-5 flex gap-4 items-center transition-colors duration-200 overflow-hidden h-full shadow-lg"
                  >
                    {/* Mini ring */}
                    <div className="relative flex-shrink-0">
                      <MiniRing pct={pct} color={meta.accentColor} />
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold"
                        style={{ color: meta.accentColor }}
                      >
                        {pct}%
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.badgeColor}`}
                        >
                          {meta.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-display font-bold text-white group-hover:text-zinc-100 truncate transition-colors">
                        {sheet.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: meta.accentColor,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-zinc-300 font-semibold whitespace-nowrap flex-shrink-0">
                          {solved} / {total}
                        </span>
                      </div>
                      {remaining > 0 ? (
                        <p className="text-[11px] font-mono text-zinc-500 mt-2">
                          <span className="text-zinc-300 font-medium">
                            {remaining}
                          </span>{" "}
                          problems remaining
                        </p>
                      ) : (
                        <p className="text-[11px] font-mono text-emerald-400 mt-2 font-medium">
                          Curriculum Completed
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
      </div>

      {/* Telemetry readiness callout */}
      {!loading && stats.totalSolved > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/25 flex items-center justify-center flex-shrink-0">
              <FiAward className="text-[#ffa116] text-lg" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {stats.totalSolved} Algorithmic Problems Mastered
              </p>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                {stats.sheetsCompleted > 0
                  ? `${stats.sheetsCompleted} complete curriculum finished · Placement ready`
                  : "Consistent practice across top curated company question patterns"}
              </p>
            </div>
          </div>
          <Link
            to="/dsa"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-mono font-semibold text-zinc-200 transition-colors"
          >
            Explore All Sheets →
          </Link>
        </div>
      )}
    </section>
  );
};

export default DSADash;

