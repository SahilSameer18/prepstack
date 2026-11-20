// ── Circular Progress Ring ─────────────────────────────────────────────────
const ProgressRing = ({ percentage, solved, total }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90" aria-hidden="true">
        {/* Background track */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          style={{ stroke: "color-mix(in srgb, var(--ink) 8%, transparent)" }}
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ stroke: 'var(--brand-grad-bottom)', transition: 'stroke-dashoffset 400ms cubic-bezier(0.23, 1, 0.32, 1)' }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-black leading-none text-fg">{percentage}%</span>
        <span className="mt-1 font-ui text-xs font-semibold text-muted">{solved} / {total}</span>
      </div>
    </div>
  );
};

export default ProgressRing;
