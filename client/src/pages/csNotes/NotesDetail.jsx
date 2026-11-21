import { useState, useEffect } from 'react';
import { CaretLeft, CaretRight, ChatCircle, Check, CheckCircle, Clock, Flag, Info, List, Warning, X } from "@phosphor-icons/react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotes, useNotesSummary } from '../../hooks/useNotes';
import { useActiveHeading } from '../../hooks/useActiveHeading';
import { useAuth } from '../../hooks/useAuth';
import SignInNotice from '../../components/auth/SignInNotice';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SkeletonNotesDetail } from '../../components/ui/Skeletons';
import { useLoadingGate } from '../../hooks/useLoadingGate';
import { PageErrorState } from '../../components/ui/ErrorComponents';
import SelectField from '../../components/ui/SelectField';
import PageBackdrop from '../../components/ui/PageBackdrop';
import Accordion from '../../components/ui/Accordion';
import Quiz from '../../components/notes/Quiz';
import Diagram from '../../components/notes/Diagram';
import { formatDate } from '../../utils/formatDate';
import { CONTACT_EMAIL } from '../../data/contact';

// ── Sections written before the new template (no lastChecked): their topics keep the old blocks ────────────────
// One neutral look for every block; amber marks the interview answer and red the traps, as everywhere else in the app.
const SectionBlock = ({ title, items, icon: Icon, colorClass, bgClass, borderClass }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`mb-6 p-5 sm:p-6 rounded-2xl border ${bgClass} ${borderClass} text-left`}>
      <h4 className={`flex items-center gap-2 text-sm font-ui font-bold mb-3 ${colorClass}`}>
        {Icon && <Icon className="text-sm" />}
        {title}
      </h4>
      <ul className="space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-fg-2">
            <span className={`mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
            <span className="leading-[1.75] text-[15px] sm:text-base">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// [topic field, heading, icon, token classes]. Spelled out in full so Tailwind can see every class.
const NEUTRAL = ['text-fg-3', 'bg-ink/[0.025]', 'border-ink/[0.08]'];
const LEGACY_BLOCKS = [
  ['concept', 'Concept', Info, ...NEUTRAL],
  ['deepInsight', 'Deep Insight', Info, ...NEUTRAL],
  ['why', 'Why it matters', null, ...NEUTRAL],
  ['realWorld', 'Real World Examples', CheckCircle, ...NEUTRAL],
  ['traps', 'Common Traps / Gotchas', Warning, 'text-bad', 'bg-bad-solid/[0.05]', 'border-bad-solid/[0.18]'],
  ['interviewAnswer', 'How to Answer in Interview', ChatCircle, 'text-brand', 'bg-brand/[0.06]', 'border-brand/[0.2]'],
  ['flow', 'Flow Step-by-Step', null, ...NEUTRAL],
  ['conditions', 'Conditions', null, ...NEUTRAL],
  ['pcbContains', 'PCB Contains', null, ...NEUTRAL],
  ['solution', 'Solution Concept', null, ...NEUTRAL],
  ['list', 'Key Takeaways', null, ...NEUTRAL],
];

const LegacyTopic = ({ topic }) => (
  <section className="mb-12">
    <h2 className="text-2xl font-display font-extrabold tracking-tight text-fg mb-5 text-left">{topic.name}</h2>
    {LEGACY_BLOCKS.map(([field, title, icon, colorClass, bgClass, borderClass]) => (
      <SectionBlock key={field} title={title} items={topic[field]} icon={icon} colorClass={colorClass} bgClass={bgClass} borderClass={borderClass} />
    ))}
    {topic.followUps && (
      <div className="mt-8 pt-6 border-t border-ink/[0.08] text-left">
        <h4 className="text-sm font-ui font-bold text-muted mb-3.5">Interview Follow-up Questions</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topic.followUps.map((q, idx) => (
            <li key={idx} className="bg-card border border-ink/[0.08] p-4 rounded-xl text-fg-3 text-sm leading-relaxed hover:border-ink/[0.15] transition-colors">{q}</li>
          ))}
        </ul>
      </div>
    )}
  </section>
);

const LegacySection = ({ section }) => (
  <>
    {section.overview?.length > 0 && (
      <div className="mb-8 space-y-3 text-fg-2 text-[17px] leading-[1.75] text-left">
        {section.overview.map((line, i) => <p key={i}>{line}</p>)}
      </div>
    )}
    {section.topics.map((topic) => <LegacyTopic key={topic.name} topic={topic} />)}
  </>
);

// ── Sections written to the template (they have lastChecked) ──────────────────────────────────────────────────────────
const Heading = ({ id, children }) => <h2 id={id} className="scroll-mt-28 text-2xl font-display font-extrabold tracking-tight text-fg mb-5 text-left">{children}</h2>;

const topicId = (name) => 'topic-' + String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const TopicCard = ({ topic }) => (
  <article id={topicId(topic.name)} className="scroll-mt-28 rounded-2xl bg-card border border-ink/[0.1] p-5 sm:p-6 text-left space-y-4 shadow-[0_1px_2px_color-mix(in_srgb,var(--shadow)_12%,transparent),0_16px_30px_-22px_color-mix(in_srgb,var(--shadow)_38%,transparent)] transition-[border-color,box-shadow] duration-200 hover:border-ink/[0.2] hover:shadow-[0_1px_2px_color-mix(in_srgb,var(--shadow)_14%,transparent),0_22px_38px_-22px_color-mix(in_srgb,var(--shadow)_50%,transparent)]">
    <h3 className="font-display text-xl font-extrabold tracking-tight text-fg">{topic.name}</h3>
    <p className="text-fg-2 text-[17px] leading-[1.75]">{topic.definition}</p>
    <div className="rounded-xl bg-brand/[0.07] border border-brand/[0.2] p-4">
      <p className="text-sm font-ui font-bold text-brand mb-1.5">Why it matters</p>
      <p className="text-fg-2 text-base leading-relaxed">{topic.why}</p>
    </div>
    <div className="rounded-xl bg-ink/[0.03] border border-ink/[0.08] p-4">
      <p className="text-sm font-ui font-bold text-fg-3 mb-1.5">Example</p>
      <p className="text-fg-2 text-base leading-relaxed whitespace-pre-wrap">{topic.example}</p>
    </div>
    <div className="rounded-xl bg-bad-solid/[0.05] border border-bad-solid/[0.18] p-4">
      <p className="text-sm font-ui font-bold text-bad mb-1.5">How it fails</p>
      <p className="text-fg-2 text-base leading-relaxed">{topic.failure}</p>
    </div>
  </article>
);

// "blind-75:graph" -> the sheet page; "backend:learn-sql" -> that step on the roadmap page
const relatedLinks = (links) => [
  ...links.sheetTopics.map((target) => ({ key: target, path: `/dsa/${target.split(':')[0]}`, label: `Practise on the ${target.split(':')[0].replace(/-/g, ' ')} sheet` })),
  ...links.roadmapSteps.map((target) => { const [slug, step] = target.split(':'); return { key: target, path: `/roadmaps/${slug}#${step}`, label: `Roadmap: ${slug.replace(/-/g, ' ')}` }; }),
];

// The headings of a reviewed section, for the "On this page" list: [{ id, label, sub?: [{ id, label }] }]
const outlineOf = (section) => [
  { id: 'topics', label: 'Topics', sub: section.topics.map((t) => ({ id: topicId(t.name), label: t.name })) },
  ...(section.diagrams?.length > 0 ? [{ id: 'diagrams', label: 'Diagrams' }] : []),
  { id: 'mistakes', label: 'Common mistakes' },
  { id: 'questions', label: 'Interview questions' },
  { id: 'quiz', label: 'Check yourself' },
  { id: 'keep-going', label: 'Keep going' },
];

const OnThisPage = ({ outline }) => {
  const ids = outline.flatMap((o) => [o.id, ...(o.sub || []).map((s) => s.id)]);
  const active = useActiveHeading(ids);
  const link = (item, small) => (
    <a
      key={item.id}
      href={`#${item.id}`}
      aria-current={active === item.id ? 'location' : undefined}
      className={`block py-1 leading-snug transition-colors ${small ? 'pl-3 text-[13px]' : 'text-sm font-semibold'} ${active === item.id ? 'text-brand' : 'text-muted hover:text-fg'}`}
    >
      {item.label}
    </a>
  );
  return (
    <nav aria-label="On this page" className="text-left">
      <p className="mb-2 font-ui text-xs font-bold text-fg-3">On this page</p>
      <ul className="space-y-0.5 border-l border-ink/[0.1] pl-3">
        {outline.map((o) => (
          <li key={o.id}>
            {link(o)}
            {o.sub && <div>{o.sub.map((s) => link(s, true))}</div>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

const ReviewedSection = ({ section }) => {
  const { user, loading: authLoading } = useAuth();
  const [quizDone, setQuizDone] = useState(false);
  return (
  <div className="space-y-14">
    <div className="space-y-3 text-fg-2 text-[17px] leading-[1.75] text-left">
      {section.overview.map((line, i) => <p key={i}>{line}</p>)}
    </div>

    <div>
      <Heading id="topics">Topics</Heading>
      <div className="space-y-5">{section.topics.map((topic) => <TopicCard key={topic.name} topic={topic} />)}</div>
    </div>

    {section.diagrams?.length > 0 && (
      <div>
        <Heading id="diagrams">Diagrams</Heading>
        <div className="space-y-5">{section.diagrams.map((d) => <Diagram key={d.caption} diagram={d} />)}</div>
      </div>
    )}

    <div>
      <Heading id="mistakes">Common mistakes</Heading>
      <ul className="space-y-3 text-left">
        {section.mistakes.map((m) => (
          <li key={m} className="flex items-start gap-3 text-fg-2 text-base leading-relaxed">
            <Warning className="text-bad mt-1.5 shrink-0" aria-hidden="true" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <Heading id="questions">Interview questions</Heading>
      <div className="space-y-3 text-left">
        {section.questions.map((q) => (
          <Accordion key={q.question} title={q.question}>
            <p className="text-fg-2 text-base leading-relaxed whitespace-pre-wrap">{q.answer}</p>
          </Accordion>
        ))}
      </div>
    </div>

    <div>
      <Heading id="quiz">Check yourself</Heading>
      <Quiz quiz={section.quiz} onComplete={(correct) => setQuizDone(correct !== null)} />
      {quizDone && !user && !authLoading && (
        <div className="mt-4">
          <SignInNotice text="This score is not saved. Sign in to keep track of your progress in My plan." />
        </div>
      )}
    </div>

    <div>
      <Heading id="keep-going">Keep going</Heading>
      <ul className="grid sm:grid-cols-2 gap-3">
        {relatedLinks(section.links).map((l) => (
          <li key={l.key}>
            <Link to={l.path} className="flex items-center justify-between gap-3 rounded-xl bg-card border border-ink/[0.1] hover:border-ink/[0.22] px-4 py-3 min-h-[44px] text-sm text-fg-2 hover:text-fg transition-colors">
              <span className="capitalize">{l.label}</span>
              <CaretRight className="text-muted shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
  );
};

// The list of sections, with the subject switcher on top. The same list sits in the side column and in the phone drawer.
// slideId: the desktop list and the phone drawer each slide their own highlight
const SectionList = ({ subject, subjectTitle, sections, activeId, onPick, slideId }) => {
  const navigate = useNavigate();
  const calm = useReducedMotion();
  const summary = useNotesSummary();
  const subjects = summary ? Object.values(summary) : [];
  return (
    <div className="text-left">
      <label htmlFor="notes-subject" className="mb-1.5 block font-ui text-xs font-bold text-fg-3">Subject</label>
      {subjects.length > 1 ? (
        <SelectField
          id="notes-subject"
          value={subject}
          options={subjects.map((s) => ({ value: s.subjectSlug, label: s.subject || s.subjectSlug }))}
          onValueChange={(v) => { onPick?.(); navigate(`/notes/${v}`); }}
          className="!bg-card font-semibold"
        />
      ) : (
        <p id="notes-subject" className="min-h-[44px] content-center text-sm font-semibold text-fg">{subjectTitle}</p>
      )}
      <p className="mb-2 mt-5 font-ui text-xs font-bold text-fg-3">{sections.length} sections</p>
      <nav aria-label="Sections">
        <ol className="space-y-0.5">
          {sections.map((s, i) => {
            const isActive = s.id === activeId;
            return (
              <li key={s.id}>
                <Link
                  to={`/notes/${subject}/${s.id}`}
                  onClick={onPick}
                  aria-current={isActive ? 'page' : undefined}
                  title={`${s.title} (${s.readMinutes} min)`}
                  className={`relative flex min-h-[44px] items-start gap-3 rounded-xl px-3 py-2.5 text-sm leading-snug transition-colors ${
                    isActive ? 'font-semibold text-brand' : 'text-muted hover:bg-ink/[0.05] hover:text-fg'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      aria-hidden="true"
                      layoutId={calm ? undefined : slideId}
                      className="absolute inset-0 -z-10 rounded-xl bg-brand/12"
                      transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                    />
                  )}
                  <span className="w-5 shrink-0 text-right font-ui text-xs leading-[1.4rem] opacity-70">{i + 1}</span>
                  <span>{s.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default function NotesDetail() {
  const { subject, sectionId } = useParams();
  const { data: noteConfig, loading, error } = useNotes(subject);
  const gate = useLoadingGate(loading);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  // A new section starts at the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [subject, sectionId]);

  if (gate === 'blank') return <div className="min-h-[60vh]" />;
  if (gate === 'skeleton') return <SkeletonNotesDetail />;

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
  const listProps = { subject, subjectTitle, sections, activeId: section.id, onPick: () => setIsSidebarOpen(false) };

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16rem_minmax(0,1fr)_13rem]">

        {/* ── Phone: the section list opens as a drawer ── */}
        <div className="lg:hidden sticky top-16 z-30 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-ink/[0.1] bg-canvas/85 px-4 py-2 backdrop-blur-xl">
          <div className="min-w-0 text-left">
            <p className="font-ui text-xs font-semibold text-muted">{subjectTitle}</p>
            <p className="truncate text-sm font-semibold text-fg">{section.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-ink/[0.12] bg-card px-3.5 text-sm font-medium text-fg-2 transition-colors hover:text-fg"
          >
            <List className="text-sm" aria-hidden="true" />
            Sections
          </button>
        </div>

        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-scrim/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
                className="fixed bottom-0 left-0 top-16 z-50 w-[300px] max-w-[88vw] overflow-y-auto border-r border-ink/[0.1] bg-card p-4 lg:hidden"
                aria-label="Sections"
              >
                <div className="mb-3 flex items-center justify-between">
                  <Link to="/notes" onClick={() => setIsSidebarOpen(false)} className="flex min-h-[44px] items-center gap-1.5 text-sm text-muted hover:text-fg">
                    <CaretLeft aria-hidden="true" /> All subjects
                  </Link>
                  <button type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close the section list" className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-ink/[0.06] hover:text-fg">
                    <X aria-hidden="true" />
                  </button>
                </div>
                <SectionList {...listProps} slideId="section-slide-drawer" />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Desktop: the section list stays beside the article ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pr-1 scrollbar-thin">
            <Link to="/notes" className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
              <CaretLeft aria-hidden="true" /> All subjects
            </Link>
            <SectionList {...listProps} slideId="section-slide-side" />
          </div>
        </aside>

        {/* ── The article: one section ── */}
        <div className="min-w-0 pb-4">
          <motion.div key={section.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="max-w-3xl">
            <div className="mb-5 flex items-center gap-1.5 font-ui text-xs text-muted">
              <Link to="/notes" className="transition-colors hover:text-fg-2">{subjectTitle}</Link>
              <CaretRight className="text-xs" aria-hidden="true" />
              <span className="truncate text-fg-2">{section.title}</span>
            </div>

            <h1 className="mb-4 text-left font-display text-3xl font-black leading-[1.1] tracking-[-0.03em] text-fg md:text-4xl">{section.title}</h1>

            <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-ink/[0.1] pb-5 font-ui text-sm text-muted">
              <span className="flex items-center gap-1.5"><Clock aria-hidden="true" /> {section.readMinutes} min read</span>
              {reviewed && <span className="flex items-center gap-1.5"><Check className="text-ok" aria-hidden="true" /> Last checked {formatDate(section.lastChecked)}</span>}
              <a href={reportHref} className="flex min-h-[44px] items-center gap-1.5 text-fg-3 transition-colors hover:text-brand"><Flag aria-hidden="true" /> Report a mistake</a>
            </div>

            {reviewed ? <ReviewedSection section={section} /> : <LegacySection section={section} />}

            <div className="mt-14 grid grid-cols-1 gap-4 border-t border-ink/[0.1] pt-8 sm:grid-cols-2">
              {prevSection ? (
                <Link to={`/notes/${subject}/${prevSection.id}`} className="group flex flex-col items-start rounded-2xl border border-ink/[0.1] bg-card p-4 text-left transition-[border-color,transform] duration-150 hover:border-ink/[0.22] active:scale-[0.99]">
                  <span className="mb-1 flex items-center gap-1.5 font-ui text-xs text-muted"><CaretLeft className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Previous section</span>
                  <span className="w-full text-sm font-semibold text-fg-2 group-hover:text-fg">{prevSection.title}</span>
                </Link>
              ) : <div />}
              {nextSection ? (
                <Link to={`/notes/${subject}/${nextSection.id}`} className="group flex flex-col items-end rounded-2xl border border-ink/[0.1] bg-card p-4 text-right transition-[border-color,transform] duration-150 hover:border-brand/40 active:scale-[0.99] sm:col-start-2">
                  <span className="mb-1 flex items-center gap-1.5 font-ui text-xs text-muted">Next section <CaretRight className="text-brand transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                  <span className="w-full text-sm font-semibold text-fg-2 group-hover:text-fg">{nextSection.title}</span>
                </Link>
              ) : <div />}
            </div>
          </motion.div>
        </div>

        {/* ── Wide screens: the headings of this section ── */}
        {reviewed && (
          <aside className="hidden xl:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 scrollbar-thin">
              <OnThisPage key={section.id} outline={outlineOf(section)} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
