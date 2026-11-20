import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Envelope, Lock } from "@phosphor-icons/react";
import { GoogleLogin } from "@react-oauth/google";
import toast from 'react-hot-toast';
import { useAuth } from "../../hooks/useAuth";
import { InlineSpinner } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import AuthShell, { BackLink } from "../../components/auth/AuthShell";
import AuthField, { PasswordToggle } from "../../components/auth/AuthField";
import { extractError } from "../../utils/extractError";
import { safeReturnTo } from '../../utils/planBuilder';
import { roadmaps } from "../../data/roadmaps";
import { behavioralQuestions } from "../../data/behavioralQuestions";

// Numbers come from the app's own data, so they cannot go stale
const FACTS = [
  { value: roadmaps.length, label: "Roadmaps" },
  { value: behavioralQuestions.length, label: "Behavioral questions" },
  { value: "Free", label: "No card needed" },
];
const FEATURES = ["DSA Sheets", "CS Notes", "Roadmaps", "AI Projects", "Behavioral Prep", "Resume Guide"];

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Keep the builder's settings through password login, Google login and the sign-up link.
  const returnTo = safeReturnTo(params.get('returnTo'));
  const { handleLogin, handleGoogleLogin, handleLinkGoogle, loading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [linkingMode, setLinkingMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await handleLogin(formData.email, formData.password);
      if (pendingGoogleToken) {
        try {
          await handleLinkGoogle(pendingGoogleToken);
          setPendingGoogleToken(null);
          setLinkingMode(false);
          toast.success("Google account linked successfully!");
        } catch (linkError) {
          setError(extractError(linkError, "Login succeeded but Google linking failed. You can try linking from your profile."));
        }
      }
      navigate(returnTo, { replace: true });
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      await handleGoogleLogin(idToken);
      navigate(returnTo, { replace: true });
    } catch (error) {
      if (error.response?.status === 409) {
        setPendingGoogleToken(idToken);
        setLinkingMode(true);
        setError("An account with this email already exists. Please enter your password below to link your Google identity.");
      } else {
        setError(extractError(error, "Google sign-in failed. Please try again."));
      }
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed. Please try again.");
  };

  const aside = (
    <>
      <p className="mb-4 font-ui text-sm font-semibold text-fg-3">Interview ready</p>
      <h2 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg xl:text-5xl">
        Everything you need to <span className="text-brand">crack your tech role.</span>
      </h2>
      <p className="mt-5 text-base leading-relaxed text-muted">
        DSA sheets, CS fundamentals, roadmaps and AI project ideas, all in one place, built for students like you.
      </p>
      <dl className="mt-8 grid grid-cols-3 gap-3">
        {FACTS.map((f) => (
          <div key={f.label} className="surface-card p-4">
            <dt className="order-2 mt-1 text-xs leading-snug text-muted">{f.label}</dt>
            <dd className="font-display text-2xl font-extrabold tracking-tight text-brand">{f.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-6 flex flex-wrap gap-2">
        {FEATURES.map((f) => (
          <li key={f} className="rounded-full border border-ink/[0.1] bg-card px-3 py-1.5 text-sm text-fg-3">{f}</li>
        ))}
      </ul>
    </>
  );

  return (
    <AuthShell aside={aside}>
      <div className="text-left">
        <BackLink />
        <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg">
          Welcome <span className="text-brand">back.</span>
        </h1>
        <p className="mb-6 mt-2 text-sm text-muted">Log in to continue your preparation journey.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InlineErrorAlert message={error} onDismiss={() => setError(null)} />

          <AuthField
            id="login-email" label="Email address" icon={Envelope}
            type="email" name="email" placeholder="you@example.com" autoComplete="email"
            value={formData.email} onChange={handleChange} required
          />

          <AuthField
            id="login-password" label="Password" icon={Lock}
            type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" autoComplete="current-password"
            value={formData.password} onChange={handleChange} required
            trailing={<PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
          />

          {!linkingMode && (
            <div className="-mt-1 flex justify-end">
              <Link to="/forgot-password" className="inline-flex min-h-[44px] items-center text-sm text-muted transition-colors hover:text-brand">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="amber-specular-button flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <><InlineSpinner size={17} color="var(--on-brand)" /><span>{linkingMode ? "Linking..." : "Signing in..."}</span></>
            ) : (
              linkingMode ? "Link Google Account" : "Log In to PrepStack"
            )}
          </button>

          {!linkingMode && (
            <>
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
            </>
          )}

          <p className="text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link to={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-brand transition-colors hover:text-brand-hover">
              Create one for free
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
};

export default Login;
