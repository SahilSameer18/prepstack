import React, { useState, useCallback, useId, memo } from "react";
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
    <div className="border-b border-ink/[0.1]">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex min-h-[64px] w-full cursor-pointer select-none items-center justify-between gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      >
        <span className="flex items-baseline gap-5 pr-3">
          <span className="font-code text-sm text-muted">{idx}</span>
          <span className="font-display text-base font-bold text-fg transition-colors group-hover:text-brand sm:text-lg">{question}</span>
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          className="shrink-0 text-2xl leading-none text-muted"
        >
          +
        </motion.span>
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
            <p className="max-w-3xl pb-6 pl-10 text-sm leading-relaxed text-muted sm:pl-12 sm:text-base">{answer}</p>
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
    <section aria-labelledby="home-faq-heading" className="border-t border-ink/[0.1] pt-16 text-left">
      <p className="font-code text-xs uppercase tracking-[0.14em] text-muted">Questions</p>
      <h2 id="home-faq-heading" className="mt-3 font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl">
        Frequently asked questions
      </h2>
      <div className="mt-8 border-t border-ink/[0.1]">
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
    </section>
  );
};

export default FAQ;
