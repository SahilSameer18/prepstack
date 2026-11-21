import { Eye, EyeSlash } from "@phosphor-icons/react";

// One text field for every auth form: label, icon, input and an optional trailing control.
// The focus ring is on the rounded wrapper (CSS focus-within), so the input itself shows no second outline.
const AuthField = ({ id, label, icon, trailing, hint, ...inputProps }) => {
  const Icon = icon;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg-3">{label}</label>
      <div className="group flex h-12 w-full items-center gap-3 rounded-xl border border-ink/[0.14] bg-card px-4 transition-[border-color,box-shadow] duration-200 hover:border-ink/[0.24] focus-within:border-brand focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)]">
        <Icon aria-hidden="true" className="shrink-0 text-lg text-muted transition-colors group-focus-within:text-brand" />
        <input id={id} className="auth-field-input w-full bg-transparent text-sm text-fg placeholder-faint outline-none" {...inputProps} />
        {trailing}
      </div>
      {hint}
    </div>
  );
};

// The eye button at the end of a password field
export const PasswordToggle = ({ show, onToggle }) => (
  <button
    type="button"
    aria-label={show ? "Hide password" : "Show password"}
    aria-pressed={show}
    onClick={onToggle}
    className="flex min-h-[32px] min-w-[32px] shrink-0 cursor-pointer items-center justify-center text-muted transition-colors hover:text-fg-3"
  >
    {show ? <Eye className="text-lg" /> : <EyeSlash className="text-lg" />}
  </button>
);

export default AuthField;
