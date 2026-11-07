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
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-fg tracking-[-0.035em] mb-3">
          Engineering Career Roadmaps
        </h1>
        <p className="text-muted max-w-2xl text-base sm:text-lg leading-relaxed font-normal">
          Structured, syllabus-grade tracks designed around tier-1 software engineering interview benchmarks and modern production stacks.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
        {roadmaps.map((r, i) => (
          <div
            key={i}
            className="titanium-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:-translate-y-1"
          >
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent group-hover:via-brand/40 transition-all" />

            {/* Top metadata row */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-ink/[0.04] border border-ink/[0.08] text-xl text-brand flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {iconMap[r.icon]}
              </div>

              <div className="flex items-center gap-1.5">
                {r.recommended && (
                  <span className="font-ui text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand/10 border border-brand/30 text-brand">
                    Core Track
                  </span>
                )}
                {r.isNew && (
                  <span className="font-ui text-xs font-bold px-2 py-0.5 rounded-md bg-ok-solid/10 border border-ok-solid/20 text-ok">
                    Updated
                  </span>
                )}
              </div>
            </div>

            {/* Title & Body */}
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-fg mb-2 group-hover:text-brand transition-colors">
                {r.title}
              </h3>

              <div className="flex items-center gap-2 font-ui text-xs text-muted mb-3">
                <span>{r.duration}</span>
                <span className="text-fg/20">/</span>
                <span>{r.level}</span>
              </div>

              <p className="text-muted text-sm leading-relaxed mb-6 font-normal">
                {r.desc}
              </p>
            </div>

            {/* CTA */}
            <Link
              to={`/roadmaps/${r.slug}`}
              className="w-full py-2.5 px-4 min-h-[44px] rounded-xl text-xs sm:text-sm font-display font-semibold flex items-center justify-center gap-2 bg-ink/[0.04] border border-ink/[0.08] text-fg-2 hover:amber-specular-button transition-all duration-200 select-none"
            >
              Explore roadmap <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;