import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaStar, FaCode, FaCheckCircle, FaExternalLinkAlt } from "react-icons/fa";
import { FiBook, FiTarget, FiZap, FiLayers } from "react-icons/fi";
import { dsaSheet } from "../../api/services/sheetService";
import { SkeletonCard } from "../../components/ui/Skeletons";
import { EmptyState } from "../../components/ui/StateComponents";

const CATEGORY_DEFINITIONS = [
  {
    id: "foundation",
    label: "Foundation Tracks",
    icon: <FiBook className="text-base" />,
    color: "text-cyan",
    bg: "bg-cyan-solid/10",
    border: "border-cyan-solid/20",
    activeBorder: "border-cyan",
    badge: "bg-cyan-solid/10 text-cyan border-cyan-solid/20",
    desc: "Comprehensive topic-by-topic curriculums to master data structures and algorithms from ground up.",
    slugs: ["love-babbar", "striver-a2z"],
  },
  {
    id: "product",
    label: "Product & FAANG Core",
    icon: <FiTarget className="text-base" />,
    color: "text-brand",
    bg: "bg-brand/10",
    border: "border-brand/20",
    activeBorder: "border-brand",
    badge: "bg-brand/10 text-brand border-brand/20",
    desc: "Handpicked algorithmic pattern sets targeting high-bar technical interviews at top tier tech firms.",
    slugs: ["striver-sde", "neetcode-150"],
  },
  {
    id: "revision",
    label: "Rapid Interview Sprint",
    icon: <FiZap className="text-base" />,
    color: "text-bad",
    bg: "bg-bad-solid/10",
    border: "border-bad-solid/20",
    activeBorder: "border-bad",
    badge: "bg-bad-solid/10 text-bad border-bad-solid/20",
    desc: "Compact high-signal sheets designed for fast 30-day review cycles before scheduled interviews.",
    slugs: ["blind-75"],
  },
];

const SHEET_METADATA_MAP = {
  "love-babbar": {
    icon: <FaStar className="text-warn" />,
    highlight: "Comprehensive 450-question complete coverage",
    recommended: false,
    defaultCategoryId: "foundation",
  },
  "striver-a2z": {
    icon: <FiLayers className="text-cyan" />,
    highlight: "Structured topic-by-topic algorithmic progression",
    recommended: true,
    defaultCategoryId: "foundation",
  },
  "striver-sde": {
    icon: <FiTarget className="text-brand" />,
    highlight: "191 handpicked problems for core tech rounds",
    recommended: true,
    defaultCategoryId: "product",
  },
  "neetcode-150": {
    icon: <FaCode className="text-ok" />,
    highlight: "Pattern-based FAANG preparation superset",
    recommended: false,
    defaultCategoryId: "product",
  },
  "blind-75": {
    icon: <FaCheckCircle className="text-bad" />,
    highlight: "The essential 75 pattern pre-interview checklist",
    recommended: true,
    defaultCategoryId: "revision",
  },
};

const SheetCard = ({ sheet, cat }) => (
  <div className="group titanium-card rounded-2xl p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between text-left">
    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent group-hover:via-brand/50 transition-all" />
    
    {sheet.recommended && (
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-brand/10 border border-brand/30 rounded-full px-2.5 py-0.5 shadow-[0_0_10px_color-mix(in_srgb,var(--brand)_15%,transparent)]">
        <span className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_6px_var(--brand)]" />
        <span className="text-brand text-xs font-ui font-semibold uppercase tracking-wider">Top Pick</span>
      </div>
    )}

    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl w-fit ${cat.bg} border ${cat.border} transition-transform duration-200 group-hover:scale-105`}>
          {sheet.icon}
        </div>
        <span className={`text-xs font-ui font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${cat.badge}`}>
          {cat.label.split(" ")[0]}
        </span>
      </div>

      <h3 className="font-display text-xl font-bold text-fg mb-1.5 group-hover:text-brand transition-colors">
        {sheet.title}
      </h3>
      <p className="text-xs text-muted mb-4 leading-relaxed line-clamp-2">
        {sheet.highlight}
      </p>

      <div className="flex items-center gap-2 mb-4 font-ui text-xs">
        <span className="text-fg font-bold">{sheet.count} Problems</span>
        <span className="text-muted">·</span>
        <span className="text-muted">{sheet.difficulty}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {(sheet.tags || []).map((tag, idx) => (
          <span key={idx} className="text-xs font-ui px-2 py-0.5 rounded-md bg-elevated/90 border border-ink/[0.08] text-muted">
            {tag}
          </span>
        ))}
      </div>
    </div>

    <Link
      to={`/dsa/${sheet.slug}`}
      className="w-full py-3 rounded-xl bg-ink/[0.04] border border-ink/[0.08] text-fg-2 group-hover:amber-specular-button font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm select-none"
    >
      <span>Launch Sheet</span>
      <FaExternalLinkAlt className="text-xs" />
    </Link>
  </div>
);

const Sheets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dbSheets, setDbSheets] = useState([]);
  const [loading, setLoading] = useState(true);

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
      { name: "Striver A2Z Sheet", slug: "striver-a2z", totalProblems: 455, difficulty: "Beginner → Advanced", tags: ["Structured", "Pattern-based"] },
      { name: "Striver SDE Sheet", slug: "striver-sde", totalProblems: 191, difficulty: "Intermediate → Advanced", tags: ["FAANG Patterns", "Must Solve"] },
      { name: "NeetCode 150", slug: "neetcode-150", totalProblems: 150, difficulty: "Advanced", tags: ["LeetCode Patterns", "Concise"] },
      { name: "Blind 75", slug: "blind-75", totalProblems: 75, difficulty: "Intermediate → Advanced", tags: ["Essential", "Time-boxed"] },
    ];

    return source.map((sheet) => {
      const meta = SHEET_METADATA_MAP[sheet.slug] || {
        icon: <FaCode className="text-brand" />,
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
    <div className="px-4 sm:px-6 pb-12 max-w-7xl mx-auto page-enter text-left">
      {/* ── HEADER ── */}
      <div className="mb-10 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-ui font-semibold text-brand bg-brand/10 border border-brand/20 rounded-full px-3 py-1 mb-4">
          <FaCode /> {totalProblemCount > 0 ? `${totalProblemCount}+ Problems` : "1,200+ Problems"}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-fg tracking-tight mb-3">
          DSA Problem <span className="text-brand">Sheets</span>
        </h1>
        <p className="text-muted max-w-2xl text-sm sm:text-base leading-relaxed font-normal">
          Curated algorithmic patterns organized by your preparation timeline, from zero-to-one fundamentals to fast pre-interview review sprints.
        </p>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
          <input
            type="text"
            placeholder="Search sheets or patterns..."
            className="w-full bg-card border border-ink/[0.08] hover:border-ink/[0.15] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_10%,transparent)] rounded-xl py-3 pl-12 pr-4 outline-none transition-colors text-sm text-fg placeholder-faint font-normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 border cursor-pointer select-none ${
              activeCategory === "all"
                ? "amber-specular-button font-bold text-on-brand border-brand"
                : "titanium-button text-muted hover:text-fg"
            }`}
          >
            All sheets
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 border cursor-pointer select-none ${
                activeCategory === c.id
                  ? `${c.bg} ${c.color} ${c.activeBorder} shadow-sm font-bold`
                  : "titanium-button text-muted hover:text-fg"
              }`}
            >
              {c.icon} {c.label}
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
            <div key={cat.id}>
              <div className={`flex items-center gap-4 p-5 rounded-2xl border ${cat.border} ${cat.bg} mb-6 relative overflow-hidden`}>
                <div className={`w-10 h-10 rounded-xl bg-ink/[0.05] border border-ink/[0.08] flex items-center justify-center ${cat.color} flex-shrink-0`}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`font-display text-lg font-bold ${cat.color}`}>{cat.label}</h2>
                  <p className="text-muted text-xs sm:text-sm mt-0.5 leading-relaxed">{cat.desc}</p>
                </div>
                <div className={`hidden sm:flex items-center gap-1.5 text-xs font-ui font-semibold px-3 py-1 rounded-full border ${cat.badge} shrink-0`}>
                  {cat.sheets.length} {cat.sheets.length === 1 ? "track" : "tracks"}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {cat.sheets.map((sheet, i) => <SheetCard key={i} sheet={sheet} cat={cat} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-muted font-ui text-sm mb-6">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((sheet, i) => {
                const cat = categories.find((c) => c.id === sheet.categoryId) || categories[0];
                return <SheetCard key={i} sheet={sheet} cat={cat} />;
              })}
            </div>
          ) : (
            <EmptyState icon={FaSearch} title="No matching sheets found" text="Try searching for a different pattern name or topic." />
          )}
        </div>
      )}
    </div>
  );
};

export default Sheets;