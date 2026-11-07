import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { FiTarget, FiAward } from 'react-icons/fi';
import ProgressRing from './ProgressRing';

// ── Header Card: sheet title, badge, solved/remaining stats, source link and the progress ring ──
const SheetHeader = ({ meta, name, totalProblems, totalSolvedCount, progressPercentage }) => (
  <div className="relative bg-card border border-ink/[0.08] rounded-2xl p-6 md:p-8 mb-8 overflow-hidden shadow-2xl">
    {/* Subtle glow blob */}
    <div
      className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
      style={{ background: meta.accentColor }}
    />

    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${meta.badgeColor}`}>
            {meta.badge}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ink/[0.04] border border-ink/[0.08] text-fg-3 font-ui">
            {totalProblems} Problems
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 leading-tight tracking-tight text-fg">
          {name}
        </h1>

        <p className="text-muted text-sm leading-relaxed max-w-2xl mb-5">
          {meta.description}
        </p>

        {/* Stats row & Source */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <FiTarget className="text-sm" style={{ color: meta.accentColor }} />
              <span className="text-sm text-fg-2 font-medium">{totalSolvedCount} solved</span>
            </div>
            <div className="flex items-center gap-2">
              <FiAward className="text-sm text-muted" />
              <span className="text-sm text-muted">{totalProblems - totalSolvedCount} remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 md:w-32 bg-ink/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  style={{ background: meta.accentColor }}
                />
              </div>
              <span className="text-xs font-ui font-medium text-fg-3">{progressPercentage}%</span>
            </div>
          </div>

          {/* SOURCE LINK (Downside of status bar) */}
          {meta.sourceUrl && meta.sourceUrl !== '#' && (
            <a
              href={meta.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 sm:py-1.5 rounded-lg bg-ink/[0.04] border border-ink/[0.08] text-muted hover:text-fg hover:bg-ink/[0.08] hover:border-ink/[0.15] transition-all w-max shadow-sm"
            >
              <span>Official Source: {meta.sourceName}</span>
              <FaExternalLinkAlt className="text-xs text-muted" />
            </a>
          )}
        </div>
      </div>

      {/* Right: circular progress */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <ProgressRing
          percentage={progressPercentage}
          solved={totalSolvedCount}
          total={totalProblems}
          accentColor={meta.accentColor}
        />
        <span className="text-xs font-ui text-muted">Progress</span>
      </div>
    </div>
  </div>
);

export default SheetHeader;
