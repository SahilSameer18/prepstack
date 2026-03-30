import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", formData);
  };

  const stats = [
    { value: "1200+", label: "DSA Problems" },
    { value: "5+", label: "CS Subjects" },
    { value: "AI", label: "Project Gen" },
  ];

  const features = ["DSA Sheets", "CS Notes", "Roadmaps", "AI Projects", "Behavioral Prep", "Resume Guide"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col p-10 xl:p-14 overflow-y-auto custom-scrollbar overflow-x-hidden">

        {/* Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#111] to-[#0a0a0a]" />
        <div className="absolute top-[-80px] left-[-80px] w-[380px] h-[380px] bg-[#ffa116]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] bg-orange-600/8 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,161,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,161,22,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
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
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-6 py-4">

          {/* Badge + Headline */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 bg-[#ffa116] rounded-full animate-pulse" />
              <span className="text-[#ffa116] text-xs font-semibold tracking-widest uppercase">Interview Ready</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-snug mb-3">
              Everything you need<br />
              to <span className="text-[#ffa116]">crack your dream</span><br />
              tech role.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              DSA sheets, CS fundamentals, roadmaps, and AI project ideas — all in one place, built for students like you.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4">
                <div className="text-xl font-bold text-[#ffa116]">{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {features.map((f) => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-300">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10 mt-8 shrink-0">
          <p className="text-gray-600 text-xs italic">"Preparation is the key that unlocks the door to opportunity."</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back 👋</h1>
            <p className="text-gray-400 text-sm">Log in to continue your preparation journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

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
                  type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password"
                  className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                  value={formData.password} onChange={handleChange}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
                  {showPassword ? <FiEye className="text-lg" /> : <FiEyeOff className="text-lg" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-[#ffa116] hover:text-[#ffb84d] transition-colors font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl text-black font-semibold text-sm bg-gradient-to-r from-[#ffa116] to-[#ff8c00] hover:from-[#ffb84d] hover:to-[#ffa116] transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 mt-2"
            >
              Log In to PrepStack
            </button>

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-gray-500 text-xs">or</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            <p className="text-center text-gray-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-[#ffa116] hover:text-[#ffb84d] font-semibold transition-colors">
                Create one for free
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;