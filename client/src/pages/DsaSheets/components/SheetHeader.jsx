import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowSquareOut, Trophy } from "@phosphor-icons/react";
import ProgressMarks from '../../../components/ui/ProgressMarks';

const LEVELS = [
  { key: 'Easy', color: 'text-ok' },
  { key: 'Medium', color: 'text-yellow' },
  { key: 'Hard', color: 'text-bad' },
];

// ── Header: title, description, source, the way into your plan, the progress as marks and the Easy/Medium/Hard split ──
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
    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{meta.description}</p>

    <div className="mt-6 flex flex-wrap items-center gap-3">
      {hasNext ? (
        <button type="button" onClick={onContinue} className="amber-specular-button group inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold">
          {totalSolvedCount > 0 ? 'Continue where you left off' : 'Start the first problem'}
          <ArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      ) : (
        totalProblems > 0 && <span className="text-sm font-semibold text-ok">You have solved every problem on this sheet.</span>
      )}
      <Link to="/my-plan" className="inline-flex min-h-[48px] items-center rounded-xl border border-ink/[0.14] px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-ink/[0.04]">
        Plan this sheet in My plan
      </Link>
      {meta.sourceUrl && meta.sourceUrl !== '#' && (
        <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 px-1 text-sm text-muted transition-colors hover:text-fg">
          Source: {meta.sourceName}
          <ArrowSquareOut aria-hidden="true" className="text-xs" />
        </a>
      )}
    </div>

    <div className={`mt-9 grid items-end gap-6 border-y border-ink/[0.1] py-7 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-8 ${celebrate ? "sheet-done-glow" : ""}`}>
      <motion.div className="min-w-0" animate={celebrate && !calm ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
        {finished ? (
          <motion.p key={celebrate ? "now" : "static"} initial={celebrate && !calm ? { scale: 0.8, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.4, bounce: 0.3 }} className="inline-flex origin-left items-center gap-1.5 font-ui text-sm font-bold text-brand">
            <Trophy weight="duotone" aria-hidden="true" /> Sheet complete
          </motion.p>
        ) : (
          <p className="font-ui text-sm text-muted">Overall progress</p>
        )}
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-code text-5xl font-medium tracking-tight text-fg">{totalSolvedCount}</span>
          <span className="font-code text-2xl text-muted">/ {totalProblems}</span>
        </p>
      </motion.div>
      <div className="min-w-0">
        {totalSolvedCount > 0 ? (
          <>
            <ProgressMarks value={totalSolvedCount} total={totalProblems} label={`Overall progress: ${progressPercentage}%`} tall />
            <p className="mt-3 text-sm text-muted">{progressPercentage}% solved</p>
          </>
        ) : (
          <p className="text-sm text-muted">Tick a problem when you solve it. Your progress is saved to your account.</p>
        )}
      </div>
      <dl className="grid grid-cols-3 gap-6">
        {LEVELS.map(({ key, color }) => (
          <div key={key}>
            <dt className={`font-ui text-sm font-semibold ${color}`}>{key}</dt>
            <dd className="mt-0.5 font-code text-xl text-fg">
              {byLevel[key].solved}
              <span className="text-sm text-muted"> / {byLevel[key].total}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </div>
  );
};

export default SheetHeader;
