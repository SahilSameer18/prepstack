import React from "react";
import { FaMap, FaLaptopCode, FaMobileAlt, FaDatabase, FaServer } from "react-icons/fa";

const Roadmap = () => {
  const roadmaps = [
    { title: "Frontend Development", icon: <FaLaptopCode />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Backend Development", icon: <FaServer />, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Android Development", icon: <FaMobileAlt />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Full Stack MERN", icon: <FaDatabase />, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="px-6 pb-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Curated <span className="text-[#ffa116]">Roadmaps</span></h1>
        <p className="text-gray-400 max-w-2xl">
          Follow these step-by-step guides to master any technology from scratch.
          Built by industry experts.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {roadmaps.map((r, i) => (
          <div key={i} className="card p-8 group flex items-start gap-6 hover:bg-[#1f1f1f] transition">
            <div className={`p-5 rounded-2xl ${r.bg} ${r.color} text-3xl group-hover:scale-110 transition duration-500`}>
              {r.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">{r.title}</h3>
              <p className="text-gray-400 text-sm mb-6">
                Complete path from absolute beginner to production ready developer. Includes projects and interview prep.
              </p>
              <button className="flex items-center gap-2 text-[#ffa116] font-semibold group/btn">
                Start Learning <span className="group-hover/btn:translate-x-1 transition">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 glass rounded-3xl border-dashed border-2 border-[#2a2a2a] text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-300">Coming Soon: Personalized Roadmap</h2>
        <p className="text-gray-500 text-sm">Specialized guides with the help of AI for CSE students.</p>
      </div>
    </div>
  );
};

export default Roadmap;