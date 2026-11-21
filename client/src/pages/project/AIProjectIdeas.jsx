import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowRight, CaretDown, Check, Copy, Cpu, Lightning } from "@phosphor-icons/react";
import LongWait from "../../components/ui/LongWait";
import PageBackdrop from "../../components/ui/PageBackdrop";
import { useProject } from '../../hooks/useProject'
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { InlineSpinner } from "../../components/ui/Skeletons";
import { EmptyState, UsageNotice } from "../../components/ui/StateComponents";
import { useUsage } from "../../hooks/useUsage";

// KEEP IN SYNC with KNOWN_STACKS in server/src/modules/ai/ai.service.js: typed names that are not in this list are
// checked by the AI ("is this a real technology?") before an idea is generated.
const techStacks = ["MERN Stack", "PERN Stack", "MEAN Stack", "Next.js", "Angular", "Python / Django", "FastAPI", "Java / Spring Boot", "Go", ".NET", "Flutter", "React Native", "Kotlin (Android)"];
// Same rule as the server: 2 to 40 characters, letters, numbers and + # . / & ( ) -, with at least 2 letters
const isValidStackName = (value) => /^[A-Za-z0-9 +#./&()-]{2,40}$/.test(value) && (value.match(/[A-Za-z]/g) || []).length >= 2;
const complexities = ["Beginner", "Intermediate", "Advanced"];
const domains = ["FinTech", "HealthTech", "EdTech", "E-Commerce", "SaaS", "Web3", "Open Source", "Social Media", "Productivity", "AI / ML"];

const chipClass = (on, dashed = false) =>
  `flex min-h-[44px] cursor-pointer items-center rounded-xl px-3.5 text-sm transition-colors duration-150 active:scale-[0.98] sm:min-h-[40px] ${
    on ? "bg-brand/12 font-semibold text-brand" : `border text-muted hover:text-fg ${dashed ? "border-dashed border-ink/[0.2]" : "border-ink/[0.1]"}`
  }`;
const inputClass = "w-full rounded-xl border border-ink/[0.1] bg-card px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint hover:border-ink/[0.2] focus:border-brand focus:ring-1 focus:ring-brand";

const AIProjectIdeas = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  // The Role Analyzer links here with ?stack=Docker: a known stack selects its button, anything else fills the "Other" box.
  const wanted = (searchParams.get("stack") || "").trim().slice(0, 40);
  const known = techStacks.find((s) => s.toLowerCase() === wanted.toLowerCase());
  const [form, setForm] = useState({ techStack: known || (isValidStackName(wanted) ? wanted : ""), complexity: "", domain: "", notes: "" });
  const { generateProject, getProjectById, loading, project, setProject } = useProject();
  const { usage, refresh: refreshUsage } = useUsage();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [customStack, setCustomStack] = useState(!known && isValidStackName(wanted)); // "Other": the user types their own tech stack
  const [detailOpen, setDetailOpen] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId);
    }
    // Clear generated project data when user leaves/unmounts the component
    return () => {
      setProject(null);
    };
  }, [projectId, getProjectById, setProject]);

  // The idea sits below the form on a phone (and below the fold when the form is long), so bring it into view when it starts.
  useEffect(() => {
    if (!loading) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current?.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" });
  }, [loading]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleGenerate = async () => {
    if (!isFormValid) return;
    setError(null);
    try {
      await generateProject({ ...form, techStack: form.techStack.trim() });
    } catch (err) {
      setError(err.message || "Failed to generate project idea. Please try again.");
    } finally {
      refreshUsage();
    }
  };

  const handleReset = () => {
    setForm({ techStack: "", complexity: "", domain: "", notes: "" });
    setCustomStack(false);
    setDetailOpen(false);
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

  const stackOk = customStack ? isValidStackName(form.techStack.trim()) : !!form.techStack;
  const stackError = customStack && form.techStack.trim() !== "" && !stackOk ? "Use 2 to 40 letters, numbers or + # . / & ( ) -" : null;
  const limitReached = !!usage && usage.projects.used >= usage.projects.allowed;
  const isFormValid = stackOk && !!form.complexity;
  const canGenerate = isFormValid && !loading && !limitReached;
  const detailCount = (form.domain ? 1 : 0) + (form.notes.trim() ? 1 : 0);
  const level = project?.difficulty || form.complexity;
  const tags = [project?.techStack || form.techStack, form.domain, level].filter(Boolean);

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-2 text-left text-fg sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="break-words font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl">Get a project idea</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Pick a tech stack and difficulty, and get a portfolio project idea with real-world challenges to solve.
            </p>
          </div>
          <Link to="/dashboard?tab=projects" className="group inline-flex min-h-[44px] items-center gap-2 self-start font-display text-sm font-bold text-brand md:self-auto">
            Saved ideas <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
          {/* Form */}
          <div className="surface-card space-y-6 p-6">
            <div role="group" aria-labelledby="stack-label">
              <p id="stack-label" className="mb-3 font-ui text-sm font-semibold text-fg">Tech stack</p>
              <div className="flex flex-wrap gap-2">
                {techStacks.map((s) => (
                  <button
                    key={s} type="button" aria-pressed={!customStack && form.techStack === s}
                    onClick={() => { setCustomStack(false); handleChange("techStack", s); }}
                    className={chipClass(!customStack && form.techStack === s)}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button" aria-pressed={customStack}
                  onClick={() => { setCustomStack(true); handleChange("techStack", ""); }}
                  className={chipClass(customStack, true)}
                >
                  Other
                </button>
              </div>
              {customStack && (
                <div className="mt-3 space-y-1.5">
                  <input
                    type="text" value={form.techStack} maxLength={40} autoFocus
                    onChange={(e) => handleChange("techStack", e.target.value)}
                    placeholder="e.g. Rust, Svelte, Laravel"
                    aria-label="Your tech stack"
                    className={inputClass}
                  />
                  <p className={`text-xs ${stackError ? "text-bad" : "text-muted"}`}>
                    {stackError || "Type a programming language, framework or tool. We check that it is a real one."}
                  </p>
                </div>
              )}
            </div>

            <div role="group" aria-labelledby="level-label">
              <p id="level-label" className="mb-3 font-ui text-sm font-semibold text-fg">Difficulty</p>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-ink/[0.1] p-1">
                {complexities.map((c) => (
                  <button
                    key={c} type="button" aria-pressed={form.complexity === c}
                    onClick={() => handleChange("complexity", c)}
                    className={`min-h-[44px] cursor-pointer rounded-lg text-sm transition-colors duration-150 sm:min-h-[40px] ${form.complexity === c ? "bg-brand/12 font-semibold text-brand" : "text-muted hover:text-fg"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Area and notes stay optional, so they start folded away */}
            <div className="border-y border-ink/[0.08]">
              <button
                type="button" aria-expanded={detailOpen} aria-controls="detail-panel"
                onClick={() => setDetailOpen((open) => !open)}
                className="flex min-h-[52px] w-full cursor-pointer items-center justify-between text-sm"
              >
                <span className="font-semibold text-fg">
                  Add detail <span className="font-normal text-muted">{detailCount > 0 ? `(${detailCount} added)` : "(optional)"}</span>
                </span>
                <CaretDown aria-hidden="true" className={`text-muted transition-transform duration-200 ${detailOpen ? "rotate-180" : ""}`} />
              </button>
              <div id="detail-panel" className={`grid transition-[grid-template-rows] duration-300 ease-out ${detailOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden" inert={!detailOpen}>
                  <div className="space-y-5 pb-5">
                    <div role="group" aria-labelledby="area-label">
                      <p id="area-label" className="mb-3 text-sm text-muted">Area</p>
                      <div className="flex flex-wrap gap-2">
                        {domains.map((d) => (
                          <button
                            key={d} type="button" aria-pressed={form.domain === d}
                            onClick={() => handleChange("domain", form.domain === d ? "" : d)}
                            className={chipClass(form.domain === d)}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="idea-notes" className="mb-3 block text-sm text-muted">Anything specific?</label>
                      <textarea
                        id="idea-notes" rows={3} value={form.notes}
                        placeholder="e.g. a real-time queue, or a low-latency target"
                        onChange={(e) => handleChange("notes", e.target.value)}
                        className={`${inputClass} resize-none`}
                      />
                      <p className="mt-2 text-xs text-muted">Please don&apos;t include personal information. What you type here is sent to our AI providers (Google and Groq) to write your idea.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <InlineErrorAlert message={error} onDismiss={() => setError(null)} className="" />
            <UsageNotice usage={usage?.projects} noun="ideas" />

            <div className="space-y-3">
              <button
                type="button" onClick={handleGenerate} disabled={!canGenerate}
                className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl font-display text-sm font-bold transition-colors ${
                  canGenerate ? "amber-specular-button cursor-pointer text-on-brand" : "cursor-not-allowed border border-ink/[0.08] bg-ink/[0.04] text-muted"
                }`}
              >
                {loading ? <><InlineSpinner size={16} color="currentColor" /> Generating...</> : <><Lightning weight="fill" aria-hidden="true" /> Generate project idea</>}
              </button>
              {!isFormValid && !loading && <p className="text-center text-sm text-muted">Choose a tech stack and a difficulty to start.</p>}
            </div>
          </div>

          {/* Idea */}
          <div ref={resultRef} className="min-h-[500px] scroll-mt-24">
            {!project && !loading && (
              <EmptyState
                icon={Cpu}
                title="Your project idea will appear here"
                text="Choose a tech stack and difficulty, then generate an idea to build."
                className="min-h-[500px]"
              />
            )}

            {loading && <LongWait shape="idea" title="Generating your project idea" note="This can take a little while." className="min-h-[500px]" />}

            {project && !loading && (
              <article className="surface-card fade-in overflow-hidden">
                <header className="p-6 sm:p-7">
                  <p className="text-sm font-semibold text-brand">{tags.join(" · ")}</p>
                  <h2 className="mt-2 break-words font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">{project.title}</h2>
                  {project.tagline && <p className="mt-1 text-muted">{project.tagline}</p>}
                </header>

                <div className="divide-y divide-ink/[0.08] border-t border-ink/[0.08]">
                  <section className="p-6 sm:p-7">
                    <h3 className="mb-2 text-sm font-semibold text-muted">Overview</h3>
                    <p className="leading-relaxed text-fg-3">{project.description}</p>
                  </section>

                  <section className="p-6 sm:p-7">
                    <h3 className="mb-3 text-sm font-semibold text-muted">What you will build</h3>
                    <ul className="space-y-2.5">
                      {project.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-fg-3">
                          <Check weight="bold" aria-hidden="true" className="mt-1 shrink-0 text-brand" />
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <dl className="grid grid-cols-1 divide-y divide-ink/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {[["Stack", project.techStack], ["Level", project.difficulty], ["Time", project.estimatedTime]].map(([label, value]) => (
                      <div key={label} className="p-6">
                        <dt className="text-sm text-muted">{label}</dt>
                        <dd className="mt-1 font-semibold leading-snug text-fg">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <section className="p-6 sm:p-7">
                    <h3 className="mb-2 text-sm font-semibold text-muted">Why it is worth showing</h3>
                    <p className="leading-relaxed text-fg-3">{project.resumeValue}</p>
                  </section>

                  <footer className="flex flex-wrap justify-end gap-3 p-5">
                    <button type="button" onClick={handleCopy} className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-ink/[0.12] px-4 text-sm font-semibold text-fg transition-colors hover:bg-ink/[0.04]">
                      {copied ? <Check weight="bold" aria-hidden="true" className="text-ok" /> : <Copy aria-hidden="true" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button type="button" onClick={handleReset} className="amber-specular-button flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-bold text-on-brand">
                      New idea <ArrowRight aria-hidden="true" />
                    </button>
                  </footer>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProjectIdeas;
