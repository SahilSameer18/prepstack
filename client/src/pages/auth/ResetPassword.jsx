import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import AuthCard from "../../components/auth/AuthCard";
import { InlineSpinner } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { resetPassword } from "../../api/services/authService";
import { extractError } from "../../utils/extractError";

// The same rules as sign-up (the server checks them again)
const RULES = [
  ["At least 8 characters", (p) => p.length >= 8],
  ["One uppercase letter", (p) => /[A-Z]/.test(p)],
  ["One lowercase letter", (p) => /[a-z]/.test(p)],
  ["One number", (p) => /[0-9]/.test(p)],
];
const TOKEN_SHAPE = /^[a-f0-9]{64}$/;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Read the link's token once, then take it out of the address bar so it is not left in the browser history or a screenshot
  const [token] = useState(() => params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (token) navigate("/reset-password", { replace: true });
    // Do not send the page address (which holds the token) to other sites if anything on the page is clicked or loaded
    const meta = document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [token, navigate]);

  if (!TOKEN_SHAPE.test(token)) {
    return (
      <AuthCard title="This link does not work">
        <div className="flex items-start gap-3 bg-bad/10 border border-bad/20 rounded-xl p-4 mb-5">
          <FiAlertCircle className="text-bad text-lg mt-0.5 flex-shrink-0" />
          <p className="text-sm text-fg-3 leading-relaxed">The reset link is missing or incomplete. Open the link from the email again, or ask for a new one.</p>
        </div>
        <Link to="/forgot-password" className="amber-specular-button w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center">
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated">
        <div className="flex items-start gap-3 bg-ok/10 border border-ok/20 rounded-xl p-4 mb-5">
          <FiCheckCircle className="text-ok text-lg mt-0.5 flex-shrink-0" />
          <p className="text-sm text-fg-3 leading-relaxed">Your password has been changed and you were signed out on all devices. Log in with your new password.</p>
        </div>
        <Link to="/login" className="amber-specular-button w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center">
          Go to log in
        </Link>
      </AuthCard>
    );
  }

  const rulesOk = RULES.every(([, test]) => test(password));
  const matches = password.length > 0 && password === confirm;
  const tooLong = password.length > 72;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rulesOk || tooLong || !matches) return;
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(extractError(err, "We could not update your password. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Choose a new password" subtitle="Pick a password you do not use anywhere else.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InlineErrorAlert message={error} onDismiss={() => setError(null)} />
        {error && (
          <p className="text-xs text-muted">
            Links work once and expire after 1 hour. <Link to="/forgot-password" className="text-brand hover:text-brand-hover">Request a new link</Link>
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-sm font-medium text-fg-3">New password</label>
          <div className="flex items-center gap-3 w-full bg-canvas border border-ink/[0.08] hover:border-ink/[0.15] focus-within:border-brand rounded-xl px-4 h-12 transition-colors">
            <FiLock className="text-lg flex-shrink-0 text-muted" />
            <input
              id="new-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm"
              placeholder="New password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
              required
            />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="text-muted hover:text-fg-3 transition-colors flex-shrink-0">
              {show ? <FiEye className="text-lg" /> : <FiEyeOff className="text-lg" />}
            </button>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs" aria-label="Password rules">
          {RULES.map(([label, test]) => (
            <li key={label} className={test(password) ? "text-ok" : "text-muted"}>
              {test(password) ? "✓" : "•"} {label}
            </li>
          ))}
          {tooLong && <li className="text-bad col-span-2">Password cannot exceed 72 characters</li>}
        </ul>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-sm font-medium text-fg-3">Confirm new password</label>
          <div className="flex items-center gap-3 w-full bg-canvas border border-ink/[0.08] hover:border-ink/[0.15] focus-within:border-brand rounded-xl px-4 h-12 transition-colors">
            <FiLock className="text-lg flex-shrink-0 text-muted" />
            <input
              id="confirm-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm"
              placeholder="Repeat the password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {confirm.length > 0 && !matches && <p className="text-xs text-bad">The two passwords do not match.</p>}
        </div>

        <button
          type="submit"
          disabled={submitting || !rulesOk || tooLong || !matches}
          className="amber-specular-button w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (<><InlineSpinner size={17} color="var(--on-brand)" /><span>Updating...</span></>) : "Update password"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
