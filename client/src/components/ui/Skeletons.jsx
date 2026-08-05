import React from "react";

/**
 * SkeletonCard - A shimmering placeholder card
 * @param {string} className - additional class names
 */
export const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden ${className}`}>
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl skeleton-shine" />
        <div className="w-16 h-5 rounded-full skeleton-shine" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded skeleton-shine" />
        <div className="h-3 w-1/2 rounded skeleton-shine" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 rounded skeleton-shine" />
        <div className="h-5 w-20 rounded skeleton-shine" />
        <div className="h-5 w-14 rounded skeleton-shine" />
      </div>
      <div className="h-9 w-full rounded-xl skeleton-shine" />
    </div>
  </div>
);

/**
 * SkeletonProjectCard - For the project dashboard grid
 */
export const SkeletonProjectCard = () => (
  <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="h-4 w-20 rounded-full skeleton-shine" />
      <div className="h-5 w-16 rounded-full skeleton-shine" />
    </div>
    <div className="space-y-2">
      <div className="h-6 w-4/5 rounded skeleton-shine" />
      <div className="h-3 w-2/3 rounded skeleton-shine" />
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
      <div className="h-3 w-20 rounded skeleton-shine" />
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-lg skeleton-shine" />
        <div className="w-8 h-8 rounded-lg skeleton-shine" />
      </div>
    </div>
  </div>
);

/**
 * SkeletonTextRows - Generic shimmer rows for any list/detail view
 */
export const SkeletonTextRows = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-4 rounded skeleton-shine"
        style={{ width: `${75 + Math.sin(i) * 20}%` }}
      />
    ))}
  </div>
);

/**
 * SkeletonStat - Compact shimmer placeholder for numbers in stat cards
 */
export const SkeletonStat = ({ width = "w-12", height = "h-7" }) => (
  <div className={`${width} ${height} rounded-lg skeleton-shine`} />
);

/**
 * SkeletonSheetDetail - Pixel-matched full page skeleton for DSA Sheet detail view
 */
export const SkeletonSheetDetail = () => (
  <div className="px-4 md:px-6 py-8 max-w-5xl mx-auto text-white">
    {/* Back Link Placeholder */}
    <div className="h-5 w-28 rounded skeleton-shine mb-6" />

    {/* Header Card */}
    <div className="bg-[#0f0f0f] border border-white/[0.07] rounded-2xl p-6 md:p-8 mb-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-28 rounded-full skeleton-shine" />
            <div className="h-6 w-24 rounded-full skeleton-shine" />
          </div>
          <div className="h-8 w-64 rounded-xl skeleton-shine" />
          <div className="h-4 w-5/6 rounded skeleton-shine" />
        </div>
        {/* Circle Progress placeholder */}
        <div className="w-24 h-24 rounded-full skeleton-shine shrink-0 hidden md:block" />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 pt-4 border-t border-white/[0.05]">
        <div className="flex justify-between">
          <div className="h-4 w-28 rounded skeleton-shine" />
          <div className="h-4 w-16 rounded skeleton-shine" />
        </div>
        <div className="h-2.5 w-full rounded-full skeleton-shine" />
      </div>
    </div>

    {/* Topic Accordions */}
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#0f0f0f] border border-white/[0.07] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md skeleton-shine" />
              <div className="h-5 w-44 rounded skeleton-shine" />
            </div>
            <div className="h-5 w-16 rounded-full skeleton-shine" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * SkeletonNotesDetail - Pixel-matched full page skeleton for CS Notes detail view
 */
export const SkeletonNotesDetail = () => (
  <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] -mt-6">
    {/* Left Sidebar Skeleton */}
    <div className="w-72 bg-[#0c0c0c] border-r border-white/[0.07] flex flex-col flex-shrink-0 hidden md:flex p-4 space-y-4">
      <div className="h-6 w-3/4 rounded skeleton-shine mb-2" />
      <div className="space-y-2.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-9 w-full rounded-xl skeleton-shine" />
        ))}
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
        {/* Breadcrumb */}
        <div className="h-4 w-36 rounded skeleton-shine mb-5" />

        {/* Title */}
        <div className="h-8 w-64 rounded-xl skeleton-shine mb-6 pb-4 border-b border-white/[0.08]" />

        {/* Note Concept Card Blocks */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
          <div className="h-4 w-32 rounded skeleton-shine" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded skeleton-shine" />
            <div className="h-4 w-5/6 rounded skeleton-shine" />
            <div className="h-4 w-4/6 rounded skeleton-shine" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
          <div className="h-4 w-28 rounded skeleton-shine" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded skeleton-shine" />
            <div className="h-4 w-3/4 rounded skeleton-shine" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * InlineSpinner - Tiny spinner strictly for inside buttons
 */
export const InlineSpinner = ({ size = 16, color = "#000" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
  >
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" opacity="0.25" />
    <path d="M12 3a9 9 0 0 1 9 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

/**
 * SectionLoader - Mid-page skeleton block
 */
export const SectionLoader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-12 h-12 rounded-2xl skeleton-shine" />
    <p className="text-gray-400 text-sm">{message}</p>
  </div>
);
