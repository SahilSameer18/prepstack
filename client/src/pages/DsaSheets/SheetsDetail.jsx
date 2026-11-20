import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { getSheetBySlug, getSheetProgress, toggleProblem } from '../../api/services/sheetService';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import { PageErrorState } from '../../components/ui/ErrorComponents';
import { SkeletonSheetDetail } from '../../components/ui/Skeletons';
import PageBackdrop from '../../components/ui/PageBackdrop';
import { getSheetMeta } from '../../data/sheetMeta';
import { useProblemNotes } from '../../hooks/useProblemNotes';
import { useAuth } from '../../hooks/useAuth';
import SignInNotice from '../../components/auth/SignInNotice';
import SheetHeader from './components/SheetHeader';
import ProblemRow from './components/ProblemRow';

const LEVEL_FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

// A problem with no difficulty counts as Medium, the same as the row shows it.
const levelOf = (problem) => {
  const d = (problem.difficulty || 'Medium').toLowerCase();
  if (d === 'easy') return 'Easy';
  if (d === 'hard') return 'Hard';
  return 'Medium';
};

// ── Main Component ─────────────────────────────────────────────────────────
const SheetsDetail = () => {
  const { slug } = useParams();
  const calm = useReducedMotion();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [solved, setSolved] = useState([]);
  const [openTopics, setOpenTopics] = useState(new Set());
  const [level, setLevel] = useState('All');
  const [hideSolved, setHideSolved] = useState(false);
  const [query, setQuery] = useState('');
  const { notesMap, updateNote, clearNote, saveStatus } = useProblemNotes();
  const [activeNoteLink, setActiveNoteLink] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  const toggleNoteDrawer = (link) => {
    // Notes are saved to an account: a signed-out visitor is asked to sign in instead of typing into a box that saves nothing
    if (!user) { setShowSignIn(true); return; }
    setActiveNoteLink((prev) => (prev === link ? null : link));
  };

  const meta = getSheetMeta(slug);

  // The sheet is public. Only the visitor's own progress needs an account, so it is never requested without one.
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const sheetRes = await getSheetBySlug(slug);
      if (sheetRes.success && sheetRes.data) setSheet(sheetRes.data);
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

  const userId = user?._id || user?.id;
  useEffect(() => {
    if (authLoading) return undefined;
    if (!userId) { setSolved([]); return undefined; }
    let live = true;
    getSheetProgress(slug)
      .then((res) => { if (live) setSolved(res.data?.solvedProblems || []); })
      .catch(() => {}); // a failed progress load shows an unticked sheet, as before
    return () => { live = false; };
  }, [slug, userId, authLoading]);

  const toggleTopic = (index) => {
    const newOpen = new Set(openTopics);
    if (newOpen.has(index)) newOpen.delete(index);
    else newOpen.add(index);
    setOpenTopics(newOpen);
  };

  const handleToggleProblem = async (e, link) => {
    e.stopPropagation();
    if (!user) { setShowSignIn(true); return; }
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

  // Counts are by unique problem link, as the saved progress is. The Easy/Medium/Hard split and the next unsolved problem come from the same pass.
  const solvedSet = useMemo(() => new Set(solved), [solved]);
  const stats = useMemo(() => {
    const byLevel = { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } };
    const seen = new Set();
    let next = null;
    let solvedCount = 0;
    (sheet?.topics || []).forEach((topic, ti) => {
      (topic.problems || []).forEach((problem, pi) => {
        if (!problem.link || seen.has(problem.link)) return;
        seen.add(problem.link);
        const lv = levelOf(problem);
        byLevel[lv].total += 1;
        if (solvedSet.has(problem.link)) { byLevel[lv].solved += 1; solvedCount += 1; }
        else if (!next) next = { ti, pi };
      });
    });
    const total = seen.size;
    return { byLevel, next, total, solvedCount, pct: total === 0 ? 0 : Math.round((solvedCount / total) * 100) };
  }, [sheet, solvedSet]);

  const q = query.trim().toLowerCase();
  const filtersActive = level !== 'All' || hideSolved || q !== '';
  const isShown = (problem) =>
    (level === 'All' || levelOf(problem) === level) &&
    (!hideSolved || !solvedSet.has(problem.link)) &&
    (q === '' || (problem.title || '').toLowerCase().includes(q) || (problem.tags || []).some((t) => t.toLowerCase().includes(q)));

  const clearFilters = () => { setLevel('All'); setHideSolved(false); setQuery(''); };

  const goToNext = () => {
    if (!stats.next) return;
    const { ti, pi } = stats.next;
    clearFilters();
    setOpenTopics((prev) => new Set(prev).add(ti));
    // wait for the topic to finish opening before scrolling to the row
    setTimeout(() => document.getElementById(`p-${ti}-${pi}`)?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' }), 350);
  };

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

  const topics = sheet.topics || [];
  const visibleTopics = topics
    .map((topic, index) => ({ topic, index, shown: (topic.problems || []).map((problem, pIdx) => ({ problem, pIdx })).filter(({ problem }) => isShown(problem)) }))
    .filter(({ shown }) => !filtersActive || shown.length > 0);

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6 pb-12 pt-2 text-fg">
        <Link to="/dsa" className="group mb-3 inline-flex min-h-[44px] items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
          <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
          Back to sheets
        </Link>

        <SheetHeader
          meta={meta}
          name={sheet.name}
          totalProblems={stats.total}
          totalSolvedCount={stats.solvedCount}
          progressPercentage={stats.pct}
          byLevel={stats.byLevel}
          hasNext={Boolean(stats.next)}
          onContinue={goToNext}
        />

        {/* ── Filters: stays under the navbar on larger screens so it is always within reach ── */}
        <div className="z-20 mb-4 rounded-2xl border border-ink/[0.1] bg-canvas/85 p-3 backdrop-blur-xl md:sticky md:top-[72px]">
          <div className="flex flex-wrap items-center gap-2">
            {LEVEL_FILTERS.map((name) => {
              const count = name === 'All' ? stats.total : stats.byLevel[name].total;
              const active = level === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLevel(name)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-[transform,color,background-color] duration-150 cursor-pointer select-none sm:min-h-[40px] ${
                    active ? 'amber-specular-button font-bold' : 'titanium-button text-muted hover:text-fg'
                  }`}
                >
                  {name}
                  <span className={`font-ui text-xs ${active ? 'opacity-80' : 'text-faint'}`}>{count}</span>
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={hideSolved}
              onClick={() => setHideSolved((v) => !v)}
              className={`flex min-h-[44px] items-center rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer select-none sm:min-h-[40px] ${
                hideSolved ? 'border-brand/40 bg-brand/10 text-brand' : 'border-ink/[0.1] text-muted hover:text-fg'
              }`}
            >
              Hide solved
            </button>
            <div className="relative ml-auto w-full sm:w-56">
              <FaSearch aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search problems"
                aria-label="Search problems"
                className="min-h-[44px] w-full rounded-xl border border-ink/[0.1] bg-card py-2 pl-9 pr-3 text-sm text-fg outline-none transition-colors placeholder-faint hover:border-ink/[0.18] focus:border-brand sm:min-h-[40px]"
              />
            </div>
          </div>
        </div>

        {/* ── Topics Accordion ── */}
        <div className="space-y-3">
          {filtersActive && visibleTopics.length === 0 && (
            <div className="rounded-2xl border border-ink/[0.1] bg-card p-8 text-center" role="status">
              <p className="font-display text-lg font-bold text-fg">No problems match these filters</p>
              <p className="mt-1 text-sm text-muted">Try a different search, or show everything again.</p>
              <button type="button" onClick={clearFilters} className="titanium-button mt-4 inline-flex min-h-[44px] items-center rounded-xl px-5 py-2 text-sm font-medium">
                Clear filters
              </button>
            </div>
          )}

          {visibleTopics.map(({ topic, index, shown }) => {
            // while filtering, every topic with a match is open; otherwise the visitor opens and closes them
            const isOpen = filtersActive || openTopics.has(index);
            const problems = topic.problems || [];
            const topicSolvedCount = problems.filter((p) => solvedSet.has(p.link)).length;
            const topicTotal = problems.length;
            const topicPct = topicTotal === 0 ? 0 : Math.round((topicSolvedCount / topicTotal) * 100);

            return (
              <div key={index} className={`overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 ${isOpen ? 'border-ink/[0.14] shadow-[0_18px_34px_-24px_color-mix(in_srgb,var(--shadow)_45%,transparent)]' : 'border-ink/[0.08] hover:border-ink/[0.16]'}`}>
                <button
                  type="button"
                  onClick={() => { if (!filtersActive) toggleTopic(index); }}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-ink/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 font-ui text-sm font-bold text-brand">{index + 1}</span>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-extrabold tracking-tight text-fg">{topic.title || topic.topic || `Topic ${index + 1}`}</h2>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink/[0.08]">
                          <div className="h-full rounded-full" style={{ width: `${topicPct}%`, background: 'var(--brand-grad-bottom)' }} />
                        </div>
                        <span className="font-ui text-xs text-muted">{topicSolvedCount}/{topicTotal}</span>
                      </div>
                    </div>
                  </div>
                  {!filtersActive && (
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 320 }}
                      className="shrink-0 text-xs text-muted"
                    >
                      <FaChevronDown />
                    </motion.span>
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                      className="overflow-hidden border-t border-ink/[0.08]"
                    >
                      {shown.map(({ problem, pIdx }) => (
                        <ProblemRow
                          key={pIdx}
                          anchorId={`p-${index}-${pIdx}`}
                          problem={problem}
                          index={pIdx}
                          isCompleted={solvedSet.has(problem.link)}
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

        {showSignIn && !user && <SignInNotice floating onClose={() => setShowSignIn(false)} />}
      </div>
    </div>
  );
};

export default SheetsDetail;
