import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiTrash2, FiCheck, FiCpu, FiClock, FiX } from 'react-icons/fi';

// ── Cockpit Approach Drawer Constants ─────────────────────────────────────
const TIME_COMPLEXITIES = ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N²)', 'O(2ⁿ)'];
const SPACE_COMPLEXITIES = ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'];
const COMMON_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Monotonic Stack',
  'Fast & Slow Pointers',
  'DFS / Backtracking',
  'BFS / Level Order',
  'Dynamic Programming',
  'Prefix Sums',
  'Greedy',
  'Union Find / Graph',
  'Trie',
  'Bit Manipulation',
];

const LABEL_CLASS = 'text-xs font-ui text-zinc-400 uppercase tracking-wider';

// A row of toggle chips (pattern / time complexity / space complexity). `selectedClass` is a full literal
// class string so Tailwind can see it.
const ChipGroup = ({ label, labelClassName, options, selected, onSelect, selectedClass }) => (
  <div className="space-y-1.5">
    <label className={labelClassName}>{label}</label>
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(isSelected ? '' : option)}
            className={`text-xs font-ui px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              isSelected
                ? selectedClass
                : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/15'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

// ── Expandable Cockpit Approach & Invariants Drawer (one per problem row) ──
const ProblemNoteDrawer = ({ isOpen, noteData, hasNote, onUpdate, onClear, onClose }) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        className="overflow-hidden"
      >
        <div className="bg-[#0b0b0f] border-t border-white/[0.06] px-5 py-4 space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-ui font-semibold text-amber-400/90 flex items-center gap-1.5">
                <FiFileText className="text-amber-400" />
                Your notes
              </span>
              <span
                className="text-xs font-ui text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded"
                title="Notes are saved only in this browser on this device. They won't appear on other devices and are lost if you clear your browser data."
              >
                This device only
              </span>
            </div>

            <div className="flex items-center gap-3">
              {hasNote && (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 text-xs font-ui text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Clear note for this problem"
                >
                  <FiTrash2 className="text-xs" />
                  Clear
                </button>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-ui text-emerald-400/80">
                <FiCheck className="text-xs text-emerald-400" />
                Auto-saved
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Close drawer"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          </div>

          {/* Pattern Chips */}
          <ChipGroup
            label="Pattern"
            labelClassName={LABEL_CLASS}
            options={COMMON_PATTERNS}
            selected={noteData?.pattern}
            onSelect={(pattern) => onUpdate({ pattern })}
            selectedClass="bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold"
          />

          {/* Complexity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            <ChipGroup
              label={<><FiClock className="text-xs text-zinc-400" />Time Complexity</>}
              labelClassName={`${LABEL_CLASS} flex items-center gap-1`}
              options={TIME_COMPLEXITIES}
              selected={noteData?.timeComplexity}
              onSelect={(timeComplexity) => onUpdate({ timeComplexity })}
              selectedClass="bg-blue-500/20 border-blue-500/50 text-blue-300 font-semibold"
            />
            <ChipGroup
              label={<><FiCpu className="text-xs text-zinc-400" />Space Complexity</>}
              labelClassName={`${LABEL_CLASS} flex items-center gap-1`}
              options={SPACE_COMPLEXITIES}
              selected={noteData?.spaceComplexity}
              onSelect={(spaceComplexity) => onUpdate({ spaceComplexity })}
              selectedClass="bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold"
            />
          </div>

          {/* Approach & Invariant Textarea */}
          <div className="space-y-1.5 pt-0.5">
            <label className={LABEL_CLASS}>
              Approach, edge cases and things to remember
            </label>
            <textarea
              rows={3}
              value={noteData?.approach || ''}
              onChange={(e) => onUpdate({ approach: e.target.value })}
              placeholder="e.g. Invariant: Maintain a monotonically decreasing stack of indices. When current element exceeds stack top, pop and compute trapped water width/height. Edge cases: empty array, strictly decreasing values."
              className="w-full bg-[#131317] border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-400 focus:outline-none transition-all resize-y font-ui leading-relaxed"
            />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ProblemNoteDrawer;
