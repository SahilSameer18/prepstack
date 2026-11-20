import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, Envelope, Lock, Check } from "@phosphor-icons/react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth";
import { InlineSpinner } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import AuthShell, { BackLink } from "../../components/auth/AuthShell";
import AuthField, { PasswordToggle } from "../../components/auth/AuthField";
import { extractError } from "../../utils/extractError";
import { safeReturnTo } from '../../utils/planBuilder';

const PERKS = ["Track your DSA progress", "Access AI project generator", "Save custom projects", "Interview Oriented CS notes"];

const Register = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Direct signups open the dashboard. Signups started from another page return there.
  const returnTo = safeReturnTo(params.get('returnTo') ?? '/dashboard');
  const { handleRegister, handleGoogleLogin, loading } = useAuth();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await handleRegister(formData.username, formData.email, formData.password);
      navigate(returnTo, { replace: true });
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      await handleGoogleLogin(idToken);
      navigate(returnTo, { replace: true });
    } catch (error) {
      if (error.response?.status === 409) {
        setError("An account with this email already exists. Redirecting to login...");
        navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
      } else {
        setError(extractError(error, "Google sign-up failed. Please try again."));
      }
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-up was cancelled or failed. Please try again.");
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return { score: 0, label: "", color: "" };
    // Mirrors backend Zod rules: 8+ chars, uppercase, lowercase, number
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    if (p.length < 8) return { score: 1, label: "Weak", color: "bg-bad-solid" };
    if (!hasUpper || !hasLower || !hasNumber) return { score: 2, label: "Fair", color: "bg-yellow-solid" };
    return { score: 3, label: "Strong", color: "bg-ok-solid" };
  };
  const strength = passwordStrength();

  const aside = (
    <>
      <p className="mb-4 font-ui text-sm font-semibold text-fg-3">Free, no card needed</p>
      <h2 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg xl:text-5xl">
        Prepare for your interviews <span className="text-brand">your way.</span>
      </h2>
      <p className="mt-5 text-base leading-relaxed text-muted">
        Create your free account and get everything PrepStack has to offer.
      </p>
      <ul className="mt-8 space-y-3.5">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-3 text-base text-fg-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/15 text-brand">
              <Check weight="bold" aria-hidden="true" className="text-xs" />
            </span>
            {perk}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <AuthShell aside={aside}>
      <div className="text-left">
        <BackLink />
        <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg">
          Create your <span className="text-brand">account.</span>
        </h1>
        <p className="mb-6 mt-2 text-sm text-muted">Get started for free</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InlineErrorAlert message={error} onDismiss={() => setError(null)} />

          <AuthField
            id="register-username" label="Username" icon={User}
            type="text" name="username" placeholder="e.g. coder_sahil" autoComplete="username"
            value={formData.username} onChange={handleChange} required minLength={4} maxLength={30}
            trailing={formData.username.length >= 4 ? <Check aria-hidden="true" className="shrink-0 text-lg text-ok" /> : null}
            hint={<p className="pl-1 font-ui text-xs text-muted">4–30 characters</p>}
          />

          <AuthField
            id="register-email" label="Email address" icon={Envelope}
            type="email" name="email" placeholder="you@example.com" autoComplete="email"
            value={formData.email} onChange={handleChange} required
          />

          <AuthField
            id="register-password" label="Password" icon={Lock}
            type={showPassword ? "text" : "password"} name="password" placeholder="Min. 8 chars, uppercase & number" autoComplete="new-password"
            value={formData.password} onChange={handleChange} required minLength={8}
            trailing={<PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
            hint={formData.password.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength.score ? strength.color : "bg-ink/10"}`} />
                  ))}
                </div>
                <span className={`text-xs font-medium ${strength.score === 1 ? "text-bad" : strength.score === 2 ? "text-warn" : "text-ok"}`}>
                  {strength.label}
                </span>
              </div>
            )}
          />

          <p className="text-xs leading-relaxed text-muted">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-brand hover:underline">Terms of Use</Link> and{" "}
            <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="amber-specular-button flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <><InlineSpinner size={17} color="var(--on-brand)" /><span>Creating account...</span></>
            ) : (
              "Create Free Account"
            )}
          </button>

          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-ink/[0.1]" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-ink/[0.1]" />
          </div>

          <div className="flex w-full justify-center pb-2" style={{ colorScheme: "light" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          </div>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-brand transition-colors hover:text-brand-hover">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;
