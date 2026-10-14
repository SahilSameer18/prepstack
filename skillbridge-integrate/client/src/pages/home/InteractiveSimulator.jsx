import React, { useState, useEffect } from "react";
import { Link } from "react-router";

const SAMPLE_PROFILES = {
  frontend: {
    title: "Senior React Engineer",
    company: "Stripe",
    matchScore: 88,
    gaps: ["System Design", "GraphQL", "Web Performance"],
    questions: [
      {
        q: "Explain how React 19 handles Server Actions and pending states.",
        a: "React 19 introduces hooks like useActionState and useTransition to natively handle pending states, error boundaries, and form action attributes without manual state triggers.",
      },
    ],
  },
  backend: {
    title: "Software Engineer (APIs)",
    company: "Vercel",
    matchScore: 92,
    gaps: ["Redis Caching", "Docker Containerization", "OAuth Rotation"],
    questions: [
      {
        q: "How do you handle race conditions in distributed token caches?",
        a: "Implement optimistic locking via transactional version checks, or use Redis Lua scripts to execute compare-and-swap operations atomically.",
      },
    ],
  },
  fullstack: {
    title: "Full Stack Engineer",
    company: "Linear",
    matchScore: 84,
    gaps: ["Next.js App Router", "PostgreSQL Indexes", "AWS Deployment"],
    questions: [
      {
        q: "Compare Server-Sent Events (SSE) vs WebSockets for real-time dashboard sync.",
        a: "SSE is standard HTTP, unidirectional, and handles reconnection automatically — ideal for notifications. WebSockets are bidirectional and protocol-heavy — best for real-time messaging.",
      },
    ],
  },
};

const InteractiveSimulator = ({ user }) => {
  const [selectedRole, setSelectedRole] = useState("frontend");
  const [simStep, setSimStep] = useState(-1);
  const [simulating, setSimulating] = useState(false);

  const activeData = SAMPLE_PROFILES[selectedRole];

  const startSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setSimStep(0);
  };

  useEffect(() => {
    let timer;
    if (simulating && simStep >= 0 && simStep < 4) {
      timer = setTimeout(() => {
        setSimStep((prev) => prev + 1);
      }, 1200);
    } else if (simStep === 4) {
      setSimulating(false);
    }
    return () => clearTimeout(timer);
  }, [simulating, simStep]);

  return (
    <div className="relative rounded-2xl border border-border bg-surface/85 shadow-2xl p-6 overflow-hidden">
      {/* Console header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/50 pb-4 mb-5">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/40" />
          <span className="w-3 h-3 rounded-full bg-amber-500/40" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/40" />
          <span className="ml-2 text-xs font-mono text-stone-500 tracking-wider">SKILL_ENGINE_CONSOLE</span>
        </div>
        
        {/* Selector tab list */}
        <div className="flex bg-background rounded-lg p-0.5 border border-border overflow-x-auto no-scrollbar max-w-full">
          {["frontend", "backend", "fullstack"].map((tab) => (
            <button
              key={tab}
              disabled={simulating}
              onClick={() => {
                setSelectedRole(tab);
                setSimStep(-1);
              }}
              className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded transition-colors uppercase cursor-pointer disabled:opacity-50 ${
                selectedRole === tab ? "bg-accent/10 text-accent" : "text-secondary hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Pre-simulation Idle Console Screen */}
      {simStep === -1 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/5 border border-accent/15 flex items-center justify-center text-accent mb-5">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-primary mb-1.5">Interactive Match Simulator</h3>
          <p className="text-xs text-secondary mb-6 max-w-xs leading-relaxed">
            Select a role template tab and run the match engine to audit credentials instantly.
          </p>
          <button
            onClick={startSimulation}
            className="px-5 py-2 rounded-xl text-xs font-bold text-background bg-accent hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-accent/10"
          >
            Run Alignment Check
          </button>
        </div>
      )}

      {/* Processing Simulation Screen */}
      {simStep >= 0 && simStep < 4 && (
        <div className="py-14 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent border border-accent/25 animate-pulse mb-6">
            <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          </div>
          <div className="w-full max-w-xs font-mono text-[10px] text-left flex flex-col gap-2 bg-background p-4 rounded-xl border border-border leading-relaxed">
            <p className={simStep >= 0 ? "text-emerald-400" : "text-secondary/60"}>
              {simStep >= 0 ? "✓" : "○"} [TASK] Loading resume content...
            </p>
            <p className={simStep >= 1 ? "text-emerald-400" : "text-secondary/60"}>
              {simStep >= 1 ? "✓" : "○"} [TASK] Extracting keyword identifiers...
            </p>
            <p className={simStep >= 2 ? "text-accent animate-pulse" : simStep >= 3 ? "text-emerald-400" : "text-secondary/60"}>
              {simStep >= 3 ? "✓" : simStep >= 2 ? "▸" : "○"} [TASK] Correlating skills matrix...
            </p>
            <p className={simStep >= 3 ? "text-accent animate-pulse" : "text-secondary/60"}>
              {simStep >= 3 ? "▸" : "○"} [TASK] Finalizing alignment metrics...
            </p>
          </div>
        </div>
      )}

      {/* Finalized Report Result Screen */}
      {simStep === 4 && (
        <div className="animate-fade-in-up">
          
          <div className="flex items-center gap-4 bg-background/60 p-3 rounded-xl border border-border mb-4">
            <div className="relative w-12 h-12 shrink-0 bg-emerald-500/5 rounded-full flex items-center justify-center border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-400">{activeData.matchScore}%</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-primary leading-tight mb-0.5">{activeData.title}</h4>
              <p className="text-[10px] text-secondary">{activeData.company} · Target Profile</p>
            </div>
            <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
              STRONG MATCH
            </span>
          </div>

          <div className="mb-4">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2 font-mono">Skill Gaps Detected</p>
            <div className="flex flex-wrap gap-1.5">
              {activeData.gaps.map((gap, i) => (
                <span
                  key={gap}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    i === 0
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {gap}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-accent/5 border border-accent/15 rounded-xl text-left leading-relaxed">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-bold text-accent uppercase tracking-wide font-mono">Sample Interview Question</span>
              <span className="text-[9px] text-accent/80">Technical Round</span>
            </div>
            <p className="text-xs font-semibold text-primary mb-1 leading-snug">
              "{activeData.questions[0].q}"
            </p>
            <p className="text-[10px] text-secondary line-clamp-2">
              {activeData.questions[0].a}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4 mt-5">
            <button
              onClick={() => setSimStep(-1)}
              className="text-[10px] font-mono font-bold text-secondary hover:text-primary transition-colors uppercase flex items-center gap-1 cursor-pointer"
            >
              ◀ Restart Demo
            </button>
            <Link
              to={user ? "/generate" : "/register"}
              className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-primary bg-accent transition-all duration-200 hover:opacity-90 active:scale-95"
            >
              Generate Your Custom Plan
            </Link>
          </div>

        </div>
      )}
    </div>
  );
};

export default InteractiveSimulator;


