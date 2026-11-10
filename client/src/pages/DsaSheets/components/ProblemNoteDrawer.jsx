import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiTrash2, FiCheck, FiCpu, FiClock, FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { TIME_COMPLEXITIES, SPACE_COMPLEXITIES, COMMON_PATTERNS, APPROACH_MAX } from '../../../data/problemNoteOptions';

// The drawer's save status, in words (never colour alone)
const STATUS = {
  saved: { Icon: FiCheck, text: 'Saved to your account', className: 'text-ok/80' },
  saving: { Icon: FiLoader, text: 'Saving...', className: 'text-muted' },
  error: { Icon: FiAlertCircle, text: 'Not saved. Change anything to try again.', className: 'text-bad' },
};

const LABEL_CLASS = 'text-xs font-ui text-muted uppercase tracking-wider';

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
                : 'bg-ink/[0.03] border-ink/[0.06] text-muted hover:text-fg hover:border-ink/15'
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
const ProblemNoteDrawer = ({ isOpen, noteData, hasNote, saveStatus = 'saved', onUpdate, onClear, onClose }) => {
  const status = STATUS[saveStatus] || STATUS.saved;
  return (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        className="overflow-hidden"
      >
        <div className="bg-card border-t border-ink/[0.06] px-5 py-4 space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-ui font-semibold text-warn/90 flex items-center gap-1.5">
                <FiFileText className="text-warn" />
                Your notes
              </span>
            </div>

            <div className="flex items-center gap-3">
              {hasNote && (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 text-xs font-ui text-muted hover:text-bad transition-colors cursor-pointer"
                  title="Clear note for this problem"
                >
                  <FiTrash2 className="text-xs" />
                  Clear
                </button>
              )}
              <span className={`inline-flex items-center gap-1 text-xs font-ui ${status.className}`} role="status" aria-live="polite">
                <status.Icon className="text-xs" aria-hidden="true" />
                {status.text}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-fg p-1 rounded hover:bg-ink/[0.05] transition-colors cursor-pointer"
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
            selectedClass="bg-warn-solid/20 border-warn-solid/50 text-warn font-semibold"
          />

          {/* Complexity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            <ChipGroup
              label={<><FiClock className="text-xs text-muted" />Time Complexity</>}
              labelClassName={`${LABEL_CLASS} flex items-center gap-1`}
              options={TIME_COMPLEXITIES}
              selected={noteData?.timeComplexity}
              onSelect={(timeComplexity) => onUpdate({ timeComplexity })}
              selectedClass="bg-info-solid/20 border-info-solid/50 text-info font-semibold"
            />
            <ChipGroup
              label={<><FiCpu className="text-xs text-muted" />Space Complexity</>}
              labelClassName={`${LABEL_CLASS} flex items-center gap-1`}
              options={SPACE_COMPLEXITIES}
              selected={noteData?.spaceComplexity}
              onSelect={(spaceComplexity) => onUpdate({ spaceComplexity })}
              selectedClass="bg-violet-solid/20 border-violet-solid/50 text-violet font-semibold"
            />
          </div>

          {/* Approach & Invariant Textarea */}
          <div className="space-y-1.5 pt-0.5">
            <label className={LABEL_CLASS}>
              Approach, edge cases and things to remember
            </label>
            <textarea
              rows={3}
              maxLength={APPROACH_MAX}
              value={noteData?.approach || ''}
              onChange={(e) => onUpdate({ approach: e.target.value })}
              placeholder="e.g. Invariant: Maintain a monotonically decreasing stack of indices. When current element exceeds stack top, pop and compute trapped water width/height. Edge cases: empty array, strictly decreasing values."
              className="w-full bg-card-hover border border-ink/[0.08] focus:border-warn-solid/50 focus:ring-1 focus:ring-warn-solid/30 rounded-lg p-3 text-xs text-fg-2 placeholder:text-muted focus:outline-none transition-all resize-y font-ui leading-relaxed"
            />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default ProblemNoteDrawer;
