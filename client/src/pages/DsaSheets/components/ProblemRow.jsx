import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowSquareOut, Article, FileText, YoutubeLogo } from "@phosphor-icons/react";
import Tick from '../../../components/ui/Tick';
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
  if (!found) return <ArrowSquareOut aria-hidden="true" className="text-base" />;
  return <span className="font-code text-xs font-medium">{found[1]}</span>;
};

// Secondary actions are plain icon buttons with a comfortable 40 px target; the title stays the loudest thing in the row.
const ICON_BUTTON = 'inline-flex h-10 min-w-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-xl text-muted transition-colors hover:bg-ink/[0.05] hover:text-fg';

const getDifficultyColor = (diff) => {
  if (!diff) return 'text-muted';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'text-ok';
  if (d === 'medium') return 'text-yellow';
  if (d === 'hard') return 'text-bad';
  return 'text-muted';
};

// ── One problem in a topic: solved tick, title, difficulty, then the quiet actions (note, watch, read, open) ──
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
    <div id={anchorId} className="border-b border-ink/[0.06] last:border-b-0">
      <div className={`group flex flex-col justify-between gap-2 py-2 transition-colors md:flex-row md:items-center md:gap-4 ${isDrawerOpen ? 'bg-ink/[0.03]' : 'hover:bg-ink/[0.02]'}`}>
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          {/* Solved tick */}
          <button
            type="button"
            onClick={(e) => { if (!isCompleted) setTickPops((n) => n + 1); onToggleSolved(e, problem.link); }}
            className="-m-2.5 flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center active:scale-90"
            aria-pressed={isCompleted}
            aria-label={isCompleted ? `Mark ${problem.title} as unsolved` : `Mark ${problem.title} as solved`}
            title={isCompleted ? 'Mark as unsolved' : 'Mark as solved'}
          >
            <motion.span
              key={tickPops}
              initial={tickPops && isCompleted && !calm ? { scale: 0.7 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.4 }}
              className="flex"
            >
              <Tick done={isCompleted} />
            </motion.span>
          </button>

          {/* Title */}
          <span className={`min-w-0 truncate font-medium transition-colors ${isCompleted ? 'text-muted line-through' : 'text-fg'}`}>
            <span className="mr-2 font-code text-xs font-normal text-muted">{String(index + 1).padStart(2, '0')}</span>
            {problem.title}
          </span>
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center gap-x-3 gap-y-1 pl-10 md:grid md:grid-cols-[84px_repeat(4,40px)] md:gap-0 md:pl-0">
          {/* Quick note badges, when a note exists */}
          {noteData?.pattern && <span className="font-ui text-xs text-fg-3">{noteData.pattern}</span>}
          {noteData?.timeComplexity && <span className="font-code text-xs text-fg-3">{noteData.timeComplexity}</span>}

          {/* Difficulty */}
          <span className={`w-16 text-sm font-semibold md:w-auto ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty || 'Medium'}</span>

          {/* The visitor's own approach notes */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleDrawer(problem.link); }}
            aria-expanded={isDrawerOpen}
            aria-label={hasNote ? `View or edit approach notes for ${problem.title}` : `Add approach notes for ${problem.title}`}
            title={hasNote ? 'View or edit approach & invariant notes' : 'Add approach notes'}
            className={`${ICON_BUTTON} ${hasNote ? 'text-brand' : ''}`}
          >
            <FileText weight={hasNote ? 'fill' : 'regular'} aria-hidden="true" />
          </button>

          {/* The author's own learning links, when the sheet has them */}
          {problem.video ? (
            <a href={problem.video} target="_blank" rel="noopener noreferrer" title="Watch the video lecture (takeUforward)" aria-label={`Watch the video lecture for ${problem.title}, on takeUforward`} className={ICON_BUTTON}>
              <YoutubeLogo aria-hidden="true" />
            </a>
          ) : <span aria-hidden="true" className="hidden md:block" />}
          {problem.article ? (
            <a href={problem.article} target="_blank" rel="noopener noreferrer" title="Read the article (takeUforward)" aria-label={`Read the article for ${problem.title}, on takeUforward`} className={ICON_BUTTON}>
              <Article aria-hidden="true" />
            </a>
          ) : <span aria-hidden="true" className="hidden md:block" />}

          {/* The problem itself, on its own site */}
          <a
            href={problem.link}
            target="_blank"
            rel="noopener noreferrer"
            title="Open this problem on its own site"
            aria-label={`Open ${problem.title} on its own site`}
            className={`${ICON_BUTTON} text-brand hover:text-brand`}
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
