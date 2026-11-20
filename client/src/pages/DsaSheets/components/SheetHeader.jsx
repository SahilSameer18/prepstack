import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowSquareOut, Trophy } from "@phosphor-icons/react";
import ProgressRing from './ProgressRing';

const LEVELS = [
  { key: 'Easy', color: 'text-ok' },
  { key: 'Medium', color: 'text-yellow' },
  { key: 'Hard', color: 'text-bad' },
];

// ── Header: title, description, source, the way into your plan, the progress ring and the Easy/Medium/Hard split ──
const SheetHeader = ({ meta, name, totalProblems, totalSolvedCount, progressPercentage, byLevel, hasNext, onContinue }) => {
  const calm = useReducedMotion();
  const finished = totalProblems > 0 && totalSolvedCount === totalProblems;
  // true for a moment only when the last problem is ticked now (not when a finished sheet is opened)
  const [celebrate, setCelebrate] = useState(false);
  const [lastCount, setLastCount] = useState(totalSolvedCount);
  if (lastCount !== totalSolvedCount) {
    setLastCount(totalSolvedCount);
    setCelebrate(finished && lastCount === totalSolvedCount - 1);
  }
  useEffect(() => {
    if (!celebrate) return undefined;
    const timer = setTimeout(() => setCelebrate(false), 2000);
    return () => clearTimeout(timer);
  }, [celebrate]);
  return (
  <div className="mb-8">
    <h1 className="font-display text-4xl sm:text-5xl font-black tracking-[-0.04em] leading-[1.04] text-fg">{name}</h1>
    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{meta.description}</p>

    <div className="mt-6 flex flex-wrap items-center gap-3">
      {hasNext ? (
        <button type="button" onClick={onContinue} className="amber-specular-button group inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold">
          {totalSolvedCount > 0 ? 'Continue where you left off' : 'Start the first problem'}
          <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
        </button>
      ) : (
        totalProblems > 0 && <span className="text-sm font-semibold text-ok">You have solved every problem on this sheet.</span>
      )}
      <Link to="/my-plan" className="titanium-button inline-flex min-h-[44px] items-center rounded-xl px-5 py-2.5 text-sm font-medium">
        Plan this sheet in My plan
      </Link>
      {meta.sourceUrl && meta.sourceUrl !== '#' && (
        <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 px-1 text-sm text-muted transition-colors hover:text-fg">
          Source: {meta.sourceName}
          <ArrowSquareOut aria-hidden="true" className="text-xs" />
        </a>
      )}
    </div>

    <div className={`mt-8 flex flex-col gap-6 surface-card p-5 sm:flex-row sm:items-center sm:p-6 ${celebrate ? "sheet-done-glow" : ""}`}>
      <motion.div className="flex justify-center sm:justify-start" animate={celebrate && !calm ? { scale: [1, 1.07, 1] } : { scale: 1 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
        <ProgressRing percentage={progressPercentage} solved={totalSolvedCount} total={totalProblems} />
      </motion.div>
      <div className="min-w-0 flex-1">
        {finished ? (
          <motion.p key={celebrate ? "now" : "static"} initial={celebrate && !calm ? { scale: 0.8, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.4, bounce: 0.3 }} className="inline-flex origin-left items-center gap-1.5 font-ui text-sm font-bold text-brand">
            <Trophy weight="duotone" aria-hidden="true" /> Sheet complete
          </motion.p>
        ) : (
          <p className="font-ui text-sm text-muted">Overall progress</p>
        )}
        <p className="mt-0.5 font-display text-3xl font-extrabold tracking-tight text-fg">
          {totalSolvedCount} <span className="text-muted">/ {totalProblems}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/[0.08]" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress">
          <div className="bar-fill h-full w-full rounded-full" style={{ transform: `scaleX(${progressPercentage / 100})`, background: 'var(--brand-grad-bottom)' }} />
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-ink/[0.08] pt-4">
          {LEVELS.map(({ key, color }) => (
            <div key={key}>
              <dt className={`font-ui text-xs font-semibold ${color}`}>{key}</dt>
              <dd className="mt-0.5 font-display text-lg font-extrabold text-fg">
                {byLevel[key].solved}
                <span className="text-sm font-medium text-muted"> / {byLevel[key].total}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </div>
  );
};

export default SheetHeader;
