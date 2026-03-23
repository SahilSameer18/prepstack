import React, { useState } from "react";
import { FaSearch, FaCode, FaCheckCircle, FaStar } from "react-icons/fa";

const Sheets = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const sheets = [
    {
      title: "Love Babbar 450",
      count: 450,
      difficulty: "Intermediate",
      tags: ["Comprehensive", "Interview Favorite"],
      icon: <FaStar className="text-yellow-500" />,
    },
    {
      title: "Striver A2Z",
      count: 455,
      difficulty: "Beginner to Advanced",
      tags: ["Structured", "YouTube Series"],
      icon: <FaCode className="text-blue-500" />,
    },
    {
      title: "NeetCode 150",
      count: 150,
      difficulty: "Advanced",
      tags: ["Pattern Based", "FAANG"],
      icon: <FaCheckCircle className="text-green-500" />,
    },
    {
      title: "Blind 75",
      count: 75,
      difficulty: "Advanced",
      tags: ["Essential", "Short & Sweet"],
      icon: <FaStar className="text-orange-500" />,
    },
  ];

  const filteredSheets = sheets.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 pb-4">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">DSA Problem <span className="text-[#ffa116]">Sheets</span></h1>
        <p className="text-gray-400 max-w-2xl">
          Carefully curated problem sets to help you master algorithms and data
          structures. Choose a sheet that fits your current level and goals.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="relative mb-10 max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search for a sheet..."
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-3 pl-12 pr-4 focus:border-[#ffa116] outline-none transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Sheets Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSheets.map((s, i) => (
          <div key={i} className="card group cursor-pointer hover:border-[#ffa116]/30 transition">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#2a2a2a] rounded-xl group-hover:scale-110 transition duration-300">
                {s.icon}
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[#2a2a2a] text-gray-400">
                {s.count} Problems
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[#ffa116] transition">
              {s.title}
            </h3>
            <p className="text-sm text-gray-400 mb-4">{s.difficulty}</p>
            <div className="flex flex-wrap gap-2">
              {s.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-[#2a2a2a] text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button className="w-full mt-6 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 group-hover:bg-[#ffa116] group-hover:text-black font-semibold transition">
              View Sheet
            </button>
          </div>
        ))}

        {filteredSheets.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500">
            No sheets found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sheets;