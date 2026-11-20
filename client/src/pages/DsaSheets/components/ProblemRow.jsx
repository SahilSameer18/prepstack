import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowSquareOut, Article, CaretDown, CheckCircle, Circle, FileText, YoutubeLogo } from "@phosphor-icons/react";
import ProblemNoteDrawer from './ProblemNoteDrawer';

// ── Platform icon resolver ─────────────────────────────────────────────────
const PLATFORMS = [
  ['leetcode.com', 'LC'],
  ['geeksforgeeks.org', 'GFG'],
  ['codingninjas.com', 'CN'],
  ['takeuforward.org', 'TUF'],
  ['interviewbit.com', 'IB'],
];

const getPlatformIcon = (link) => {
  if (!link) return null;
  const l = link.toLowerCase();
  const found = PLATFORMS.find(([host]) => l.includes(host)) || (l.includes('tuf') ? PLATFORMS[3] : null);
  if (!found) return <ArrowSquareOut className="text-muted text-xs" />;
  return <span className="font-ui text-xs font-semibold text-fg-3">{found[1]}</span>;
};

const LEARN_LINK = 'inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-ink/[0.1] bg-card px-2 font-ui text-xs font-medium text-fg-3 transition-colors hover:border-ink/[0.22] hover:text-fg cursor-pointer';

const getDifficultyColor = (diff) => {
  if (!diff) return 'text-muted';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'text-ok';
  if (d === 'medium') return 'text-yellow';
  if (d === 'hard') return 'text-bad';
  return 'text-muted';
};

const getDifficultyBg = (diff) => {
  if (!diff) return 'bg-ink/[0.04] border-ink/[0.07]';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'bg-ok-solid/[0.08] border-ok-solid/20';
  if (d === 'medium') return 'bg-yellow-solid/[0.08] border-yellow-solid/20';
  if (d === 'hard') return 'bg-bad-solid/[0.08] border-bad-solid/20';
  return 'bg-ink/[0.04] border-ink/[0.07]';
};

// ── One problem in a topic: solved toggle, title, quick-note badges, tags, difficulty, notes drawer, platform link ──
const ProblemRow = ({
  anchorId,
  problem,
  index,
  isCompleted,
  noteData,
  saveStatus,
  isDrawerOpen,
  onToggleSolved,
  onToggleDrawer,
  onUpdateNote,
  onClearNote,
  onCloseDrawer,
}) => {
  const calm = useReducedMotion();
  // counts only the ticks the user makes now, so rows that load already solved do not pop
  const [tickPops, setTickPops] = useState(0);
  const hasNote = Boolean(
    noteData && (noteData.approach || noteData.pattern || noteData.timeComplexity || noteData.spaceComplexity)
  );

  return (
    <div
      id={anchorId}
      className={`border-b border-ink/[0.06] last:border-b-0 transition-colors ${
        isCompleted ? 'bg-brand/[0.04]' : ''
      }`}
    >
      <div
        className={`group flex flex-col md:flex-row md:items-center justify-between px-5 py-3.5 transition-colors gap-3 ${
          isDrawerOpen ? 'bg-ink/[0.03]' : 'hover:bg-ink/[0.02]'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Toggle */}
          <button
            onClick={(e) => { if (!isCompleted) setTickPops((n) => n + 1); onToggleSolved(e, problem.link); }}
            className={`flex h-11 w-11 -m-2.5 flex-shrink-0 items-center justify-center text-2xl transition-[transform,color] duration-150 active:scale-90 cursor-pointer ${isCompleted ? 'text-brand' : 'text-faint hover:text-fg-3'}`}
            aria-pressed={isCompleted}
            aria-label={isCompleted ? `Mark ${problem.title} as unsolved` : `Mark ${problem.title} as solved`}
            title={isCompleted ? 'Mark as unsolved' : 'Mark as solved'}
          >
            {isCompleted ? (
              <motion.span key={tickPops} className="flex" initial={tickPops && !calm ? { scale: 0.55 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.3, bounce: 0.4 }}>
                <CheckCircle weight="fill" />
              </motion.span>
            ) : <Circle weight="regular" />}
          </button>

          {/* Title */}
          <span
            className={`text-sm font-medium truncate transition-colors ${
              isCompleted ? 'text-muted line-through' : 'text-fg-2 group-hover:text-fg'
            }`}
          >
            {index + 1}. {problem.title}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 pl-9 md:pl-0 flex-shrink-0">
          {/* Quick Note Badges if note exists */}
          {noteData?.pattern && (
            <span className="text-xs font-ui font-medium text-fg-3 bg-ink/[0.05] border border-ink/[0.1] px-2 py-0.5 rounded-md">
              {noteData.pattern}
            </span>
          )}
          {noteData?.timeComplexity && (
            <span className="text-xs font-ui font-medium text-fg-3 bg-ink/[0.05] border border-ink/[0.1] px-1.5 py-0.5 rounded-md">
              {noteData.timeComplexity}
            </span>
          )}

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {problem.tags.slice(0, 2).map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-xs font-ui text-muted bg-ink/[0.04] px-1.5 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
              {problem.tags.length > 2 && (
                <span className="text-xs font-ui text-muted">
                  +{problem.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Difficulty */}
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getDifficultyColor(
              problem.difficulty
            )} ${getDifficultyBg(problem.difficulty)}`}
          >
            {problem.difficulty || 'Medium'}
          </span>

          {/* Approach & Invariant Notes Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDrawer(problem.link);
            }}
            title={hasNote ? 'View or edit approach & invariant notes' : 'Add approach notes'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-ui font-medium border transition-all cursor-pointer ${
              hasNote
                ? 'bg-brand/10 border-brand/30 text-brand hover:bg-brand/15'
                : isDrawerOpen
                ? 'bg-ink/[0.08] border-ink/20 text-fg'
                : 'bg-ink/[0.04] border-ink/[0.08] text-muted hover:text-fg-2 hover:border-ink/15'
            }`}
          >
            <FileText className={`text-xs ${hasNote ? 'text-brand' : 'text-muted'}`} />
            <span className="hidden sm:inline">{hasNote ? 'Notes' : '+ Note'}</span>
            <motion.span
              animate={{ rotate: isDrawerOpen ? 180 : 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 320 }}
              className="text-xs"
            >
              <CaretDown />
            </motion.span>
          </button>

          {/* The author's own learning links, when the sheet has them */}
          {problem.video && (
            <a href={problem.video} target="_blank" rel="noopener noreferrer" title="Watch the video lecture (takeUforward)" aria-label={`Watch the video lecture for ${problem.title}, on takeUforward`} className={LEARN_LINK}>
              <YoutubeLogo weight="duotone" className="text-base" aria-hidden="true" />
              <span className="hidden lg:inline">Watch</span>
            </a>
          )}
          {problem.article && (
            <a href={problem.article} target="_blank" rel="noopener noreferrer" title="Read the article (takeUforward)" aria-label={`Read the article for ${problem.title}, on takeUforward`} className={LEARN_LINK}>
              <Article weight="duotone" className="text-base" aria-hidden="true" />
              <span className="hidden lg:inline">Read</span>
            </a>
          )}

          {/* Platform Link */}
          <a
            href={problem.link}
            target="_blank"
            rel="noopener noreferrer"
            title="Open this problem on its own site"
            className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border border-ink/[0.1] bg-card px-1.5 transition-colors hover:border-ink/[0.22] cursor-pointer"
          >
            {getPlatformIcon(problem.link)}
          </a>
        </div>
      </div>

      <ProblemNoteDrawer
        isOpen={isDrawerOpen}
        noteData={noteData}
        hasNote={hasNote}
        saveStatus={saveStatus}
        onUpdate={(updates) => onUpdateNote(problem.link, updates)}
        onClear={() => onClearNote(problem.link)}
        onClose={onCloseDrawer}
      />
    </div>
  );
};

export default ProblemRow;
