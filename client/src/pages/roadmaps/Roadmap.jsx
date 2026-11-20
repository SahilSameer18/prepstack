import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { roadmaps } from "../../data/roadmaps.js";
import { iconMap } from "./roadmapIcons";
import PageBackdrop from "../../components/ui/PageBackdrop";

const MotionLink = motion.create(Link);

const RoadmapCard = ({ r, index }) => {
  const calm = useReducedMotion();
  return (
    <MotionLink
      to={`/roadmaps/${r.slug}`}
      initial={calm ? { opacity: 0 } : { opacity: 0, transform: "translate3d(0, 20px, 0)" }}
      animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      transition={calm ? { duration: 0.2 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.07 }}
      className="group relative flex flex-col surface-card p-6 text-left surface-card-link"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-3xl text-brand">{iconMap[r.icon]}</span>
        {r.recommended && <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 font-ui text-xs font-semibold text-brand">Core track</span>}
      </div>

      <h2 className="mt-5 font-display text-xl font-extrabold tracking-tight text-fg">{r.title}</h2>
      <p className="mt-1.5 font-ui text-sm text-fg-3">{r.duration} · {r.level}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{r.desc}</p>

      <p className="mt-4 font-ui text-sm text-muted">{r.steps.length} steps</p>
      <span className="mt-4 inline-flex items-center gap-2 font-display text-sm font-bold text-brand">
        Open roadmap
        <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
      </span>
    </MotionLink>
  );
};

const Roadmap = () => (
  <div className="relative">
    <PageBackdrop />
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 text-left sm:px-6">
      <div className="mb-10 pt-2">
        <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">
          Learning <span className="text-brand">roadmaps.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Step-by-step paths for the skills interviews and first jobs ask for. Each step says what to learn, how long it takes, what to practise and how to know you are done.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {roadmaps.map((r, i) => <RoadmapCard key={r.slug} r={r} index={i} />)}
      </div>
    </div>
  </div>
);

export default Roadmap;
