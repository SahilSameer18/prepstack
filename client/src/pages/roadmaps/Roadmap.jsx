import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { roadmaps } from "../../data/roadmaps.js";
import PageBackdrop from "../../components/ui/PageBackdrop";
import Reveal from "../../components/ui/Reveal";

// One roadmap as a line: its name and path, how long it takes, its level, and how many steps it has.
const RoadmapRow = ({ r, index }) => (
  <Link
    to={`/roadmaps/${r.slug}`}
    className="group grid grid-cols-[32px_1fr_auto] items-center gap-x-5 gap-y-2 border-b border-ink/[0.1] py-6 transition-colors hover:bg-ink/[0.02] sm:grid-cols-[40px_1fr_190px_80px_24px] sm:gap-x-6"
  >
    <span className="font-code text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
    <div className="min-w-0">
      <h2 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">
        {r.title}
        {r.recommended && <span className="rounded-full border border-brand/30 px-2.5 py-0.5 font-ui text-xs font-semibold text-brand">Core track</span>}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">{r.desc}</p>
    </div>
    <ArrowRight aria-hidden="true" className="justify-self-end text-brand transition-transform duration-150 group-hover:translate-x-1 sm:order-last" />
    <div className="col-start-2 sm:col-start-auto">
      <p className="font-code text-sm text-fg">{r.duration}</p>
      <p className="text-sm text-muted">{r.level}</p>
    </div>
    <span className="col-start-2 font-code text-sm text-fg-3 sm:col-start-auto sm:text-right">{r.steps.length} steps</span>
  </Link>
);

const Roadmap = () => (
  <div className="relative">
    <PageBackdrop />
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 text-left sm:px-6">
      <div className="mb-10 pt-2">
        <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">
          Learning roadmaps.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Step-by-step paths for the skills interviews and first jobs ask for. Each step says what to learn, how long it takes, what to practise and how to know you are done.
        </p>
      </div>

      <div className="border-t border-ink">
        {roadmaps.map((r, i) => <Reveal key={r.slug} y={10} delay={Math.min(i, 5) * 0.05}><RoadmapRow r={r} index={i} /></Reveal>)}
      </div>
    </div>
  </div>
);

export default Roadmap;
