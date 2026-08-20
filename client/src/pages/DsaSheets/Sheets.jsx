import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaStar, FaCode, FaCheckCircle, FaExternalLinkAlt } from "react-icons/fa";
import { FiBook, FiTarget, FiZap, FiLayers } from "react-icons/fi";
import { dsaSheet } from "../../api/services/sheetService";

const CATEGORY_DEFINITIONS = [
  {
    id: "foundation",
    label: "Build Your Foundation",
    icon: <FiBook className="text-xl" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    activeBorder: "border-blue-500",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    desc: "Start from scratch and master every DSA concept. Best for beginners starting their prep journey.",
    slugs: ["love-babbar", "striver-a2z"],
  },
  {
    id: "product",
    label: "Product-Based Companies",
    icon: <FiTarget className="text-xl" />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    activeBorder: "border-orange-500",
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/20",
    desc: "Focused sets targeting FAANG / MNCs. High-quality questions interview teams actually ask.",
    slugs: ["striver-sde", "neetcode-150"],
  },
  {
    id: "revision",
    label: "Last-Minute Revision",
    icon: <FiZap className="text-xl" />,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    activeBorder: "border-red-500",
    badge: "bg-red-500/15 text-red-300 border-red-500/20",
    desc: "Interview tomorrow? These compact sheets cover the essentials every SDE must know — fast.",
    slugs: ["blind-75"],
  },
];

const SHEET_METADATA_MAP = {
  "love-babbar": {
    icon: <FaStar className="text-yellow-400" />,
    highlight: "Most loved for structured learning",
    recommended: false,
    defaultCategoryId: "foundation",
  },
  "striver-a2z": {
    icon: <FiLayers className="text-blue-400" />,
    highlight: "Best paired with YouTube series",
    recommended: true,
    defaultCategoryId: "foundation",
  },
  "striver-sde": {
    icon: <FiTarget className="text-orange-400" />,
    highlight: "Handpicked for top companies",
    recommended: true,
    defaultCategoryId: "product",
  },
  "neetcode-150": {
    icon: <FaCode className="text-green-400" />,
    highlight: "Pattern-based FAANG prep",
    recommended: false,
    defaultCategoryId: "product",
  },
  "blind-75": {
    icon: <FaCheckCircle className="text-red-400" />,
    highlight: "The go-to pre-interview checklist",
    recommended: true,
    defaultCategoryId: "revision",
  },
};

const SheetCard = ({ sheet, cat }) => (
  <div className="group bg-[#111] border border-white/[0.06] hover:border-white/[0.15] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 relative overflow-hidden">
    {sheet.recommended && (
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-2.5 py-0.5">
        <FaStar className="text-[#ffa116] text-[10px]" />
        <span className="text-[#ffa116] text-[10px] font-bold uppercase tracking-wider">Top Pick</span>
      </div>
    )}
    <div className="flex flex-col mb-4">
      <div className={`p-2.5 rounded-xl w-fit ${cat.bg} group-hover:scale-110 transition-transform duration-300 mb-4`}>
        {sheet.icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#ffa116] transition-colors">{sheet.title}</h3>
      <p className="text-xs text-gray-500 italic mb-2">{sheet.highlight}</p>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cat.badge} border`}>
          {sheet.count} Problems
        </span>
        <span className="text-xs text-gray-400">{sheet.difficulty}</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5 mb-5">
      {(sheet.tags || []).map((tag, idx) => (
        <span key={idx} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-gray-400">
          {tag}
        </span>
      ))}
    </div>
    <Link to={`/dsa/${sheet.slug}`} className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 group-hover:bg-[#ffa116] group-hover:text-black group-hover:border-[#ffa116] font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2">
      View Sheet <FaExternalLinkAlt className="text-[10px]" />
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
        icon: <FaCode className="text-[#ffa116]" />,
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
    <div className="px-6 pb-4 max-w-7xl mx-auto page-enter">
      <div className="mb-10 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-3 py-1 mb-4">
          <FaCode /> {totalProblemCount > 0 ? `${totalProblemCount}+ Problems` : "1200+ Problems"}
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          DSA Problem <span className="text-[#ffa116]">Sheets</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-base leading-relaxed">
          Sheets organised by your goal — building foundations, targeting top companies, or a last-minute sprint.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Search sheets or tags..."
            className="w-full bg-[#111] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#ffa116] focus:shadow-[0_0_0_3px_rgba(255,161,22,0.1)] rounded-xl py-3 pl-12 pr-4 outline-none transition-all text-sm text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveCategory("all")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${activeCategory === "all" ? "bg-[#ffa116] text-black border-[#ffa116]" : "bg-[#111] border-white/[0.08] text-gray-400 hover:text-white"}`}>
            All Sheets
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${activeCategory === c.id ? `${c.bg} ${c.color} ${c.activeBorder}` : "bg-[#111] border-white/[0.08] text-gray-400 hover:text-white"}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl skeleton-shine" />
              <div className="w-48 h-6 rounded skeleton-shine" />
              <div className="w-32 h-3 rounded skeleton-shine" />
              <div className="w-full h-10 rounded-xl skeleton-shine" />
            </div>
          ))}
        </div>
      ) : searchTerm === "" ? (
        <div className="space-y-14">
          {visibleCategories.map((cat) => (
            <div key={cat.id}>
              <div className={`flex items-center gap-4 p-5 rounded-2xl border ${cat.border} ${cat.bg} mb-6`}>
                <div className={`w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center ${cat.color} flex-shrink-0`}>{cat.icon}</div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${cat.color}`}>{cat.label}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">{cat.desc}</p>
                </div>
                <div className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cat.badge}`}>
                  {cat.sheets.length} {cat.sheets.length === 1 ? "sheet" : "sheets"}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {cat.sheets.map((sheet, i) => <SheetCard key={i} sheet={sheet} cat={cat} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-gray-500 text-sm mb-6">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((sheet, i) => {
                const cat = categories.find((c) => c.id === sheet.categoryId) || categories[0];
                return <SheetCard key={i} sheet={sheet} cat={cat} />;
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500 border border-dashed border-white/[0.08] rounded-3xl">
              <FaSearch className="text-3xl mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">No sheets found</p>
              <p className="text-sm">Try a different search or category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sheets;