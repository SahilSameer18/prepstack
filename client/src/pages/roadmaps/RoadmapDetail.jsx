import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ArrowSquareOut, CaretDown, Check, Clock, Flag, Wrench } from "@phosphor-icons/react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { roadmaps } from "../../data/roadmaps.js";
import { iconMap } from "./roadmapIcons";
import { practiceLink, projectLink } from "./roadmapLinks";
import PageBackdrop from "../../components/ui/PageBackdrop";
import { useActiveHeading } from "../../hooks/useActiveHeading";

const LABEL = "mb-2 font-ui text-sm font-bold";

// What a step can say beyond its description. Each part is drawn only when the step has it.
const StepExtras = ({ step }) => (
  <div className="space-y-5">
    {step.goal && (
      <div className="rounded-xl border border-brand/[0.2] bg-brand/[0.07] p-4">
        <p className={`${LABEL} text-brand`}>Goal</p>
        <p className="text-base leading-relaxed text-fg-2">{step.goal}</p>
      </div>
    )}
    {(step.time || step.topics) && (
      <div className="rounded-xl border border-ink/[0.08] bg-ink/[0.025] p-4">
        {step.time && <p className="mb-3 flex items-center gap-1.5 font-ui text-sm font-semibold text-fg-3"><Clock aria-hidden="true" /> {step.time}</p>}
        {step.topics && (
          <>
            <p className={`${LABEL} text-fg-3`}>What you will learn</p>
            <ul className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
              {step.topics.map((topic) => (
                <li key={topic} className="flex items-start gap-2.5 text-base leading-snug text-fg-2"><Check className="mt-1 shrink-0 text-brand" aria-hidden="true" />{topic}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    )}
    {step.practice && (
      <div>
        <p className={`${LABEL} text-fg-3`}>Practise in PrepStack</p>
        <div className="flex flex-wrap gap-2">
          {step.practice.map((entry) => {
            const l = practiceLink(entry);
            return (
              <Link key={entry.target} to={l.path} className="titanium-button inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3.5 text-sm font-medium">
                {l.label} <ArrowRight className="text-xs" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    )}
    {step.checkpoint && (
      <div className="rounded-xl border border-ink/[0.08] bg-ink/[0.025] p-4">
        <p className={`${LABEL} flex items-center gap-1.5 text-fg-3`}><Flag aria-hidden="true" /> Checkpoint</p>
        <ul className="space-y-2">
          {step.checkpoint.map((c) => <li key={c} className="text-base leading-relaxed text-fg-2">{c}</li>)}
        </ul>
      </div>
    )}
    {step.project && (
      <div className="rounded-xl border border-ink/[0.08] bg-ink/[0.025] p-4">
        <p className={`${LABEL} flex items-center gap-1.5 text-fg-3`}><Wrench aria-hidden="true" /> Mini-project</p>
        <p className="mb-4 text-base leading-relaxed text-fg-2">{step.project.brief}</p>
        <Link to={projectLink(step.project)} className="amber-specular-button inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-bold">Generate an idea with {step.project.stack}</Link>
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
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-4xl text-brand">
              {iconMap[roadmap.icon]}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-4xl font-black leading-[1.05] tracking-[-0.04em] text-fg sm:text-5xl">{roadmap.title}</h1>
              <p className="mt-3 font-ui text-sm text-fg-3">{roadmap.duration} · {roadmap.level} · {roadmap.steps.length} steps</p>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{roadmap.desc}</p>
            </div>
          </div>

          {/* ── The path ── */}
          <h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight text-fg">Step-by-step path</h2>
          <ol className="relative space-y-3 sm:pl-12">
            <span aria-hidden="true" className="absolute bottom-6 left-[15px] top-6 hidden w-px bg-ink/[0.14] sm:block" />
            {roadmap.steps.map((detail, idx) => {
              const isOpen = expandedIdx === idx;
              return (
                <li
                  key={detail.id}
                  id={detail.id}
                  className={`relative scroll-mt-24 rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 ${
                    isOpen ? "border-ink/[0.16] shadow-[0_18px_34px_-24px_color-mix(in_srgb,var(--shadow)_45%,transparent)]" : "border-ink/[0.1] hover:border-ink/[0.2]"
                  }`}
                >
                  <span aria-hidden="true" className={`absolute -left-12 top-4 hidden h-8 w-8 items-center justify-center rounded-full border-2 bg-canvas font-ui text-xs font-bold transition-colors duration-300 sm:flex ${isOpen ? "border-brand text-brand" : "border-ink/[0.2] text-muted"}`}>
                    {idx + 1}
                  </span>
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-lg font-extrabold tracking-tight text-fg">{detail.title}</span>
                        <span className="mt-1 block text-sm font-normal leading-relaxed text-muted">{detail.desc}</span>
                        {detail.time && !isOpen && <span className="mt-2 flex items-center gap-1.5 font-ui text-xs font-medium text-fg-3"><Clock aria-hidden="true" /> {detail.time}</span>}
                      </span>
                      <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition-[transform,color] duration-200 ${isOpen ? "rotate-180 border-brand/30 bg-brand/10 text-brand" : "border-ink/[0.1] text-muted"}`}>
                        <CaretDown aria-hidden="true" />
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
                    <div className="space-y-6 border-t border-ink/[0.08] px-5 pb-6 pt-5">
                      <StepExtras step={detail} />

                      {detail.resources && detail.resources.length > 0 && (
                        <div>
                          <p className={`${LABEL} text-fg-3`}>Free resources</p>
                          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            {detail.resources.map((res) => (
                              <a
                                key={res.url}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/res flex min-h-[44px] items-start gap-2.5 rounded-xl border border-ink/[0.1] bg-card p-3 transition-colors hover:border-ink/[0.22]"
                              >
                                <ArrowSquareOut className="mt-0.5 shrink-0 text-sm text-brand" aria-hidden="true" />
                                <span className="text-sm font-medium leading-snug text-fg-3 transition-colors group-hover/res:text-fg">{res.label}</span>
                              </a>
                            ))}
                          </div>
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
