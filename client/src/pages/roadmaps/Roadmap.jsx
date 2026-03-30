import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { FaRobot, FaLaptopCode, FaMobileAlt, FaDatabase, FaServer, FaBrain, FaChartLine } from "react-icons/fa";
import { roadmaps } from "../../data/roadmaps.js";

const iconMap = {
  FaLaptopCode: <FaLaptopCode />,
  FaMobileAlt: <FaMobileAlt />,
  FaDatabase: <FaDatabase />,
  FaServer: <FaServer />,
  FaBrain: <FaBrain />,
  FaChartLine: <FaChartLine />
};



const Roadmap = () => {
  return (
    <div className="px-6 pb-4 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-4">
          <FiStar /> 6 Learning Paths
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          Curated <span className="text-[#ffa116]">Roadmaps</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-base leading-relaxed">
          Step-by-step guides to master any technology from scratch. Built from real interview requirements and industry standards.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
        {roadmaps.map((r, i) => (
          <div
            key={i}
            className={`group bg-[#111] border ${r.border} hover:border-opacity-60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:${r.glow} relative overflow-hidden`}
          >
            {/* Recommended / New badges */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
              {r.recommended && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116]">⭐ Recommended</span>
              )}
              {r.isNew && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/20 text-green-400">New</span>
              )}
            </div>

            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl ${r.bg} ${r.color} text-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
              {iconMap[r.icon]}
            </div>

            {/* Title & meta */}
            <h3 className={`text-xl font-bold mb-1 transition-colors ${r.color}`}>{r.title}</h3>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
              <span>⏱ {r.duration}</span>
              <span>·</span>
              <span>{r.level}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">{r.desc}</p>

            {/* CTA */}
            <Link to={`/roadmaps/${i}`} className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${r.bg} ${r.color} border ${r.border} group-hover:opacity-90`}>
              Open Roadmap <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>


    </div>
  );
};

export default Roadmap;