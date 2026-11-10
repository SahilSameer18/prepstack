import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCheckCircle, FiExternalLink, FiChevronDown, FiChevronUp, FiBookOpen, FiFlag, FiTool, FiArrowRight } from "react-icons/fi";
import { roadmaps } from "../../data/roadmaps.js";
import { iconMap } from "./roadmapIcons";
import { practiceLink, projectLink } from "./roadmapLinks";

// What a step can say beyond its description. Each part is drawn only when the step has it (they are written in stage 4).
const StepExtras = ({ step, roadmap }) => (
  <div className="space-y-4 mb-6">
    {step.goal && (
      <div className={`rounded-xl border border-ink/[0.08] p-4 ${roadmap.bg}`}>
        <p className={`text-xs font-ui font-bold uppercase tracking-wider mb-1 ${roadmap.color}`}>Goal</p>
        <p className="text-fg-2 text-sm leading-relaxed">{step.goal}</p>
      </div>
    )}
    {(step.time || step.topics) && (
      <div className="rounded-xl bg-card-hover border border-ink/[0.08] p-4">
        {step.time && <p className="flex items-center gap-1.5 text-xs font-ui font-semibold text-muted mb-2"><FiClock /> {step.time}</p>}
        {step.topics && (
          <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {step.topics.map((topic) => (
              <li key={topic} className="flex items-start gap-2 text-fg-3 text-sm"><FiCheckCircle className={`mt-1 shrink-0 text-xs ${roadmap.color}`} />{topic}</li>
            ))}
          </ul>
        )}
      </div>
    )}
    {step.practice && (
      <div>
        <p className="text-xs font-ui font-bold text-muted mb-2.5">Practise in PrepStack</p>
        <div className="flex flex-wrap gap-2">
          {step.practice.map((entry) => {
            const l = practiceLink(entry);
            return <Link key={entry.target} to={l.path} className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl bg-card-hover border border-ink/[0.08] hover:border-ink/[0.18] text-xs text-fg-2 font-medium transition-colors">{l.label} <FiArrowRight className="text-xs" /></Link>;
          })}
        </div>
      </div>
    )}
    {step.checkpoint && (
      <div className="rounded-xl bg-ok-solid/[0.04] border border-ok-solid/[0.12] p-4">
        <p className="flex items-center gap-1.5 text-xs font-ui font-bold uppercase tracking-wider text-ok mb-2"><FiFlag /> Checkpoint</p>
        <ul className="space-y-1.5">
          {step.checkpoint.map((c) => <li key={c} className="text-fg-3 text-sm leading-relaxed">{c}</li>)}
        </ul>
      </div>
    )}
    {step.project && (
      <div className="rounded-xl bg-warn-solid/[0.04] border border-warn-solid/[0.12] p-4">
        <p className="flex items-center gap-1.5 text-xs font-ui font-bold uppercase tracking-wider text-warn mb-2"><FiTool /> Mini-project</p>
        <p className="text-fg-3 text-sm leading-relaxed mb-3">{step.project.brief}</p>
        <Link to={projectLink(step.project)} className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl amber-specular-button text-on-brand font-bold text-xs">Generate an idea with {step.project.stack}</Link>
      </div>
    )}
  </div>
);

const RoadmapDetail = () => {
  const { slug, id } = useParams();
  const param = slug || id;
  const { hash } = useLocation();
  const [expandedIdx, setExpandedIdx] = useState(null);

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
    <div className="px-4 md:px-6 pb-20 max-w-4xl mx-auto page-enter text-left">

      {/* Back Button */}
      <div className="pt-6 mb-8">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 text-muted hover:text-fg transition-colors text-sm font-medium group min-h-[44px]"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5 text-muted group-hover:text-fg" />
          <span>Back to Roadmaps</span>
        </Link>
      </div>

      {/* ── Header Card ── */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-card border border-ink/[0.08] overflow-hidden mb-10 shadow-2xl">
        {/* Ambient glow - hardware accelerated */}
        <div className={`absolute -right-16 -top-16 w-64 h-64 ${roadmap.bg} rounded-full blur-[90px] opacity-40 pointer-events-none transform-gpu`} />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className={`w-16 h-16 rounded-2xl ${roadmap.bg} ${roadmap.color} text-2xl sm:text-3xl flex items-center justify-center shrink-0 border border-ink/[0.08] shadow-lg`}>
            {iconMap[roadmap.icon]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`text-xs font-ui font-bold uppercase tracking-widest px-3 py-1 rounded-full ${roadmap.bg} ${roadmap.color} border border-ink/[0.08]`}>
                {roadmap.level}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-fg-3 font-ui">
                <FiClock className="text-muted" /> {roadmap.duration}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-fg-3 font-ui">
                <FiBookOpen className={roadmap.color} /> {roadmap.steps.length} Modules
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-fg mb-2 leading-tight">
              {roadmap.title}
            </h1>
            <p className="text-fg-3 text-sm md:text-base max-w-2xl leading-relaxed">
              {roadmap.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ── Curriculum ── */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-display font-bold text-fg shrink-0">Step-by-step path</h2>
          <div className="h-px bg-ink/[0.08] flex-1" />
          <span className="text-xs font-ui font-semibold text-muted shrink-0">
            {roadmap.steps.length} phases
          </span>
        </div>

        {/* Vertical connecting line */}
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-ink/[0.12] via-ink/[0.08] to-transparent hidden md:block" />

          <div className="space-y-3">
            {roadmap.steps.map((detail, idx) => {
              const num = (idx + 1).toString().padStart(2, '0');
              const isOpen = expandedIdx === idx;

              return (
                <div
                  key={detail.id}
                  id={detail.id}
                  className={`relative scroll-mt-24 transition-colors duration-200 ml-0 md:ml-12 rounded-2xl overflow-hidden border ${
                    isOpen
                      ? `border-ink/[0.15] bg-card shadow-xl shadow-scrim/40`
                      : 'border-ink/[0.08] bg-card hover:border-ink/[0.15]'
                  }`}
                >
                  {/* Node dot (desktop) */}
                  <div className={`hidden md:flex absolute top-5 -left-12 w-6 h-6 rounded-full border-2 z-10 items-center justify-center transition-colors ${
                    isOpen ? `border-brand bg-card` : 'border-line bg-card'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-brand' : 'bg-faint'}`} />
                  </div>

                  {/* Accordion Header */}
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Step number */}
                      <span className={`text-xs font-ui font-bold tracking-wider px-2 py-1 rounded-lg shrink-0 border ${
                        isOpen
                          ? `${roadmap.bg} ${roadmap.color} border-ink/[0.1]`
                          : 'bg-ink/[0.03] border-ink/[0.06] text-muted'
                      }`}>
                        {num}
                      </span>
                      <div className="min-w-0">
                        <h3 className={`font-semibold text-sm md:text-base truncate transition-colors ${isOpen ? 'text-fg' : 'text-fg-2 group-hover:text-fg'}`}>
                          {detail.title}
                        </h3>
                        {!isOpen && (
                          <p className="text-xs text-muted truncate mt-0.5 hidden md:block">{detail.desc}</p>
                        )}
                      </div>
                    </div>
                    <div className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-colors ${
                      isOpen ? `${roadmap.bg} ${roadmap.color} border-ink/[0.1]` : 'border-ink/[0.08] text-muted'
                    }`}>
                      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="px-5 pb-6 border-t border-ink/[0.06]">
                      {/* Big number watermark */}
                      <div className="relative overflow-hidden">
                        <div className="absolute -right-2 -top-6 text-fg/[0.02] text-[100px] font-ui font-bold pointer-events-none select-none leading-none">
                          {num}
                        </div>
                      </div>

                      {/* Phase label */}
                      <div className="flex items-center gap-2 mt-4 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-ui uppercase tracking-wider font-semibold px-2.5 py-1 rounded-lg border ${roadmap.bg} ${roadmap.color} border-ink/[0.08]`}>
                          <FiCheckCircle className="opacity-90" /> Phase {num}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-fg-3 text-sm leading-relaxed mb-6">
                        {detail.desc}
                      </p>

                      <StepExtras step={detail} roadmap={roadmap} />

                      {/* Resources */}
                      {detail.resources && detail.resources.length > 0 && (
                        <div>
                          <p className="text-xs font-ui font-bold text-muted mb-3 flex items-center gap-2">
                            <FiBookOpen className={roadmap.color} />
                            Curated Resources
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {detail.resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/res flex items-start gap-2.5 p-3 rounded-xl bg-card-hover border border-ink/[0.08] hover:border-ink/[0.18] hover:bg-ink/[0.03] transition-colors"
                              >
                                <div className={`shrink-0 w-6 h-6 rounded-md ${roadmap.bg} border border-ink/[0.08] flex items-center justify-center mt-0.5`}>
                                  <FiExternalLink className={`${roadmap.color} text-xs`} />
                                </div>
                                <span className="text-xs text-fg-3 group-hover/res:text-fg transition-colors leading-snug font-medium">
                                  {res.label}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;
