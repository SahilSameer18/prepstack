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
  const { id } = useParams();
  const roadmapIndex = parseInt(id, 10);
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (isNaN(roadmapIndex) || roadmapIndex < 0 || roadmapIndex >= roadmaps.length) {
    return <Navigate to="/roadmaps" replace />;
  }

  const roadmap = roadmaps[roadmapIndex];

  const toggle = (idx) => setExpandedIdx(expandedIdx === idx ? null : idx);

  return (
    <div className="px-4 md:px-6 pb-20 max-w-4xl mx-auto page-enter">

      {/* Back Button */}
      <div className="pt-6 mb-8">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium group"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5" /> Back to Roadmaps
        </Link>
      </div>

      {/* ── Header Card ── */}
      <div className={`relative p-8 rounded-3xl bg-[#0f0f0f] border ${roadmap.border} overflow-hidden mb-10`}>
        {/* Ambient glow */}
        <div className={`absolute -right-16 -top-16 w-72 h-72 ${roadmap.bg} rounded-full blur-[120px] opacity-60 pointer-events-none`} />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className={`w-16 h-16 rounded-2xl ${roadmap.bg} ${roadmap.color} text-3xl flex items-center justify-center shrink-0 shadow-lg`}>
            {iconMap[roadmap.icon]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${roadmap.bg} ${roadmap.color} border ${roadmap.border}`}>
                {roadmap.level}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <FiClock /> {roadmap.duration}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <FiBookOpen className={roadmap.color} /> {roadmap.details.length} Modules
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{roadmap.title}</h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">{roadmap.desc}</p>
          </div>
        </div>
      </div>

      {/* ── Curriculum ── */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-black text-white shrink-0">Step-by-Step Curriculum</h2>
          <div className="h-px bg-white/[0.05] flex-1" />
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest shrink-0">{roadmap.details.length} phases</span>
        </div>

        {/* Vertical connecting line */}
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-white/[0.06] via-white/[0.04] to-transparent hidden md:block" />

          <div className="space-y-3">
            {roadmap.details.map((detail, idx) => {
              const num = (idx + 1).toString().padStart(2, '0');
              const isOpen = expandedIdx === idx;

              return (
                <div
                  key={idx}
                  className={`relative transition-all duration-200 ml-0 md:ml-12 rounded-2xl overflow-hidden border ${
                    isOpen
                      ? `border-white/[0.1] bg-[#0f0f0f] shadow-xl shadow-black/50`
                      : 'border-white/[0.05] bg-[#0a0a0a] hover:border-white/[0.1]'
                  }`}
                >
                  {/* Node dot (desktop) */}
                  <div className={`hidden md:flex absolute top-5 -left-12 w-6 h-6 rounded-full border-4 border-[#050505] z-10 items-center justify-center transition-colors ${
                    isOpen ? `${roadmap.bg}` : 'bg-[#1a1a1a] border-[#1a1a1a]'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? roadmap.color.replace('text-', 'bg-') : 'bg-gray-600'}`} />
                  </div>

                  {/* Accordion Header */}
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Step number */}
                      <span className={`text-[10px] font-black tracking-widest px-2 py-1 rounded-lg shrink-0 border ${
                        isOpen
                          ? `${roadmap.bg} ${roadmap.color} ${roadmap.border}`
                          : 'bg-white/[0.03] border-white/[0.05] text-gray-600'
                      }`}>
                        {num}
                      </span>
                      <div className="min-w-0">
                        <h3 className={`font-bold text-sm md:text-base truncate transition-colors ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                          {detail.title}
                        </h3>
                        {!isOpen && (
                          <p className="text-[11px] text-gray-600 truncate mt-0.5 hidden md:block">{detail.desc}</p>
                        )}
                      </div>
                    </div>
                    <div className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center text-sm transition-all ${
                      isOpen ? `${roadmap.bg} ${roadmap.color} ${roadmap.border}` : 'border-white/[0.05] text-gray-600'
                    }`}>
                      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="px-5 pb-6 border-t border-white/[0.05]">
                      {/* Big number watermark */}
                      <div className="relative overflow-hidden">
                        <div className="absolute -right-2 -top-6 text-white/[0.015] text-[120px] font-black pointer-events-none select-none leading-none">
                          {num}
                        </div>
                      </div>

                      {/* Phase label */}
                      <div className="flex items-center gap-2 mt-4 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg border ${roadmap.bg} ${roadmap.color} ${roadmap.border}`}>
                          <FiCheckCircle className="opacity-80" /> Phase {num}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {detail.desc}
                      </p>

                      {/* Resources */}
                      {detail.resources && detail.resources.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
                            <FiBookOpen className={roadmap.color} />
                            Free Resources
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {detail.resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group/res flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all`}
                              >
                                <div className={`shrink-0 w-5 h-5 rounded-md ${roadmap.bg} border ${roadmap.border} flex items-center justify-center mt-0.5`}>
                                  <FiExternalLink className={`${roadmap.color} text-[9px]`} />
                                </div>
                                <span className="text-xs text-gray-400 group-hover/res:text-white transition-colors leading-tight font-medium">
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
