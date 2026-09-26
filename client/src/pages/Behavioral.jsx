import React, { useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiMessageSquare, FiZap, FiUsers, FiTarget, FiCpu, FiStar } from "react-icons/fi";
import { behavioralQuestions } from "../data/behavioralQuestions";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { label: "All", icon: <FiStar /> },
  { label: "Personal", icon: <FiTarget /> },
  { label: "Teamwork", icon: <FiUsers /> },
  { label: "Problem Solving", icon: <FiCpu /> },
  { label: "Leadership", icon: <FiZap /> },
];

const CATEGORY_COLORS = {
  Personal:        { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/25" },
  Teamwork:        { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  "Problem Solving":{ text: "text-purple-400", bg: "bg-purple-500/10",  border: "border-purple-500/25" },
  Leadership:      { text: "text-[#ffa116]",   bg: "bg-[#ffa116]/10",   border: "border-[#ffa116]/25" },
};

const QuestionCard = ({ q }) => {
  const [open, setOpen] = useState(false);
  const catStyle = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.Personal;

  return (
    <div
      className={`group bg-[#0c0c0e] border rounded-2xl overflow-hidden transition-colors duration-200 shadow-md text-left
        ${open ? `border-[#ffa116]/40` : `border-white/[0.08] hover:border-white/[0.18]`}`}
    >
      {/* Question row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 sm:px-6 py-5 flex items-start gap-4 focus:outline-none cursor-pointer"
      >
        {/* Number badge */}
        <span className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-mono font-bold text-zinc-400">
          {String(q.id).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${catStyle.text} ${catStyle.bg} ${catStyle.border}`}
            >
              {q.category}
            </span>
          </div>
          <h3 className={`text-base font-semibold leading-snug transition-colors duration-200 ${open ? "text-[#ffa116]" : "text-zinc-100 group-hover:text-white"}`}>
            {q.question}
          </h3>
        </div>

        <motion.div 
          animate={{ rotate: open ? 180 : 0 }} 
          transition={{ type: "spring", damping: 20, stiffness: 320 }}
          className={`flex-shrink-0 mt-1 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors duration-200
            ${open ? "bg-[#ffa116]/15 border-[#ffa116]/30 text-[#ffa116]" : "bg-white/[0.04] border-white/[0.08] text-zinc-400 group-hover:text-white"}`}
        >
          <FiChevronDown className="text-sm" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-5 sm:px-6 py-6 bg-[#0a0a0c]">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Strategy / Tip */}
                <div className="rounded-xl bg-[#ffa116]/[0.03] border border-[#ffa116]/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#ffa116]/15 flex items-center justify-center">
                      <FiZap className="text-[#ffa116] text-xs" />
                    </div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ffa116]">Evaluation Strategy</span>
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">{q.tip}</p>
                </div>

                {/* Example Answer */}
                <div className="rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
                      <FiMessageSquare className="text-emerald-400 text-xs" />
                    </div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">STAR Model Answer</span>
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed italic">"{q.exampleAnswer}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Behavioral = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredQuestions = behavioralQuestions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalByCategory = (cat) =>
    cat === "All" ? behavioralQuestions.length : behavioralQuestions.filter((q) => q.category === cat).length;

  return (
    <div className="px-4 sm:px-6 pb-12 max-w-4xl mx-auto page-enter text-left">

      {/* ── Header ── */}
      <div className="mb-8 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
          <span className="tracking-wider uppercase font-semibold text-zinc-300">
            {behavioralQuestions.length} Curated Questions // STAR Methodology
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-[-0.035em] mb-2.5">
          Behavioral Interview Studio
        </h1>
        <p className="text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed">
          Master the behavioral and leadership rounds for top-tier tech roles. Practice curated question archetypes with STAR answer frameworks and strategic evaluation signals.
        </p>
      </div>

      {/* ── STAR Method callout ── */}
      <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-5 sm:p-6 mb-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/25 flex items-center justify-center">
            <FiStar className="text-[#ffa116] text-lg" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-base mb-1">The STAR Formulation Model</p>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Structure every response cleanly: <strong className="text-white font-mono">Situation → Task → Action → Result</strong>.
              Always quantify the delta impact (e.g., latency dropped by 42%, incident resolution time halved).
            </p>
            <div className="flex flex-wrap gap-2 mt-3.5">
              {[
                { name: "Situation", desc: "Context & stakes" },
                { name: "Task", desc: "Your responsibility" },
                { name: "Action", desc: "Technical decisions" },
                { name: "Result", desc: "Quantified metric" }
              ].map((s) => (
                <div key={s.name} className="px-3 py-1.5 rounded-lg bg-[#121216] border border-white/[0.08] text-xs">
                  <span className="font-mono font-bold text-[#ffa116] mr-1.5">{s.name}:</span>
                  <span className="text-zinc-400">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col gap-3.5 mb-8">
        {/* Search bar */}
        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
          <input
            type="text"
            placeholder="Search interview question archetypes..."
            className="w-full bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#ffa116] rounded-xl py-3 pl-11 pr-4 outline-none transition-colors text-sm text-white placeholder-zinc-500 font-mono"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border transition-all duration-150 active:scale-95 cursor-pointer min-h-[44px]
                  ${isActive
                    ? "bg-[#ffa116] text-black border-[#ffa116]"
                    : "bg-[#0c0c0e] border-white/[0.08] text-zinc-400 hover:border-white/[0.18] hover:text-white"
                  }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md
                  ${isActive ? "bg-black/20 text-black" : "bg-white/[0.06] text-zinc-400"}`}>
                  {totalByCategory(cat.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Questions List ── */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => (
          <QuestionCard key={q.id} q={q} />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="py-16 text-center text-zinc-400 border border-white/[0.08] rounded-2xl bg-[#0c0c0e]">
            <FiSearch className="text-3xl mx-auto mb-2 text-zinc-600" />
            <p className="text-base font-semibold text-white mb-1">No questions match criteria</p>
            <p className="text-xs font-mono text-zinc-500">Try adjusting your search keywords or switching category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Behavioral;
