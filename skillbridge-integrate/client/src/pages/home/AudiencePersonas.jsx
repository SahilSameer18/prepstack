import React, { useState } from "react";
import { Link } from "react-router";

const PERSONAS = [
  {
    title: "Fresh Graduates",
    tagline: "Break into tech with confidence",
    desc: "Map entry-level benchmarks, identify prerequisite skills, and build a profile that stands out to campus recruiters.",
    color: "#ff6662",
    tags: ["Entry-Level", "Skill Mapping", "Resume Polish"],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2.67 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
  {
    title: "Career Switchers",
    tagline: "Pivot with purpose",
    desc: "Transition roles using a structured matrix of transferrable skills and a targeted gap-closing roadmap.",
    color: "#818cf8",
    tags: ["Role Transition", "Skill Transfer", "Gap Analysis"],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m16 3 4 4-4 4" /><path d="M20 7H9a4 4 0 0 0 0 8h1" />
      </svg>
    ),
  },
  {
    title: "Senior Engineers",
    tagline: "Elevate to staff-level roles",
    desc: "Audit advanced capabilities, practice leadership behavioral guides, and benchmark against FAANG expectations.",
    color: "#34d399",
    tags: ["Staff Level", "FAANG Prep", "Behavioral Rounds"],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3-1.912 5.886H3.886L8.784 12.5l-1.872 5.764L12 14.73l5.088 3.534-1.872-5.764 4.898-3.614h-6.202L12 3Z" />
      </svg>
    ),
  },
  {
    title: "International Talents",
    tagline: "Localize your profile globally",
    desc: "Align CV terminology with local market keywords, ATS conventions, and cultural communication norms.",
    color: "#fbbf24",
    tags: ["Global Markets", "ATS Alignment", "Localization"],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
];

const AudiencePersonas = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "#080808" }}>
      {/* Bottom page glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{
        width: 800, height: 400,
        background: "radial-gradient(ellipse at bottom, rgba(255,102,98,0.06) 0%, transparent 70%)",
      }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5" style={{
            background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24",
          }}>
            Who It's Built For
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Built for Every Stage{" "}
            <span style={{ background: "linear-gradient(135deg, #fbbf24, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              of Your Career
            </span>
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(161,161,170,0.7)" }}>
            Whether you're breaking in or leveling up, SkillBridge AI adapts to your unique career stage.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PERSONAS.map((p, i) => (
            <div
              key={p.title}
              className="relative group rounded-2xl p-6 flex flex-col gap-4 transition-all duration-500 cursor-default overflow-hidden"
              style={{
                background: hovered === i ? `linear-gradient(160deg, ${p.color}0c, rgba(10,10,10,0.98))` : "rgba(255,255,255,0.02)",
                border: hovered === i ? `1px solid ${p.color}30` : "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-px transition-all duration-500" style={{
                background: hovered === i ? `linear-gradient(90deg, transparent, ${p.color}60, transparent)` : "transparent",
              }} />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
                style={{
                  background: `${p.color}12`,
                  border: `1px solid ${p.color}25`,
                  color: p.color,
                  transform: hovered === i ? "scale(1.08)" : "scale(1)",
                }}
              >
                {p.icon}
              </div>

              {/* Text */}
              <div>
                <h4 className="font-bold text-white text-base mb-1">{p.title}</h4>
                <p className="text-xs font-semibold mb-2" style={{ color: p.color + "90" }}>{p.tagline}</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{p.desc}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{ background: `${p.color}0d`, color: `${p.color}80`, border: `1px solid ${p.color}15` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA banner */}
        <div
          className="relative rounded-3xl overflow-hidden p-px"
          style={{ background: "linear-gradient(135deg, rgba(255,102,98,0.3), rgba(254,154,0,0.2), rgba(129,140,248,0.2))" }}
        >
          <div
            className="rounded-3xl px-8 py-12 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(160deg, rgba(18,16,16,0.99), rgba(10,10,10,1))" }}
          >
            {/* bg orbs */}
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,102,98,0.07), transparent 70%)", filter: "blur(30px)" }} />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(129,140,248,0.07), transparent 70%)", filter: "blur(30px)" }} />

            <p className="text-xs font-mono uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              Ready to start?
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Audit Your Profile in{" "}
              <span style={{ background: "linear-gradient(135deg, #ff6662, #fe9a00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                30 Seconds
              </span>
            </h3>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Join 12,000+ engineers who've used SkillBridge AI to land interviews at top companies.
            </p>
            <Link
              to="/register"
              id="bottom-cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #ff6662, #fe7a00)",
                boxShadow: "0 0 40px rgba(255,102,98,0.3), 0 8px 24px rgba(255,102,98,0.15)",
              }}
            >
              Get Started Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AudiencePersonas;
