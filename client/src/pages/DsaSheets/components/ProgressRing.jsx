// ── Circular Progress Ring ─────────────────────────────────────────────────
const ProgressRing = ({ percentage, solved, total, accentColor }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
        {/* Background track */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          style={{ stroke: "color-mix(in srgb, var(--ink) 6%, transparent)" }}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ stroke: accentColor, transition: 'stroke-dashoffset 0.6s ease', filter: `drop-shadow(0 0 6px color-mix(in srgb, ${accentColor} 50%, transparent))` }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-fg leading-none">{solved}</span>
        <span className="text-xs text-muted font-semibold mt-0.5">/ {total}</span>
        <span className="text-xs text-muted mt-1 font-bold">Solved</span>
      </div>
    </div>
  );
};

export default ProgressRing;
