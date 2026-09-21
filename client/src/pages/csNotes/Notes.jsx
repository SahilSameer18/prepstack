import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiSearch, FiArrowRight, FiClock, FiLayers } from "react-icons/fi";
import { FaCode, FaDatabase, FaNetworkWired, FaSitemap, FaProjectDiagram } from "react-icons/fa";

const subjects = [
  {
    title: "Operating Systems",
    slug: "os",
    icon: <FaCode />,
    hoverColor: "#60a5fa",   // blue-400
    bg: "bg-blue-500/10", border: "border-blue-500/20",
    topics: 24,
    description: "Deep dive into process management, memory, and the internals that power every computer.",
    topicList: ["Processes & Threads", "CPU Scheduling", "Deadlocks", "Memory Management", "Virtual Memory", "File Systems"],
    lastUpdated: "2 days ago",
    difficulty: "Core",
    readTime: "~4 hrs",
  },
  {
    title: "DBMS",
    slug: "dbms",
    icon: <FaDatabase />,
    hoverColor: "#34d399",   // emerald-400
    bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    topics: 18,
    description: "Master relational databases, SQL, normalization, transactions and indexing concepts.",
    topicList: ["ER Diagrams", "Normalization", "SQL Queries", "Transactions", "Indexing", "NoSQL Basics"],
    lastUpdated: "5 days ago",
    difficulty: "Core",
    readTime: "~3 hrs",
  },
  {
    title: "Computer Networks",
    slug: "cn",
    icon: <FaNetworkWired />,
    hoverColor: "#c084fc",   // purple-400
    bg: "bg-purple-500/10", border: "border-purple-500/20",
    topics: 30,
    description: "Understand how the internet works — from OSI layers to TCP/IP, DNS, routing and sockets.",
    topicList: ["OSI & TCP/IP Model", "HTTP/HTTPS", "DNS & DHCP", "TCP vs UDP", "Routing Protocols", "Socket Programming"],
    lastUpdated: "1 week ago",
    difficulty: "Core",
    readTime: "~5 hrs",
  },
  {
    title: "OOPs",
    slug: "oops",
    icon: <FaSitemap />,
    hoverColor: "#fb923c",   // orange-400
    bg: "bg-orange-500/10", border: "border-orange-500/20",
    topics: 15,
    description: "Grasp the four pillars of OOP and how design patterns solve real-world software problems.",
    topicList: ["Classes & Objects", "Inheritance", "Polymorphism", "Abstraction", "Encapsulation", "Design Patterns"],
    lastUpdated: "3 weeks ago",
    difficulty: "Core",
    readTime: "~2 hrs",
  },
  {
    title: "System Design",
    slug: "system-design",
    icon: <FaProjectDiagram />,
    hoverColor: "#f472b6",   // pink-400
    bg: "bg-pink-500/10", border: "border-pink-500/20",
    topics: 12,
    description: "Learn to architect scalable systems — load balancing, caching, microservices and API design.",
    topicList: ["Scalability", "Load Balancing", "Caching", "Database Design", "Microservices", "API Design"],
    lastUpdated: "In Progress",
    difficulty: "Advanced",
    comingSoon: true,
    readTime: "~6 hrs",
  },
];

// NoteCard uses pure CSS hover for 60fps GPU performance without React state overhead
const NoteCard = ({ s }) => {
  return (
    <div className="group relative bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.2] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/70 text-left">
      {/* Top colour accent bar on hover */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `linear-gradient(to right, ${s.hoverColor}, transparent)`,
        }}
      />

      <div className="p-6 sm:p-7 flex flex-col flex-1">
        {/* Icon + badges row */}
        <div className="flex items-start justify-between mb-5">
          <div
            className={`p-3 rounded-xl ${s.bg} border ${s.border} text-xl transition-transform duration-200 group-hover:scale-105`}
            style={{ color: s.hoverColor }}
          >
            {s.icon}
          </div>
          <div className="flex items-center gap-1.5">
            {s.comingSoon ? (
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                In Review
              </span>
            ) : (
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/20 text-[#ffa116]">
                {s.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
          {s.title}
        </h3>

        {/* Description */}
        <p className="text-zinc-400 text-sm leading-relaxed mb-4 flex-1">
          {s.description}
        </p>

        {/* Telemetry metadata */}
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5"><FiLayers className="text-xs text-zinc-400" />{s.topics} Topics</span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1.5"><FiClock className="text-xs text-zinc-400" />{s.readTime}</span>
          <span className="text-zinc-700">•</span>
          <span className="text-zinc-400">{s.lastUpdated}</span>
        </div>

        {/* Topic chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {s.topicList.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-300">
              {t}
            </span>
          ))}
          {s.topicList.length > 4 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-400">
              +{s.topicList.length - 4} more
            </span>
          )}
        </div>

        {/* CTA */}
        {s.comingSoon ? (
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-white/[0.02] border border-white/[0.06] text-zinc-500 cursor-not-allowed"
          >
            Coming Soon
          </button>
        ) : (
          <Link to={`/notes/${s.slug}`} className="block">
            <button
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 bg-white/[0.04] border border-white/[0.08] text-zinc-200 group-hover:bg-[#ffa116] group-hover:text-black group-hover:border-[#ffa116] cursor-pointer"
            >
              <span>Study Notes</span>
              <FiArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = subjects.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.topicList.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="px-4 sm:px-6 pb-12 max-w-7xl mx-auto page-enter text-left">

      {/* ── HEADER ── */}
      <div className="mb-10 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 mb-4">
          <FiBook /> 5 Core Engineering Tracks
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
          Computer Science <span className="text-[#ffa116]">Internals</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed font-normal">
          Master the low-level operating system, database, and network fundamentals required for rigorous technical screening rounds.
        </p>
      </div>

      {/* ── SEARCH ── */}
      <div className="relative w-full md:w-96 mb-10">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search subjects or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#ffa116] focus:shadow-[0_0_0_3px_rgba(255,161,22,0.1)] rounded-xl py-3 pl-12 pr-4 outline-none transition-colors text-sm text-white placeholder-zinc-500 font-normal"
        />
      </div>

      {/* ── CARDS GRID ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <NoteCard key={s.slug} s={s} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-zinc-400 border border-dashed border-white/[0.08] rounded-3xl bg-[#0c0c0e]/50">
            <FiSearch className="text-3xl mx-auto mb-3 opacity-30 text-[#ffa116]" />
            <p className="text-lg font-bold text-white mb-1">No subjects found</p>
            <p className="text-sm text-zinc-400">Try a different search query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
