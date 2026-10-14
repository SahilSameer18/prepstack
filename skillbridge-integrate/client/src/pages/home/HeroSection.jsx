import React, { useState, useEffect } from "react";
import { Link } from "react-router";

/* ── Animated typewriter words ── */
const CYCLING_WORDS = ["Interviews", "Tech Rounds", "Dream Roles", "Offers"];

/* ── Floating skill chip data ── */
const SKILL_CHIPS = [
  { label: "React", match: true, x: "8%", y: "22%", delay: "0s" },
  { label: "TypeScript", match: true, x: "72%", y: "14%", delay: "0.4s" },
  { label: "GraphQL", match: false, x: "80%", y: "68%", delay: "0.8s" },
  { label: "Docker", match: false, x: "6%", y: "72%", delay: "1.2s" },
  { label: "Next.js", match: true, x: "60%", y: "80%", delay: "0.2s" },
  { label: "Redis", match: false, x: "28%", y: "88%", delay: "1.6s" },
];

/* ── Match score meter ── */
const ScoreMeter = ({ score }) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!score) return;
    let startTimestamp = null;
    let animationFrameId;
    const duration = 1000;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (displayed / 100) * circumference;
  const color = displayed >= 80 ? "#34d399" : displayed >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{displayed}%</span>
        <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider mt-0.5">Match</span>
      </div>
    </div>
  );
};

/* ── Floating skill chip ── */
const SkillChip = ({ label, match, x, y, delay }) => (
  <div
    className="absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold font-mono pointer-events-none"
    style={{
      left: x, top: y,
      background: match ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
      border: `1px solid ${match ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.2)"}`,
      color: match ? "#34d399" : "#f87171",
      animation: `floatChip 4s ease-in-out infinite`,
      animationDelay: delay,
    }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{ background: match ? "#34d399" : "#f87171" }}
    />
    {label}
  </div>
);

const HeroSection = ({ user }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [score, setScore] = useState(0);

  /* Cycle words */
  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % CYCLING_WORDS.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  /* Trigger score meter once */
  useEffect(() => {
    const timer = setTimeout(() => {
      setScore(88);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#080808" }}>

      {/* ── Deep background layers ── */}
      {/* Large blurred orb top-left */}
      <div className="absolute pointer-events-none" style={{
        width: 700, height: 700, left: "-15%", top: "-20%",
        background: "radial-gradient(circle, rgba(255,102,98,0.12) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />
      {/* Orb bottom-right */}
      <div className="absolute pointer-events-none" style={{
        width: 600, height: 600, right: "-10%", bottom: "-15%",
        background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />

      {/* ── Subtle grid ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
      }} />

      {/* ── Floating skill chips ── */}
      {SKILL_CHIPS.map((chip) => (
        <SkillChip key={chip.label} {...chip} />
      ))}

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center text-center">

          {/* ── Status pill ── */}
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-semibold mb-10 animate-scale-in"
            style={{
              background: "linear-gradient(135deg, rgba(255,102,98,0.08), rgba(255,102,98,0.04))",
              border: "1px solid rgba(255,102,98,0.22)",
              color: "var(--color-accent)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            AI-Powered · 100+ Profiles Audited
          </div>

          {/* ── Headline ── */}
          <h1
            className="font-bold tracking-tight mb-6 animate-fade-in-up"
            style={{ fontSize: "clamp(2rem, 6vw, 5rem)", maxWidth: "820px", lineHeight: 1.1 }}
          >
            <span style={{ color: "#ffffff", display: "block" }}>Land Your</span>
            {/* Fixed-height wrapper stops surrounding text from jumping */}
            <span
              style={{
                display: "block",
                height: "1.15em",
                overflow: "hidden",
              }}
            >
              <span
                className="text-gradient-primary"
                style={{
                  opacity: fade ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  display: "block",
                }}
              >
                {CYCLING_WORDS[wordIndex]}
              </span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.88)", display: "block" }}>With AI-Precision Prep</span>
          </h1>

          {/* ── Sub-headline ── */}
          <p
            className="text-base sm:text-lg text-secondary leading-relaxed mb-12 animate-fade-in-up delay-100"
            style={{ maxWidth: "560px", color: "rgba(161,161,170,0.9)" }}
          >
            Upload your resume. Paste a job description. In 30 seconds, get your skill-gap report,
            curated interview questions, and a 10-day prep roadmap — tailored to <em>your</em> exact target role.
          </p>

          {/* ── CTA buttons ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20 animate-fade-in-up delay-200 w-full max-w-md sm:max-w-none">
            <Link
              to={user ? "/generate" : "/register"}
              id="hero-cta-primary"
              className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 overflow-hidden text-center"
              style={{
                background: "linear-gradient(135deg, #ff6662, #fe7a00)",
                color: "#fff",
                boxShadow: "0 0 40px rgba(255,102,98,0.35), 0 8px 32px rgba(255,102,98,0.2)",
              }}
            >
              <span className="relative z-10">
                {user ? "Build Analysis Plan" : "Analyze Your Profile Free"}
              </span>
              <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              {/* Shine sweep */}
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </Link>

            <Link
              to={user ? "/dashboard" : "/login"}
              id="hero-cta-secondary"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(8px)",
              }}
            >
              {user ? "View Dashboard" : "Sign In"}
            </Link>
          </div>

          {/* ── Live demo card ── */}
          <div
            className="w-full animate-fade-in-up delay-300"
            style={{ maxWidth: "820px" }}
          >
            <div
              className="relative rounded-3xl overflow-hidden p-px"
              style={{
                background: "linear-gradient(135deg, rgba(255,102,98,0.3), rgba(99,102,241,0.2), rgba(255,255,255,0.05))",
              }}
            >
              {/* inner card */}
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{ background: "linear-gradient(160deg, rgba(20,18,18,0.98), rgba(10,10,10,0.99))" }}
              >
                {/* Card header bar */}
                <div
                  className="flex items-center justify-between px-5 py-3.5 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
                     <span className="ml-3 text-xs font-mono truncate max-w-[140px] sm:max-w-none" style={{ color: "rgba(255,255,255,0.25)" }}>
                      skillbridge_audit_engine.ai
                     </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "#34d399" }}>LIVE</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

                  {/* ── Col 1: JD Input ── */}
                  <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[9px] font-bold font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                      01 · Target Role
                    </p>
                    <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}>
                          <svg className="w-3.5 h-3.5" style={{ color: "#818cf8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Senior React Engineer</p>
                          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Stripe · San Francisco</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {["React", "TypeScript", "Node.js", "GraphQL", "AWS"].map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-mono" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ── Col 2: Analysis ── */}
                  <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[9px] font-bold font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                      02 · Skill Audit
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { skill: "React (Next.js)", status: "match" },
                        { skill: "TypeScript", status: "match" },
                        { skill: "Node.js", status: "match" },
                        { skill: "GraphQL Core", status: "gap" },
                        { skill: "AWS Lambda", status: "partial" },
                      ].map(({ skill, status }) => (
                        <div key={skill} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>{skill}</span>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
                            style={{
                              background: status === "match" ? "rgba(52,211,153,0.1)" : status === "gap" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                              color: status === "match" ? "#34d399" : status === "gap" ? "#f87171" : "#fbbf24",
                              border: `1px solid ${status === "match" ? "rgba(52,211,153,0.2)" : status === "gap" ? "rgba(248,113,113,0.2)" : "rgba(251,191,36,0.2)"}`,
                            }}
                          >
                            {status === "match" ? "✓ Match" : status === "gap" ? "✗ Gap" : "~ Partial"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Col 3: Score + action ── */}
                  <div className="p-5 flex flex-col items-center justify-between">
                    <div className="w-full">
                      <p className="text-[9px] font-bold font-mono uppercase tracking-widest mb-4 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                        03 · Match Score
                      </p>
                      <div className="flex justify-center mb-4">
                        <ScoreMeter score={88} />
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-4">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                          STRONG MATCH
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-full text-center text-xs font-bold py-2.5 rounded-xl transition-all duration-200"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,102,98,0.15), rgba(254,154,0,0.1))",
                        border: "1px solid rgba(255,102,98,0.25)",
                        color: "var(--color-accent)",
                      }}
                    >
                      View Full Report →
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Analysis complete · ~28s
                  </span>
                  <div className="flex items-center gap-4">
                    {[
                      { label: "3 Gaps", color: "#f87171" },
                      { label: "1 Partial", color: "#fbbf24" },
                      { label: "3 Match", color: "#34d399" },
                    ].map(({ label, color }) => (
                      <span key={label} className="text-[10px] font-mono font-semibold" style={{ color }}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges below card */}
            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>No credit card required</span>
              <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>Results in ~30 seconds</span>
              <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>ATS-optimized output</span>
            </div>
          </div>

        </div>
      </div>

      {/* Keyframe for floating chips */}
      <style>{`
        @keyframes floatChip {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.75; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

