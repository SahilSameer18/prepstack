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
    <div className="px-6 pb-4 max-w-7xl mx-auto">
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
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-3 pl-12 pr-4 focus:border-[#ffa116] outline-none transition"
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
                  : "bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:border-[#ffa116]/50"
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
            className={`card group border ${expandedId === q.id ? "border-[#ffa116]/50 shadow-[0_0_20px_rgba(255,161,22,0.1)]" : "border-[#2a2a2a]"
              } transition-all duration-300 overflow-hidden`}
          >
            <div
              className="p-6 cursor-pointer flex justify-between items-center gap-4"
              onClick={() => toggleExpand(q.id)}
            >
              <div className="flex items-center gap-4 text-left">
                <div className={`p-3 rounded-xl transition ${expandedId === q.id ? "bg-[#ffa116]/20 text-[#ffa116]" : "bg-[#2a2a2a] text-gray-400"
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
                <div className="h-[1px] bg-[#2a2a2a] mb-6"></div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#ffa116] font-semibold">
                      <FaLightbulb />
                      <span>The Strategy (Tip)</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed bg-[#1a1a1a] p-4 rounded-xl border border-[#2a2a2a]">
                      {q.tip}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-500 font-semibold">
                      <FaCommentDots />
                      <span>Example Answer</span>
                    </div>
                    <div className="text-gray-300 leading-relaxed italic bg-[#1a1a1a] p-4 rounded-xl border border-[#2a2a2a]">
                      "{q.exampleAnswer}"
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="py-20 text-center text-gray-500 border border-dashed border-[#2a2a2a] rounded-3xl">
            <p className="text-xl mb-2">No questions found</p>
            <p className="text-sm">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-16 p-8 glass rounded-3xl border border-[#2a2a2a] text-center">
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