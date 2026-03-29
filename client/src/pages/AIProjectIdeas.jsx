import React, { useState } from "react";
import { FiCpu, FiSave, FiRefreshCw, FiCopy, FiCheck, FiZap, FiCode, FiLoader } from "react-icons/fi";
import { FaRobot, FaBookmark, FaLightbulb } from "react-icons/fa";

const techStacks = ["MERN Stack", "Python / Django", "React Native", "Next.js", "Flutter", "Spring Boot", "FastAPI", "Vue.js", "MEAN Stack"];
const complexities = ["Beginner", "Intermediate", "Advanced"];
const domains = ["FinTech", "HealthTech", "EdTech", "E-Commerce", "SaaS", "Web3", "Open Source", "Social Media", "Productivity", "AI / ML"];

const placeholderIdea = {
  title: "AI-Powered Study Planner",
  tagline: "Smart scheduling meets intelligent learning",
  description:
    "A full-stack web application that uses AI to generate personalised weekly study plans based on the topics a student selects, their current skill level, and the number of hours they can dedicate per day. The AI adapts the plan dynamically each week based on progress.",
  features: [
    "AI-generated weekly study schedule using Gemini API",
    "Progress tracker with streak calendar",
    "Topic-wise resource recommendation",
    "Smart reminders via email or browser notifications",
    "Mobile-responsive dashboard with dark mode",
  ],
  techStack: "MERN Stack + Gemini AI + Tailwind CSS",
  difficulty: "Intermediate",
  estimatedTime: "3–4 weeks",
  resumeValue: "High — demonstrates AI integration, full-stack skills, and product thinking",
};

const AIProjectIdeas = () => {
  const [form, setForm] = useState({ stack: "", complexity: "", domain: "", notes: "" });
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleGenerate = async () => {
    if (!form.stack || !form.complexity) return;
    setLoading(true);
    setSaved(false);
    
    // Simulate backend connection delay
    await new Promise((r) => setTimeout(r, 1000));
    
    // TODO: Connect to your backend route that calls Gemini API
    console.log("Form payload to send to backend:", form);
    alert("Backend connection required. Please connect the Gemini API endpoint to receive ideas.");
    
    setLoading(false);
    // When backend is ready, set the response here:
    // setGenerated(response.data);
  };

  const handleSave = async () => {
    // Will POST to /api/ai/save-idea when backend is connected
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopy = () => {
    if (!generated) return;
    const text = `${generated.title}\n\n${generated.description}\n\nFeatures:\n${generated.features.map((f) => `- ${f}`).join("\n")}\n\nStack: ${generated.techStack}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFormValid = form.stack && form.complexity;

  return (
    <div className="px-6 pb-4 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-4">
          <FaRobot /> Powered by Gemini AI
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          AI Project <span className="text-[#ffa116]">Generator</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-base leading-relaxed">
          Stop building another To-Do app. Generate unique, resume-worthy project ideas tailored to your tech stack and goals.
        </p>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">

        {/* ─── LEFT PANEL: Controls ─── */}
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 space-y-5 sticky top-20">

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-lg flex items-center justify-center">
              <FiCode className="text-[#ffa116]" />
            </div>
            <h2 className="font-bold text-white">Configure Your Idea</h2>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tech Stack *</label>
            <div className="flex flex-wrap gap-2">
              {techStacks.map((s) => (
                <button
                  key={s}
                  onClick={() => handleChange("stack", s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.stack === s ? "bg-[#ffa116]/15 border-[#ffa116]/40 text-[#ffa116]" : "bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-white hover:border-white/[0.2]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Complexity *</label>
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

          {/* Domain */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Domain / Industry</label>
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

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Additional Notes</label>
            <textarea
              placeholder="e.g. something with real-time features, or related to my college project..."
              rows={3}
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#ffa116] focus:shadow-[0_0_0_3px_rgba(255,161,22,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none transition-all"
            />
          </div>

          {/* Generate Button */}
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

          {!isFormValid && (
            <p className="text-center text-xs text-gray-600">Select Tech Stack and Complexity to continue</p>
          )}
        </div>

        {/* ─── RIGHT PANEL: Generated Idea ─── */}
        <div className="min-h-[500px]">
          {!generated && !loading && (
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
              <p className="text-gray-500 text-sm">Gemini AI is crafting something unique for you</p>
            </div>
          )}

          {generated && !loading && (
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#ffa116]/10 to-transparent border-b border-white/[0.06] px-6 py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-2 py-0.5">AI Generated</span>
                    <span className="text-xs text-gray-500">{form.stack} · {form.complexity}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{generated.title}</h2>
                  <p className="text-gray-400 text-sm mt-1 italic">{generated.tagline}</p>
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
                    onClick={handleGenerate}
                    title="Regenerate"
                    className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all"
                  >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={handleSave}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-500/15 border border-green-500/30 text-green-400" : "bg-[#ffa116] text-black hover:bg-[#ffb84d]"}`}
                  >
                    {saved ? <><FiCheck /> Saved!</> : <><FaBookmark /> Save Idea</>}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project Overview</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{generated.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {generated.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FiCheck className="text-[#ffa116] text-[10px]" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Meta badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Tech Stack", value: generated.techStack },
                    { label: "Difficulty", value: generated.difficulty },
                    { label: "Time Estimate", value: generated.estimatedTime },
                    { label: "Resume Value", value: generated.resumeValue },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
                      <p className="text-xs text-white font-medium leading-snug">{m.value}</p>
                    </div>
                  ))}
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