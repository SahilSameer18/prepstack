import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMenu, FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiMessageSquare, FiClock, FiFlag, FiCheck } from 'react-icons/fi';
import { useNotes } from '../../hooks/useNotes';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonNotesDetail } from '../../components/ui/Skeletons';
import { PageErrorState } from '../../components/ui/ErrorComponents';
import Accordion from '../../components/ui/Accordion';
import Quiz from '../../components/notes/Quiz';
import Diagram from '../../components/notes/Diagram';
import { formatDate } from '../../utils/formatDate';
import { CONTACT_EMAIL } from '../../data/contact';

// ── Sections written before the new template (no lastChecked): their topics keep the old blocks ──────────────────────
const SectionBlock = ({ title, items, icon: Icon, colorClass, bgClass, borderClass }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`mb-6 p-5 sm:p-6 rounded-2xl border ${bgClass} ${borderClass} shadow-sm text-left`}>
      <h4 className={`flex items-center gap-2 text-xs font-ui font-bold mb-3 uppercase tracking-wider ${colorClass}`}>
        {Icon && <Icon className="text-sm" />}
        {title}
      </h4>
      <ul className="space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-fg-2">
            <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
            <span className="leading-[1.7] text-[14.5px] sm:text-[15px]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// [topic field, heading, icon, token classes]. Spelled out in full so Tailwind can see every class.
const LEGACY_BLOCKS = [
  ['concept', 'Concept', FiInfo, 'text-info', 'bg-info-solid/[0.04]', 'border-info-solid/[0.12]'],
  ['deepInsight', 'Deep Insight', FiInfo, 'text-violet', 'bg-violet-solid/[0.04]', 'border-violet-solid/[0.12]'],
  ['why', 'Why it matters', null, 'text-warn', 'bg-warn-solid/[0.04]', 'border-warn-solid/[0.12]'],
  ['realWorld', 'Real World Examples', FiCheckCircle, 'text-ok', 'bg-ok-solid/[0.04]', 'border-ok-solid/[0.12]'],
  ['traps', 'Common Traps / Gotchas', FiAlertTriangle, 'text-bad', 'bg-bad-solid/[0.04]', 'border-bad-solid/[0.12]'],
  ['interviewAnswer', 'How to Answer in Interview', FiMessageSquare, 'text-brand', 'bg-brand/[0.04]', 'border-brand/[0.12]'],
  ['flow', 'Flow Step-by-Step', null, 'text-cyan', 'bg-cyan-solid/[0.04]', 'border-cyan-solid/[0.12]'],
  ['conditions', 'Conditions', null, 'text-yellow', 'bg-yellow-solid/[0.04]', 'border-yellow-solid/[0.12]'],
  ['pcbContains', 'PCB Contains', null, 'text-cyan', 'bg-cyan-solid/[0.04]', 'border-cyan-solid/[0.12]'],
  ['solution', 'Solution Concept', null, 'text-ok', 'bg-ok-solid/[0.04]', 'border-ok-solid/[0.12]'],
  ['list', 'Key Takeaways', null, 'text-fg-3', 'bg-ink/[0.02]', 'border-ink/[0.08]'],
];

const LegacyTopic = ({ topic }) => (
  <section className="mb-12">
    <h2 className="text-xl md:text-2xl font-display font-bold text-fg mb-5 text-left">{topic.name}</h2>
    {LEGACY_BLOCKS.map(([field, title, icon, colorClass, bgClass, borderClass]) => (
      <SectionBlock key={field} title={title} items={topic[field]} icon={icon} colorClass={colorClass} bgClass={bgClass} borderClass={borderClass} />
    ))}
    {topic.followUps && (
      <div className="mt-8 pt-6 border-t border-ink/[0.08] text-left">
        <h4 className="text-xs font-ui font-bold text-muted mb-3.5">Interview Follow-up Questions</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topic.followUps.map((q, idx) => (
            <li key={idx} className="bg-card border border-ink/[0.08] p-4 rounded-xl text-fg-3 text-xs sm:text-sm leading-relaxed hover:border-ink/[0.15] transition-colors">{q}</li>
          ))}
        </ul>
      </div>
    )}
  </section>
);

const LegacySection = ({ section }) => (
  <>
    {section.overview?.length > 0 && (
      <div className="mb-8 space-y-2 text-fg-3 text-sm md:text-base leading-relaxed text-left">
        {section.overview.map((line, i) => <p key={i}>{line}</p>)}
      </div>
    )}
    {section.topics.map((topic) => <LegacyTopic key={topic.name} topic={topic} />)}
  </>
);

// ── Sections written to the template (they have lastChecked) ──────────────────────────────────────────────────────────
const Heading = ({ children }) => <h2 className="text-xl md:text-2xl font-display font-bold text-fg mb-4 text-left">{children}</h2>;

const TopicCard = ({ topic }) => (
  <article className="rounded-2xl bg-card border border-ink/[0.08] p-5 sm:p-6 text-left space-y-3">
    <h3 className="font-display text-lg font-bold text-fg">{topic.name}</h3>
    <p className="text-fg-2 text-[15px] leading-[1.7]">{topic.definition}</p>
    <div className="rounded-xl bg-warn-solid/[0.04] border border-warn-solid/[0.12] p-4">
      <p className="text-xs font-ui font-bold uppercase tracking-wider text-warn mb-1.5">Why it matters</p>
      <p className="text-fg-3 text-sm leading-relaxed">{topic.why}</p>
    </div>
    <div className="rounded-xl bg-ok-solid/[0.04] border border-ok-solid/[0.12] p-4">
      <p className="text-xs font-ui font-bold uppercase tracking-wider text-ok mb-1.5">Example</p>
      <p className="text-fg-3 text-sm leading-relaxed whitespace-pre-wrap">{topic.example}</p>
    </div>
    <div className="rounded-xl bg-bad-solid/[0.04] border border-bad-solid/[0.12] p-4">
      <p className="text-xs font-ui font-bold uppercase tracking-wider text-bad mb-1.5">How it fails</p>
      <p className="text-fg-3 text-sm leading-relaxed">{topic.failure}</p>
    </div>
  </article>
);

// "blind-75:graph" -> the sheet page; "backend:learn-sql" -> that step on the roadmap page
const relatedLinks = (links) => [
  ...links.sheetTopics.map((target) => ({ key: target, path: `/dsa/${target.split(':')[0]}`, label: `Practise on the ${target.split(':')[0].replace(/-/g, ' ')} sheet` })),
  ...links.roadmapSteps.map((target) => { const [slug, step] = target.split(':'); return { key: target, path: `/roadmaps/${slug}#${step}`, label: `Roadmap: ${slug.replace(/-/g, ' ')}` }; }),
];

const ReviewedSection = ({ section }) => (
  <div className="space-y-12">
    <div className="space-y-2 text-fg-2 text-[15px] md:text-base leading-[1.75] text-left">
      {section.overview.map((line, i) => <p key={i}>{line}</p>)}
    </div>

    <div>
      <Heading>Topics</Heading>
      <div className="space-y-5">{section.topics.map((topic) => <TopicCard key={topic.name} topic={topic} />)}</div>
    </div>

    {section.diagrams?.length > 0 && (
      <div>
        <Heading>Diagrams</Heading>
        <div className="space-y-5">{section.diagrams.map((d) => <Diagram key={d.caption} diagram={d} />)}</div>
      </div>
    )}

    <div>
      <Heading>Common mistakes</Heading>
      <ul className="space-y-2.5 text-left">
        {section.mistakes.map((m) => (
          <li key={m} className="flex items-start gap-3 text-fg-3 text-sm md:text-[15px] leading-relaxed">
            <FiAlertTriangle className="text-bad mt-1 shrink-0" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <Heading>Interview questions</Heading>
      <div className="space-y-3 text-left">
        {section.questions.map((q) => (
          <Accordion key={q.question} title={q.question}>
            <p className="text-fg-3 text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap">{q.answer}</p>
          </Accordion>
        ))}
      </div>
    </div>

    <div>
      <Heading>Check yourself</Heading>
      <Quiz quiz={section.quiz} />
    </div>

    <div>
      <Heading>Keep going</Heading>
      <ul className="grid sm:grid-cols-2 gap-3">
        {relatedLinks(section.links).map((l) => (
          <li key={l.key}>
            <Link to={l.path} className="flex items-center justify-between gap-3 rounded-xl bg-card border border-ink/[0.08] hover:border-ink/[0.2] px-4 py-3 min-h-[44px] text-sm text-fg-2 hover:text-fg transition-colors">
              <span className="capitalize">{l.label}</span>
              <FiChevronRight className="text-muted shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function NotesDetail() {
  const { subject, sectionId } = useParams();
  const { data: noteConfig, loading, error } = useNotes(subject);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  // A new section starts at the top of the reading area
  useEffect(() => {
    document.getElementById('notes-content-container')?.scrollTo({ top: 0 });
  }, [subject, sectionId]);

  if (loading) {
    return <SkeletonNotesDetail />;
  }

  if (error || !noteConfig) {
    return <PageErrorState title="Failed to load notes" message={error || "Notes not found"} backTo="/notes" />;
  }

  const { sections, subject: subjectTitle } = noteConfig;
  // /notes/os opens the first section; /notes/os/<id> opens that one
  const index = sectionId ? sections.findIndex((s) => s.id === sectionId) : 0;
  if (index === -1) {
    return <PageErrorState title="Section not found" message="This section is not in these notes." backTo={`/notes/${subject}`} backLabel="Back to the notes" />;
  }
  const section = sections[index];
  const prevSection = sections[index - 1] || null;
  const nextSection = section.links?.next ? sections.find((s) => s.id === section.links.next) || null : sections[index + 1] || null;
  const reviewed = Boolean(section.lastChecked);
  const reportHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Mistake in notes: ${section.title} (${section.id})`)}`;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] -mt-6">

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-ink/[0.08] bg-card sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/notes" aria-label="Back to all subjects" className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg bg-ink/5 text-muted hover:text-fg hover:bg-ink/10 transition-colors">
            <FiChevronLeft className="text-base" />
          </Link>
          <div className="min-w-0 text-left">
            <p className="text-xs text-muted font-ui font-semibold">{subjectTitle}</p>
            <p className="text-sm font-semibold text-fg truncate">{section.title}</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-lg bg-ink/[0.06] border border-ink/[0.08] text-fg-2 hover:text-fg text-xs font-medium transition-colors"
        >
          <FiMenu className="text-sm" />
          Sections
        </button>
      </div>

      {/* ── Mobile Sidebar Backdrop ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-scrim/70 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar: the sections of this subject ── */}
      <div
        className={`
          fixed left-0 md:left-auto md:sticky top-0 md:top-[80px]
          h-screen md:h-[calc(100vh-80px)]
          w-[280px] md:w-64
          bg-card
          border-r border-ink/[0.08]
          z-50 md:z-auto
          flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-left
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-ink/[0.08] flex-shrink-0">
          <Link to="/notes" className="flex items-center gap-2 min-h-[44px] text-muted hover:text-fg transition-colors text-sm group">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-ink/5 group-hover:bg-ink/10 transition-colors">
              <FiChevronLeft className="text-sm" />
            </div>
            <span className="font-medium">All Subjects</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close the section list"
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-muted hover:text-fg hover:bg-ink/10 transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-3 border-b border-ink/[0.06] flex-shrink-0">
          <h2 className="font-display text-base font-bold text-fg mb-0.5">{subjectTitle}</h2>
          <p className="font-ui text-xs text-muted">{sections.length} sections</p>
        </div>

        <nav aria-label="Sections" className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          <ul className="px-3 space-y-0.5">
            {sections.map((s) => {
              const isActive = s.id === section.id;
              return (
                <li key={s.id}>
                  <Link
                    to={`/notes/${subject}/${s.id}`}
                    onClick={() => setIsSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-lg text-[13px] font-medium transition-colors duration-150 flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-brand/10 text-brand border border-brand/25 font-semibold'
                        : 'text-muted hover:bg-ink/[0.04] hover:text-fg-2 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{s.title}</span>
                    <span className="flex items-center gap-1.5 shrink-0 text-xs text-muted">
                      {s.lastChecked && <FiCheck className="text-ok" aria-label="Checked" />}
                      {s.readMinutes} min
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* ── Main Content: one section ── */}
      <div id="notes-content-container" className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10">
          <motion.div key={section.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <div className="flex items-center gap-1.5 text-xs text-muted mb-5 font-ui">
              <Link to="/notes" className="hover:text-fg-2 transition-colors">{subjectTitle}</Link>
              <FiChevronRight className="text-xs text-muted" />
              <span className="text-fg-2 truncate">{section.title}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-display font-bold text-fg mb-4 leading-tight text-left">{section.title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-ui text-muted mb-8 pb-4 border-b border-ink/[0.08]">
              <span className="flex items-center gap-1.5"><FiClock /> {section.readMinutes} min read</span>
              {reviewed && <span className="flex items-center gap-1.5"><FiCheck className="text-ok" /> Last checked {formatDate(section.lastChecked)}</span>}
              <a href={reportHref} className="flex items-center gap-1.5 min-h-[44px] text-fg-3 hover:text-brand transition-colors"><FiFlag /> Report a mistake</a>
            </div>

            {reviewed ? <ReviewedSection section={section} /> : <LegacySection section={section} />}

            <div className="mt-12 pt-8 border-t border-ink/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevSection ? (
                <Link to={`/notes/${subject}/${prevSection.id}`} className="group flex flex-col items-start p-4 rounded-xl border border-ink/[0.08] bg-card hover:border-ink/[0.2] transition-colors text-left">
                  <span className="flex items-center gap-1.5 text-xs text-muted font-ui mb-1"><FiChevronLeft className="group-hover:-translate-x-0.5 transition-transform" /> Previous section</span>
                  <span className="text-sm font-semibold text-fg-2 group-hover:text-fg truncate w-full">{prevSection.title}</span>
                </Link>
              ) : <div />}
              {nextSection ? (
                <Link to={`/notes/${subject}/${nextSection.id}`} className="group flex flex-col items-end p-4 rounded-xl border border-ink/[0.08] bg-card hover:border-brand/30 transition-colors text-right sm:col-start-2">
                  <span className="flex items-center gap-1.5 text-xs text-muted font-ui mb-1">Next section <FiChevronRight className="group-hover:translate-x-0.5 transition-transform text-brand" /></span>
                  <span className="text-sm font-semibold text-fg-2 group-hover:text-fg truncate w-full">{nextSection.title}</span>
                </Link>
              ) : <div />}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
