import { Link } from "react-router-dom";
import { FiClock } from "react-icons/fi";

const BUTTON = "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl amber-specular-button text-on-brand font-bold text-xs sm:text-sm min-h-[44px] cursor-pointer";

// An empty list or "nothing found" screen: icon, title, one line, and an optional button.
// icon is a react-icons component (for example FiCpu); action is { label, to } for a link or { label, onClick } for a button.
export const EmptyState = ({ icon: Icon, title, text, action, className = "" }) => (
  <div className={`flex flex-col items-center justify-center py-12 bg-card border border-ink/[0.08] rounded-2xl text-center px-4 ${className}`}>
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-ink/[0.03] border border-ink/[0.08] flex items-center justify-center mb-4">
        <Icon className="text-2xl text-muted" />
      </div>
    )}
    <h3 className="font-display text-lg font-bold text-fg mb-2">{title}</h3>
    {text && <p className="text-muted text-xs sm:text-sm max-w-sm mb-5 leading-relaxed">{text}</p>}
    {action?.to && <Link to={action.to} className={BUTTON}>{action.label}</Link>}
    {action?.onClick && <button type="button" onClick={action.onClick} className={BUTTON}>{action.label}</button>}
  </div>
);

// A daily limit that has been reached (or is close): what the limit is and when it resets.
// used and allowed are optional and draw a small bar; resetsAt is an ISO date string.
export const LimitState = ({ title, text, used, allowed, resetsAt, className = "" }) => {
  const resets = resetsAt ? new Date(resetsAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : null;
  const showBar = Number.isFinite(used) && Number.isFinite(allowed) && allowed > 0;
  return (
    <div role="status" className={`bg-warn-solid/10 border border-warn-solid/25 rounded-xl px-4 py-3 ${className}`}>
      <div className="flex items-start gap-3">
        <FiClock className="text-warn flex-shrink-0 mt-0.5 text-base" />
        <div className="flex-1">
          <p className="text-warn text-sm font-semibold leading-snug">{title}</p>
          {text && <p className="text-warn text-xs mt-1 leading-snug">{text}{resets ? ` Resets at ${resets}.` : ""}</p>}
        </div>
      </div>
      {showBar && (
        <div className="mt-3 h-1.5 rounded-full bg-ink/[0.08] overflow-hidden" aria-hidden="true">
          <div className="h-full bg-warn-solid" style={{ width: `${Math.min(100, Math.round((used / allowed) * 100))}%` }} />
        </div>
      )}
    </div>
  );
};

// What is left of today's allowance, shown on a form before the user hits the limit. usage is { used, allowed, resetsAt }
// from useUsage (null while loading: nothing is shown). noun is the plural, for example "ideas".
export const UsageNotice = ({ usage, noun, className = "" }) => {
  if (!usage) return null;
  const left = usage.allowed - usage.used;
  if (left <= 0) {
    return (
      <LimitState
        className={className}
        title={`Daily limit reached: ${usage.used} of ${usage.allowed} ${noun} used`}
        text="You can make more once your oldest one is over 24 hours old."
        used={usage.used}
        allowed={usage.allowed}
        resetsAt={usage.resetsAt}
      />
    );
  }
  return <p className={`text-xs text-muted text-center ${className}`}>{left} of {usage.allowed} {noun} left today</p>;
};
