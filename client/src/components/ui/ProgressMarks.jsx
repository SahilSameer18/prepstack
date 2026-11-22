// Progress as a row of small marks: one mark per problem (or per slice when there are many), filled as you finish.
// `value` of `total` is the real count; `max` caps the number of marks so a long list stays a calm row.
const ProgressMarks = ({ value, total, max = 20, label, tall = false, className = "" }) => {
  const marks = Math.max(1, Math.min(total, max));
  const pct = total > 0 ? Math.min(value >= total ? 100 : 99, Math.max(0, Math.floor((value / total) * 100))) : 0;
  // a started list always shows at least one filled mark, and a finished one fills them all
  // Keep the final mark empty until the actual list is complete.
  const filled = value <= 0 ? 0 : value >= total ? marks : Math.min(marks - 1, Math.max(1, Math.floor((value / total) * marks)));
  return (
    <span
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`flex gap-[3px] ${className}`}
    >
      {Array.from({ length: marks }, (_, i) => (
        <i
          key={i}
          aria-hidden="true"
          style={i < filled ? { animationDelay: `${Math.min(i * 40, 600)}ms` } : undefined}
          className={`${tall ? "h-3" : "h-2"} min-w-0 flex-1 rounded-[2px] transition-colors duration-300 ${i < filled ? "bg-brand mark-fill" : "bg-ink/[0.1]"}`}
        />
      ))}
    </span>
  );
};

export default ProgressMarks;
