import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MagnifyingGlass, CaretDown, ArrowRight } from "@phosphor-icons/react";
import { behavioralQuestions, CATEGORIES as CATEGORY_NAMES } from "../data/behavioralQuestions";
import { EmptyState } from "../components/ui/StateComponents";
import PageBackdrop from "../components/ui/PageBackdrop";
import Reveal from "../components/ui/Reveal";

const CATEGORIES = ["All", ...CATEGORY_NAMES];

const STAR = [
  { letter: "S", name: "Situation", desc: "What was happening" },
  { letter: "T", name: "Task", desc: "What you had to do" },
  { letter: "A", name: "Action", desc: "What you did" },
  { letter: "R", name: "Result", desc: "What happened next" },
];
const STAR_LETTERS = STAR.map((s) => s.name);

const PartTitle = ({ children, tone = "text-brand" }) => (
  <p className={`mb-2 font-ui text-sm font-semibold ${tone}`}>{children}</p>
);

// One question as a line. Opening it shows what the interviewer is looking for, a plan, an example and mistakes to avoid.
const QuestionRow = ({ q, number }) => {
  const [open, setOpen] = useState(false);
  const calm = useReducedMotion();

  return (
    <div className="border-b border-ink/[0.1] text-left">
      <h3 className="m-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={`answer-${q.id}`}
          className="group flex w-full cursor-pointer items-start gap-5 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
        >
          <span className="mt-1 w-7 shrink-0 font-code text-sm text-muted">{String(number).padStart(2, "0")}</span>
          <span className="min-w-0 flex-1">
            <span className={`block font-display text-base font-bold leading-snug tracking-tight transition-colors duration-200 sm:text-lg ${open ? "text-brand" : "text-fg group-hover:text-brand"}`}>
              {q.question}
            </span>
          </span>
          <CaretDown aria-hidden="true" className={`mt-1.5 shrink-0 text-base transition-[transform,color] duration-200 ${open ? "rotate-180 text-brand" : "text-muted"}`} />
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
            transition={calm ? { duration: 0.15 } : { height: { type: "spring", duration: 0.3, bounce: 0 }, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="space-y-6 pb-8 pl-12 pr-1">
              <div className="rounded-xl bg-brand/[0.07] p-5">
                <PartTitle>What the interviewer is looking for</PartTitle>
                <p className="text-sm leading-relaxed text-fg-3 sm:text-base">{q.checks}</p>
              </div>

              <div>
                <PartTitle tone="text-fg-3">Plan your answer (STAR)</PartTitle>
                <p className="mb-3 text-sm leading-relaxed text-muted">If the question does not ask about one past event, use the four steps as a guide and give an example from your own life.</p>
                <ol className="divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
                  {q.star.map((hint, i) => (
                    <li key={STAR_LETTERS[i]} className="flex gap-3 py-2.5 text-sm leading-relaxed text-fg-3">
                      <span className="w-20 shrink-0 font-ui font-bold text-brand">{STAR_LETTERS[i]}</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <PartTitle tone="text-fg-3">Example answer (made up: use your own true story, do not copy it)</PartTitle>
                <p className="border-l-2 border-brand/40 pl-4 text-sm italic leading-relaxed text-fg-3 sm:text-base">"{q.exampleAnswer}"</p>
              </div>

              <div>
                <PartTitle tone="text-bad">Mistakes to avoid</PartTitle>
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

  const groups = CATEGORY_NAMES
    .map((name) => ({ name, items: filteredQuestions.filter((q) => q.category === name) }))
    .filter((group) => group.items.length > 0);

  const numberOf = new Map(groups.flatMap((g) => g.items).map((q, i) => [q.id, i + 1]));

  const totalByCategory = (cat) =>
    cat === "All" ? behavioralQuestions.length : behavioralQuestions.filter((q) => q.category === cat).length;

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 text-left sm:px-6">
        <div className="mb-10 pt-2">
          <p className="mb-3 font-code text-xs uppercase tracking-[0.14em] text-muted">
            {behavioralQuestions.length} questions in {CATEGORY_NAMES.length} groups
          </p>
          <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">
            Behavioral interview prep.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Behavioral questions ask about things you did in the past, like working in a team or fixing a mistake. For each question you get what the interviewer is looking for, a plan for your answer, an example and mistakes to avoid.
          </p>
          <Link to="/analyzer" className="group mt-4 inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-brand">
            Get questions picked for a specific job with the Role Analyzer
            <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* The STAR method */}
        <section aria-labelledby="star-heading" className="mb-12">
          <h2 id="star-heading" className="font-display text-xl font-bold tracking-tight text-fg">The STAR way to answer</h2>
          <ol className="mt-4 grid grid-cols-2 border-y border-ink/[0.1] md:grid-cols-4">
            {STAR.map((s) => (
              <li key={s.name} className="py-5 pr-4 md:border-l md:border-ink/[0.1] md:px-6 md:first:border-l-0 md:first:pl-0">
                <span className="font-code text-3xl text-brand">{s.letter}</span>
                <p className="mt-1 font-semibold text-fg">{s.name}</p>
                <p className="text-sm text-muted">{s.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-fg-3 sm:text-base">
            Tell one real, true story in four parts. Spend most of your time on the Action, the part that shows what you did. Use "I" for your own part, keep it to about one to two minutes, and add a number to the result when you can (for example, "the page loaded in half the time").
          </p>
        </section>

        <div className="grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="relative">
              <MagnifyingGlass aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                aria-label="Search questions"
                placeholder="Search questions..."
                className="min-h-[44px] w-full rounded-xl border border-ink/[0.1] bg-card py-3 pl-11 pr-4 font-ui text-sm text-fg placeholder-faint outline-none transition-colors hover:border-ink/[0.18] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={isActive}
                    className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-sm transition-colors duration-150 lg:rounded-lg ${
                      isActive ? "border border-brand/45 bg-brand/15 font-semibold text-brand lg:border-transparent" : "border border-ink/[0.2] bg-card text-fg-3 hover:border-ink/[0.4] hover:text-fg lg:border-transparent lg:bg-transparent lg:hover:bg-ink/[0.04]"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="font-code text-xs">{totalByCategory(cat)}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <p className="sr-only" aria-live="polite">{filteredQuestions.length} questions shown</p>
            <div className="space-y-12">
              {groups.map(({ name, items }) => (
                <Reveal as="section" key={name} y={10} aria-labelledby={`group-${name.replace(/\s+/g, "-")}`}>
                  <div className="mb-3 flex items-end justify-between gap-4">
                    <h2 id={`group-${name.replace(/\s+/g, "-")}`} className="font-code text-xs uppercase tracking-[0.14em] text-fg-3">{name}</h2>
                    <span className="font-code text-xs text-muted">{items.length} {items.length === 1 ? "question" : "questions"}</span>
                  </div>
                  <div className="border-t border-ink">
                    {items.map((q) => <QuestionRow key={q.id} q={q} number={numberOf.get(q.id)} />)}
                  </div>
                </Reveal>
              ))}
            </div>
            {filteredQuestions.length === 0 && (
              <EmptyState icon={MagnifyingGlass} title="No questions match" text="Try different search words or another group." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Behavioral;
