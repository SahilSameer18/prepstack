import { Link } from 'react-router-dom';
import { ArrowRight, ArrowSquareOut } from "@phosphor-icons/react";
import ProgressRing from './ProgressRing';

const LEVELS = [
  { key: 'Easy', color: 'text-ok' },
  { key: 'Medium', color: 'text-yellow' },
  { key: 'Hard', color: 'text-bad' },
];

// ── Header: title, description, source, the way into your plan, the progress ring and the Easy/Medium/Hard split ──
const SheetHeader = ({ meta, name, totalProblems, totalSolvedCount, progressPercentage, byLevel, hasNext, onContinue }) => (
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

    <div className="mt-8 flex flex-col gap-6 surface-card p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="flex justify-center sm:justify-start">
        <ProgressRing percentage={progressPercentage} solved={totalSolvedCount} total={totalProblems} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-ui text-sm text-muted">Overall progress</p>
        <p className="mt-0.5 font-display text-3xl font-extrabold tracking-tight text-fg">
          {totalSolvedCount} <span className="text-muted">/ {totalProblems}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/[0.08]" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress">
          <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${progressPercentage}%`, background: 'var(--brand-grad-bottom)' }} />
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

export default SheetHeader;
