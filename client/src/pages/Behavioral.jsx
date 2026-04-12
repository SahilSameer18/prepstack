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
  Personal:        { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    dot: "#60a5fa" },
  Teamwork:        { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "#34d399" },
  "Problem Solving":{ text: "text-purple-400", bg: "bg-purple-500/10",  border: "border-purple-500/20",  dot: "#c084fc" },
  Leadership:      { text: "text-[#ffa116]",   bg: "bg-[#ffa116]/10",   border: "border-[#ffa116]/20",   dot: "#ffa116" },
};

const QuestionCard = ({ q, index }) => {
  const [open, setOpen] = useState(false);
  const catStyle = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.Personal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`group bg-[#0f0f0f] border rounded-2xl overflow-hidden transition-all duration-300
        ${open ? `border-[#ffa116]/40 shadow-[0_0_30px_rgba(255,161,22,0.06)]` : `border-white/[0.07] hover:border-white/[0.14]`}`}
    >
      {/* Question row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-start gap-4 focus:outline-none"
      >
        {/* Number badge */}
        <span className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[11px] font-bold text-gray-500">
          {String(q.id).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${catStyle.text} ${catStyle.bg} ${catStyle.border}`}
            >
              {q.category}
            </span>
          </div>
          <h3 className={`text-base font-semibold leading-snug transition-colors duration-200 ${open ? "text-[#ffa116]" : "text-gray-100 group-hover:text-white"}`}>
            {q.question}
          </h3>
        </div>

        <div className={`flex-shrink-0 mt-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200
          ${open ? "bg-[#ffa116]/15 text-[#ffa116]" : "bg-white/[0.04] text-gray-500 group-hover:bg-white/[0.08]"}`}
        >
          {open ? <FiChevronUp className="text-sm" /> : <FiChevronDown className="text-sm" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-6 py-6">
              <div className="grid md:grid-cols-2 gap-5">
                {/* Strategy / Tip */}
                <div className="rounded-xl bg-[#ffa116]/[0.04] border border-[#ffa116]/[0.12] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#ffa116]/15 flex items-center justify-center">
                      <FiZap className="text-[#ffa116] text-xs" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#ffa116]">The Strategy</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{q.tip}</p>
                </div>

                {/* Example Answer */}
                <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.12] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
                      <FiMessageSquare className="text-emerald-400 text-xs" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Example Answer</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed italic">"{q.exampleAnswer}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
    <div className="px-6 pb-12 max-w-4xl mx-auto page-enter">

      {/* ── Header ── */}
      <div className="mb-10 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-3 py-1 mb-4">
          <FiMessageSquare /> {behavioralQuestions.length} Questions
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          Behavioral <span className="text-[#ffa116]">Questions</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-base leading-relaxed">
          Master the HR round. Practice curated behavioral questions with expert strategy tips and structured example answers.
        </p>
      </div>

      {/* ── STAR Method callout ── */}
      <div className="relative bg-gradient-to-br from-[#ffa116]/[0.06] to-[#ff8c00]/[0.02] border border-[#ffa116]/20 rounded-2xl p-5 mb-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ffa116]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#ffa116]/15 flex items-center justify-center">
            <FiStar className="text-[#ffa116] text-lg" />
          </div>
          <div>
            <p className="font-bold text-white mb-1">Use the <span className="text-[#ffa116]">STAR Method</span></p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Structure every answer with <strong className="text-gray-300">Situation → Task → Action → Result</strong>.
              Quantify your impact wherever possible — numbers make stories memorable.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Situation", "Task", "Action", "Result"].map((s, i) => (
                <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/20 text-[#ffa116]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search bar */}
        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full bg-[#111] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#ffa116] focus:shadow-[0_0_0_3px_rgba(255,161,22,0.1)] rounded-xl py-3 pl-12 pr-4 outline-none transition-all text-sm text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.label;
            const style = CATEGORY_COLORS[cat.label] || {};
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-200
                  ${isActive
                    ? "bg-[#ffa116] text-black border-[#ffa116] shadow-md shadow-[#ffa116]/20"
                    : "bg-[#111] border-white/[0.08] text-gray-400 hover:border-white/[0.2] hover:text-white"
                  }`}
              >
                {cat.icon}
                {cat.label}
                <span className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${isActive ? "bg-black/20 text-black" : "bg-white/[0.06] text-gray-500"}`}>
                  {totalByCategory(cat.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Questions List ── */}
      <div className="space-y-3">
        {filteredQuestions.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i} />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="py-20 text-center text-gray-500 border border-dashed border-white/[0.08] rounded-3xl bg-[#0f0f0f]">
            <FiSearch className="text-3xl mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium mb-1">No questions found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Behavioral;