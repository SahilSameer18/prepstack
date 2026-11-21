import React, { useState, useCallback, useId, memo } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const TECHNICAL_FAQS = [
  {
    question: "Is PrepStack free?",
    answer: "Yes, there is no payment. Reading is open: the DSA sheets, CS notes, roadmaps and the behavioral guide need no account. You sign in to save your progress and plan and to use the Role Analyzer and AI projects.",
  },
  {
    question: "How does PrepStack differ from solving directly on LeetCode?",
    answer: "LeetCode has 3,000+ uncurated problems with noisy forums. PrepStack provides vetted pattern progressions (Blind 75, NeetCode 150, Striver SDE) with progress tracking per sheet, CS interview notes, and AI-written project ideas in one place.",
  },
  {
    question: "Which DSA sheet should I start with if I have 30 to 60 days?",
    answer: "If you have under 60 days, we recommend starting with Blind 75 (FAANG essentials) followed by NeetCode 150. If you are building foundational mastery from scratch, Striver A2Z or Love Babbar 450 provides exhaustive topic-by-topic depth.",
  },
  {
    question: "How is my progress saved?",
    answer: "When you tick a problem, the page updates at once and the tick is saved to your account. If the save fails, the tick is undone and you see a message. Progress is kept for each sheet separately: ticking a problem on one sheet does not tick it on another.",
  },
  {
    question: "What does the AI project generator give me?",
    answer: "Each idea comes with a title, a short description, a feature list, a suggested tech stack, a difficulty level, an estimated time and a note on how it can look on a resume. It is a starting point written by an AI, so check it before you build on it.",
  },
  {
    question: "What happens to my data?",
    answer: "Your progress, notes and projects are tied to your account, and you can delete the account yourself to remove them. You can sign out of one device or all devices. When you use an AI feature, the text you send is shared with the AI provider that answers it. See the Privacy page for details.",
  },
];

const FAQItem = memo(({ idx, question, answer, isOpen, toggle }) => {
  const panelId = useId();
  return (
    <div
      className={`rounded-2xl transition-all duration-200 border overflow-hidden relative ${
        isOpen
          ? "surface-card border-brand/40 shadow-[0_15px_35px_-14px_color-mix(in_srgb,var(--shadow)_55%,transparent)]"
          : "bg-card border-ink/[0.07] hover:border-ink/[0.14] hover:bg-ink/[0.015]"
      }`}
    >
      {isOpen && (
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
      )}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand cursor-pointer group select-none"
      >
        <div className="flex items-center gap-3.5 sm:gap-4 pr-3">
          <span className="font-ui text-xs font-semibold text-brand shrink-0">
            [{idx}]
          </span>
          <span className="font-display text-base sm:text-lg font-bold text-fg group-hover:text-fg-2 transition-colors">
            {question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 320 }}
          className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
            isOpen
              ? "bg-brand/10 border-brand/30 text-brand"
              : "border-ink/[0.08] text-muted group-hover:text-fg"
          }`}
        >
          <CaretDown className="text-sm" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 pt-1 text-muted text-sm leading-relaxed border-t border-ink/[0.04] mt-1 pl-12 sm:pl-14">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section className="relative">
      <div className="max-w-3xl mx-auto text-left">
        <div className="text-center mb-12 sm:mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-fg tracking-tight leading-tight mb-4">
            Frequently asked <span className="text-brand">questions</span>
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Short answers about how PrepStack works.
          </p>
        </div>

        <div className="space-y-3.5">
          {TECHNICAL_FAQS.map((faq, index) => (
            <FAQItem
              key={index}
              idx={String(index + 1).padStart(2, "0")}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
