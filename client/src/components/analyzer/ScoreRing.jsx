// The match score as a ring. The number is worked out on the server from the requirement marks, never by the AI.
const colorFor = (score) => (score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#fb7185");

const ScoreRing = ({ score, size = 132 }) => {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = colorFor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Match score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-extrabold text-white leading-none">{score}</span>
        <span className="text-xs text-zinc-400 mt-1">out of 100</span>
      </div>
    </div>
  );
};

export default ScoreRing;
