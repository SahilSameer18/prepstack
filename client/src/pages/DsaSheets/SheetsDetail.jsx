import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSheetBySlug, getSheetProgress, toggleProblem } from '../../api/services/sheetService';
import { FaChevronDown } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import { PageErrorState } from '../../components/ui/ErrorComponents';
import { SkeletonSheetDetail } from '../../components/ui/Skeletons';
import { getSheetMeta } from '../../data/sheetMeta';
import { useProblemNotes } from '../../hooks/useProblemNotes';
import SheetHeader from './components/SheetHeader';
import ProblemRow from './components/ProblemRow';

// ── Main Component ─────────────────────────────────────────────────────────
const SheetsDetail = () => {
  const { slug } = useParams();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [solved, setSolved] = useState([]);
  const [openTopics, setOpenTopics] = useState(new Set());
  const { notesMap, updateNote, clearNote, saveStatus } = useProblemNotes();
  const [activeNoteLink, setActiveNoteLink] = useState(null);

  const toggleNoteDrawer = (link) => {
    setActiveNoteLink((prev) => (prev === link ? null : link));
  };

  const meta = getSheetMeta(slug);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [sheetRes, progressRes] = await Promise.all([
        getSheetBySlug(slug),
        getSheetProgress(slug).catch(() => ({ data: { solvedProblems: [] } }))
      ]);
      if (sheetRes.success && sheetRes.data) setSheet(sheetRes.data);
      if (progressRes.success || progressRes.data) setSolved(progressRes.data?.solvedProblems || []);
    } catch (err) {
      console.error('Error fetching sheet data:', err);
      setFetchError(
        err?.response?.data?.message ||
        'Failed to load the sheet. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTopic = (index) => {
    const newOpen = new Set(openTopics);
    if (newOpen.has(index)) newOpen.delete(index);
    else newOpen.add(index);
    setOpenTopics(newOpen);
  };

  const handleToggleProblem = async (e, link) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && typeof navigator?.vibrate === 'function') {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe fallback for browsers/platforms without haptic vibration support
      }
    }
    const isSolved = solved.includes(link);
    setSolved((prev) => isSolved ? prev.filter(l => l !== link) : [...prev, link]);
    try {
      await toggleProblem(slug, link);
    } catch (err) {
      console.error('Failed to toggle problem', err);
      setSolved((prev) => isSolved ? [...prev, link] : prev.filter(l => l !== link));
    }
  };

  const { totalProblems, totalSolvedCount, progressPercentage } = useMemo(() => {
    if (!sheet) return { totalProblems: 0, totalSolvedCount: 0, progressPercentage: 0 };
    const linkSet = new Set();
    (sheet.topics || []).forEach((t) => {
      (t.problems || []).forEach((p) => {
        if (p.link) linkSet.add(p.link);
      });
    });
    const total = linkSet.size;
    const count = (solved || []).filter((link) => linkSet.has(link)).length;
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return { totalProblems: total, totalSolvedCount: count, progressPercentage: pct };
  }, [sheet, solved]);

  if (loading) return <SkeletonSheetDetail />;

  if (fetchError) return (
    <PageErrorState
      message={fetchError}
      onRetry={fetchData}
      backTo="/dsa"
      backLabel="Back to Sheets"
    />
  );

  if (!sheet) return (
    <PageErrorState
      message="This sheet doesn't exist or couldn't be found."
      backTo="/dsa"
      backLabel="Back to Sheets"
    />
  );

  return (
    <div className="px-4 md:px-6 py-8 max-w-5xl mx-auto page-enter text-fg">

      {/* Back link */}
      <Link to="/dsa" className="inline-flex items-center gap-2 min-h-[44px] text-muted hover:text-fg text-sm mb-3 transition-colors group">
        <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
        Back to Sheets
      </Link>

      <SheetHeader
        meta={meta}
        name={sheet.name}
        totalProblems={totalProblems}
        totalSolvedCount={totalSolvedCount}
        progressPercentage={progressPercentage}
      />

      {/* ── Topics Accordion ── */}
      <div className="space-y-3">
        {(sheet.topics || []).map((topic, index) => {
          const isOpen = openTopics.has(index);
          const problems = topic.problems || [];
          const topicSolvedCount = problems.filter(p => solved.includes(p.link)).length;
          const topicTotal = problems.length;
          const topicPct = topicTotal === 0 ? 0 : Math.round((topicSolvedCount / topicTotal) * 100);

          return (
            <div key={index} className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'border-ink/[0.12] shadow-lg' : 'border-ink/[0.06] hover:border-ink/[0.1]'}`}>
              {/* Accordion Header */}
              <button
                onClick={() => toggleTopic(index)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-ink/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-ink/[0.04] flex-shrink-0">
                    <span className="text-sm font-bold text-fg font-ui">{index + 1}</span>
                  </div>
                  <div className="min-w-0 text-left">
                    <h2 className="text-sm md:text-base font-semibold text-fg-1 truncate">{topic.title || topic.topic || `Topic ${index + 1}`}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-1 w-16 bg-ink/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${topicPct}%`, background: meta.accentColor, opacity: 0.8 }}
                        />
                      </div>
                      <span className="text-xs text-muted font-ui">{topicSolvedCount}/{topicTotal}</span>
                    </div>
                  </div>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 320 }}
                  className="text-muted text-xs flex-shrink-0"
                >
                  <FaChevronDown />
                </motion.span>
              </button>

              {/* Accordion Body */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 350 }}
                    className="border-t border-ink/[0.06] overflow-hidden"
                  >
                    {problems.map((problem, pIdx) => (
                      <ProblemRow
                        key={pIdx}
                        problem={problem}
                        index={pIdx}
                        isCompleted={solved.includes(problem.link)}
                        noteData={notesMap[problem.link] || null}
                        saveStatus={saveStatus}
                        isDrawerOpen={activeNoteLink === problem.link}
                        onToggleSolved={handleToggleProblem}
                        onToggleDrawer={toggleNoteDrawer}
                        onUpdateNote={updateNote}
                        onClearNote={clearNote}
                        onCloseDrawer={() => setActiveNoteLink(null)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SheetsDetail;
