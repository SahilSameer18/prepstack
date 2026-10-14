import React, { useRef, useState, useEffect } from "react";

const STEPS = [
  {
    num: "01",
    label: "Upload & Target",
    title: "Define Your Target Role",
    desc: "Paste the job description and upload your resume. Our parser ingests both in under 5 seconds.",
    color: "#ff6662",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    detail: "PDF, DOCX, or plain text supported",
  },
  {
    num: "02",
    label: "AI Analysis",
    title: "Keyword & Skill Audit",
    desc: "The AI extracts requirements, matches your credentials, and flags severity-ranked gaps with precision.",
    color: "#818cf8",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="m16.2 7.8-2 2" /><path d="m7.8 16.2 2-2" /><circle cx="12" cy="12" r="4" />
      </svg>
    ),
    detail: "96.4% match scoring accuracy",
  },
  {
    num: "03",
    label: "Prep Workspace",
    title: "Your Tailored Roadmap",
    desc: "Study curated Q&As, follow the 10-day plan, track progress, and export ATS-ready resume PDFs.",
    color: "#34d399",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    detail: "Full PDF export included",
  },
];

const ProcessTimeline = () => {
  const [activeStep, setActiveStep] = useState(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #080808 0%, #0c0c0c 100%)" }}
    >
      {/* subtle dot pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="max-w-5xl mx-auto relative">
        {/* Heading */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5" style={{
            background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.2)", color: "#818cf8",
          }}>
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            From Zero to{" "}
            <span style={{ background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Interview Ready
            </span>
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(161,161,170,0.7)" }}>
            Three focused steps that transform your scattered job hunt into a laser-focused interview strategy.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-0 right-0 h-px" style={{
            background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent 95%)",
          }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {STEPS.map((step, index) => (
              <div
                key={step.num}
                className={`relative flex flex-col items-center text-center transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 0.15}s` }}
                onMouseEnter={() => setActiveStep(step.num)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Number connector node */}
                <div
                  className="relative z-10 w-28 h-28 rounded-3xl flex flex-col items-center justify-center mb-8 transition-all duration-400"
                  style={{
                    background: activeStep === step.num
                      ? `linear-gradient(135deg, ${step.color}20, ${step.color}08)`
                      : "rgba(255,255,255,0.02)",
                    border: activeStep === step.num
                      ? `1px solid ${step.color}40`
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: activeStep === step.num
                      ? `0 0 40px ${step.color}20, 0 0 80px ${step.color}10`
                      : "none",
                    transform: activeStep === step.num ? "scale(1.06)" : "scale(1)",
                    color: step.color,
                  }}
                >
                  {step.icon}
                  <span
                    className="text-[10px] font-black font-mono uppercase tracking-widest mt-2"
                    style={{ color: activeStep === step.num ? step.color : "rgba(255,255,255,0.2)" }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <span
                  className="text-[9px] font-bold font-mono uppercase tracking-[0.15em] mb-3 px-3 py-1 rounded-full"
                  style={{
                    color: step.color,
                    background: `${step.color}10`,
                    border: `1px solid ${step.color}20`,
                  }}
                >
                  {step.label}
                </span>
                <h3 className="text-base font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.45)", maxWidth: "240px" }}>
                  {step.desc}
                </p>
                <span className="text-[10px] font-mono" style={{ color: step.color + "70" }}>
                  {step.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;