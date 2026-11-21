import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { useNotesSummary } from '../../hooks/useNotes';
import { SkeletonStat } from '../../components/ui/Skeletons';
import { formatDate } from '../../utils/formatDate';
import { EmptyState } from "../../components/ui/StateComponents";
import PageBackdrop from '../../components/ui/PageBackdrop';
import Reveal from '../../components/ui/Reveal';

// One line per subject, told apart by name.
const subjects = [
  { title: "Operating Systems", slug: "os", level: "Core", description: "Deep dive into process management, memory, and the internals that power every computer." },
  { title: "DBMS", slug: "dbms", level: "Core", description: "Master relational databases, SQL, normalization, transactions and indexing concepts." },
  { title: "Computer Networks", slug: "cn", level: "Core", description: "Understand how the internet works, from OSI layers to TCP/IP, DNS, routing and sockets." },
  { title: "OOPs", slug: "oops", level: "Core", description: "Grasp the four pillars of OOP and how design patterns solve real-world software problems." },
  { title: "System Design", slug: "hld", level: "Advanced", description: "Design systems the way big-tech interviews ask: caching, replication, consistency, queues, reliability and 12 full case studies." },
];

// "17 min" under an hour, "3 hrs" above
const readTimeLabel = (minutes) => (minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 6) / 10} hrs`);

// stats: this subject's numbers from the API (null while loading, undefined if they could not be loaded)
const NoteRow = ({ s, stats, index }) => (
  <Link
    to={`/notes/${s.slug}`}
    className="group grid grid-cols-[32px_1fr_auto] items-center gap-x-5 gap-y-2 border-b border-ink/[0.1] py-6 text-left transition-colors hover:bg-ink/[0.02] sm:grid-cols-[40px_1fr_210px_24px] sm:gap-x-6"
  >
    <span className="font-code text-sm text-muted">{String(index + 1).padStart(2, '0')}</span>
    <div className="min-w-0">
      <h2 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">
        {s.title}
        {s.level === 'Advanced' && <span className="rounded-full border border-brand/30 px-2.5 py-0.5 font-ui text-xs font-semibold text-brand">Advanced</span>}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">{s.description}</p>
    </div>
    <ArrowRight aria-hidden="true" className="justify-self-end text-brand transition-transform duration-200 group-hover:translate-x-1 sm:order-last" />
    {/* Numbers worked out from the notes themselves */}
    <div className="col-start-2 min-h-[20px] font-code text-sm sm:col-start-auto">
      {stats === null ? (
        <SkeletonStat width="w-40" height="h-4" />
      ) : stats ? (
        <>
          <p className="text-fg">{stats.sectionCount} sections · {stats.topicCount} topics</p>
          <p className="text-muted">{readTimeLabel(stats.readMinutes)} read{stats.lastChecked ? ` · checked ${formatDate(stats.lastChecked)}` : ''}</p>
        </>
      ) : null}
    </div>
  </Link>
);

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const summary = useNotesSummary();

  const term = searchTerm.toLowerCase();
  const filtered = subjects.filter((s) => s.title.toLowerCase().includes(term) || s.description.toLowerCase().includes(term));

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 text-left sm:px-6">

        {/* ── HEADER ── */}
        <div className="mb-10 pt-2">
          <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">
            Computer science internals.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            The operating system, database, network and design fundamentals that technical screening rounds ask about, in plain words and checked against their sources.
          </p>
        </div>

        {/* ── SEARCH ── */}
        <div className="relative mb-10 w-full md:w-96">
          <MagnifyingGlass aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search subjects"
            aria-label="Search subjects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-ink/[0.1] bg-card py-3 pl-12 pr-4 text-sm font-normal text-fg outline-none transition-colors placeholder-faint hover:border-ink/[0.18] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)]"
          />
        </div>

        {/* ── SUBJECTS ── */}
        <div className="border-t border-ink">
          {filtered.map((s, i) => (
            <Reveal key={s.slug} y={10} delay={Math.min(i, 5) * 0.06}><NoteRow s={s} stats={summary && summary[s.slug]} index={i} /></Reveal>
          ))}
        </div>
        {filtered.length === 0 && (
          <EmptyState icon={MagnifyingGlass} title="No subjects found" text="Try a different search query." />
        )}
      </div>
    </div>
  );
};

export default Notes;
