import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MagnifyingGlass, CaretDown, ChatCircleText, ListNumbers, Lightning, Target, UsersThree, Flag, WarningCircle, Star, Clock, Question, PencilSimple, Heart, ArrowRight } from "@phosphor-icons/react";
import { behavioralQuestions, CATEGORIES as CATEGORY_NAMES } from "../data/behavioralQuestions";
import { EmptyState } from "../components/ui/StateComponents";
import PageBackdrop from "../components/ui/PageBackdrop";

const iconProps = { weight: "duotone", "aria-hidden": "true" };
const CATEGORY_ICONS = {
  Personal: <Target {...iconProps} />,
  Teamwork: <UsersThree {...iconProps} />,
  Conflict: <Flag {...iconProps} />,
  "Failure and learning": <WarningCircle {...iconProps} />,
  Leadership: <Lightning {...iconProps} />,
  "Taking responsibility": <Star {...iconProps} />,
  "Deadlines and pressure": <Clock {...iconProps} />,
  "Unclear situations and learning": <Question {...iconProps} />,
  Feedback: <PencilSimple {...iconProps} />,
  Motivation: <Heart {...iconProps} />,
};

const CATEGORIES = [{ label: "All", icon: <Star {...iconProps} /> }, ...CATEGORY_NAMES.map((label) => ({ label, icon: CATEGORY_ICONS[label] }))];

const STAR = [
  { letter: "S", name: "Situation", desc: "What was happening" },
  { letter: "T", name: "Task", desc: "What you had to do" },
  { letter: "A", name: "Action", desc: "What you did" },
  { letter: "R", name: "Result", desc: "What happened next" },
];
const STAR_LETTERS = STAR.map((s) => s.name);

const CARD = "surface-card";

const PartTitle = ({ icon, children, className }) => (
  <p className={`mb-3 flex items-center gap-2 font-ui text-sm font-bold ${className}`}>
    <span aria-hidden="true" className="text-base">{icon}</span>
    {children}
  </p>
);

const QuestionCard = ({ q }) => {
  const [open, setOpen] = useState(false);
  const calm = useReducedMotion();

  return (
    <div
      className={`group overflow-hidden rounded-2xl border bg-card text-left transition-[border-color,box-shadow] duration-200 ${
        open ? "border-ink/[0.16] shadow-[0_18px_34px_-24px_color-mix(in_srgb,var(--shadow)_45%,transparent)]" : "border-ink/[0.1] hover:border-ink/[0.2]"
      }`}
    >
      <h3 className="m-0">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={`answer-${q.id}`}
          className="flex w-full cursor-pointer items-start gap-4 px-5 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand sm:px-6"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/[0.1] font-ui text-xs font-bold text-muted">
            {String(q.id).padStart(2, "0")}
          </span>

          <span className="min-w-0 flex-1">
            <span className="mb-1 block font-ui text-xs font-semibold text-brand">{q.category}</span>
            <span className={`block font-display text-base font-extrabold leading-snug tracking-tight transition-colors duration-200 sm:text-lg ${open ? "text-brand" : "text-fg"}`}>
              {q.question}
            </span>
          </span>

          <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition-[transform,color] duration-200 ${open ? "rotate-180 border-brand/30 bg-brand/10 text-brand" : "border-ink/[0.1] text-muted"}`}>
            <CaretDown aria-hidden="true" />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={`answer-${q.id}`}
            role="region"
            aria-label={`Answer help for: ${q.question}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={calm ? { duration: 0.15 } : { height: { type: "spring", duration: 0.45, bounce: 0 }, opacity: { duration: 0.25, delay: 0.05 } }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-ink/[0.08] px-5 py-6 sm:px-6">
              <div className="rounded-xl border border-brand/20 bg-brand/[0.05] p-5">
                <PartTitle icon={<Lightning weight="duotone" />} className="text-brand">What the interviewer is looking for</PartTitle>
                <p className="text-sm leading-relaxed text-fg-3">{q.checks}</p>
              </div>

              <div className="rounded-xl border border-ink/[0.1] bg-ink/[0.02] p-5">
                <PartTitle icon={<ListNumbers weight="duotone" />} className="text-fg-3">Plan your answer (STAR)</PartTitle>
                <p className="mb-3 text-sm leading-relaxed text-muted">If the question does not ask about one past event, use the four steps as a guide and give an example from your own life.</p>
                <ol className="space-y-2">
                  {q.star.map((hint, i) => (
                    <li key={STAR_LETTERS[i]} className="text-sm leading-relaxed text-fg-3">
                      <span className="mr-1.5 font-ui font-bold text-brand">{STAR_LETTERS[i]}:</span>
                      {hint}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl border border-ink/[0.1] bg-ink/[0.02] p-5">
                <PartTitle icon={<ChatCircleText weight="duotone" />} className="text-fg-3">Example answer (made up: use your own true story, do not copy it)</PartTitle>
                <p className="border-l-2 border-brand/40 pl-4 text-sm italic leading-relaxed text-fg-3">"{q.exampleAnswer}"</p>
              </div>

              <div className="rounded-xl border border-bad-solid/20 bg-bad-solid/[0.04] p-5">
                <PartTitle icon={<WarningCircle weight="duotone" />} className="text-bad">Mistakes to avoid</PartTitle>
                <ul className="list-disc space-y-1.5 pl-5">
                  {q.mistakes.map((m) => (
                    <li key={m} className="text-sm leading-relaxed text-fg-3">{m}</li>
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
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16 text-left sm:px-6">
        <div className="mb-10 pt-2">
          <p className="mb-3 font-ui text-sm font-semibold text-fg-3">
            {behavioralQuestions.length} questions in {CATEGORY_NAMES.length} groups
          </p>
          <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">
            Behavioral <span className="text-brand">interview prep.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Behavioral questions ask about things you did in the past, like working in a team or fixing a mistake. For each question you get what the interviewer is looking for, a plan for your answer, an example and mistakes to avoid.
          </p>
          <Link to="/analyzer" className="group mt-4 inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-brand">
            Get questions picked for a specific job with the Role Analyzer
            <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* The STAR method */}
        <div className={`${CARD} mb-10 p-5 sm:p-7`}>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-fg">The STAR way to answer</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-3">
            Tell one real, true story in four parts. Spend most of your time on the Action, the part that shows what you did. Use "I" for your own part, keep it to about one to two minutes, and add a number to the result when you can (for example, "the page loaded in half the time").
          </p>
          <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAR.map((s) => (
              <li key={s.name} className="rounded-xl border border-ink/[0.1] bg-ink/[0.02] p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 font-display text-sm font-black text-brand">{s.letter}</span>
                <p className="mt-3 font-display text-sm font-extrabold tracking-tight text-fg">{s.name}</p>
                <p className="mt-0.5 text-sm leading-snug text-muted">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-8 flex flex-col gap-4">
          <div className="relative w-full">
            <MagnifyingGlass aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              aria-label="Search questions"
              placeholder="Search questions..."
              className="w-full rounded-xl border border-ink/[0.1] bg-card py-3 pl-11 pr-4 font-ui text-sm text-fg placeholder-faint outline-none transition-colors hover:border-ink/[0.18] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)]"
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
                  className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 font-ui text-sm font-semibold transition-colors duration-150 active:scale-[0.97] ${
                    isActive
                      ? "amber-specular-button border-transparent text-on-brand"
                      : "border-ink/[0.1] bg-card text-muted hover:border-ink/[0.2] hover:text-fg"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${isActive ? "bg-scrim/20 text-on-brand" : "bg-ink/[0.06] text-muted"}`}>
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
            <EmptyState icon={MagnifyingGlass} title="No questions match" text="Try different search words or another group." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Behavioral;
