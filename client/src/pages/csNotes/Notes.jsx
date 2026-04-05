import { useState } from 'react';
import { FiBook, FiSearch, FiArrowRight, FiClock, FiLayers } from "react-icons/fi";
import { FaCode, FaDatabase, FaNetworkWired, FaSitemap, FaProjectDiagram } from "react-icons/fa";

const subjects = [
  {
    title: "Operating Systems",
    slug: "os",
    icon: <FaCode />,
    color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
    topics: 24,
    topicList: ["Processes & Threads", "CPU Scheduling", "Deadlocks", "Memory Management", "Virtual Memory", "File Systems"],
    lastUpdated: "2 days ago",
    difficulty: "Core",
  },
  {
    title: "DBMS",
    slug: "dbms",
    icon: <FaDatabase />,
    color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20",
    topics: 18,
    topicList: ["ER Diagrams", "Normalization", "SQL Queries", "Transactions", "Indexing", "NoSQL Basics"],
    lastUpdated: "5 days ago",
    difficulty: "Core",
  },
  {
    title: "Computer Networks",
    slug: "cn",
    icon: <FaNetworkWired />,
    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20",
    topics: 30,
    topicList: ["OSI & TCP/IP Model", "HTTP/HTTPS", "DNS & DHCP", "TCP vs UDP", "Routing Protocols", "Socket Programming"],
    lastUpdated: "1 week ago",
    difficulty: "Core",
  },
  {
    title: "OOPs",
    slug: "oops",
    icon: <FaSitemap />,
    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20",
    topics: 15,
    topicList: ["Classes & Objects", "Inheritance", "Polymorphism", "Abstraction", "Encapsulation", "Design Patterns"],
    lastUpdated: "3 weeks ago",
    difficulty: "Core",
  },
  {
    title: "System Design",
    slug: "system-design",
    icon: <FaProjectDiagram />,
    color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20",
    topics: 12,
    topicList: ["Scalability", "Load Balancing", "Caching", "Database Design", "Microservices", "API Design"],
    lastUpdated: "New",
    difficulty: "Advanced",
    isNew: true,
  },
];

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSlug, setExpandedSlug] = useState(null);

  const filtered = subjects.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.topicList.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="px-6 pb-4 max-w-7xl mx-auto page-enter">

      {/* Header */}
      <div className="mb-10 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
          <FiBook /> 5 Core Subjects
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          Core CS <span className="text-[#ffa116]">Notes</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-base leading-relaxed">
          Master the CS fundamentals every interviewer asks. Structured, concise, and interview-focused notes.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-96 mb-10">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search subjects or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#ffa116] focus:shadow-[0_0_0_3px_rgba(255,161,22,0.1)] rounded-xl py-3 pl-12 pr-4 outline-none transition-all text-sm text-white placeholder-gray-500"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => (
          <div
            key={s.slug}
            className={`group bg-[#111] border ${expandedSlug === s.slug ? `${s.border} shadow-lg` : 'border-white/[0.06] hover:border-white/[0.15]'} rounded-2xl transition-all duration-300 overflow-hidden hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40`}
          >
            {/* Card Top */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${s.bg} ${s.color} text-lg group-hover:scale-110 transition-transform duration-300`}>
                  {s.icon}
                </div>
                <div className="flex items-center gap-2">
                  {s.isNew && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/20 text-green-400">New</span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.difficulty === 'Advanced' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-[#ffa116]/10 border border-[#ffa116]/20 text-[#ffa116]'}`}>
                    {s.difficulty}
                  </span>
                </div>
              </div>

              <h3 className={`text-xl font-bold mb-1 transition-colors ${expandedSlug === s.slug ? s.color : 'text-white group-hover:' + s.color}`}>{s.title}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><FiLayers className="text-[10px]" />{s.topics} Topics</span>
                <span>·</span>
                <span className="flex items-center gap-1"><FiClock className="text-[10px]" />Updated {s.lastUpdated}</span>
              </div>

              {/* Topics preview */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {s.topicList.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-gray-400">{t}</span>
                ))}
                {s.topicList.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-gray-500">+{s.topicList.length - 3} more</span>
                )}
              </div>

              {/* Expand toggle */}
              <button
                onClick={() => setExpandedSlug(expandedSlug === s.slug ? null : s.slug)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${expandedSlug === s.slug ? `${s.bg} ${s.color} border ${s.border}` : 'bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.08]'}`}
              >
                {expandedSlug === s.slug ? "Hide Topics" : "View Topics"} <FiArrowRight className={`text-xs transition-transform ${expandedSlug === s.slug ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </button>
            </div>

            {/* Expanded Topics */}
            {expandedSlug === s.slug && (
              <div className={`border-t ${s.border} px-5 py-4 bg-white/[0.01]`}>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">All Topics</p>
                <ul className="space-y-2">
                  {s.topicList.map((t, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm text-gray-300 hover:${s.color} cursor-pointer transition-colors`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.color.replace('text-', 'bg-')}`} />
                    {t}
                  </li>
                ))}
                </ul>
                <button className={`mt-4 w-full py-2 rounded-xl text-sm font-semibold ${s.color} ${s.bg} border ${s.border} transition-all hover:opacity-90`}>
                  Start Reading →
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-white/[0.08] rounded-3xl">
            <FiSearch className="text-3xl mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium mb-1">No subjects found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;