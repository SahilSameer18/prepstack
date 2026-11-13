import { useState } from 'react';
import { useNotesSummary } from '../../hooks/useNotes';
import { SkeletonStat } from '../../components/ui/Skeletons';
import { formatDate } from '../../utils/formatDate';
import { Link } from 'react-router-dom';
import { FiBook, FiSearch, FiArrowRight, FiClock, FiLayers } from "react-icons/fi";
import { FaCode, FaDatabase, FaNetworkWired, FaSitemap, FaProjectDiagram } from "react-icons/fa";
import { EmptyState } from "../../components/ui/StateComponents";

const subjects = [
  {
    title: "Operating Systems",
    slug: "os",
    icon: <FaCode />,
    hoverColor: "var(--data-blue-soft)",   // blue-400
    bg: "bg-info-solid/10", border: "border-info-solid/20",
    description: "Deep dive into process management, memory, and the internals that power every computer.",
    difficulty: "Core",
  },
  {
    title: "DBMS",
    slug: "dbms",
    icon: <FaDatabase />,
    hoverColor: "var(--data-green-soft)",   // emerald-400
    bg: "bg-ok-solid/10", border: "border-ok-solid/20",
    description: "Master relational databases, SQL, normalization, transactions and indexing concepts.",
    difficulty: "Core",
  },
  {
    title: "Computer Networks",
    slug: "cn",
    icon: <FaNetworkWired />,
    hoverColor: "var(--data-purple-soft)",   // purple-400
    bg: "bg-violet-solid/10", border: "border-violet-solid/20",
    description: "Understand how the internet works, from OSI layers to TCP/IP, DNS, routing and sockets.",
    difficulty: "Core",
  },
  {
    title: "OOPs",
    slug: "oops",
    icon: <FaSitemap />,
    hoverColor: "var(--data-orange-soft)",   // orange-400
    bg: "bg-orange-solid/10", border: "border-orange-solid/20",
    description: "Grasp the four pillars of OOP and how design patterns solve real-world software problems.",
    difficulty: "Core",
  },
  {
    title: "System Design",
    slug: "hld",
    icon: <FaProjectDiagram />,
    hoverColor: "var(--data-pink-soft)",   // pink-400
    bg: "bg-pink-solid/10", border: "border-pink-solid/20",
    description: "Design systems the way big-tech interviews ask: caching, replication, consistency, queues, reliability and 12 full case studies.",
    difficulty: "Advanced",
  },
];

// "17 min" under an hour, "3 hrs" above
const readTimeLabel = (minutes) => (minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 6) / 10} hrs`);

// NoteCard uses pure CSS hover for 60fps GPU performance without React state overhead.
// stats: this subject's numbers from the API (null while loading, undefined if they could not be loaded)
const NoteCard = ({ s, stats }) => {
  return (
    <div className="group relative titanium-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 text-left">
      {/* Top colour accent bar on hover */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `linear-gradient(to right, ${s.hoverColor}, transparent)`,
        }}
      />
      {/* Specular hairline */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent" />

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
              <span className="text-xs font-ui font-semibold px-2.5 py-0.5 rounded-full bg-bad-solid/10 border border-bad-solid/20 text-bad">
                In Review
              </span>
            ) : (
              <span className="text-xs font-ui font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand/10 border border-brand/30 text-brand">
                {s.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-bold text-fg mb-2 group-hover:text-fg transition-colors">
          {s.title}
        </h3>

        {/* Description */}
        <p className="text-muted text-sm leading-relaxed mb-4 flex-1">
          {s.description}
        </p>

        {/* Numbers worked out from the notes themselves */}
        <div className="flex items-center gap-3 text-xs font-ui text-muted mb-6 flex-wrap min-h-[20px]">
          {s.comingSoon ? (
            <span>In progress</span>
          ) : stats === null ? (
            <SkeletonStat width="w-40" height="h-4" />
          ) : stats ? (
            <>
              <span className="flex items-center gap-1.5"><FiLayers className="text-xs text-muted" />{stats.sectionCount} sections, {stats.topicCount} topics</span>
              <span className="text-muted">•</span>
              <span className="flex items-center gap-1.5"><FiClock className="text-xs text-muted" />{readTimeLabel(stats.readMinutes)} read</span>
              {stats.lastChecked && (<><span className="text-muted">•</span><span>Checked {formatDate(stats.lastChecked)}</span></>)}
            </>
          ) : null}
        </div>

        {/* CTA */}
        {s.comingSoon ? (
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-ink/[0.02] text-muted cursor-not-allowed"
          >
            Coming Soon
          </button>
        ) : (
          <Link to={`/notes/${s.slug}`} className="block">
            <button
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-ink/[0.04] border border-ink/[0.08] text-fg-2 group-hover:amber-specular-button cursor-pointer select-none"
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
  const summary = useNotesSummary();

  const term = searchTerm.toLowerCase();
  const filtered = subjects.filter((s) => s.title.toLowerCase().includes(term) || s.description.toLowerCase().includes(term));

  return (
    <div className="px-4 sm:px-6 pb-12 max-w-7xl mx-auto page-enter text-left">

      {/* ── HEADER ── */}
      <div className="mb-10 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-ui font-semibold text-cyan bg-cyan-solid/10 border border-cyan-solid/20 rounded-full px-3 py-1 mb-4">
          <FiBook /> {subjects.filter((s) => !s.comingSoon).length} core subjects
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-fg tracking-tight mb-3">
          Computer Science <span className="text-brand">Internals</span>
        </h1>
        <p className="text-muted max-w-2xl text-sm sm:text-base leading-relaxed font-normal">
          Master the low-level operating system, database, and network fundamentals required for rigorous technical screening rounds.
        </p>
      </div>

      {/* ── SEARCH ── */}
      <div className="relative w-full md:w-96 mb-10">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card border border-ink/[0.08] hover:border-ink/[0.15] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_10%,transparent)] rounded-xl py-3 pl-12 pr-4 outline-none transition-colors text-sm text-fg placeholder-faint font-normal"
        />
      </div>

      {/* ── CARDS GRID ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <NoteCard key={s.slug} s={s} stats={summary && summary[s.slug]} />
        ))}

        {filtered.length === 0 && (
          <EmptyState className="col-span-full" icon={FiSearch} title="No subjects found" text="Try a different search query." />
        )}
      </div>
    </div>
  );
};

export default Notes;
