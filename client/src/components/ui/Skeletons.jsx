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
 * InlineSpinner - Tiny spinner for inside buttons
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
 * SectionLoader - Mid-page loading state (not full-screen)
 */
export const SectionLoader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-2 border-[#ffa116]/20 animate-ping" />
      <div className="w-14 h-14 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/30 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#ffa116]/40 border-t-[#ffa116] rounded-full animate-spin" />
      </div>
    </div>
    <p className="text-gray-400 text-sm animate-pulse">{message}</p>
  </div>
);