import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const FAQItem = ({ question, answer, isOpen, toggle }) => {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? "border-[#ffa116] bg-[#1a1a1a]" : "border-[#2a2a2a] bg-[#1a1a1a]/40"
      }`}>
      <button
        onClick={toggle}
        className="w-full p-5 flex justify-between items-center text-left focus:outline-none"
      >
        <span className="text-lg font-medium text-gray-200">{question}</span>
        <FaChevronDown className={`text-[#ffa116] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}>
        <div className="px-5 pb-5 text-gray-400 leading-relaxed border-t border-[#2a2a2a]/50 pt-4">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Who is this platform for?",
      answer: "This platform is designed specifically for Computer Science students preparing for internships, placements, and software engineering interviews.",
    },
    {
      question: "Does it include core CS notes?",
      answer: "Yes! We have comprehensive notes for Operating Systems, DBMS, OOPs, Computer Networks, and basic System Design concepts specifically tailored for interview prep.",
    },
    {
      question: "How do the behavioral question answers help?",
      answer: "Our behavioral section provides strategic tips and STAR-method based example answers to help you structure your responses effectively and leave a great impression during HR interviews.",
    },
    {
      question: "Can I generate project ideas using AI?",
      answer: "Absolutely! With our AI integration, you can generate unique project ideas tailored to your chosen tech stack, helping you build a standout portfolio.",
    },
    {
      question: "Are there structured roadmaps?",
      answer: "Yes, you can explore domain-specific roadmaps (like Web Development, Data Science, Backend) and pre-built year-wise guides to navigate your college journey.",
    },
    {
      question: "Are these resources free to use?",
      answer: "Yes, our mission is to provide high-quality, curated interview preparation resources to all students for free to ensure equal opportunities for everyone.",
    },
  ];

  return (
    <section className="mt-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Got Questions? <span className="text-[#ffa116]">Answers Here</span>
          </h2>
          <p className="text-gray-400">
            Everything you need to know about the platform.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;