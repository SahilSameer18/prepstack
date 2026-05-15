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
    badge: "FAANG Favourite",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  "neetcode-150": {
    accentColor: "#a855f7",
    badge: "Community Favourite",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  "striver-sde": {
    accentColor: "#ffa116",
    badge: "Most Popular",
    badgeColor: "text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/20",
  },
  "striver-a2z": {
    accentColor: "#10b981",
    badge: "Beginner Friendly",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  "love-babbar": {
    accentColor: "#ec4899",
    badge: "Complete Coverage",
    badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  },
};
const getSheetMeta = (slug) =>
  SHEET_META[slug] || {
    accentColor: "#ffa116",
    badge: "Popular",
    badgeColor: "text-gray-400 bg-white/5 border-white/10",
  };

// ── Skeleton ───────────────────────────────────────────────────────────────
const SkeletonDSACard = memo(() => (
  <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-28 rounded bg-white/[0.06]" />
      <div className="h-5 w-16 rounded-full bg-white/[0.06]" />
    </div>
    <div className="h-2.5 w-full rounded-full bg-white/[0.04]" />
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
        strokeWidth="4"
      />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        style={{
          transition: "stroke-dashoffset 0.8s ease",
          filter: `drop-shadow(0 0 4px ${color}80)`,
        }}
      />
    </svg>
  );
});

// ── DSADash ────────────────────────────────────────────────────────────────
// Props:
//   dsaData   – array of { sheet, solved, total }
//   loading   – boolean
//   stats     – { totalSolved, sheetsCompleted }
const DSADash = ({ dsaData, loading, stats }) => {
  return (
    <motion.section
      className="mb-14"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Section heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/20 flex items-center justify-center">
            <FiCode className="text-[#ffa116]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">DSA Sheets</h2>
            <p className="text-xs text-gray-500">
              Track your progress across curated sheets
            </p>
          </div>
        </div>
        <Link
          to="/dsa"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all"
        >
          View All <FiExternalLink className="text-xs" />
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
                <motion.div
                  key={sheet.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <Link
                    to={`/dsa/${sheet.slug}`}
                    className="group relative bg-[#0f0f0f] border border-white/[0.05] hover:border-white/[0.15] rounded-2xl p-5 flex gap-4 items-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden h-full"
                  >
                    {/* Glow */}
                    <div
                      className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300 pointer-events-none"
                      style={{ background: meta.accentColor }}
                    />

                    {/* Mini ring */}
                    <div className="relative flex-shrink-0">
                      <MiniRing pct={pct} color={meta.accentColor} />
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[11px] font-black"
                        style={{ color: meta.accentColor }}
                      >
                        {pct}%
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                        >
                          {meta.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-100 group-hover:text-white truncate transition-colors">
                        {sheet.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: meta.accentColor,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 font-semibold whitespace-nowrap flex-shrink-0">
                          {solved} / {total}
                        </span>
                      </div>
                      {remaining > 0 && (
                        <p className="text-[10px] text-gray-600 mt-2">
                          <span className="text-gray-400 font-semibold">
                            {remaining}
                          </span>{" "}
                          problems left
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
      </div>

      {/* Achievement callout */}
      {!loading && stats.totalSolved > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-3 bg-gradient-to-r from-emerald-500/[0.06] to-blue-500/[0.06] border border-emerald-500/20 rounded-2xl px-5 py-4"
        >
          <FiAward className="text-emerald-400 text-xl flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300">
              <span className="text-emerald-400 font-black">
                {stats.totalSolved} problems solved
              </span>
              <span className="text-gray-500"> • Keep grinding! 🚀</span>
            </p>
            {stats.sheetsCompleted > 0 && (
              <p className="text-[11px] text-gray-500 mt-1">
                <FiStar className="inline mr-1" />
                {stats.sheetsCompleted} sheet
                {stats.sheetsCompleted !== 1 ? "s" : ""} completed
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default DSADash;