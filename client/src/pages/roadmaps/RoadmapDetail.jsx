import React, { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCheckCircle, FiExternalLink, FiChevronDown, FiChevronUp, FiBookOpen } from "react-icons/fi";
import { roadmaps } from "../../data/roadmaps.js";
import { FaLaptopCode, FaMobileAlt, FaDatabase, FaServer, FaBrain, FaChartLine } from "react-icons/fa";

const iconMap = {
  FaLaptopCode: <FaLaptopCode />,
  FaMobileAlt: <FaMobileAlt />,
  FaDatabase: <FaDatabase />,
  FaServer: <FaServer />,
  FaBrain: <FaBrain />,
  FaChartLine: <FaChartLine />
};

const RoadmapDetail = () => {
  const { slug, id } = useParams();
  const param = slug || id;
  const [expandedIdx, setExpandedIdx] = useState(null);

  // Lookup by semantic slug, or fallback to numeric index for backward compatibility
  const roadmap = roadmaps.find((r) => r.slug === param) ||
    (!isNaN(parseInt(param, 10)) ? roadmaps[parseInt(param, 10)] : null);

  if (!roadmap) {
    return <Navigate to="/roadmaps" replace />;
  }

  const toggle = (idx) => setExpandedIdx(expandedIdx === idx ? null : idx);

  return (
    <div className="px-4 md:px-6 pb-20 max-w-4xl mx-auto page-enter text-left">

      {/* Back Button */}
      <div className="pt-6 mb-8">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium group min-h-[44px]"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5 text-zinc-400 group-hover:text-white" />
          <span>Back to Roadmaps</span>
        </Link>
      </div>

      {/* ── Header Card ── */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] overflow-hidden mb-10 shadow-2xl">
        {/* Ambient glow - hardware accelerated */}
        <div className={`absolute -right-16 -top-16 w-64 h-64 ${roadmap.bg} rounded-full blur-[90px] opacity-40 pointer-events-none transform-gpu`} />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className={`w-16 h-16 rounded-2xl ${roadmap.bg} ${roadmap.color} text-2xl sm:text-3xl flex items-center justify-center shrink-0 border border-white/[0.08] shadow-lg`}>
            {iconMap[roadmap.icon]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full ${roadmap.bg} ${roadmap.color} border border-white/[0.08]`}>
                {roadmap.level}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                <FiClock className="text-zinc-400" /> {roadmap.duration}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                <FiBookOpen className={roadmap.color} /> {roadmap.details.length} Modules
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2 leading-tight">
              {roadmap.title}
            </h1>
            <p className="text-zinc-300 text-sm md:text-base max-w-2xl leading-relaxed">
              {roadmap.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ── Curriculum ── */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-display font-bold text-white shrink-0">Step-by-Step Curriculum</h2>
          <div className="h-px bg-white/[0.08] flex-1" />
          <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
            {roadmap.details.length} phases
          </span>
        </div>

        {/* Vertical connecting line */}
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-white/[0.12] via-white/[0.08] to-transparent hidden md:block" />

          <div className="space-y-3">
            {roadmap.details.map((detail, idx) => {
              const num = (idx + 1).toString().padStart(2, '0');
              const isOpen = expandedIdx === idx;

              return (
                <div
                  key={idx}
                  className={`relative transition-colors duration-200 ml-0 md:ml-12 rounded-2xl overflow-hidden border ${
                    isOpen
                      ? `border-white/[0.15] bg-[#0e0e11] shadow-xl shadow-black/40`
                      : 'border-white/[0.08] bg-[#0c0c0e] hover:border-white/[0.15]'
                  }`}
                >
                  {/* Node dot (desktop) */}
                  <div className={`hidden md:flex absolute top-5 -left-12 w-6 h-6 rounded-full border-2 z-10 items-center justify-center transition-colors ${
                    isOpen ? `border-[#ffa116] bg-[#0c0c0e]` : 'border-zinc-700 bg-[#0c0c0e]'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#ffa116]' : 'bg-zinc-500'}`} />
                  </div>

                  {/* Accordion Header */}
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Step number */}
                      <span className={`text-[11px] font-mono font-bold tracking-wider px-2 py-1 rounded-lg shrink-0 border ${
                        isOpen
                          ? `${roadmap.bg} ${roadmap.color} border-white/[0.1]`
                          : 'bg-white/[0.03] border-white/[0.06] text-zinc-400'
                      }`}>
                        {num}
                      </span>
                      <div className="min-w-0">
                        <h3 className={`font-semibold text-sm md:text-base truncate transition-colors ${isOpen ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                          {detail.title}
                        </h3>
                        {!isOpen && (
                          <p className="text-xs text-zinc-400 truncate mt-0.5 hidden md:block">{detail.desc}</p>
                        )}
                      </div>
                    </div>
                    <div className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-colors ${
                      isOpen ? `${roadmap.bg} ${roadmap.color} border-white/[0.1]` : 'border-white/[0.08] text-zinc-400'
                    }`}>
                      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="px-5 pb-6 border-t border-white/[0.06]">
                      {/* Big number watermark */}
                      <div className="relative overflow-hidden">
                        <div className="absolute -right-2 -top-6 text-white/[0.02] text-[100px] font-mono font-bold pointer-events-none select-none leading-none">
                          {num}
                        </div>
                      </div>

                      {/* Phase label */}
                      <div className="flex items-center gap-2 mt-4 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-1 rounded-lg border ${roadmap.bg} ${roadmap.color} border-white/[0.08]`}>
                          <FiCheckCircle className="opacity-90" /> Phase {num}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                        {detail.desc}
                      </p>

                      {/* Resources */}
                      {detail.resources && detail.resources.length > 0 && (
                        <div>
                          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                            <FiBookOpen className={roadmap.color} />
                            Curated Resources
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {detail.resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/res flex items-start gap-2.5 p-3 rounded-xl bg-[#121216] border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.03] transition-colors"
                              >
                                <div className={`shrink-0 w-6 h-6 rounded-md ${roadmap.bg} border border-white/[0.08] flex items-center justify-center mt-0.5`}>
                                  <FiExternalLink className={`${roadmap.color} text-[10px]`} />
                                </div>
                                <span className="text-xs text-zinc-300 group-hover/res:text-white transition-colors leading-snug font-medium">
                                  {res.label}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;
