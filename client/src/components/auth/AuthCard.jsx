import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

/**
 * AuthCard: the plain centred frame used by the password-reset pages (logo, back link, title, content).
 * Colors come from the design tokens only.
 */
const AuthCard = ({ title, subtitle, backTo = "/login", backLabel = "Back to log in", children }) => (
  <div className="min-h-screen bg-canvas text-body flex flex-col items-center justify-center px-6 py-10">
    <Link to="/" className="text-xl font-display font-bold tracking-tight text-fg mb-8">
      Prep<span className="text-brand">Stack</span>
    </Link>

    <div className="w-full max-w-md bg-card border border-ink/[0.08] rounded-2xl p-6 sm:p-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 min-h-[44px] text-xs font-ui text-muted hover:text-fg transition-colors mb-2"
      >
        <FiArrowLeft className="text-xs" />
        <span>{backLabel}</span>
      </Link>

      <h1 className="text-2xl font-bold text-fg mb-1.5">{title}</h1>
      {subtitle && <p className="text-muted text-sm mb-6">{subtitle}</p>}

      {children}
    </div>
  </div>
);

export default AuthCard;
