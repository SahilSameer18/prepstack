import React from "react";
import PageBackdrop from "./PageBackdrop";

// ─────────────────────────────────────────────────────────────────────────────
// The loading kit. Every placeholder in the app is built from <Skeleton>, so they all share one shimmer
// (the .skeleton-shine class in index.css): warm tint, a slow soft sweep, still under "reduce motion".
// Shapes follow one rule: lines are rounded-md, tiles rounded-xl, pills rounded-full, cards .surface-card,
// and each placeholder keeps the size of the real thing so nothing jumps when the content arrives.
// ─────────────────────────────────────────────────────────────────────────────

export const Skeleton = ({ className = "", style }) => <div aria-hidden="true" className={`skeleton-shine ${className}`} style={style} />;

// A group of placeholders announced once to screen readers
const Busy = ({ label = "Loading", className = "", children }) => (
  <div role="status" aria-busy="true" className={className}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
);

/** SkeletonStat - a single number: a small pill the size of the number */
export const SkeletonStat = ({ width = "w-12", height = "h-7" }) => <Skeleton className={`${width} ${height} rounded-md`} />;

/** SkeletonTextRows - generic lines for any text block */
export const SkeletonTextRows = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-4 rounded-md" style={{ width: `${75 + Math.sin(i) * 20}%` }} />
    ))}
  </div>
);

/** SkeletonCard - one DSA sheet card (same structure as the real card) */
export const SkeletonCard = ({ className = "" }) => (
  <div className={`surface-card p-6 ${className}`}>
    <div className="flex items-start justify-between">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="mt-5 h-6 w-2/3 rounded-md" />
    <Skeleton className="mt-3 h-4 w-5/6 rounded-md" />
    <Skeleton className="mt-4 h-4 w-1/2 rounded-md" />
    <div className="mt-4 flex gap-1.5">
      <Skeleton className="h-6 w-14 rounded-md" />
      <Skeleton className="h-6 w-16 rounded-md" />
      <Skeleton className="h-6 w-14 rounded-md" />
    </div>
    <Skeleton className="mt-6 h-4 w-24 rounded-md" />
  </div>
);

/** SkeletonSheetList - the DSA list: three groups (2 + 2 + 1 cards), like the real page */
export const SkeletonSheetList = () => (
  <Busy label="Loading sheets" className="space-y-14">
    {[2, 2, 1].map((count, g) => (
      <section key={g}>
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-ink/[0.1] pb-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded-md" />
            <Skeleton className="h-4 w-72 max-w-full rounded-md" />
          </div>
          <Skeleton className="h-4 w-14 rounded-md" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    ))}
  </Busy>
);

/** SkeletonProjectCard - a saved project idea on the dashboard */
export const SkeletonProjectCard = () => (
  <div className="surface-card space-y-4 p-6">
    <div className="flex items-start justify-between">
      <Skeleton className="h-4 w-20 rounded-md" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-6 w-4/5 rounded-md" />
      <Skeleton className="h-4 w-2/3 rounded-md" />
    </div>
    <div className="flex items-center justify-between border-t border-ink/[0.08] pt-4">
      <Skeleton className="h-4 w-20 rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);

/** SkeletonDSACard - the per-sheet progress card on the dashboard */
export const SkeletonDSACard = () => (
  <div className="surface-card space-y-3 p-5">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-28 rounded-md" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-20 rounded-md" />
      <Skeleton className="h-4 w-12 rounded-md" />
    </div>
  </div>
);

/** SkeletonSheetDetail - the whole sheet page: back link, title, buttons, progress card, filter bar, topic rows */
export const SkeletonSheetDetail = () => (
  <div className="relative">
    <PageBackdrop />
    <Busy label="Loading the sheet" className="relative z-10 mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <Skeleton className="mb-4 h-5 w-28 rounded-md" />
      <Skeleton className="h-12 w-2/3 rounded-xl" />
      <Skeleton className="mt-5 h-4 w-full max-w-2xl rounded-md" />
      <Skeleton className="mt-3 h-4 w-3/4 max-w-xl rounded-md" />
      <div className="mt-6 flex flex-wrap gap-3">
        <Skeleton className="h-11 w-56 rounded-xl" />
        <Skeleton className="h-11 w-48 rounded-xl" />
      </div>

      <div className="surface-card mt-8 flex flex-col items-center gap-6 p-6 sm:flex-row">
        <Skeleton className="h-[136px] w-[136px] shrink-0 rounded-full" />
        <div className="w-full flex-1 space-y-3">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-3 border-t border-ink/[0.08] pt-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 rounded-md" />)}
          </div>
        </div>
      </div>

      <div className="surface-card mt-6 flex flex-wrap items-center gap-2 p-3">
        {["w-16", "w-20", "w-24", "w-20", "w-32"].map((w, i) => <Skeleton key={i} className={`h-11 rounded-xl ${w}`} />)}
      </div>

      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </Busy>
  </div>
);

/** SkeletonNotesDetail - a notes reading page: section list, title, text and cards, and the on-this-page column */
export const SkeletonNotesDetail = () => (
  <div className="relative">
    <PageBackdrop />
    <Busy label="Loading the notes" className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_13rem]">
      <div className="hidden space-y-4 lg:block">
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="h-3 w-14 rounded-md" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-3 w-20 rounded-md" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)}
        </div>
      </div>

      <div className="min-w-0 max-w-3xl space-y-5">
        <Skeleton className="h-4 w-56 rounded-md" />
        <Skeleton className="h-11 w-3/4 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-md" />
        <div className="space-y-3 border-t border-ink/[0.08] pt-6">
          {[100, 95, 100, 70].map((w, i) => <Skeleton key={i} className="h-4 rounded-md" style={{ width: `${w}%` }} />)}
        </div>
        <Skeleton className="mt-4 h-8 w-32 rounded-md" />
        {[0, 1].map((i) => (
          <div key={i} className="surface-card space-y-3 p-6">
            <Skeleton className="h-6 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        ))}
      </div>

      <div className="hidden space-y-3 xl:block">
        <Skeleton className="h-3 w-24 rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full rounded-md" />)}
      </div>
    </Busy>
  </div>
);

/** SectionLoader - a block of content that has not arrived yet (for example a list under a dashboard tab) */
export const SectionLoader = ({ message = "Loading..." }) => (
  <Busy label={message} className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="surface-card flex items-center gap-4 p-5">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="w-full space-y-2">
          <Skeleton className="h-5 w-1/3 rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </div>
    ))}
  </Busy>
);

/**
 * InlineSpinner - a tiny spinner for inside buttons and small messages
 */
export const InlineSpinner = ({ size = 16, color = "var(--on-brand)" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="shrink-0 animate-spin"
    style={{ animationDuration: "0.8s" }}
  >
    <circle cx="12" cy="12" r="9" style={{ stroke: color }} strokeWidth="2.5" opacity="0.25" />
    <path d="M12 3a9 9 0 0 1 9 9" style={{ stroke: color }} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** SkeletonPlanPreview - the "See what fits" panel while the server builds the preview */
export const SkeletonPlanPreview = () => (
  <div aria-hidden="true" className="space-y-6">
    <div className="space-y-3 border-b border-ink/[0.1] pb-5">
      <Skeleton className="h-10 w-40 rounded-md" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
    </div>
    <div className="space-y-2.5">
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-5/6 rounded-md" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-5 w-28 rounded-md" />
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)}
    </div>
  </div>
);

/** SkeletonStudy - the daily plan while it loads. Like the real Today screen it holds only a heading, one big button and the day's tasks. */
export const SkeletonStudy = () => (
  <Busy label="Loading your plan" className="mx-auto max-w-2xl space-y-5">
    <Skeleton className="h-9 w-72 max-w-full rounded-xl" />
    <Skeleton className="h-14 w-full rounded-2xl" />
    <div className="surface-card space-y-1 px-5 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-4">
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
      ))}
    </div>
  </Busy>
);
