import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { registerSchema, registerBaseSchema } from "../../schemas/auth.schema.js";
import LoadingScreen from "../../components/layout/LoadingScreen";
import GoogleButton from "../../components/auth/GoogleButton";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1.5 animate-fade-in">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
      {msg}
    </p>
  ) : null;

const Register = () => {
  const navigate = useNavigate();
  const { registerLoading, googleLoading, handleRegister, handleGoogleAuth } = useAuth();

  const [fields, setFields] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    let err = null;
    if (name === "confirmPassword") {
      const result = registerBaseSchema.shape.confirmPassword.safeParse(value);
      if (!result.success) {
        err = result.error.issues?.[0]?.message || result.error.errors?.[0]?.message;
      } else if (value !== fields.password) {
        err = "Passwords do not match.";
      }
    } else {
      const fieldSchema = registerBaseSchema.shape[name];
      const result = fieldSchema.safeParse(value);
      err = result.success ? null : (result.error.issues?.[0]?.message || result.error.errors?.[0]?.message);
    }
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
    return err;
  };

  const handleChange = (name) => (e) => {
    const value = e.target.value;
    setFields((prev) => ({ ...prev, [name]: value }));
    setError(null);

    if (touched[name]) {
      if (name === "confirmPassword") {
        const err = value === fields.password ? null : "Passwords do not match.";
        setFieldErrors((prev) => ({ ...prev, confirmPassword: err }));
      } else {
        const fieldSchema = registerBaseSchema.shape[name];
        const result = fieldSchema.safeParse(value);
        const err = result.success ? null : (result.error.issues?.[0]?.message || result.error.errors?.[0]?.message);
        setFieldErrors((prev) => ({ ...prev, [name]: err }));
      }
    }

    if (name === "password" && touched.confirmPassword) {
      const err = fields.confirmPassword === value ? null : "Passwords do not match.";
      setFieldErrors((prev) => ({ ...prev, confirmPassword: err }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, fields[name]);
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError(null);
    try {
      await handleGoogleAuth({ accessToken: tokenResponse.access_token });
      navigate("/");
    } catch (err) {
      if (err?.response?.status === 409) {
        // Store the token and redirect to Login to complete the link flow
        sessionStorage.setItem("pendingGoogleToken", tokenResponse.access_token);
        navigate("/login", {
          state: { pendingGoogleLink: true },
        });
      } else {
        setError(err?.response?.data?.message || "Google registration failed.");
      }
    }
  };

  const handleGoogleError = (err) => {
    if (err?.cancelled) return; // User closed popup — no error needed
    setError("Google Sign-In failed. Please try again.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const allTouched = { username: true, email: true, password: true, confirmPassword: true };
    setTouched(allTouched);

    const result = registerSchema.safeParse(fields);
    if (!result.success) {
      const errors = { username: null, email: null, password: null, confirmPassword: null };
      const issues = result.error.issues || result.error.errors || [];
      issues.forEach((err) => {
        const path = err.path[0];
        if (!errors[path]) {
          errors[path] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({ username: null, email: null, password: null, confirmPassword: null });

    try {
      await handleRegister({ username: fields.username, email: fields.email, password: fields.password });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  // Only show full-screen loader for credential registration (not Google — it has inline spinner)
  if (registerLoading) {
    return (
      <LoadingScreen
        message="Setting up your account..."
        subtitle="Creating your professional profile and personalized workspace."
      />
    );
  }

  const inputClass = (hasError) =>
    `w-full pl-12 pr-4 py-3.5 bg-surface/50 border rounded-xl text-primary placeholder-secondary/40 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/60 transition-all duration-300 ${
      hasError
        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10 bg-red-500/5"
        : "border-white/[0.08] hover:border-white/[0.15]"
    }`;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col lg:flex-row">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between bg-surface/30 p-12 relative overflow-hidden border-r border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-[#fe9a00]/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-accent/15 rounded-full blur-[140px] animate-pulse-slow delay-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0gMjAgMCBMMCAwIDAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50" />
        </div>

        <div className="relative z-10 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="text-2xl font-bold text-primary tracking-wide">
              Skill<span className="text-accent">Bridge</span> <span className="font-light text-white/70">AI</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 mt-auto mb-10 animate-fade-in-up delay-200">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] mb-8 backdrop-blur-md">
            <svg className="w-8 h-8 text-[#fe9a00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-[2.75rem] font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Accelerate your <br /> career growth <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#fe9a00]">
              starting today.
            </span>
          </h2>
          <p className="text-secondary/90 text-lg mb-10 max-w-md font-light leading-relaxed">
            Get personalized mock interviews, instant AI feedback, and actionable insights to become the top candidate in any field.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-[420px] animate-fade-in-up delay-100 py-10 lg:py-0">
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3">
              Create an account
            </h1>
            <p className="text-secondary/80 text-base">
              Start your journey to interview success today.
            </p>
          </div>

          {/* Custom Google Sign-Up Button */}
          <div className="mb-6">
            <GoogleButton
              text="signup_with"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              isLoading={googleLoading}
            />
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/[0.08] w-full" />
            <span className="bg-background px-3 text-xs text-secondary/60 uppercase tracking-wider font-mono shrink-0">
              Or register with email
            </span>
            <div className="border-t border-white/[0.08] w-full" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-white/90">
                Username
              </label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 group-focus-within/input:text-accent transition-colors duration-300">
                  <FiUser className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={fields.username}
                  onChange={handleChange("username")}
                  onBlur={() => handleBlur("username")}
                  placeholder="e.g. alex_dev"
                  autoComplete="username"
                  className={inputClass(touched.username && fieldErrors.username)}
                />
              </div>
              {touched.username && <FieldError msg={fieldErrors.username} />}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white/90">
                Email
              </label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 group-focus-within/input:text-accent transition-colors duration-300">
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={fields.email}
                  onChange={handleChange("email")}
                  onBlur={() => handleBlur("email")}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={inputClass(touched.email && fieldErrors.email)}
                />
              </div>
              {touched.email && <FieldError msg={fieldErrors.email} />}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/90">
                Password
              </label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 group-focus-within/input:text-accent transition-colors duration-300">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={fields.password}
                  onChange={handleChange("password")}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`${inputClass(touched.password && fieldErrors.password)} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-primary transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {touched.password && <FieldError msg={fieldErrors.password} />}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90">
                Confirm Password
              </label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 group-focus-within/input:text-accent transition-colors duration-300">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={fields.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`${inputClass(touched.confirmPassword && fieldErrors.confirmPassword)} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-primary transition-colors focus:outline-none cursor-pointer"
                >
                  {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {touched.confirmPassword && <FieldError msg={fieldErrors.confirmPassword} />}
            </div>

            {error && (
              <div className="p-4 mt-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full py-4 mt-4 rounded-xl font-semibold text-white bg-gradient-to-r from-accent to-[#fe9a00] hover:from-accent hover:to-[#eb8e00] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_10px_25px_rgba(255,102,98,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {registerLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-secondary/80 mt-10 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-semibold hover:text-orange-400 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
