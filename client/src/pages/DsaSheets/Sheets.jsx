import React, { useState } from "react";
import { FaSearch, FaStar, FaCode, FaCheckCircle, FaExternalLinkAlt } from "react-icons/fa";
import { FiBook, FiTarget, FiZap, FiLayers } from "react-icons/fi";

const categories = [
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
    sheets: [
      {
        title: "Love Babbar DSA Sheet",
        slug: "love-babbar",
        count: 450,
        difficulty: "Beginner → Intermediate",
        tags: ["Comprehensive", "GFG Based", "Topic-wise"],
        icon: <FaStar className="text-yellow-400" />,
        recommended: true,
        highlight: "Most loved for structured learning",
      },
      {
        title: "Striver A2Z Sheet",
        slug: "striver-a2z",
        count: 455,
        difficulty: "Beginner → Advanced",
        tags: ["Structured", "Video Walkthrough", "Pattern-based"],
        icon: <FiLayers className="text-blue-400" />,
        recommended: false,
        highlight: "Best paired with YouTube series",
      },
    ],
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
    sheets: [
      {
        title: "Striver SDE Sheet",
        slug: "striver-sde",
        count: 191,
        difficulty: "Intermediate → Advanced",
        tags: ["FAANG Patterns", "Must Solve", "Interview Focused"],
        icon: <FiTarget className="text-orange-400" />,
        recommended: true,
        highlight: "Handpicked for top companies",
      },
      {
        title: "NeetCode 150",
        slug: "neetcode-150",
        count: 150,
        difficulty: "Advanced",
        tags: ["LeetCode Patterns", "Video Solutions", "Concise"],
        icon: <FaCode className="text-green-400" />,
        recommended: false,
        highlight: "Pattern-based FAANG prep",
      },
    ],
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
    sheets: [
      {
        title: "Blind 75",
        slug: "blind-75",
        count: 75,
        difficulty: "Intermediate → Advanced",
        tags: ["Essential", "Time-boxed", "Widely Recommended"],
        icon: <FaCheckCircle className="text-red-400" />,
        recommended: true,
        highlight: "The go-to pre-interview checklist",
      },
    ],
  },
];

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
      {sheet.tags.map((tag, idx) => (
        <span key={idx} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-gray-400">
          {tag}
        </span>
      ))}
    </div>
    <button className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 group-hover:bg-[#ffa116] group-hover:text-black group-hover:border-[#ffa116] font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2">
      View Sheet <FaExternalLinkAlt className="text-[10px]" />
    </button>
  </div>
);

const Sheets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const allSheets = categories.flatMap((c) =>
    c.sheets.map((s) => ({ ...s, categoryId: c.id }))
  );

  const filtered = allSheets.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = activeCategory === "all" || s.categoryId === activeCategory;
    return matchSearch && matchCat;
  });

  const visibleCategories = activeCategory === "all"
    ? categories
    : categories.filter((c) => c.id === activeCategory);

  return (
    <div className="px-6 pb-4 max-w-7xl mx-auto">
      <div className="mb-10 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-3 py-1 mb-4">
          <FaCode /> 1200+ Problems
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

      {searchTerm === "" ? (
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
                const cat = categories.find((c) => c.id === sheet.categoryId);
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