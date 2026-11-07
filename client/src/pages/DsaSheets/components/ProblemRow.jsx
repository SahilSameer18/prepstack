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
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20">
        LC
      </span>
    );
  }
  if (l.includes('geeksforgeeks.org')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        GFG
      </span>
    );
  }
  if (l.includes('codingninjas.com')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        CN
      </span>
    );
  }
  if (l.includes('takeuforward.org') || l.includes('tuf')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        TUF
      </span>
    );
  }
  if (l.includes('interviewbit.com')) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-ui font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        IB
      </span>
    );
  }
  return <FaExternalLinkAlt className="text-zinc-400 text-xs" />;
};

const getDifficultyColor = (diff) => {
  if (!diff) return 'text-zinc-400';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'text-emerald-400';
  if (d === 'medium') return 'text-yellow-400';
  if (d === 'hard') return 'text-red-400';
  return 'text-zinc-400';
};

const getDifficultyBg = (diff) => {
  if (!diff) return 'bg-white/[0.04] border-white/[0.07]';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'bg-emerald-500/[0.08] border-emerald-500/20';
  if (d === 'medium') return 'bg-yellow-500/[0.08] border-yellow-500/20';
  if (d === 'hard') return 'bg-red-500/[0.08] border-red-500/20';
  return 'bg-white/[0.04] border-white/[0.07]';
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
      className={`border-b border-white/[0.03] last:border-b-0 transition-colors ${
        isCompleted ? 'bg-emerald-500/[0.02]' : ''
      }`}
    >
      <div
        className={`group flex flex-col md:flex-row md:items-center justify-between px-5 py-3.5 transition-colors gap-3 ${
          isDrawerOpen ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Toggle */}
          <button
            onClick={(e) => onToggleSolved(e, problem.link)}
            className="flex-shrink-0 text-lg text-zinc-400 hover:text-zinc-300 hover:scale-110 transition-all cursor-pointer"
            style={isCompleted ? { color: '#10b981' } : {}}
            title={isCompleted ? 'Mark as unsolved' : 'Mark as solved'}
          >
            {isCompleted ? <FaCheckCircle /> : <FaRegCircle />}
          </button>

          {/* Title */}
          <span
            className={`text-sm font-medium truncate transition-colors ${
              isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-200 group-hover:text-white'
            }`}
          >
            {index + 1}. {problem.title}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 pl-9 md:pl-0 flex-shrink-0">
          {/* Quick Note Badges if note exists */}
          {noteData?.pattern && (
            <span className="text-xs font-ui font-medium text-amber-300/90 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
              {noteData.pattern}
            </span>
          )}
          {noteData?.timeComplexity && (
            <span className="text-xs font-ui font-medium text-blue-300/90 bg-blue-500/10 border border-blue-500/25 px-1.5 py-0.5 rounded-md">
              {noteData.timeComplexity}
            </span>
          )}

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {problem.tags.slice(0, 2).map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-xs font-ui text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
              {problem.tags.length > 2 && (
                <span className="text-xs font-ui text-zinc-400">
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
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300 hover:bg-amber-500/25'
                : isDrawerOpen
                ? 'bg-white/[0.08] border-white/20 text-white'
                : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/15'
            }`}
          >
            <FiFileText className={`text-xs ${hasNote ? 'text-amber-400' : 'text-zinc-400'}`} />
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
            className="flex items-center justify-center p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
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
