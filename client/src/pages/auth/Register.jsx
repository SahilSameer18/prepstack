import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck, FiAlertCircle, FiX } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { InlineSpinner } from "../../components/ui/Skeletons";

const Register = () => {
  const navigate = useNavigate();
  const { handleRegister, loading } = useAuth();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null); // clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await handleRegister(formData.username, formData.email, formData.password);
      navigate("/");
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return { score: 0, label: "", color: "" };
    if (p.length < 6) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (p.length < 10 || !/[A-Z]/.test(p)) return { score: 2, label: "Fair", color: "bg-yellow-500" };
    return { score: 3, label: "Strong", color: "bg-green-500" };
  };
  const strength = passwordStrength();

  const perks = [
    "Track your DSA progress",
    "Save custom roadmaps",
    "Access AI project generator",
    "Bookmark important notes",
  ];

  const avatars = ["S", "A", "R", "P"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col p-10 xl:p-14 overflow-y-auto custom-scrollbar overflow-x-hidden">

        {/* Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#111] to-[#0a0a0a]" />
        <div className="absolute top-[-80px] right-[-40px] w-[360px] h-[360px] bg-[#ffa116]/8 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[60px] left-[-60px] w-[280px] h-[280px] bg-orange-600/6 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,161,22,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Logo */}
        <div className="relative z-10 mb-10 shrink-0">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <span className="text-2xl font-bold tracking-tight text-white group-hover:opacity-90 transition-opacity">
              Prep<span className="text-[#ffa116]">Stack</span>
            </span>
          </Link>
        </div>

        {/* Main content — vertically centered */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-6 py-2">

          {/* Badge + Headline */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-semibold tracking-widest uppercase">Free Forever</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-snug mb-3">
              Join thousands of<br />
              students <span className="text-[#ffa116]">getting hired</span><br />
              at top companies.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Create your free account and get instant access to everything PrepStack has to offer.
            </p>
          </div>

          {/* Perks checklist */}
          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/30 flex items-center justify-center flex-shrink-0">
                  <FiCheck className="text-[#ffa116] text-xs" />
                </div>
                <span className="text-gray-300 text-sm">{perk}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
                {avatars.map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `hsl(${i * 40 + 20}, 70%, 45%)` }}>
                    {l}
                  </div>
                ))}
              </div>
              <span className="text-gray-300 text-sm">+2,000 students joined</span>
            </div>
            <p className="text-gray-500 text-xs italic">"PrepStack helped me prepare systematically and land my first SDE internship!"</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-8 shrink-0">
          <p className="text-gray-600 text-xs italic">"Your future self will thank you for starting today."</p>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 relative">

        {/* Back to home */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors group"
        >
          <span className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.1] transition-all">
            <FiArrowLeft className="text-sm" />
          </span>
          <span className="hidden sm:inline">Back to Home</span>
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link to="/" className="text-xl font-bold">Prep<span className="text-[#ffa116]">Stack</span></Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account ✨</h1>
            <p className="text-gray-400 text-sm">Get started for free — no credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 animate-[fadeIn_0.2s_ease]">
                <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5 text-base" />
                <p className="text-red-300 text-sm leading-snug flex-1">{error}</p>
                <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-200 transition-colors flex-shrink-0">
                  <FiX className="text-sm" />
                </button>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Username</label>
              <div className={`flex items-center gap-3 w-full bg-[#111] border rounded-xl px-4 h-12 transition-all duration-200 ${focusedField === 'username' ? 'border-[#ffa116] shadow-[0_0_0_3px_rgba(255,161,22,0.1)]' : 'border-white/[0.08] hover:border-white/[0.15]'}`}>
                <FiUser className={`text-lg flex-shrink-0 transition-colors ${focusedField === 'username' ? 'text-[#ffa116]' : 'text-gray-500'}`} />
                <input
                  type="text" name="username" placeholder="e.g. coder_sahil"
                  className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                  value={formData.username} onChange={handleChange}
                  onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                  required minLength={4} maxLength={12}
                />
                {formData.username.length >= 4 && <FiCheck className="text-green-400 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-600 pl-1">4–12 characters</p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Email address</label>
              <div className={`flex items-center gap-3 w-full bg-[#111] border rounded-xl px-4 h-12 transition-all duration-200 ${focusedField === 'email' ? 'border-[#ffa116] shadow-[0_0_0_3px_rgba(255,161,22,0.1)]' : 'border-white/[0.08] hover:border-white/[0.15]'}`}>
                <FiMail className={`text-lg flex-shrink-0 transition-colors ${focusedField === 'email' ? 'text-[#ffa116]' : 'text-gray-500'}`} />
                <input
                  type="email" name="email" placeholder="you@example.com"
                  className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                  value={formData.email} onChange={handleChange}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className={`flex items-center gap-3 w-full bg-[#111] border rounded-xl px-4 h-12 transition-all duration-200 ${focusedField === 'password' ? 'border-[#ffa116] shadow-[0_0_0_3px_rgba(255,161,22,0.1)]' : 'border-white/[0.08] hover:border-white/[0.15]'}`}>
                <FiLock className={`text-lg flex-shrink-0 transition-colors ${focusedField === 'password' ? 'text-[#ffa116]' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? "text" : "password"} name="password" placeholder="Min. 6 characters"
                  className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                  value={formData.password} onChange={handleChange}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  required minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
                  {showPassword ? <FiEye className="text-lg" /> : <FiEyeOff className="text-lg" />}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strength.score === 1 ? 'text-red-400' : strength.score === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              By creating an account, you agree to our{" "}
              <span className="text-[#ffa116] cursor-pointer">Terms of Service</span> and{" "}
              <span className="text-[#ffa116] cursor-pointer">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-black font-semibold text-sm bg-gradient-to-r from-[#ffa116] to-[#ff8c00] hover:from-[#ffb84d] hover:to-[#ffa116] transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 mt-1 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 btn-press"
            >
              {loading ? (
                <>
                  <InlineSpinner size={17} color="#000" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create Free Account"
              )}
            </button>

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-gray-500 text-xs">or</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            <p className="text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-[#ffa116] hover:text-[#ffb84d] font-semibold transition-colors">
                Log in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
