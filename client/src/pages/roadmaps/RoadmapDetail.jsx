import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCheckCircle } from "react-icons/fi";
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
  
  if (isNaN(roadmapIndex) || roadmapIndex < 0 || roadmapIndex >= roadmaps.length) {
    return <Navigate to="/roadmaps" replace />;
  }

  const roadmap = roadmaps[roadmapIndex];

  return (
    <div className="px-6 pb-20 max-w-4xl mx-auto page-enter">
      {/* Back Button */}
      <div className="pt-6 mb-8">
        <Link 
          to="/roadmaps" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          <FiArrowLeft /> Back to Roadmaps
        </Link>
      </div>

      {/* Header */}
      <div className={`p-8 rounded-3xl bg-[#111] border ${roadmap.border} relative overflow-hidden mb-12`}>
        {/* Glow */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 ${roadmap.bg} rounded-full blur-[100px] opacity-50`} />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className={`w-16 h-16 rounded-2xl ${roadmap.bg} ${roadmap.color} text-3xl flex items-center justify-center shrink-0`}>
            {iconMap[roadmap.icon]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${roadmap.bg} ${roadmap.color} border ${roadmap.border}`}>
                {roadmap.level}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <FiClock /> {roadmap.duration}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{roadmap.title}</h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
              {roadmap.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-8">Step-by-Step Curriculum</h2>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#2a2a2a] before:via-[#2a2a2a] before:to-transparent">
          {roadmap.details.map((detail, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Timeline dot */}
              <div className={`flex items-center justify-center w-9 h-9 rounded-full border-4 border-[#0a0a0a] ${roadmap.bg} ${roadmap.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10`}>
                <span className="text-sm font-bold">{idx + 1}</span>
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-[#111] border border-[#2a2a2a] group-hover:border-[#444] transition-colors shadow-lg">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-white text-lg">{detail.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{detail.desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  <FiCheckCircle className="text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">Module {idx + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default RoadmapDetail;
