import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { FaLaptopCode, FaMobileAlt, FaDatabase, FaServer, FaBrain, FaChartLine } from "react-icons/fa";
import { roadmaps } from "../../data/roadmaps.js";

const iconMap = {
  FaLaptopCode: <FaLaptopCode />,
  FaMobileAlt: <FaMobileAlt />,
  FaDatabase: <FaDatabase />,
  FaServer: <FaServer />,
  FaBrain: <FaBrain />,
  FaChartLine: <FaChartLine />,
};

const Roadmap = () => {
  return (
    <div className="px-4 sm:px-6 pb-12 max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-10 pt-2">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-[-0.035em] mb-3">
          Engineering Career Roadmaps
        </h1>
        <p className="text-zinc-400 max-w-2xl text-base sm:text-lg leading-relaxed font-normal">
          Structured, syllabus-grade tracks designed around tier-1 software engineering interview benchmarks and modern production stacks.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
        {roadmaps.map((r, i) => (
          <div
            key={i}
            className="luxury-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group"
          >
            {/* Top metadata row */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xl text-[#ffa116] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {iconMap[r.icon]}
              </div>

              <div className="flex items-center gap-1.5">
                {r.recommended && (
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/30 text-[#ffa116]">
                    Core Track
                  </span>
                )}
                {r.isNew && (
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Updated
                  </span>
                )}
              </div>
            </div>

            {/* Title & Body */}
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-[#ffa116] transition-colors">
                {r.title}
              </h3>

              <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 mb-3">
                <span>{r.duration}</span>
                <span className="text-white/20">/</span>
                <span>{r.level}</span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-normal">
                {r.desc}
              </p>
            </div>

            {/* CTA */}
            <Link
              to={`/roadmaps/${r.slug}`}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-display font-semibold flex items-center justify-center gap-2 bg-white/[0.03] border border-white/[0.08] text-zinc-200 hover:bg-[#ffa116] hover:text-black hover:border-[#ffa116] transition-all duration-200"
            >
              Explore Curriculum <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;