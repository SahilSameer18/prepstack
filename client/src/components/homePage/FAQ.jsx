import React, { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

const TECHNICAL_FAQS = [
  {
    idx: "01",
    question: "How does PrepStack differ from solving directly on LeetCode?",
    answer: "LeetCode has 3,000+ uncurated problems with noisy forums. PrepStack provides vetted pattern progressions (Blind 75, NeetCode 150, Striver SDE) with instant atomic progress tracking, low-level CS interview internals, and production project blueprints all in one unified cockpit.",
  },
  {
    idx: "02",
    question: "Which DSA sheet should I start with if I have 30 to 60 days?",
    answer: "If you have under 60 days, we recommend starting with Blind 75 (FAANG essentials) followed by NeetCode 150. If you are building foundational mastery from scratch, Striver A2Z or Love Babbar 450 provides exhaustive topic-by-topic depth.",
  },
  {
    idx: "03",
    question: "How does the atomic progress sync work?",
    answer: "Every time you toggle a problem or complete a topic, your client updates state optimistically in 0ms while silently persisting to the database. If your network hiccups, changes rollback gracefully with instant feedback.",
  },
  {
    idx: "04",
    question: "What makes the AI project specs recruiter-ready?",
    answer: "Rather than spitting out generic to-do apps or weather widgets, our Gemini-backed architect designs high-throughput services (e.g. distributed rate limiters, write-ahead logs, cache-aside pipelines) with schema definitions, p99 latency targets, and talking points for technical rounds.",
  },
  {
    idx: "05",
    question: "Is my progress and account data fully private?",
    answer: "Yes. PrepStack is engineered with zero-knowledge token hashing at rest, enterprise multi-device session management with remote kill-switches, and full GDPR Article 17 self-service account erasure with cascading collection wipe.",
  },
];

const FAQItem = memo(({ idx, question, answer, isOpen, toggle }) => {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 border overflow-hidden relative ${
        isOpen
          ? "titanium-card border-[#ffa116]/40 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.9)]"
          : "bg-[#0b0b0e] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.015]"
      }`}
    >
      {isOpen && (
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffa116]/50 to-transparent" />
      )}
      <button
        type="button"
        onClick={toggle}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left focus:outline-none cursor-pointer group select-none"
      >
        <div className="flex items-center gap-3.5 sm:gap-4 pr-3">
          <span className="font-mono text-xs font-semibold text-[#ffa116] shrink-0">
            [{idx}]
          </span>
          <span className="font-display text-base sm:text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
            {question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
            isOpen
              ? "bg-[#ffa116]/10 border-[#ffa116]/30 text-[#ffa116]"
              : "border-white/[0.08] text-zinc-400 group-hover:text-white"
          }`}
        >
          <FiChevronDown className="text-sm" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 pt-1 text-zinc-400 text-sm leading-relaxed border-t border-white/[0.04] mt-1 pl-12 sm:pl-14">
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
          <p className="text-xs font-mono uppercase tracking-widest text-[#ffa116] font-semibold mb-3">
            Technical Briefing
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Frequently asked <span className="text-[#ffa116]">questions</span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Everything you need to know about the platform architecture and preparation workflow.
          </p>
        </div>

        <div className="space-y-3.5">
          {TECHNICAL_FAQS.map((faq, index) => (
            <FAQItem
              key={index}
              idx={faq.idx}
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