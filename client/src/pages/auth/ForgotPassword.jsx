import { useState } from "react";
import { FiMail, FiCheckCircle } from "react-icons/fi";
import AuthCard from "../../components/auth/AuthCard";
import { InlineSpinner } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { forgotPassword } from "../../api/services/authService";
import { extractError } from "../../utils/extractError";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sentTo, setSentTo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      setError(extractError(err, "We could not send the email. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthCard title="Check your email">
        <div className="flex items-start gap-3 bg-ok/10 border border-ok/20 rounded-xl p-4 mb-5">
          <FiCheckCircle className="text-ok text-lg mt-0.5 flex-shrink-0" />
          <p className="text-sm text-fg-3 leading-relaxed">
            If an account with <strong className="text-fg break-all">{sentTo}</strong> exists, we have sent a link to choose a new password.
          </p>
        </div>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted mb-6">
          <li>The link works once and expires after 1 hour.</li>
          <li>It can take a minute to arrive. Check your spam or junk folder too.</li>
          <li>If you sign in with Google only, there is no password to reset: use &ldquo;Continue with Google&rdquo; on the log in page.</li>
        </ul>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="text-sm font-ui text-brand hover:text-brand-hover transition-colors min-h-[44px]"
        >
          Use a different email
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot your password?" subtitle="Enter your email and we will send you a link to choose a new one.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InlineErrorAlert message={error} onDismiss={() => setError(null)} />

        <div className="space-y-1.5">
          <label htmlFor="forgot-email" className="text-sm font-medium text-fg-3">Email address</label>
          <div className={`flex items-center gap-3 w-full bg-canvas border rounded-xl px-4 h-12 transition-colors duration-150 ${focused ? "border-brand shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_10%,transparent)]" : "border-ink/[0.08] hover:border-ink/[0.15]"}`}>
            <FiMail className={`text-lg flex-shrink-0 transition-colors ${focused ? "text-brand" : "text-muted"}`} />
            <input
              id="forgot-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !email.trim()}
          className="amber-specular-button w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (<><InlineSpinner size={17} color="var(--on-brand)" /><span>Sending...</span></>) : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
