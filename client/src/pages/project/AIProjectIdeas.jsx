import React, { useState, useEffect } from "react";
import { FiCpu, FiRefreshCw, FiCopy, FiCheck, FiZap, FiCode, FiLoader, FiList } from "react-icons/fi";
import { useProject } from '../../hooks/useProject'
import { useNavigate, useParams } from "react-router-dom";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";

const techStacks = ["MERN Stack", "Python / Django", "React Native", "Next.js", "Flutter", "Spring Boot", "FastAPI", "Vue.js", "MEAN Stack"];
const complexities = ["Beginner", "Intermediate", "Advanced"];
const domains = ["FinTech", "HealthTech", "EdTech", "E-Commerce", "SaaS", "Web3", "Open Source", "Social Media", "Productivity", "AI / ML"];

const AIProjectIdeas = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [form, setForm] = useState({ techStack: "", complexity: "", domain: "", notes: "" });
  const { generateProject, getProjectById, loading, project, setProject } = useProject();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId);
    }
    // Clear generated project data when user leaves/unmounts the component
    return () => {
      setProject(null);
    };
  }, [projectId, getProjectById, setProject]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleGenerate = async () => {
    if (!form.techStack || !form.complexity) return;
    setError(null);
    try {
      await generateProject(form);
    } catch (err) {
      setError(err.message || "Failed to generate project idea. Please try again.");
    }
  };

  const handleReset = () => {
    setForm({ techStack: "", complexity: "", domain: "", notes: "" });
    setProject(null);
    setError(null);
    navigate('/ai-projects', { replace: true });
  };

  const handleCopy = () => {
    if (!project) return;
    const text = `${project.title}\n\n${project.description}\n\nFeatures:\n${project.features?.map((f) => `- ${f}`).join("\n")}\n\nStack: ${project.techStack}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFormValid = form.techStack && form.complexity;

  return (
    <div className="px-4 sm:px-6 pb-12 max-w-7xl mx-auto page-enter">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-2">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
            <span className="tracking-wider uppercase font-semibold text-zinc-300">Architecture Compiler</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-[-0.035em] mb-3">
            System Architecture Studio
          </h1>
          <p className="text-zinc-400 max-w-2xl text-base sm:text-lg leading-relaxed font-normal">
            Generate production-grade engineering projects tailored to your target tech stack with distributed systems challenges, concurrency bottlenecks, and realistic benchmark targets.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.18] transition-all font-display font-semibold text-xs sm:text-sm self-start md:self-auto cursor-pointer"
        >
          <FiList className="text-[#ffa116]" /> Saved Blueprints
        </button>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start text-left">

        {/* ─── LEFT PANEL: Controls ─── */}
        <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-6 space-y-5 sticky top-20 shadow-xl">

          <div className="flex items-center gap-2.5 mb-2 pb-3 border-b border-white/[0.08]">
            <div className="w-8 h-8 bg-[#ffa116]/10 border border-[#ffa116]/25 rounded-lg flex items-center justify-center">
              <FiCode className="text-[#ffa116] text-sm" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-sm">Specification Constraints</h2>
              <p className="text-[11px] font-mono text-zinc-400">Define architectural parameters</p>
            </div>
          </div>

          {/* Tech Stack — grouped section */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5 space-y-2.5">
            <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              Tech Stack <span className="text-[#ffa116]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {techStacks.map((s) => (
                <button
                  key={s}
                  onClick={() => handleChange("techStack", s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    form.techStack === s 
                      ? "bg-[#ffa116]/15 border-[#ffa116]/40 text-[#ffa116] font-semibold" 
                      : "bg-[#121216] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.2]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity — grouped section */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5 space-y-2.5">
            <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              Target Complexity <span className="text-[#ffa116]">*</span>
            </label>
            <div className="flex gap-2">
              {complexities.map((c) => {
                const activeColors = { 
                  Beginner: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10", 
                  Intermediate: "text-amber-400 border-amber-500/40 bg-amber-500/10", 
                  Advanced: "text-rose-400 border-rose-500/40 bg-rose-500/10" 
                };
                return (
                  <button
                    key={c}
                    onClick={() => handleChange("complexity", c)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      form.complexity === c 
                        ? activeColors[c] 
                        : "bg-[#121216] border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Domain + Notes — grouped section */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5 space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Target Domain</label>
              <div className="flex flex-wrap gap-2">
                {domains.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleChange("domain", form.domain === d ? "" : d)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      form.domain === d 
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-300 font-semibold" 
                        : "bg-[#121216] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.2]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2.5 border-t border-white/[0.06]">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Architectural Constraints / Goals</label>
              <textarea
                placeholder="e.g. distributed event queue, high throughput p99 latency target, or WebSocket coordination..."
                rows={3}
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="w-full bg-[#121216] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#ffa116] focus:ring-1 focus:ring-[#ffa116] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none resize-none transition-colors"
              />
            </div>
          </div>

          {/* Validation hint */}
          {!isFormValid && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-2.5 rounded-lg text-left">
              <FiZap className="shrink-0 mt-0.5 text-sm" />
              <p className="text-xs font-medium">Select Tech Stack and Complexity to compile blueprint</p>
            </div>
          )}

          {/* Rate limit / generation error */}
          <InlineErrorAlert
            message={error}
            onDismiss={() => setError(null)}
            className=""
          />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGenerate}
              disabled={!isFormValid || loading}
              className={`w-full py-3 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isFormValid && !loading 
                  ? "amber-specular-button text-black font-bold" 
                  : "bg-white/[0.04] border border-white/[0.08] text-zinc-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <><FiLoader className="animate-spin text-zinc-400" /> Compiling Blueprint...</>
              ) : (
                <><FiZap /> Generate Architecture Blueprint</>
              )}
            </button>
            <button
               onClick={handleReset}
               title="Clear all fields and start fresh"
               className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors font-medium text-xs sm:text-sm cursor-pointer"
            >
              <FiRefreshCw className="text-xs" /> Reset Parameters
            </button>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Generated Idea ─── */}
        <div className="min-h-[500px]">
          {!project && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#ffa116]/10 border border-[#ffa116]/25 flex items-center justify-center mb-4">
                <FiCpu className="text-2xl text-[#ffa116]" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">Architectural Blueprint Canvas</h3>
              <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
                Configure your system parameters on the left to compile an industry-grade architecture blueprint with realistic distributed challenges.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm">
                {[
                  { label: "Production Scale", sub: "Distributed" },
                  { label: "Benchmarked", sub: "Latency & RPS" },
                  { label: "ATS Caliber", sub: "Portfolio Ready" }
                ].map((tag) => (
                  <div key={tag.label} className="bg-[#121216] border border-white/[0.08] rounded-xl p-3 text-center">
                    <p className="text-xs text-zinc-200 font-semibold mb-0.5">{tag.label}</p>
                    <p className="text-[10px] font-mono text-zinc-500">{tag.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-10 text-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/30 flex items-center justify-center">
                  <FiCpu className="text-2xl text-[#ffa116] animate-pulse" />
                </div>
              </div>
              <p className="font-display text-white font-semibold text-base mb-1">Synthesizing Blueprint...</p>
              <p className="font-mono text-zinc-400 text-xs">[SYSTEM_ARCH] Formulating data schemas and concurrency controls</p>
            </div>
          )}

          {project && !loading && (
            <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
              {/* Card Header */}
              <div className="bg-[#101014] border-b border-white/[0.08] px-6 py-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Chip tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/25 rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" /> ARCHITECTURE BLUEPRINT
                    </span>
                    {(project.techStack || form.techStack) && (
                      <span className="text-[10px] font-mono font-semibold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-0.5 uppercase">
                        {project.techStack || form.techStack}
                      </span>
                    )}
                    {form.domain && (
                      <span className="text-[10px] font-mono font-semibold tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-0.5 uppercase">
                        {form.domain}
                      </span>
                    )}
                    {(project.difficulty || form.complexity) && (
                      <span className={`text-[10px] font-mono font-semibold tracking-wider rounded-full px-2.5 py-0.5 border uppercase ${
                        (project.difficulty || form.complexity) === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' :
                        (project.difficulty || form.complexity) === 'Intermediate' ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' :
                        'text-rose-400 bg-rose-500/10 border-rose-500/25'
                      }`}>
                        {project.difficulty || form.complexity}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-1">{project.title}</h2>
                  <p className="text-zinc-400 text-xs sm:text-sm">{project.tagline}</p>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCopy}
                    title="Copy specification to clipboard"
                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                  </button>
                  <button
                    onClick={handleReset}
                    title="Clear current specification and start over"
                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group"
                  >
                    <FiRefreshCw className="transition-transform group-hover:rotate-180 duration-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">System Overview</h3>
                  <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">{project.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">Core Technical Requirements</h3>
                  <ul className="space-y-2.5">
                    {project.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                        <span className="w-5 h-5 rounded-md bg-[#ffa116]/10 border border-[#ffa116]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FiCheck className="text-[#ffa116] text-xs" />
                        </span>
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Meta details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { label: "Tech Stack", value: project.techStack },
                      { label: "Architectural Tier", value: project.difficulty },
                      { label: "Implementation Target", value: project.estimatedTime },
                    ].map((m) => (
                      <div key={m.label} className="bg-[#121216] border border-white/[0.08] rounded-xl p-3.5">
                        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">{m.label}</p>
                        <p className="text-xs sm:text-sm text-white font-medium leading-snug">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Resume Value - Full Width and Highlighted */}
                  <div className="bg-[#ffa116]/[0.03] border border-[#ffa116]/20 rounded-xl p-4">
                    <p className="text-[11px] font-mono text-[#ffa116] uppercase tracking-wider mb-2 font-bold flex items-center gap-2">
                      <FiZap className="text-xs" /> Portfolio Value & ATS High-Signal Talking Points
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {project.resumeValue}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProjectIdeas;
