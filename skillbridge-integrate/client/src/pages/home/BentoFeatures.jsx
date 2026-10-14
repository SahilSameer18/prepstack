import React, { useState } from "react";

const FEATURES = [
  {
    id: "jd-match",
    title: "JD Keyword Alignment",
    tag: "Match Engine",
    desc: "Scans your credentials against job prerequisites, extracts matching stacks, and highlights missing terms with severity rankings.",
    color: "#ff6662",
    span: "md:col-span-2",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" /><path d="M11 8v6" />
      </svg>
    ),
    visual: (
      <div className="mt-5 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex justify-between px-4 py-2 border-b text-[10px] font-mono font-bold uppercase tracking-wider" style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
          <span>Requirement</span><span>Status</span>
        </div>
        {[
          { skill: "React (Next.js)", status: "match" },
          { skill: "TypeScript Typing", status: "match" },
          { skill: "GraphQL Core", status: "gap" },
          { skill: "AWS Lambda", status: "partial" },
        ].map(({ skill, status }) => (
          <div key={skill} className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>{skill}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
              background: status === "match" ? "rgba(52,211,153,0.1)" : status === "gap" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
              color: status === "match" ? "#34d399" : status === "gap" ? "#f87171" : "#fbbf24",
            }}>
              {status === "match" ? "✓ Match" : status === "gap" ? "✗ Gap" : "~ Partial"}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "practice-banks",
    title: "Practice Banks",
    tag: "Interview Prep",
    desc: "Tailored technical & behavioral questions with expert model answers, specific to your target role.",
    color: "#818cf8",
    span: "md:col-span-1",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    visual: (
      <div className="mt-5 rounded-2xl p-4" style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)" }}>
        <p className="text-[9px] font-bold font-mono uppercase tracking-widest mb-2" style={{ color: "#818cf8" }}>Technical Round</p>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          "Explain how React 19 handles Server Actions and pending states..."
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(129,140,248,0.15)" }}>
            <div className="h-1 rounded-full w-3/4" style={{ background: "#818cf8" }} />
          </div>
          <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Expert</span>
        </div>
      </div>
    ),
  },
  {
    id: "gap-audit",
    title: "Priority Gap Auditing",
    tag: "Severity Engine",
    desc: "Categorizes missing skills into High, Medium, and Low priorities so you know exactly what to tackle first.",
    color: "#fbbf24",
    span: "md:col-span-1",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4" /><path d="M12 17h.01" /><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      </svg>
    ),
    visual: (
      <div className="mt-5 flex flex-col gap-2">
        {[
          { label: "Docker Containerization", level: "HIGH", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", bar: 90 },
          { label: "Redis Caching", level: "MED", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", bar: 55 },
          { label: "CI/CD Pipelines", level: "LOW", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", bar: 25 },
        ].map(({ label, level, color, bg, border, bar }) => (
          <div key={label} className="rounded-xl px-3 py-2.5" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ color, background: `${color}15` }}>{level}</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${bar}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "learning",
    title: "Curated Learning Paths",
    tag: "Knowledge Base",
    desc: "Each identified gap links to pre-verified documentation, tutorial videos, and hands-on exercises.",
    color: "#34d399",
    span: "md:col-span-2",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    visual: (
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          { type: "Documentation", title: "Official Next.js Docs", color: "#34d399", icon: "📄" },
          { type: "Video Tutorial", title: "Advanced App Router", color: "#ff6662", icon: "▶" },
          { type: "Exercise", title: "GraphQL Playground", color: "#818cf8", icon: "⚡" },
          { type: "Cheatsheet", title: "Docker Quick Ref", color: "#fbbf24", icon: "📋" },
        ].map(({ type, title, color, icon }) => (
          <div key={title} className="rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.02]" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
            <span className="text-base">{icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider font-mono" style={{ color: `${color}90` }}>{type}</span>
            <span className="text-xs font-semibold leading-tight" style={{ color: "rgba(255,255,255,0.75)" }}>{title}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "roadmap",
    title: "10-Day Preparation Roadmap",
    tag: "Structured Plan",
    desc: "A day-by-day layout that walks you through closing gaps, building mock answers, and reinforcing core concepts before interview day.",
    color: "#c084fc",
    span: "md:col-span-3",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
    visual: (
      <div className="mt-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { day: "Day 1", task: "Setup Docker", done: true },
            { day: "Day 2", task: "Cache Locks", done: true },
            { day: "Day 3", task: "OAuth Flows", active: true },
            { day: "Day 4", task: "AWS Lambda", pending: true },
            { day: "Day 5", task: "GraphQL API", pending: true },
          ].map(({ day, task, done, active, pending }) => (
            <div
              key={day}
              className="relative rounded-xl p-3 text-center"
              style={{
                background: done ? "rgba(52,211,153,0.06)" : active ? "rgba(192,132,252,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${done ? "rgba(52,211,153,0.2)" : active ? "rgba(192,132,252,0.25)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {active && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold font-mono px-2 py-0.5 rounded-full" style={{ background: "#c084fc", color: "#000" }}>ACTIVE</span>
              )}
              <p className="text-[9px] font-mono font-bold uppercase tracking-wider mb-1" style={{ color: done ? "#34d399" : active ? "#c084fc" : "rgba(255,255,255,0.2)" }}>{day}</p>
              <p className="text-xs font-semibold" style={{ color: done ? "rgba(52,211,153,0.9)" : active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }}>{task}</p>
              <span className="text-sm">{done ? "✓" : active ? "▸" : "○"}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="h-full rounded-full" style={{ width: "30%", background: "linear-gradient(90deg, #34d399, #c084fc)" }} />
          </div>
          <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Day 3 / 10 — 30% Complete</span>
        </div>
      </div>
    ),
  },
];

const BentoFeatures = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative" style={{ background: "#080808" }}>
      {/* Section glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,102,98,0.04) 0%, transparent 70%)",
      }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5" style={{
            background: "rgba(255,102,98,0.06)", border: "1px solid rgba(255,102,98,0.2)", color: "#ff6662",
          }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Everything to Ace<br />
            <span style={{ background: "linear-gradient(135deg, #ff6662, #fe9a00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Your Tech Interview
            </span>
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(161,161,170,0.8)" }}>
            A comprehensive AI workbench designed to close skill gaps and align your profile with real hiring standards.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feat) => (
            <div
              key={feat.id}
              className={`relative rounded-2xl p-6 flex flex-col overflow-hidden transition-all duration-500 cursor-default ${feat.span}`}
              style={{
                background: hovered === feat.id
                  ? `linear-gradient(160deg, ${feat.color}0a, rgba(10,10,10,0.98))`
                  : "rgba(255,255,255,0.02)",
                border: hovered === feat.id
                  ? `1px solid ${feat.color}30`
                  : "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={() => setHovered(feat.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Top glow spot */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{
                background: hovered === feat.id
                  ? `linear-gradient(90deg, transparent, ${feat.color}50, transparent)`
                  : "transparent",
                transition: "background 0.5s",
              }} />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300"
                    style={{
                      background: `${feat.color}12`,
                      border: `1px solid ${feat.color}25`,
                      color: feat.color,
                      transform: hovered === feat.id ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{feat.title}</h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold font-mono tracking-widest uppercase shrink-0 px-2 py-1 rounded-lg" style={{ color: feat.color, background: `${feat.color}10` }}>
                  {feat.tag}
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{feat.desc}</p>

              {feat.visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
