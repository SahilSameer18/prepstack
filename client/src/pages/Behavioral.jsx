import React, { useState } from "react";
import { FaSearch, FaLightbulb, FaCommentDots, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { behavioralQuestions } from "../data/behavioralQuestions";

const Behavioral = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const categories = ["All", "Personal", "Teamwork", "Problem Solving", "Leadership"];

  const filteredQuestions = behavioralQuestions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="px-6 pb-4 max-w-7xl mx-auto page-enter">
      {/* Header Section */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Behavioral <span className="text-[#ffa116]">Questions</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Master the art of HR interviews. Practice common behavioral questions with curated tips and structured example answers.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full bg-[#111] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 focus:border-[#ffa116] focus:shadow-[0_0_0_3px_rgba(255,161,22,0.1)] outline-none transition-all text-sm text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                ? "bg-[#ffa116] text-black"
                : "bg-[#111] border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.2]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid gap-6">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className={`bg-[#111] group border rounded-lg ${expandedId === q.id ? "border-[#ffa116]/50 shadow-[0_0_20px_rgba(255,161,22,0.1)]" : "border-white/[0.08] hover:border-white/[0.15]"
              } transition-all duration-300 overflow-hidden`}
          >
            <div
              className="p-2 cursor-pointer flex justify-between items-center gap-4"
              onClick={() => toggleExpand(q.id)}
            >
              <div className="flex items-center gap-4 text-left">
                <div className={`p-3 rounded-xl transition-colors ${expandedId === q.id ? "bg-[#ffa116]/20 text-[#ffa116]" : "bg-white/[0.05] text-gray-400 group-hover:bg-white/[0.08]"
                  }`}>
                  <FaCommentDots className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#ffa116] transition">
                    {q.question}
                  </h3>
                  <span className="text-xs uppercase tracking-widest text-[#ffa116]/70 mt-1 block">
                    {q.category}
                  </span>
                </div>
              </div>
              <div className="text-gray-500">
                {expandedId === q.id ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {expandedId === q.id && (
              <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-300">
                <div className="h-px bg-white/[0.08] mb-6"></div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#ffa116] font-semibold">
                      <FaLightbulb />
                      <span>The Strategy (Tip)</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed bg-[#0a0a0a] p-5 rounded-2xl border border-white/[0.05]">
                      {q.tip}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-500 font-semibold">
                      <FaCommentDots />
                      <span>Example Answer</span>
                    </div>
                    <div className="text-gray-300 text-sm leading-relaxed italic bg-[#0a0a0a] p-5 rounded-2xl border border-white/[0.05]">
                      "{q.exampleAnswer}"
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="py-20 text-center text-gray-500 border border-dashed border-white/[0.08] rounded-3xl bg-[#111]">
            <p className="text-xl mb-2">No questions found</p>
            <p className="text-sm">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-16 p-8 bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-3xl border border-white/[0.08] text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffa116]/5 rounded-full blur-3xl -z-10" />
        <h3 className="text-2xl font-bold mb-4">Pro Tip: Use the <span className="text-[#ffa116]">STAR</span> Method</h3>
        <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
          When answering behavioral questions, always structure your response using the
          <strong> Situation, Task, Action, and Result</strong> format. This ensures your answers
          are concise, focused, and evidence-based.
        </p>
      </div>
    </div>
  );
};

export default Behavioral;