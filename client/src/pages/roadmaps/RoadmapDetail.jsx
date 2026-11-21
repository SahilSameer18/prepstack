import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ArrowSquareOut, CaretDown, Check, Clock } from "@phosphor-icons/react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { roadmaps } from "../../data/roadmaps.js";
import { practiceLink, projectLink } from "./roadmapLinks";
import PageBackdrop from "../../components/ui/PageBackdrop";
import { useActiveHeading } from "../../hooks/useActiveHeading";

// Every part of an opened step starts with the same small label, so the eye finds them at once.
const LABEL = "mb-3 font-code text-xs uppercase tracking-[0.14em] text-muted";
const BODY = "text-sm leading-relaxed text-fg-3 sm:text-base";

// What a step can say beyond its description. Each part is drawn only when the step has it. The time is already in the step's header.
const StepExtras = ({ step }) => (
  <div className="space-y-8">
    {step.goal && (
      <div className="rounded-xl bg-brand/[0.07] p-5">
        <p className="mb-2 font-code text-xs uppercase tracking-[0.14em] text-brand">Goal</p>
        <p className="text-base leading-relaxed text-fg-2">{step.goal}</p>
      </div>
    )}
    {step.topics && (
      <div>
        <p className={LABEL}>What you will learn</p>
        <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {step.topics.map((topic) => (
            <li key={topic} className={`flex items-start gap-2.5 ${BODY}`}><Check className="mt-1 shrink-0 text-brand" aria-hidden="true" />{topic}</li>
          ))}
        </ul>
      </div>
    )}
    {step.practice && (
      <div>
        <p className={LABEL}>Practise in PrepStack</p>
        <div className="flex flex-wrap gap-2">
          {step.practice.map((entry) => {
            const l = practiceLink(entry);
            return (
              <Link key={entry.target} to={l.path} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-ink/[0.2] bg-card px-3.5 text-sm font-medium text-fg transition-colors hover:border-ink/[0.4]">
                {l.label} <ArrowRight className="text-xs text-brand" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    )}
    {step.checkpoint && (
      <div>
        <p className={LABEL}>Checkpoint: you are done when you can</p>
        <ul className="divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
          {step.checkpoint.map((c) => <li key={c} className={`py-3 ${BODY}`}>{c}</li>)}
        </ul>
      </div>
    )}
    {step.project && (
      <div>
        <p className={LABEL}>Mini-project</p>
        <p className={BODY}>{step.project.brief}</p>
        <Link to={projectLink(step.project)} className="group mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-brand">
          Generate an idea with {step.project.stack} <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
        </Link>
      </div>
    )}
  </div>
);

const OnThisPage = ({ steps }) => {
  const active = useActiveHeading(steps.map((s) => s.id));
  return (
    <nav aria-label="Steps of this roadmap" className="text-left">
      <p className="mb-2 font-ui text-xs font-bold text-fg-3">Steps</p>
      <ol className="space-y-0.5 border-l border-ink/[0.1] pl-3">
        {steps.map((s, i) => (
          <li key={s.id}>
            <Link
              to={{ hash: `#${s.id}` }}
              aria-current={active === s.id ? "location" : undefined}
              className={`flex gap-2 py-1 text-sm leading-snug transition-colors ${active === s.id ? "font-semibold text-brand" : "text-muted hover:text-fg"}`}
            >
              <span className="w-5 shrink-0 text-right font-ui text-xs leading-[1.3rem] opacity-70">{i + 1}</span>
              <span>{s.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

const RoadmapDetail = () => {
  const { slug, id } = useParams();
  const param = slug || id;
  const { hash } = useLocation();
  const [expandedIdx, setExpandedIdx] = useState(null);
  const calm = useReducedMotion();

  // Lookup by semantic slug, or fallback to numeric index for backward compatibility
  const roadmap = roadmaps.find((r) => r.slug === param) ||
    (!isNaN(parseInt(param, 10)) ? roadmaps[parseInt(param, 10)] : null);

  // /roadmaps/frontend#react-basics opens that step: the link works from anywhere, because the step id never changes
  const hashIdx = roadmap ? roadmap.steps.findIndex((s) => `#${s.id}` === hash) : -1;
  const [syncedHash, setSyncedHash] = useState(null);
  if (hash !== syncedHash) {
    setSyncedHash(hash);
    if (hashIdx !== -1) setExpandedIdx(hashIdx);
  }
  useEffect(() => {
    if (hashIdx !== -1) document.getElementById(roadmap.steps[hashIdx].id)?.scrollIntoView({ block: "start" });
  }, [hashIdx, roadmap]);

  if (!roadmap) {
    return <Navigate to="/roadmaps" replace />;
  }

  const toggle = (idx) => setExpandedIdx(expandedIdx === idx ? null : idx);

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 text-left sm:px-6 xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-12">
        <div className="min-w-0">
          <Link to="/roadmaps" className="group mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            Back to roadmaps
          </Link>

          {/* ── Header ── */}
          <div className="mb-12 min-w-0">
            <p className="font-code text-xs uppercase tracking-[0.14em] text-muted">Roadmap · {roadmap.steps.length} steps · {roadmap.duration}</p>
            <h1 className="mt-3 font-display text-4xl font-black leading-[1.05] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">{roadmap.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{roadmap.desc} {roadmap.level}.</p>
          </div>

          {/* ── The path ── */}
          <h2 className="mb-6 font-display text-2xl font-bold tracking-tight text-fg">Step-by-step path</h2>
          <ol className="relative sm:pl-12">
            <span aria-hidden="true" className="absolute bottom-6 left-[15px] top-6 hidden w-px bg-ink/[0.14] sm:block" />
            {roadmap.steps.map((detail, idx) => {
              const isOpen = expandedIdx === idx;
              return (
                <li
                  key={detail.id}
                  id={detail.id}
                  className="relative scroll-mt-24 border-b border-ink/[0.1] first:border-t"
                >
                  <span aria-hidden="true" className={`absolute -left-12 top-5 hidden h-8 w-8 items-center justify-center rounded-full border font-code text-xs transition-colors duration-300 sm:flex ${isOpen ? "border-brand bg-brand text-on-brand" : "border-ink/[0.25] bg-canvas text-muted"}`}>
                    {idx + 1}
                  </span>
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-start justify-between gap-4 py-5 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">{detail.title}</span>
                        <span className="mt-1 block text-sm font-normal leading-relaxed text-muted sm:text-base">{detail.desc}</span>
                      </span>
                      <span className="mt-1.5 flex shrink-0 items-center gap-4 text-muted">
                        {detail.time && <span className="hidden items-center gap-1.5 font-code text-sm sm:flex"><Clock aria-hidden="true" /> {detail.time}</span>}
                        <CaretDown aria-hidden="true" className={`text-base transition-[transform,color] duration-200 ${isOpen ? "rotate-180 text-brand" : ""}`} />
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={calm ? { duration: 0.15 } : { height: { type: "spring", duration: 0.3, bounce: 0 }, opacity: { duration: 0.2 } }}
                      className="overflow-hidden"
                    >
                    <div className="space-y-8 border-t border-ink/[0.08] pb-10 pt-7">
                      <StepExtras step={detail} />

                      {detail.resources && detail.resources.length > 0 && (
                        <div>
                          <p className={LABEL}>Free resources</p>
                          <ul className="divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
                            {detail.resources.map((res) => (
                              <li key={res.url}>
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/res flex min-h-[44px] items-center justify-between gap-3 py-2.5 text-sm text-fg-3 transition-colors hover:text-fg sm:text-base"
                                >
                                  <span>{res.label}</span>
                                  <ArrowSquareOut className="shrink-0 text-base text-muted transition-colors group-hover/res:text-brand" aria-hidden="true" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── Wide screens: the steps, with the one being read highlighted ── */}
        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pt-14 scrollbar-thin">
            <OnThisPage steps={roadmap.steps} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RoadmapDetail;
