import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { dsaSheet } from "../../api/services/sheetService";
import { SkeletonSheetList } from "../../components/ui/Skeletons";
import { useLoadingGate } from "../../hooks/useLoadingGate";
import { EmptyState } from "../../components/ui/StateComponents";
import PageBackdrop from "../../components/ui/PageBackdrop";
import ProgressMarks from "../../components/ui/ProgressMarks";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardSummary } from "../../api/services/userService";

// Three groups, one accent colour: the groups differ by their words, not by colour.
const CATEGORY_DEFINITIONS = [
  {
    id: "foundation",
    label: "Foundation tracks",
    chip: "Foundation",
    desc: "Topic-by-topic courses that teach data structures and algorithms from the ground up.",
    slugs: ["love-babbar", "striver-a2z"],
  },
  {
    id: "product",
    label: "Product and FAANG core",
    chip: "FAANG core",
    desc: "Handpicked pattern sets for high-bar interviews at top tech companies.",
    slugs: ["striver-sde", "neetcode-150"],
  },
  {
    id: "revision",
    label: "Rapid interview sprint",
    chip: "Rapid sprint",
    desc: "A short, high-signal sheet for a fast review in the last 30 days.",
    slugs: ["blind-75"],
  },
];

const SHEET_METADATA_MAP = {
  "love-babbar": { highlight: "Thorough coverage of the data structures and algorithms", recommended: false, defaultCategoryId: "foundation" },
  "striver-a2z": { highlight: "Basics to advanced, in Striver's module order", recommended: true, defaultCategoryId: "foundation" },
  "striver-sde": { highlight: "Handpicked problems for core tech rounds", recommended: true, defaultCategoryId: "product" },
  "neetcode-150": { highlight: "Pattern-based preparation for big-tech interviews", recommended: false, defaultCategoryId: "product" },
  "blind-75": { highlight: "The essential 75-problem pre-interview checklist", recommended: true, defaultCategoryId: "revision" },
};

// One sheet as a line: name and one sentence, the size, your progress as marks (only when signed in), and the way in.
const SheetRow = ({ sheet, progress, withProgress }) => (
  <Link
    to={`/dsa/${sheet.slug}`}
    className={`group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-b border-ink/[0.1] py-6 transition-colors hover:bg-ink/[0.02] ${withProgress ? "sm:grid-cols-[1fr_130px_260px_70px]" : "sm:grid-cols-[1fr_130px_70px]"}`}
  >
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">
        {sheet.title}
        {sheet.recommended && <span className="rounded-full border border-brand/30 px-2.5 py-0.5 font-ui text-xs font-semibold text-brand">Top pick</span>}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">{sheet.highlight} · {sheet.difficulty}</p>
    </div>
    <span className="font-code text-sm text-fg sm:text-right sm:text-base">{sheet.count} <span className="text-muted">problems</span></span>
    {withProgress && <div className="col-span-2 min-w-0 sm:col-span-1">
      {progress && (
        <>
          <ProgressMarks value={progress.solved} total={progress.total} label={`Your progress on ${sheet.title}`} tall />
          <p className="mt-1.5 font-code text-xs text-muted">{progress.solved} of {progress.total} solved</p>
        </>
      )}
    </div>}
    <span className="hidden items-center justify-end gap-1.5 font-display text-sm font-bold text-brand sm:flex">
      Open <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
    </span>
  </Link>
);

const Sheets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dbSheets, setDbSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState({});
  const gate = useLoadingGate(loading);

  // Your solved counts per sheet. Only asked for when signed in: a signed-out page never calls a personal API.
  const userId = user?._id || user?.id;
  useEffect(() => {
    if (authLoading || !userId) { setProgress({}); return undefined; }
    let live = true;
    getDashboardSummary()
      .then((res) => {
        if (!live) return;
        setProgress(Object.fromEntries((res?.data?.dsaSheets || []).map((d) => [d.sheet.slug, { solved: d.solved, total: d.total }])));
      })
      .catch(() => {}); // a failed load just shows no bars
    return () => { live = false; };
  }, [userId, authLoading]);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setLoading(true);
        const res = await dsaSheet();
        setDbSheets(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch dynamic sheets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSheets();
  }, []);

  // Enrich dynamic backend sheets with category and UI meta
  const enrichedSheets = useMemo(() => {
    const source = dbSheets.length > 0 ? dbSheets : [
      { name: "Love Babbar DSA Sheet", slug: "love-babbar", totalProblems: 450, difficulty: "Beginner → Intermediate", tags: ["Comprehensive", "GFG Based"] },
      { name: "Striver A2Z Sheet", slug: "striver-a2z", totalProblems: 453, difficulty: "Beginner → Advanced", tags: ["Structured", "Pattern-based"] },
      { name: "Striver SDE Sheet", slug: "striver-sde", totalProblems: 179, difficulty: "Intermediate → Advanced", tags: ["FAANG Patterns", "Must Solve"] },
      { name: "NeetCode 150", slug: "neetcode-150", totalProblems: 150, difficulty: "Advanced", tags: ["LeetCode Patterns", "Concise"] },
      { name: "Blind 75", slug: "blind-75", totalProblems: 75, difficulty: "Intermediate → Advanced", tags: ["Essential", "Time-boxed"] },
    ];

    return source.map((sheet) => {
      const meta = SHEET_METADATA_MAP[sheet.slug] || {
        highlight: sheet.description || "Structured interview prep sheet",
        recommended: false,
        defaultCategoryId: "foundation",
      };

      let categoryId = meta.defaultCategoryId;
      const catFound = CATEGORY_DEFINITIONS.find((c) => c.slugs.includes(sheet.slug));
      if (catFound) categoryId = catFound.id;

      return {
        title: sheet.name,
        slug: sheet.slug,
        count: sheet.totalProblems || 0,
        difficulty: sheet.difficulty || "Intermediate",
        tags: sheet.tags && sheet.tags.length > 0 ? sheet.tags : ["Interview Prep", "DSA"],
        highlight: meta.highlight,
        recommended: meta.recommended,
        categoryId,
      };
    });
  }, [dbSheets]);

  const categories = useMemo(() => {
    return CATEGORY_DEFINITIONS.map((c) => ({
      ...c,
      sheets: enrichedSheets.filter((s) => s.categoryId === c.id),
    }));
  }, [enrichedSheets]);

  const hasProgress = Object.keys(progress).length > 0;

  const totalProblemCount = useMemo(() => {
    return enrichedSheets.reduce((acc, s) => acc + s.count, 0);
  }, [enrichedSheets]);

  const filtered = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return enrichedSheets.filter((s) => {
      const matchSearch = s.title.toLowerCase().includes(query) ||
        s.tags.some((t) => t.toLowerCase().includes(query));
      const matchCat = activeCategory === "all" || s.categoryId === activeCategory;
      return matchSearch && matchCat;
    });
  }, [enrichedSheets, searchTerm, activeCategory]);

  const visibleCategories = useMemo(() => {
    return activeCategory === "all"
      ? categories.filter((c) => c.sheets.length > 0)
      : categories.filter((c) => c.id === activeCategory);
  }, [categories, activeCategory]);

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-12 text-left">
        {/* ── HEADER ── */}
        <div className="mb-10 pt-2">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] leading-[1.04] text-fg">
            DSA problem sheets.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {totalProblemCount > 0 ? `${totalProblemCount.toLocaleString("en-IN")} problems in ${enrichedSheets.length} curated sheets.` : "Curated problem sheets."}{" "}
            Pick a long course to learn from the ground up, or a short sheet for a fast review before an interview.
          </p>
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-80">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
            <input
              type="text"
              placeholder="Search sheets or patterns"
              aria-label="Search sheets or patterns"
              className="w-full bg-card border border-ink/[0.1] hover:border-ink/[0.18] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)] rounded-xl py-3 pl-12 pr-4 outline-none transition-colors text-sm text-fg placeholder-faint font-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ id: "all", chip: "All sheets" }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                aria-pressed={activeCategory === c.id}
                className={`flex min-h-[44px] items-center rounded-xl px-4 text-sm transition-colors duration-150 cursor-pointer select-none ${
                  activeCategory === c.id ? "border border-brand/45 bg-brand/15 font-semibold text-brand" : "border border-ink/[0.2] bg-card text-fg-3 hover:border-ink/[0.4] hover:text-fg"
                }`}
              >
                {c.chip}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        {gate === "blank" ? (
          <div className="min-h-[40vh]" />
        ) : gate === "skeleton" ? (
          <SkeletonSheetList />
        ) : searchTerm === "" ? (
          <div className="fade-in space-y-14">
            {visibleCategories.map((cat) => (
              <section key={cat.id} aria-labelledby={`sheets-${cat.id}`}>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h2 id={`sheets-${cat.id}`} className="font-code text-xs uppercase tracking-[0.14em] text-fg-3">{cat.label}</h2>
                    <p className="mt-1.5 text-sm text-muted">{cat.desc}</p>
                  </div>
                  <span className="shrink-0 font-code text-xs text-muted">{cat.sheets.length} {cat.sheets.length === 1 ? "sheet" : "sheets"}</span>
                </div>
                <div className="border-t border-ink">
                  {cat.sheets.map((sheet) => <SheetRow key={sheet.slug} sheet={sheet} progress={progress[sheet.slug]} withProgress={hasProgress} />)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="fade-in">
            <p className="mb-6 font-ui text-sm text-muted" role="status">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
            {filtered.length > 0 ? (
              <div className="border-t border-ink">
                {filtered.map((sheet) => <SheetRow key={sheet.slug} sheet={sheet} progress={progress[sheet.slug]} withProgress={hasProgress} />)}
              </div>
            ) : (
              <EmptyState icon={MagnifyingGlass} title="No matching sheets found" text="Try searching for a different pattern name or topic." />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sheets;
