import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useRevealed } from "../../hooks/useRevealed";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpenText, ChatsCircle, Check, CodeBlock, MapTrifold, Robot, Target } from "@phosphor-icons/react";

const CHECKS = [
  "DSA sheets: Blind 75, NeetCode 150, Striver and more",
  "CS notes: OS, DBMS, networks and OOP in simple words",
  "AI project ideas to build for your resume",
  "Behavioral prep: answers for the common questions",
];

// Each tile is a real page. Labels follow the order of a preparation: practice, understand, build, grow, prepare, match.
const TILES = [
  { step: "01", verb: "Practice", title: "DSA", text: "Solve with intent.", to: "/dsa", icon: <CodeBlock weight="duotone" /> },
  { step: "02", verb: "Understand", title: "CS notes", text: "Build foundations.", to: "/notes", icon: <BookOpenText weight="duotone" /> },
  { step: "03", verb: "Build", title: "AI projects", text: "Turn ideas into impact.", to: "/ai-projects", icon: <Robot weight="duotone" /> },
  { step: "04", verb: "Grow", title: "Roadmaps", text: "Plan your journey.", to: "/roadmaps", icon: <MapTrifold weight="duotone" /> },
  { step: "05", verb: "Prepare", title: "Interviews", text: "Walk in with confidence.", to: "/behavioral", icon: <ChatsCircle weight="duotone" /> },
  { step: "06", verb: "Match", title: "Role Analyzer", text: "Check your resume against a job.", to: "/analyzer", icon: <Target weight="duotone" /> },
];

const MotionLink = motion.create(Link);

const Tile = ({ tile, index }) => {
  const calm = useReducedMotion();
  const ref = useRef(null);
  const seen = useRevealed(ref);
  return (
    <MotionLink
      to={tile.to}
      ref={ref}
      initial={calm ? { opacity: 0 } : { opacity: 0, transform: "translate3d(0, 24px, 0)" }}
      animate={seen ? { opacity: 1, transform: "translate3d(0, 0, 0)" } : undefined}
      transition={calm ? { duration: 0.2 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="group relative flex min-h-[176px] flex-col overflow-hidden surface-card p-4 surface-card-link"
    >
      <span aria-hidden="true" className="absolute bottom-3.5 right-3.5 text-[52px] leading-none text-brand">
        {tile.icon}
      </span>
      <span className="font-ui text-xs text-muted">{tile.step} / {tile.verb}</span>
      <h3 className="mt-2 font-display text-lg font-extrabold tracking-tight text-fg">{tile.title}</h3>
      <p className="mt-1 text-sm text-muted">{tile.text}</p>
      <span className="relative mt-auto flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-on-brand">
        <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5" />
        <span className="sr-only">Open {tile.title}</span>
      </span>
    </MotionLink>
  );
};

const SuiteSection = () => {
  return (
  <section aria-labelledby="home-suite-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 text-left">
    <div className="lg:col-span-5 min-w-0">
      <h2 id="home-suite-heading" className="font-display text-4xl sm:text-5xl font-black tracking-[-0.04em] leading-[1.04] text-fg">
        A complete preparation suite,
        <span className="block text-brand">in one place.</span>
      </h2>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
        From solving problems to building projects, PrepStack helps you prepare in an order that makes sense.
      </p>
      <ul className="mt-6 space-y-3">
        {CHECKS.map((line) => (
          <li key={line} className="flex items-start gap-3 text-sm sm:text-base text-fg-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs text-brand">
              <Check aria-hidden="true" />
            </span>
            {line}
          </li>
        ))}
      </ul>
    </div>

    <div className="lg:col-span-7 min-w-0 grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 gap-3.5">
      {TILES.map((tile, i) => <Tile key={tile.to} tile={tile} index={i} />)}
    </div>
  </section>
  );
};

export default SuiteSection;
