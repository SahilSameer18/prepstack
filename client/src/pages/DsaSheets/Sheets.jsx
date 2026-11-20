import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpenText, CheckSquare, CodeBlock, Lightning, MagnifyingGlass, Stack, Star, Target } from "@phosphor-icons/react";
import { dsaSheet } from "../../api/services/sheetService";
import { SkeletonCard } from "../../components/ui/Skeletons";
import { EmptyState } from "../../components/ui/StateComponents";
import PageBackdrop from "../../components/ui/PageBackdrop";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardSummary } from "../../api/services/userService";

const MotionLink = motion.create(Link);

// Three groups, one accent colour: the groups differ by their words, not by colour.
const CATEGORY_DEFINITIONS = [
  {
    id: "foundation",
    label: "Foundation tracks",
    chip: "Foundation",
    icon: <BookOpenText weight="duotone" />,
    desc: "Topic-by-topic courses that teach data structures and algorithms from the ground up.",
    slugs: ["love-babbar", "striver-a2z"],
  },
  {
    id: "product",
    label: "Product and FAANG core",
    chip: "FAANG core",
    icon: <Target weight="duotone" />,
    desc: "Handpicked pattern sets for high-bar interviews at top tech companies.",
    slugs: ["striver-sde", "neetcode-150"],
  },
  {
    id: "revision",
    label: "Rapid interview sprint",
    chip: "Rapid sprint",
    icon: <Lightning weight="duotone" />,
    desc: "A short, high-signal sheet for a fast review in the last 30 days.",
    slugs: ["blind-75"],
  },
];

const SHEET_METADATA_MAP = {
  "love-babbar": { icon: <Star weight="duotone" />, highlight: "Thorough coverage of the data structures and algorithms", recommended: false, defaultCategoryId: "foundation" },
  "striver-a2z": { icon: <Stack weight="duotone" />, highlight: "Basics to advanced, in Striver's module order", recommended: true, defaultCategoryId: "foundation" },
  "striver-sde": { icon: <Target weight="duotone" />, highlight: "Handpicked problems for core tech rounds", recommended: true, defaultCategoryId: "product" },
  "neetcode-150": { icon: <CodeBlock weight="duotone" />, highlight: "Pattern-based preparation for big-tech interviews", recommended: false, defaultCategoryId: "product" },
  "blind-75": { icon: <CheckSquare weight="duotone" />, highlight: "The essential 75-problem pre-interview checklist", recommended: true, defaultCategoryId: "revision" },
};

const SheetCard = ({ sheet, index, progress }) => {
  const calm = useReducedMotion();
  const pct = progress && progress.total > 0 ? Math.round((progress.solved / progress.total) * 100) : 0;
  return (
    <MotionLink
      to={`/dsa/${sheet.slug}`}
      initial={calm ? { opacity: 0 } : { opacity: 0, transform: "translate3d(0, 12px, 0)" }}
      animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      transition={calm ? { duration: 0.2 } : { duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: (index % 2) * 0.04 }}
      className="group relative flex flex-col surface-card p-6 text-left surface-card-link"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-3xl text-brand">
          {sheet.icon}
        </span>
        {sheet.recommended && (
          <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 font-ui text-xs font-semibold text-brand">Top pick</span>
        )}
      </div>

      <h3 className="mt-5 font-display text-xl font-extrabold tracking-tight text-fg">{sheet.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{sheet.highlight}</p>

      <p className="mt-4 font-ui text-sm text-fg-3">
        <span className="font-bold text-fg">{sheet.count} problems</span>
        <span className="text-muted"> · {sheet.difficulty}</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {sheet.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md border border-ink/[0.08] bg-ink/[0.03] px-2 py-0.5 font-ui text-xs text-muted">{tag}</span>
        ))}
      </div>

      {progress && (
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between font-ui text-sm text-muted">
            <span>{progress.solved} of {progress.total} solved</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.08]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Your progress on ${sheet.title}`}>
            <div className="bar-fill h-full w-full rounded-full" style={{ transform: `scaleX(${pct / 100})`, background: 'var(--brand-grad-bottom)' }} />
          </div>
        </div>
      )}

      <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold text-brand">
        Open sheet
        <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
      </span>
    </MotionLink>
  );
};

const Sheets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dbSheets, setDbSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState({});

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
        icon: <CodeBlock weight="duotone" />,
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
        icon: meta.icon,
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
            DSA problem <span className="text-brand">sheets.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {totalProblemCount > 0 ? `${totalProblemCount} problems in ${enrichedSheets.length} curated sheets.` : "Curated problem sheets."}{" "}
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
            {[{ id: "all", chip: "All sheets", icon: null }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                aria-pressed={activeCategory === c.id}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-[transform,color,background-color] duration-150 cursor-pointer select-none ${
                  activeCategory === c.id ? "amber-specular-button font-bold" : "titanium-button text-muted hover:text-fg"
                }`}
              >
                {c.icon && <span className="text-lg">{c.icon}</span>}
                {c.chip}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : searchTerm === "" ? (
          <div className="space-y-14">
            {visibleCategories.map((cat) => (
              <section key={cat.id} aria-labelledby={`sheets-${cat.id}`}>
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-ink/[0.1] pb-4">
                  <div className="min-w-0">
                    <h2 id={`sheets-${cat.id}`} className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-fg">{cat.label}</h2>
                    <p className="mt-1 text-sm text-muted">{cat.desc}</p>
                  </div>
                  <span className="shrink-0 font-ui text-sm text-muted">{cat.sheets.length} {cat.sheets.length === 1 ? "sheet" : "sheets"}</span>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {cat.sheets.map((sheet, i) => <SheetCard key={sheet.slug} sheet={sheet} index={i} progress={progress[sheet.slug]} />)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div>
            <p className="mb-6 font-ui text-sm text-muted" role="status">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
            {filtered.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {filtered.map((sheet, i) => <SheetCard key={sheet.slug} sheet={sheet} index={i} progress={progress[sheet.slug]} />)}
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
