import React, { useState, useEffect } from "react";
import { FiCpu, FiSave, FiRefreshCw, FiCopy, FiCheck, FiZap, FiCode, FiLoader, FiList } from "react-icons/fi";
import { FaRobot, FaBookmark, FaLightbulb } from "react-icons/fa";
import { useProject } from '../../hooks/useProject'
import { useNavigate } from "react-router-dom";

const techStacks = ["MERN Stack", "Python / Django", "React Native", "Next.js", "Flutter", "Spring Boot", "FastAPI", "Vue.js", "MEAN Stack"];
const complexities = ["Beginner", "Intermediate", "Advanced"];
const domains = ["FinTech", "HealthTech", "EdTech", "E-Commerce", "SaaS", "Web3", "Open Source", "Social Media", "Productivity", "AI / ML"];

const AIProjectIdeas = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ techStack: "", complexity: "", domain: "", notes: "" });
  const { generateProject, loading, project, setProject } = useProject();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Clear generated project data when user leaves/unmounts the component
    return () => {
      setProject(null);
    };
  }, [setProject]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleGenerate = async () => {
    if (!form.techStack || !form.complexity) return;
    try {
      await generateProject(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to generate idea", error);
    }
  };

  const handleReset = () => {
    setForm({ techStack: "", complexity: "", domain: "", notes: "" });
    setProject(null);
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
    <div className="px-6 pb-4 max-w-7xl mx-auto page-enter">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-2">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-4">
            <FaRobot /> Powered by AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            AI Project <span className="text-[#ffa116]">Generator</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-base leading-relaxed">
            Stop building another To-Do app. Generate unique, resume-worthy project ideas tailored to your tech stack and goals.
          </p>
        </div>

        <button
          onClick={() => navigate('/project-dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all font-medium text-sm self-start md:self-auto"
        >
          <FiList className="text-[#ffa116]" /> View Saved Projects
        </button>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">

        {/* ─── LEFT PANEL: Controls ─── */}
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 space-y-5 sticky top-20">

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-lg flex items-center justify-center">
              <FiCode className="text-[#ffa116]" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Configure Your Idea</h2>
              <p className="text-[10px] text-gray-500">Set constraints for the AI</p>
            </div>
          </div>

          {/* Tech Stack — grouped section */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              Tech Stack <span className="text-[#ffa116]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {techStacks.map((s) => (
                <button
                  key={s}
                  onClick={() => handleChange("techStack", s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.techStack === s ? "bg-[#ffa116]/15 border-[#ffa116]/40 text-[#ffa116]" : "bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-white hover:border-white/[0.2]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity — grouped section */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              Complexity <span className="text-[#ffa116]">*</span>
            </label>
            <div className="flex gap-2">
              {complexities.map((c) => {
                const colors = { Beginner: "text-green-400 border-green-500/40 bg-green-500/10", Intermediate: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10", Advanced: "text-red-400 border-red-500/40 bg-red-500/10" };
                return (
                  <button
                    key={c}
                    onClick={() => handleChange("complexity", c)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${form.complexity === c ? colors[c] : "bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-white"}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Domain + Notes — grouped section */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Domain / Industry</label>
              <div className="flex flex-wrap gap-2">
                {domains.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleChange("domain", form.domain === d ? "" : d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.domain === d ? "bg-purple-500/15 border-purple-500/40 text-purple-300" : "bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-white hover:border-white/[0.2]"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.05]">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Additional Notes</label>
              <textarea
                placeholder="e.g. something with real-time features, or related to my college project..."
                rows={3}
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="w-full bg-[#0d0d0d] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#ffa116] focus:shadow-[0_0_0_3px_rgba(255,161,22,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none transition-all"
              />
            </div>
          </div>

          {/* Validation hint */}
          {!isFormValid && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-2.5 rounded-lg">
              <FiZap className="shrink-0 mt-0.5 text-sm" />
              <p className="text-xs font-semibold">Select Tech Stack and Complexity to continue</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGenerate}
              disabled={!isFormValid || loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${isFormValid && !loading ? "bg-gradient-to-r from-[#ffa116] to-[#ff8c00] text-black hover:from-[#ffb84d] hover:to-[#ffa116] shadow-lg shadow-orange-500/20 hover:-translate-y-0.5" : "bg-white/[0.05] text-gray-500 cursor-not-allowed"}`}
            >
              {loading ? (
                <><FiLoader className="animate-spin" /> Generating Idea...</>
              ) : (
                <><FiZap /> Generate Project Idea</>
              )}
            </button>
            <button
               onClick={handleReset}
               title="Clear all fields and start fresh"
               className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all font-medium text-sm"
            >
              <FiRefreshCw className="text-xs" /> Reset
            </button>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Generated Idea ─── */}
        <div className="min-h-[500px]">
          {!project && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#111] border border-dashed border-white/[0.08] rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#ffa116]/10 border border-[#ffa116]/20 flex items-center justify-center mb-4">
                <FaRobot className="text-3xl text-[#ffa116]/60" />
              </div>
              <h3 className="text-lg font-bold text-gray-300 mb-2">Your idea will appear here</h3>
              <p className="text-gray-500 text-sm max-w-xs">Configure your preferences on the left and hit Generate to get a unique, tailored project idea.</p>
              <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm">
                {["Resume-Worthy", "Unique Concepts", "Practical Ideas"].map((tag) => (
                  <div key={tag} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                    <FaLightbulb className="text-[#ffa116]/40 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-500 font-medium">{tag}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#111] border border-white/[0.08] rounded-2xl p-10 text-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-[#ffa116]/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/30 flex items-center justify-center">
                  <FiCpu className="text-2xl text-[#ffa116] animate-pulse" />
                </div>
              </div>
              <p className="text-white font-semibold mb-1">Generating your idea...</p>
              <p className="text-gray-500 text-sm">AI is crafting something unique for you</p>
            </div>
          )}

          {project && !loading && (
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#ffa116]/10 to-transparent border-b border-white/[0.06] px-6 py-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Chip tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold tracking-widest text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                      <FiCheck strokeWidth={3} className="text-[8px]" /> AI GENERATED
                    </span>
                    {(project.techStack || form.techStack) && (
                      <span className="text-[10px] font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-0.5 uppercase">
                        {project.techStack || form.techStack}
                      </span>
                    )}
                    {form.domain && (
                      <span className="text-[10px] font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-0.5 uppercase">
                        {form.domain}
                      </span>
                    )}
                    {(project.difficulty || form.complexity) && (
                      <span className={`text-[10px] font-bold tracking-widest rounded-full px-2.5 py-0.5 border uppercase ${
                        (project.difficulty || form.complexity) === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        (project.difficulty || form.complexity) === 'Intermediate' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                        'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {project.difficulty || form.complexity}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-white">{project.title}</h2>
                  <p className="text-gray-400 text-sm mt-1 italic">{project.tagline}</p>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCopy}
                    title="Copy to clipboard"
                    className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all"
                  >
                    {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
                  </button>
                  <button
                    onClick={handleReset}
                    title="Clear current idea and start over"
                    className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all group"
                  >
                    <FiRefreshCw className="transition-transform group-hover:rotate-180 duration-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project Overview</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{project.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {project.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FiCheck className="text-[#ffa116] text-[10px]" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Meta details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { label: "Tech Stack", value: project.techStack },
                      { label: "Difficulty", value: project.difficulty },
                      { label: "Time Estimate", value: project.estimatedTime },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
                        <p className="text-xs text-white font-medium leading-snug">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Resume Value - Full Width and Highlighted */}
                  <div className="bg-[#ffa116]/5 border border-[#ffa116]/10 rounded-xl p-4">
                    <p className="text-[10px] text-[#ffa116] uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                      <FiZap className="text-xs" /> Resume Impact & Implementation Value
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed italic">
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