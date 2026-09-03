import React from "react";

const STATS = [
  { value: "1,200+", label: "Curated DSA Problems" },
  { value: "4 Core", label: "CS Subjects (OS, DBMS, CN)" },
  { value: "6 Tracks", label: "Step-by-Step Roadmaps" },
  { value: "100%", label: "Free & Open Access" },
];

const MetricsStrip = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto my-16">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#0f0f0f] border border-white/[0.07] rounded-xl p-4 text-center"
        >
          <div className="text-2xl sm:text-3xl font-black text-white mb-1">
            {stat.value}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsStrip;
