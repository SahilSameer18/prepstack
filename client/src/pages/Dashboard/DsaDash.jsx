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
    accentColor: "var(--data-blue)",
    badge: "FAANG Core",
    badgeColor: "text-info bg-info-solid/10 border-info-solid/25",
  },
  "neetcode-150": {
    accentColor: "var(--data-purple)",
    badge: "Algorithms 150",
    badgeColor: "text-violet bg-violet-solid/10 border-violet-solid/25",
  },
  "striver-sde": {
    accentColor: "var(--brand)",
    badge: "SDE Standard",
    badgeColor: "text-brand bg-brand/10 border-brand/25",
  },
  "striver-a2z": {
    accentColor: "var(--data-green)",
    badge: "Foundational A2Z",
    badgeColor: "text-ok bg-ok-solid/10 border-ok-solid/25",
  },
  "love-babbar": {
    accentColor: "var(--data-pink)",
    badge: "DSA 450",
    badgeColor: "text-pink bg-pink-solid/10 border-pink-solid/25",
  },
};
const getSheetMeta = (slug) =>
  SHEET_META[slug] || {
    accentColor: "var(--brand)",
    badge: "Sheet",
    badgeColor: "text-fg-3 bg-ink/[0.04] border-ink/[0.08]",
  };

// ── Skeleton ───────────────────────────────────────────────────────────────
const SkeletonDSACard = memo(() => (
  <div className="bg-card border border-ink/[0.08] rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-28 rounded bg-ink/[0.06]" />
      <div className="h-5 w-16 rounded-full bg-ink/[0.06]" />
    </div>
    <div className="h-2 w-full rounded-full bg-ink/[0.04]" />
    <div className="flex items-center justify-between">
      <div className="h-3 w-20 rounded bg-ink/[0.06]" />
      <div className="h-3 w-12 rounded bg-ink/[0.06]" />
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
        style={{ stroke: "color-mix(in srgb, var(--ink) 6%, transparent)" }}
        strokeWidth="3.5"
      />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        style={{
          stroke: color,
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
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center">
            <FiCode className="text-brand text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-fg">DSA Practice Workspace</h2>
            <p className="text-xs font-ui text-muted mt-0.5">
              Your progress on each DSA sheet
            </p>
          </div>
        </div>
        <Link
          to="/dsa"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink/[0.04] border border-ink/[0.08] hover:border-ink/[0.18] text-xs font-ui font-semibold text-fg-3 hover:text-fg transition-colors self-start sm:self-auto min-h-[44px]"
        >
          <span>All sheets</span>
          <FiExternalLink className="text-xs text-muted" />
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
                    className="group relative titanium-card rounded-2xl p-5 flex gap-4 items-center transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden h-full shadow-lg"
                  >
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent group-hover:via-brand/40 transition-all" />

                    {/* Mini ring */}
                    <div className="relative flex-shrink-0">
                      <MiniRing pct={pct} color={meta.accentColor} />
                      <span
                        className="absolute inset-0 flex items-center justify-center text-xs font-ui font-bold"
                        style={{ color: meta.accentColor }}
                      >
                        {pct}%
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-xs font-ui font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.badgeColor}`}
                        >
                          {meta.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-display font-bold text-fg group-hover:text-brand truncate transition-colors">
                        {sheet.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 bg-ink/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            style={{
                              background: meta.accentColor,
                            }}
                          />
                        </div>
                        <span className="text-xs font-ui text-fg-3 font-semibold whitespace-nowrap flex-shrink-0">
                          {solved} / {total}
                        </span>
                      </div>
                      {remaining > 0 ? (
                        <p className="text-xs font-ui text-muted mt-2">
                          <span className="text-fg-3 font-medium">
                            {remaining}
                          </span>{" "}
                          problems remaining
                        </p>
                      ) : (
                        <p className="text-xs font-ui text-ok mt-2 font-medium">
                          Sheets completed
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
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 titanium-card rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center flex-shrink-0">
              <FiAward className="text-brand text-lg" />
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">
                {stats.totalSolved} problems solved
              </p>
              <p className="text-xs font-ui text-muted mt-0.5">
                {stats.sheetsCompleted > 0
                  ? `${stats.sheetsCompleted} complete curriculum finished · Placement ready`
                  : "Keep going: a little practice every day adds up"}
              </p>
            </div>
          </div>
          <Link
            to="/dsa"
            className="self-start sm:self-auto px-4 py-2 min-h-[44px] sm:min-h-0 inline-flex items-center rounded-xl titanium-button text-xs font-ui font-semibold text-fg-2 transition-colors"
          >
            Explore All Sheets →
          </Link>
        </div>
      )}
    </section>
  );
};

export default DSADash;

