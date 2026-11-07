import { motion } from 'framer-motion';
import { FaCheckCircle, FaRegCircle, FaChevronDown, FaExternalLinkAlt } from 'react-icons/fa';
import { FiFileText } from 'react-icons/fi';
import ProblemNoteDrawer from './ProblemNoteDrawer';

// ── Platform icon resolver ─────────────────────────────────────────────────
const getPlatformIcon = (link) => {
  if (!link) return null;
  const l = link.toLowerCase();
  if (l.includes('leetcode.com')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-brand/10 text-brand border border-brand/20">
        LC
      </span>
    );
  }
  if (l.includes('geeksforgeeks.org')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-ok-solid/10 text-ok border border-ok-solid/20">
        GFG
      </span>
    );
  }
  if (l.includes('codingninjas.com')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-warn-solid/10 text-warn border border-warn-solid/20">
        CN
      </span>
    );
  }
  if (l.includes('takeuforward.org') || l.includes('tuf')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-bad-solid/10 text-bad border border-bad-solid/20">
        TUF
      </span>
    );
  }
  if (l.includes('interviewbit.com')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-info-solid/10 text-info border border-info-solid/20">
        IB
      </span>
    );
  }
  return <FaExternalLinkAlt className="text-muted text-xs" />;
};

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
  problem,
  index,
  isCompleted,
  noteData,
  isDrawerOpen,
  onToggleSolved,
  onToggleDrawer,
  onUpdateNote,
  onClearNote,
  onCloseDrawer,
}) => {
  const hasNote = Boolean(
    noteData && (noteData.approach || noteData.pattern || noteData.timeComplexity || noteData.spaceComplexity)
  );

  return (
    <div
      className={`border-b border-ink/[0.03] last:border-b-0 transition-colors ${
        isCompleted ? 'bg-ok-solid/[0.02]' : ''
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
            onClick={(e) => onToggleSolved(e, problem.link)}
            className="flex-shrink-0 text-lg text-muted hover:text-fg-3 hover:scale-110 transition-all cursor-pointer"
            style={isCompleted ? { color: 'var(--data-green)' } : {}}
            title={isCompleted ? 'Mark as unsolved' : 'Mark as solved'}
          >
            {isCompleted ? <FaCheckCircle /> : <FaRegCircle />}
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
            <span className="text-xs font-ui font-medium text-warn/90 bg-warn-solid/10 border border-warn-solid/25 px-2 py-0.5 rounded-md">
              {noteData.pattern}
            </span>
          )}
          {noteData?.timeComplexity && (
            <span className="text-xs font-ui font-medium text-info/90 bg-info-solid/10 border border-info-solid/25 px-1.5 py-0.5 rounded-md">
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
                ? 'bg-warn-solid/15 border-warn-solid/35 text-warn hover:bg-warn-solid/25'
                : isDrawerOpen
                ? 'bg-ink/[0.08] border-ink/20 text-fg'
                : 'bg-ink/[0.04] border-ink/[0.08] text-muted hover:text-fg-2 hover:border-ink/15'
            }`}
          >
            <FiFileText className={`text-xs ${hasNote ? 'text-warn' : 'text-muted'}`} />
            <span className="hidden sm:inline">{hasNote ? 'Notes' : '+ Note'}</span>
            <motion.span
              animate={{ rotate: isDrawerOpen ? 180 : 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 320 }}
              className="text-xs"
            >
              <FaChevronDown />
            </motion.span>
          </button>

          {/* Platform Link */}
          <a
            href={problem.link}
            target="_blank"
            rel="noopener noreferrer"
            title="View Problem on External Platform"
            className="flex items-center justify-center p-1.5 rounded-lg bg-ink/[0.04] border border-ink/[0.08] hover:bg-ink/[0.08] hover:border-ink/20 transition-all cursor-pointer"
          >
            {getPlatformIcon(problem.link)}
          </a>
        </div>
      </div>

      <ProblemNoteDrawer
        isOpen={isDrawerOpen}
        noteData={noteData}
        hasNote={hasNote}
        onUpdate={(updates) => onUpdateNote(problem.link, updates)}
        onClear={() => onClearNote(problem.link)}
        onClose={onCloseDrawer}
      />
    </div>
  );
};

export default ProblemRow;
