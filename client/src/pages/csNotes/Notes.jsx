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
    lastUpdated: "New",
    difficulty: "Advanced",
    isNew: true,
    readTime: "~6 hrs",
  },
];

// NoteCard uses explicit React state for hover to bypass Tailwind purge issues with dynamic classes
const NoteCard = ({ s }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative bg-[#0f0f0f] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col
        transition-all duration-300
        ${hovered ? 'border-white/[0.18] -translate-y-1' : ''}
      `}
      style={{
        boxShadow: hovered ? `0 20px 40px -12px rgba(0,0,0,0.5), 0 0 0 1px ${s.hoverColor}18` : 'none',
      }}
    >
      {/* Top colour accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
        style={{
          background: `linear-gradient(to right, ${s.hoverColor}88, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon + badges row */}
        <div className="flex items-start justify-between mb-5">
          <div
            className={`p-3 rounded-xl ${s.bg} text-xl transition-transform duration-300`}
            style={{ color: s.hoverColor, transform: hovered ? 'scale(1.1)' : 'scale(1)' }}
          >
            {s.icon}
          </div>
          <div className="flex items-center gap-1.5">
            {s.isNew && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/20 text-green-400">New</span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.difficulty === 'Advanced' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-[#ffa116]/10 border border-[#ffa116]/20 text-[#ffa116]'}`}>
              {s.difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-xl font-bold mb-1.5 transition-colors duration-200"
          style={{ color: hovered ? s.hoverColor : '#ffffff' }}
        >
          {s.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{s.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5"><FiLayers className="text-xs" />{s.topics} Topics</span>
          <span className="text-gray-700">•</span>
          <span className="flex items-center gap-1.5"><FiClock className="text-xs" />{s.readTime}</span>
          <span className="text-gray-700">•</span>
          <span className="text-gray-600">Updated {s.lastUpdated}</span>
        </div>

        {/* Topic chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {s.topicList.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-gray-400">{t}</span>
          ))}
          {s.topicList.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-gray-500">+{s.topicList.length - 4} more</span>
          )}
        </div>

        {/* CTA */}
        <Link to={`/notes/${s.slug}`} className="block">
          <button
            className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${s.bg} border ${s.border}`}
            style={{ color: s.hoverColor, filter: hovered ? 'brightness(1.2)' : 'brightness(1)' }}
          >
            Start Reading
            <FiArrowRight className="text-xs" style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
          </button>
        </Link>
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
    <div className="px-6 pb-10 max-w-7xl mx-auto page-enter">

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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <NoteCard key={s.slug} s={s} />
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