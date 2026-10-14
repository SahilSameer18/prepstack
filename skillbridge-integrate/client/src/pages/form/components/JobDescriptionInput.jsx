import React, { useState, useEffect, useMemo } from "react";

// Common industry skills to scan for live matches
const COMMON_SKILLS = [
  "React", "TypeScript", "JavaScript", "Python", "Node.js", "Express", "Next.js", 
  "Java", "Spring Boot", "Golang", "Rust", "AWS", "Docker", "Kubernetes", "SQL", 
  "MongoDB", "PostgreSQL", "GraphQL", "Tailwind CSS", "Redux", "CI/CD", 
  "Machine Learning", "System Design", "Microservices", "Git", "Figma", "Agile"
];

/**
 * JobDescriptionInput Component
 * Renders the input section for the target job description.
 */
const JobDescriptionInput = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync local state if parent value changes externally
  useEffect(() => {
    setLocalValue(value);
    setDebouncedValue(value);
  }, [value]);

  // Debounce the parent onChange callback and skill extractor to keep typing fluid
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(localValue);
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 180);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  const handleBlur = () => {
    setIsFocused(false);
    setDebouncedValue(localValue);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  // Extract skills dynamically based on debounced content
  const extractedSkills = useMemo(() => {
    if (!debouncedValue.trim()) return [];
    return COMMON_SKILLS.filter(skill => {
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      return regex.test(debouncedValue);
    });
  }, [debouncedValue]);

  return (
    <div className={`flex flex-col h-full bg-background/40 p-6 rounded-2xl border transition-all duration-300 ${
      isFocused ? "border-accent/40 shadow-[0_0_15px_rgba(255,102,98,0.15)]" : "border-border/80 hover:border-border/60"
    }`}>
      {/* Header section with Icon and Title */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-105"
            style={{
              background: "rgba(255,102,98,0.08)",
              border: "1px solid rgba(255,102,98,0.2)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff6662"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-primary text-base tracking-wide font-sans">
              Target Job Description
            </h2>
            <p className="text-xs text-accent font-medium mt-0.5">Required</p>
          </div>
        </div>

        {/* IDE window dot decoration */}
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
        </div>
      </div>

      {/* Editor Pane container */}
      <div className="relative flex-grow flex flex-col mb-3">
        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={`Paste the full job description details here...\ne.g. 'Senior Frontend Engineer at Google. Requires proficiency in React, TypeScript, and architectural principles...'`}
          maxLength={5000}
          className="flex-1 min-h-[280px] w-full rounded-xl p-4 text-sm text-primary/90 placeholder-secondary resize-none focus:outline-none transition-all duration-200 leading-relaxed border border-border/80 bg-background/80 no-scrollbar"
        />
      </div>

      {/* Live Extracted Skills tags */}
      <div className="mb-4">
        <p className="text-xs text-secondary mb-2 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Live Extracted Skills
        </p>
        <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 rounded-xl bg-background/50 border border-border/60">
          {extractedSkills.length > 0 ? (
            extractedSkills.map(skill => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md border bg-accent/10 text-accent border-accent/20 animate-fade-in"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-secondary/60 italic px-1 self-center">
              Type or paste job description to auto-detect core skills
            </span>
          )}
        </div>
      </div>

      {/* Character Count & Tip */}
      <div className="flex justify-between items-center text-[11px] text-secondary border-t border-border/80 pt-3">
        <span>Tailor your resume against these specific guidelines</span>
        <span className={`${localValue.length > 4500 ? 'text-amber-400' : 'text-secondary'} font-mono`}>
          {localValue.length} / 5000
        </span>
      </div>
    </div>
  );
};

export default JobDescriptionInput;
