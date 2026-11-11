import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiChevronDown, FiMessageSquare, FiZap, FiUsers, FiTarget, FiCpu, FiStar, FiAlertTriangle, FiList, FiHeart, FiClock, FiEdit3, FiFlag } from "react-icons/fi";
import { behavioralQuestions, CATEGORIES as CATEGORY_NAMES } from "../data/behavioralQuestions";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "../components/ui/StateComponents";

const CATEGORY_ICONS = {
  Personal: <FiTarget />,
  Teamwork: <FiUsers />,
  Conflict: <FiFlag />,
  "Failure and learning": <FiAlertTriangle />,
  Leadership: <FiZap />,
  "Taking responsibility": <FiStar />,
  "Deadlines and pressure": <FiClock />,
  "Unclear situations and learning": <FiCpu />,
  Feedback: <FiEdit3 />,
  Motivation: <FiHeart />,
};

const CATEGORIES = [{ label: "All", icon: <FiStar /> }, ...CATEGORY_NAMES.map((label) => ({ label, icon: CATEGORY_ICONS[label] }))];

const CATEGORY_COLORS = {
  Personal: { text: "text-info", bg: "bg-info-solid/10", border: "border-info-solid/25" },
  Teamwork: { text: "text-ok", bg: "bg-ok-solid/10", border: "border-ok-solid/25" },
  Conflict: { text: "text-bad", bg: "bg-bad-solid/10", border: "border-bad-solid/25" },
  "Failure and learning": { text: "text-warn", bg: "bg-warn-solid/10", border: "border-warn-solid/25" },
  Leadership: { text: "text-brand", bg: "bg-brand/10", border: "border-brand/25" },
  "Taking responsibility": { text: "text-violet", bg: "bg-violet-solid/10", border: "border-violet-solid/25" },
  "Deadlines and pressure": { text: "text-warn", bg: "bg-warn-solid/10", border: "border-warn-solid/25" },
  "Unclear situations and learning": { text: "text-info", bg: "bg-info-solid/10", border: "border-info-solid/25" },
  Feedback: { text: "text-ok", bg: "bg-ok-solid/10", border: "border-ok-solid/25" },
  Motivation: { text: "text-violet", bg: "bg-violet-solid/10", border: "border-violet-solid/25" },
};

const STAR_LETTERS = ["Situation", "Task", "Action", "Result"];

const PartTitle = ({ icon, children, className }) => (
  <div className="flex items-center gap-2 mb-3">
    <div aria-hidden="true" className="w-6 h-6 rounded-md bg-ink/[0.06] flex items-center justify-center">{icon}</div>
    <span className={`text-xs font-ui font-bold uppercase tracking-wider ${className}`}>{children}</span>
  </div>
);

const QuestionCard = ({ q }) => {
  const [open, setOpen] = useState(false);
  const catStyle = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.Personal;

  return (
    <div
      className={`group bg-card border rounded-2xl overflow-hidden transition-colors duration-200 shadow-md text-left
        ${open ? "border-brand/40" : "border-ink/[0.08] hover:border-ink/[0.18]"}`}
    >
      <h3 className="m-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`answer-${q.id}`}
        className="w-full text-left px-5 sm:px-6 py-5 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
      >
        <span className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-ink/[0.04] border border-ink/[0.08] flex items-center justify-center text-xs font-ui font-bold text-muted">
          {String(q.id).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-ui font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${catStyle.text} ${catStyle.bg} ${catStyle.border}`}>
              {q.category}
            </span>
          </div>
          <span className={`block text-base font-semibold leading-snug transition-colors duration-200 ${open ? "text-brand" : "text-fg-1 group-hover:text-fg"}`}>
            {q.question}
          </span>
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 320 }}
          className={`flex-shrink-0 mt-1 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors duration-200
            ${open ? "bg-brand/15 border-brand/30 text-brand" : "bg-ink/[0.04] border-ink/[0.08] text-muted group-hover:text-fg"}`}
        >
          <FiChevronDown aria-hidden="true" className="text-sm" />
        </motion.div>
      </button>
      </h3>

      <AnimatePresence>
        {open && (
          <motion.div
            key="content"
            id={`answer-${q.id}`}
            role="region"
            aria-label={`Answer help for: ${q.question}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink/[0.06] px-5 sm:px-6 py-6 bg-card space-y-4">
              <div className="rounded-xl bg-brand/[0.03] border border-brand/20 p-5">
                <PartTitle icon={<FiZap className="text-brand text-xs" />} className="text-brand">What the interviewer is looking for</PartTitle>
                <p className="text-fg-3 text-sm leading-relaxed">{q.checks}</p>
              </div>

              <div className="rounded-xl bg-card-hover border border-ink/[0.08] p-5">
                <PartTitle icon={<FiList className="text-muted text-xs" />} className="text-muted">Plan your answer (STAR)</PartTitle>
                <p className="text-xs text-muted mb-3">If the question does not ask about one past event, use the four steps as a guide and give an example from your own life.</p>
                <ol className="space-y-2">
                  {q.star.map((hint, i) => (
                    <li key={STAR_LETTERS[i]} className="text-sm text-fg-3 leading-relaxed">
                      <span className="font-ui font-bold text-brand mr-1.5">{STAR_LETTERS[i]}:</span>
                      {hint}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl bg-ok-solid/[0.03] border border-ok-solid/20 p-5">
                <PartTitle icon={<FiMessageSquare className="text-ok text-xs" />} className="text-ok">Example answer (made up: use your own true story, do not copy it)</PartTitle>
                <p className="text-fg-3 text-sm leading-relaxed italic">"{q.exampleAnswer}"</p>
              </div>

              <div className="rounded-xl bg-bad-solid/[0.03] border border-bad-solid/20 p-5">
                <PartTitle icon={<FiAlertTriangle className="text-bad text-xs" />} className="text-bad">Mistakes to avoid</PartTitle>
                <ul className="space-y-1.5 list-disc pl-5">
                  {q.mistakes.map((m) => (
                    <li key={m} className="text-sm text-fg-3 leading-relaxed">{m}</li>
                  ))}
                </ul>
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
      <div className="mb-8 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-ui text-muted mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span className="tracking-wider font-semibold text-fg-3">
            {behavioralQuestions.length} questions in {CATEGORY_NAMES.length} groups
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-fg tracking-[-0.035em] mb-2.5">
          Behavioral Interview Prep
        </h1>
        <p className="text-muted max-w-2xl text-sm sm:text-base leading-relaxed">
          Behavioral questions ask about things you did in the past, like working in a team or fixing a mistake. For each question you get what the interviewer is looking for, a plan for your answer, an example and mistakes to avoid.
        </p>
        <Link to="/analyzer" className="inline-block mt-3 text-sm text-brand hover:underline">Get questions picked for a specific job with the Role Analyzer &rarr;</Link>
      </div>

      <div className="bg-card border border-ink/[0.08] rounded-2xl p-5 sm:p-6 mb-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center">
            <FiStar className="text-brand text-lg" />
          </div>
          <div>
            <p className="font-display font-bold text-fg text-base mb-1">The STAR way to answer</p>
            <p className="text-fg-3 text-xs sm:text-sm leading-relaxed">
              Tell one real, true story in four parts: <strong className="text-fg font-ui">Situation → Task → Action → Result</strong>. Spend most of your time on the Action, the part that shows what you did. Use "I" for your own part, keep it to about one to two minutes, and add a number to the result when you can (for example, "the page loaded in half the time").
            </p>
            <div className="flex flex-wrap gap-2 mt-3.5">
              {[
                { name: "Situation", desc: "What was happening" },
                { name: "Task", desc: "What you had to do" },
                { name: "Action", desc: "What you did" },
                { name: "Result", desc: "What happened next" },
              ].map((s) => (
                <div key={s.name} className="px-3 py-1.5 rounded-lg bg-card-hover border border-ink/[0.08] text-xs">
                  <span className="font-ui font-bold text-brand mr-1.5">{s.name}:</span>
                  <span className="text-muted">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 mb-8">
        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
          <input
            type="text"
            aria-label="Search questions"
            placeholder="Search questions..."
            className="w-full bg-card border border-ink/[0.08] hover:border-ink/[0.15] focus:border-brand rounded-xl py-3 pl-11 pr-4 outline-none transition-colors text-sm text-fg placeholder-faint font-ui"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-ui font-semibold border transition-all duration-150 active:scale-95 cursor-pointer min-h-[44px]
                  ${isActive
                    ? "bg-brand text-on-brand border-brand"
                    : "bg-card border-ink/[0.08] text-muted hover:border-ink/[0.18] hover:text-fg"
                  }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`text-xs font-ui font-bold px-1.5 py-0.5 rounded-md
                  ${isActive ? "bg-scrim/20 text-on-brand" : "bg-ink/[0.06] text-muted"}`}>
                  {totalByCategory(cat.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{filteredQuestions.length} questions shown</p>
      <div className="space-y-3">
        {filteredQuestions.map((q) => (
          <QuestionCard key={q.id} q={q} />
        ))}

        {filteredQuestions.length === 0 && (
          <EmptyState icon={FiSearch} title="No questions match" text="Try different search words or another group." />
        )}
      </div>
    </div>
  );
};

export default Behavioral;
