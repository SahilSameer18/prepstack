import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { Blueprint, Cpu, Cube, Database, ShareNetwork } from "@phosphor-icons/react";
import { useNotesSummary } from '../../hooks/useNotes';
import { SkeletonStat } from '../../components/ui/Skeletons';
import { formatDate } from '../../utils/formatDate';
import { EmptyState } from "../../components/ui/StateComponents";
import PageBackdrop from '../../components/ui/PageBackdrop';

const MotionLink = motion.create(Link);

// One accent for every subject: they are told apart by their names and icons, not by colour.
const subjects = [
  { title: "Operating Systems", slug: "os", icon: <Cpu weight="duotone" />, level: "Core", description: "Deep dive into process management, memory, and the internals that power every computer." },
  { title: "DBMS", slug: "dbms", icon: <Database weight="duotone" />, level: "Core", description: "Master relational databases, SQL, normalization, transactions and indexing concepts." },
  { title: "Computer Networks", slug: "cn", icon: <ShareNetwork weight="duotone" />, level: "Core", description: "Understand how the internet works, from OSI layers to TCP/IP, DNS, routing and sockets." },
  { title: "OOPs", slug: "oops", icon: <Cube weight="duotone" />, level: "Core", description: "Grasp the four pillars of OOP and how design patterns solve real-world software problems." },
  { title: "System Design", slug: "hld", icon: <Blueprint weight="duotone" />, level: "Advanced", description: "Design systems the way big-tech interviews ask: caching, replication, consistency, queues, reliability and 12 full case studies." },
];

// "17 min" under an hour, "3 hrs" above
const readTimeLabel = (minutes) => (minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 6) / 10} hrs`);

// stats: this subject's numbers from the API (null while loading, undefined if they could not be loaded)
const NoteCard = ({ s, stats, index }) => {
  const calm = useReducedMotion();
  return (
    <MotionLink
      to={`/notes/${s.slug}`}
      initial={calm ? { opacity: 0 } : { opacity: 0, transform: "translate3d(0, 20px, 0)" }}
      animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      transition={calm ? { duration: 0.2 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.07 }}
      className="group relative flex flex-col rounded-2xl border border-ink/[0.1] bg-card p-6 text-left shadow-[0_1px_2px_color-mix(in_srgb,var(--shadow)_14%,transparent),0_18px_34px_-20px_color-mix(in_srgb,var(--shadow)_42%,transparent)] transition-[transform,box-shadow] duration-200 active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_color-mix(in_srgb,var(--shadow)_16%,transparent),0_26px_44px_-20px_color-mix(in_srgb,var(--shadow)_55%,transparent)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-3xl text-brand">{s.icon}</span>
        <span className="font-ui text-xs font-semibold text-muted">{s.level}</span>
      </div>

      <h2 className="mt-5 font-display text-xl font-extrabold tracking-tight text-fg">{s.title}</h2>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>

      {/* Numbers worked out from the notes themselves */}
      <div className="mt-4 flex min-h-[20px] flex-wrap items-center gap-x-2 gap-y-1 font-ui text-xs text-muted">
        {stats === null ? (
          <SkeletonStat width="w-40" height="h-4" />
        ) : stats ? (
          <>
            <span>{stats.sectionCount} sections, {stats.topicCount} topics</span>
            <span aria-hidden="true">·</span>
            <span>{readTimeLabel(stats.readMinutes)} read</span>
            {stats.lastChecked && (<><span aria-hidden="true">·</span><span>Checked {formatDate(stats.lastChecked)}</span></>)}
          </>
        ) : null}
      </div>

      <span className="mt-5 inline-flex items-center gap-2 font-display text-sm font-bold text-brand">
        Study notes
        <FiArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
      </span>
    </MotionLink>
  );
};

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
            Computer science <span className="text-brand">internals.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            The operating system, database, network and design fundamentals that technical screening rounds ask about, in plain words and checked against their sources.
          </p>
        </div>

        {/* ── SEARCH ── */}
        <div className="relative mb-10 w-full md:w-96">
          <FiSearch aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search subjects"
            aria-label="Search subjects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-ink/[0.1] bg-card py-3 pl-12 pr-4 text-sm font-normal text-fg outline-none transition-colors placeholder-faint hover:border-ink/[0.18] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)]"
          />
        </div>

        {/* ── CARDS GRID ── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, i) => (
            <NoteCard key={s.slug} s={s} stats={summary && summary[s.slug]} index={i} />
          ))}

          {filtered.length === 0 && (
            <EmptyState className="col-span-full" icon={FiSearch} title="No subjects found" text="Try a different search query." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
