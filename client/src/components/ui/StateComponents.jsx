import { Link } from "react-router-dom";
import { Clock } from "@phosphor-icons/react";

const BUTTON = "amber-specular-button inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold";

// An empty list or "nothing found" screen: icon, title, one line, and an optional button.
// icon is an icon component (Phosphor, for example MagnifyingGlass); action is { label, to } for a link or { label, onClick } for a button.
export const EmptyState = ({ icon: Icon, title, text, action, className = "" }) => (
  <div className={`surface-card fade-in relative flex flex-col items-center justify-center overflow-hidden px-6 py-14 text-center ${className}`}>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-20 left-1/2 h-44 w-80 -translate-x-1/2 rounded-full blur-3xl"
      style={{ background: "color-mix(in srgb, var(--brand) 12%, transparent)" }}
    />
    {Icon && (
      <span className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-3xl text-brand">
        <Icon weight="duotone" aria-hidden="true" />
      </span>
    )}
    <h3 className="relative font-display text-2xl font-extrabold tracking-tight text-fg">{title}</h3>
    {text && <p className="relative mb-6 mt-2 max-w-sm text-base leading-relaxed text-muted">{text}</p>}
    {action?.to && <Link to={action.to} className={`relative ${BUTTON}`}>{action.label}</Link>}
    {action?.onClick && <button type="button" onClick={action.onClick} className={`relative ${BUTTON}`}>{action.label}</button>}
  </div>
);

// A daily limit that has been reached (or is close): what the limit is and when it resets.
// used and allowed are optional and draw a small bar; resetsAt is an ISO date string.
export const LimitState = ({ title, text, used, allowed, resetsAt, className = "" }) => {
  const resets = resetsAt ? new Date(resetsAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : null;
  const showBar = Number.isFinite(used) && Number.isFinite(allowed) && allowed > 0;
  return (
    <div role="status" className={`rounded-xl border border-warn-solid/25 bg-warn-solid/10 px-4 py-3 ${className}`}>
      <div className="flex items-start gap-3">
        <Clock weight="duotone" aria-hidden="true" className="mt-0.5 shrink-0 text-lg text-warn" />
        <div className="flex-1">
          <p className="text-sm font-semibold leading-snug text-warn">{title}</p>
          {text && <p className="mt-1 text-sm leading-snug text-warn">{text}{resets ? ` Resets at ${resets}.` : ""}</p>}
        </div>
      </div>
      {showBar && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]" aria-hidden="true">
          <div className="bar-fill h-full w-full bg-warn-solid" style={{ transform: `scaleX(${Math.min(100, Math.round((used / allowed) * 100)) / 100})` }} />
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
  return <p className={`text-center text-sm text-muted ${className}`}>{left} of {usage.allowed} {noun} left today</p>;
};
