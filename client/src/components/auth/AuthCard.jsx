import PageBackdrop from "../ui/PageBackdrop";
import { AuthEnter, BackLink, Logo } from "./AuthShell";

/**
 * AuthCard: the centred frame used by the password-reset pages (logo, back link, title, content).
 * Colors come from the design tokens only.
 */
const AuthCard = ({ title, subtitle, backTo = "/login", backLabel = "Back to log in", children }) => (
  <div className="relative flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-10 text-body">
    <PageBackdrop />
    <div className="relative z-10 mb-8"><Logo className="text-xl" /></div>

    <AuthEnter className="surface-card relative z-10 w-full max-w-md p-6 text-left sm:p-8">
      <BackLink to={backTo} label={backLabel} />
      <h1 className="mb-1.5 font-display text-3xl font-black tracking-[-0.04em] text-fg">{title}</h1>
      {subtitle && <p className="mb-6 text-sm leading-relaxed text-muted">{subtitle}</p>}
      {children}
    </AuthEnter>
  </div>
);

export default AuthCard;
