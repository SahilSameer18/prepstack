import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { InlineSpinner } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { GoogleLogin } from "@react-oauth/google";
import toast from 'react-hot-toast';
import { extractError } from "../../utils/extractError";

/* ── variants ── */
const panelLeft = {
  hidden: { opacity: 0, x: -30 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const panelRight = {
  hidden: { opacity: 0, x: 28 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
};

const formStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const formItem = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, handleGoogleLogin, handleLinkGoogle, loading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
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
      navigate("/");
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      await handleGoogleLogin(idToken);
      navigate("/");
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

  const stats    = [{ value: "1200+", label: "DSA Problems" }, { value: "AI", label: "Project Gen" }, { value: "4+", label: "CS Subjects" }];
  const features = ["DSA Sheets", "CS Notes", "Roadmaps", "AI Projects", "Behavioral Prep", "Resume Guide"];

  return (
    <div className="min-h-screen bg-canvas flex selection:bg-brand/25 selection:text-fg">

      {/* ── Left Panel ── */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative flex-col p-10 xl:p-14 overflow-y-auto custom-scrollbar overflow-x-hidden border-r border-ink/[0.06]"
        variants={panelLeft}
        initial="hidden"
        animate="show"
      >
        {/* Hardware-accelerated ambient glow (0 GPU re-rasterization) */}
        <div className="absolute inset-0 bg-canvas" />
        <div
          className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none transform-gpu opacity-60"
          style={{
            background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 12%, transparent) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-[360px] h-[360px] rounded-full pointer-events-none transform-gpu opacity-40"
          style={{
            background: "radial-gradient(circle, color-mix(in srgb, var(--orange-solid) 8%, transparent) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(color-mix(in srgb, var(--brand) 50%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--brand) 50%, transparent) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 mb-10 shrink-0">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <span className="text-2xl font-display font-bold tracking-tight text-fg group-hover:opacity-90 transition-opacity">
              Prep<span className="text-brand">Stack</span>
            </span>
          </Link>
        </div>

        {/* Main content */}
        <motion.div
          className="relative z-10 flex-1 flex flex-col justify-center gap-6 py-4"
          variants={formStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={formItem}>
            <p className="mb-5 font-ui text-sm font-semibold text-brand">Interview ready</p>
            <h2 className="text-3xl xl:text-4xl font-bold text-fg leading-snug mb-3">
              Everything you need<br />
              to <span className="text-brand">crack your dream</span><br />
              tech role.
            </h2>
            <p className="text-muted text-sm leading-relaxed max-w-sm">
              DSA sheets, CS fundamentals, roadmaps, and AI project ideas, all in one place, built for students like you.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-3 gap-3" variants={formItem}>
            {stats.map((s) => (
              <div key={s.label} className="bg-ink/[0.04] rounded-2xl p-4">
                <div className="text-xl font-bold text-brand">{s.value}</div>
                <div className="text-xs text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div className="flex flex-wrap gap-2" variants={formItem}>
            {features.map((f) => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-ink/[0.04] border border-ink/[0.08] text-fg-3">
                {f}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative z-10 mt-8 shrink-0">
          <p className="text-muted text-xs italic">&ldquo;Preparation is the key that unlocks the door to opportunity.&rdquo;</p>
        </div>
      </motion.div>

      {/* ── Right Panel (Form) ── */}
      <motion.div
        className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-8 sm:py-12 relative overflow-y-auto"
        variants={panelRight}
        initial="hidden"
        animate="show"
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-6">
          <Link to="/" className="text-xl font-bold">Prep<span className="text-brand">Stack</span></Link>
        </div>

        <motion.div
          className="w-full max-w-md"
          variants={formStagger}
          initial="hidden"
          animate="show"
        >
          {/* Back to Home button with clear breathing room */}
          <motion.div variants={formItem} className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 min-h-[44px] text-xs font-ui text-muted hover:text-fg transition-colors group"
            >
              <span className="w-7 h-7 rounded-full bg-ink/[0.04] border border-ink/[0.08] flex items-center justify-center group-hover:bg-ink/[0.08] group-hover:border-brand/40 group-hover:text-brand transition-all">
                <FiArrowLeft className="text-xs" />
              </span>
              <span>Back to Home</span>
            </Link>
          </motion.div>

          <motion.div className="mb-6" variants={formItem}>
            <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-1.5">Welcome back</h1>
            <p className="text-muted text-sm">Log in to continue your preparation journey.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error Alert */}
            <InlineErrorAlert message={error} onDismiss={() => setError(null)} />

            {/* Email */}
            <motion.div className="space-y-1.5" variants={formItem}>
              <label className="text-sm font-medium text-fg-3">Email address</label>
              <div className={`flex items-center gap-3 w-full bg-card border rounded-xl px-4 h-12 transition-colors duration-150 ${focusedField === "email" ? "border-brand shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_10%,transparent)]" : "border-ink/[0.08] hover:border-ink/[0.15]"}`}>
                <FiMail className={`text-lg flex-shrink-0 transition-colors ${focusedField === "email" ? "text-brand" : "text-muted"}`} />
                <input
                  type="email" name="email" placeholder="you@example.com"
                  className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm"
                  value={formData.email} onChange={handleChange}
                  onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} required
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div className="space-y-1.5" variants={formItem}>
              <label className="text-sm font-medium text-fg-3">Password</label>
              <div className={`flex items-center gap-3 w-full bg-card border rounded-xl px-4 h-12 transition-colors duration-150 ${focusedField === "password" ? "border-brand shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_10%,transparent)]" : "border-ink/[0.08] hover:border-ink/[0.15]"}`}>
                <FiLock className={`text-lg flex-shrink-0 transition-colors ${focusedField === "password" ? "text-brand" : "text-muted"}`} />
                <input
                  type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password"
                  className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm"
                  value={formData.password} onChange={handleChange}
                  onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted hover:text-fg-3 transition-colors flex-shrink-0">
                  {showPassword ? <FiEye className="text-lg" /> : <FiEyeOff className="text-lg" />}
                </button>
              </div>
            </motion.div>

            {!linkingMode && (
              <motion.div variants={formItem} className="flex justify-end -mt-1">
                <Link to="/forgot-password" className="inline-flex items-center min-h-[44px] text-xs font-ui text-muted hover:text-brand transition-colors">
                  Forgot password?
                </Link>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              variants={formItem}
              className="amber-specular-button w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><InlineSpinner size={17} color="var(--on-brand)" /><span>{linkingMode ? "Linking..." : "Signing in..."}</span></>
              ) : (
                linkingMode ? "Link Google Account" : "Log In to PrepStack"
              )}
            </motion.button>

            {!linkingMode && (
              <>
                <motion.div className="flex items-center gap-3 py-2" variants={formItem}>
                  <div className="flex-1 h-px bg-ink/[0.07]" />
                  <span className="text-muted text-xs">or</span>
                  <div className="flex-1 h-px bg-ink/[0.07]" />
                </motion.div>

                <motion.div variants={formItem} className="w-full flex justify-center pb-2" style={{ colorScheme: "light" }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="pill"
                    text="continue_with"
                  />
                </motion.div>
              </>
            )}

            <motion.p className="text-center text-muted text-sm" variants={formItem}>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-brand hover:text-brand-hover font-semibold transition-colors">
                Create one for free
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
