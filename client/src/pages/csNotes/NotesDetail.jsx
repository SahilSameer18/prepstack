import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiMenu, FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import { useNotes } from '../../hooks/useNotes';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonNotesDetail } from '../../components/ui/Skeletons';

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

export default function NotesDetail() {
  const { subject } = useParams();
  const { data: noteConfig, loading, error } = useNotes(subject);
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [prevSubject, setPrevSubject] = useState(subject);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reset selected topic when subject param changes
  if (prevSubject !== subject) {
    setPrevSubject(subject);
    setSelectedTopic(null);
  }

  // Derive activeTopic: selected topic or default to first topic of first section
  const activeTopic = selectedTopic || (noteConfig?.sections?.[0]?.topics?.[0] ?? null);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  if (loading) {
    return <SkeletonNotesDetail />;
  }

  if (error || !noteConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <FiAlertTriangle className="text-bad-solid text-4xl mb-4" />
        <h2 className="text-xl font-bold text-fg mb-2">Failed to load notes</h2>
        <p className="text-muted mb-6 text-sm">{error || "Notes not found"}</p>
        <Link to="/notes" className="px-5 py-2 bg-ink/10 hover:bg-ink/20 rounded-full text-fg transition-colors text-sm">
          Go Back
        </Link>
      </div>
    );
  }

  const { sections, subject: subjectTitle } = noteConfig;

  // Count total topics
  const totalTopics = sections.reduce((acc, s) => acc + s.topics.length, 0);

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
            <p className="text-sm font-semibold text-fg truncate">{activeTopic?.name || 'Select topic'}</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-lg bg-ink/[0.06] border border-ink/[0.08] text-fg-2 hover:text-fg text-xs font-medium transition-colors"
        >
          <FiMenu className="text-sm" />
          Topics
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

      {/* ── Sidebar ── */}
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
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-ink/[0.08] flex-shrink-0">
          <Link
            to="/notes"
            className="flex items-center gap-2 min-h-[44px] text-muted hover:text-fg transition-colors text-sm group"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-ink/5 group-hover:bg-ink/10 transition-colors">
              <FiChevronLeft className="text-sm" />
            </div>
            <span className="font-medium">All Subjects</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-muted hover:text-fg hover:bg-ink/10 transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        </div>

        {/* Subject Title */}
        <div className="px-4 pt-4 pb-3 border-b border-ink/[0.06] flex-shrink-0">
          <h2 className="font-display text-base font-bold text-fg mb-0.5">{subjectTitle}</h2>
          <p className="font-ui text-xs text-muted">{totalTopics} topics</p>
        </div>

        {/* Topic List */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          <div className="px-3 space-y-5">
            {sections.map((section, sIdx) => (
              <div key={sIdx}>
                <p className="text-xs font-ui font-semibold text-muted mb-1.5 px-2">
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.topics.map((topic, tIdx) => {
                    const isActive = activeTopic?.name === topic.name;
                    return (
                      <li key={tIdx}>
                        <button
                          onClick={() => {
                            setSelectedTopic(topic);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 flex items-center justify-between group cursor-pointer ${
                            isActive 
                              ? 'bg-brand/10 text-brand border border-brand/25 font-semibold' 
                              : 'text-muted hover:bg-ink/[0.04] hover:text-fg-2 border border-transparent'
                          }`}
                        >
                          <span className="truncate">{topic.name}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0 ml-2" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div id="notes-content-container" className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10">
          {activeTopic ? (
            <motion.div
              key={activeTopic.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-muted mb-5 font-ui">
                <Link to="/notes" className="hover:text-fg-2 transition-colors">{subjectTitle}</Link>
                <FiChevronRight className="text-xs text-muted" />
                <span className="text-fg-2 truncate">{activeTopic.name}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-fg mb-6 pb-4 border-b border-ink/[0.08] leading-tight text-left">
                {activeTopic.name}
              </h1>

              <SectionBlock 
                title="Concept" 
                items={activeTopic.concept} 
                icon={FiInfo}
                colorClass="text-info" bgClass="bg-info-solid/[0.04]" borderClass="border-info-solid/[0.12]" 
              />

              <SectionBlock 
                title="Deep Insight" 
                items={activeTopic.deepInsight} 
                icon={FiInfo}
                colorClass="text-violet" bgClass="bg-violet-solid/[0.04]" borderClass="border-violet-solid/[0.12]" 
              />

              <SectionBlock 
                title="Why it matters" 
                items={activeTopic.why} 
                colorClass="text-warn" bgClass="bg-warn-solid/[0.04]" borderClass="border-warn-solid/[0.12]" 
              />

              <SectionBlock 
                title="Real World Examples" 
                items={activeTopic.realWorld} 
                icon={FiCheckCircle}
                colorClass="text-ok" bgClass="bg-ok-solid/[0.04]" borderClass="border-ok-solid/[0.12]" 
              />

              <SectionBlock 
                title="Common Traps / Gotchas" 
                items={activeTopic.traps} 
                icon={FiAlertTriangle}
                colorClass="text-bad" bgClass="bg-bad-solid/[0.04]" borderClass="border-bad-solid/[0.12]" 
              />

              <SectionBlock 
                title="How to Answer in Interview" 
                items={activeTopic.interviewAnswer} 
                icon={FiMessageSquare}
                colorClass="text-brand" bgClass="bg-brand/[0.04]" borderClass="border-brand/[0.12]" 
              />

              {activeTopic.flow && (
                <SectionBlock 
                  title="Flow Step-by-Step" 
                  items={activeTopic.flow} 
                  colorClass="text-cyan" bgClass="bg-cyan-solid/[0.04]" borderClass="border-cyan-solid/[0.12]" 
                />
              )}

              {activeTopic.conditions && (
                <SectionBlock 
                  title="Conditions" 
                  items={activeTopic.conditions} 
                  colorClass="text-yellow" bgClass="bg-yellow-solid/[0.04]" borderClass="border-yellow-solid/[0.12]" 
                />
              )}

              {activeTopic.pcbContains && (
                <SectionBlock 
                  title="PCB Contains" 
                  items={activeTopic.pcbContains} 
                  colorClass="text-cyan" bgClass="bg-cyan-solid/[0.04]" borderClass="border-cyan-solid/[0.12]" 
                />
              )}

              {activeTopic.solution && (
                <SectionBlock 
                  title="Solution Concept" 
                  items={activeTopic.solution} 
                  colorClass="text-ok" bgClass="bg-ok-solid/[0.04]" borderClass="border-ok-solid/[0.12]" 
                />
              )}

              {activeTopic.list && (
                <SectionBlock 
                  title="Key Takeaways" 
                  items={activeTopic.list} 
                  colorClass="text-fg-3" bgClass="bg-ink/[0.02]" borderClass="border-ink/[0.08]" 
                />
              )}

              {activeTopic.followUps && (
                <div className="mt-8 pt-6 border-t border-ink/[0.08] text-left">
                  <h4 className="text-xs font-ui font-bold text-muted mb-3.5">
                    Interview Follow-up Questions
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeTopic.followUps.map((q, idx) => (
                      <li key={idx} className="bg-card border border-ink/[0.08] p-4 rounded-xl text-fg-3 text-xs sm:text-sm leading-relaxed hover:border-ink/[0.15] transition-colors">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next / Previous Topic Footer */}
              {(() => {
                const allTopics = sections.flatMap(s => s.topics);
                const currentIndex = allTopics.findIndex(t => t.name === activeTopic.name);
                const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
                const nextTopic = currentIndex >= 0 && currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

                const scrollToReadingTop = () => {
                  const el = document.getElementById('notes-content-container');
                  if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
                };

                return (
                  <div className="mt-12 pt-8 border-t border-ink/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {prevTopic ? (
                      <button
                        onClick={() => {
                          setSelectedTopic(prevTopic);
                          scrollToReadingTop();
                        }}
                        className="group flex flex-col items-start p-4 rounded-xl border border-ink/[0.08] bg-card hover:border-ink/[0.2] hover:bg-ink/[0.02] transition-colors text-left"
                      >
                        <span className="flex items-center gap-1.5 text-xs text-muted font-ui mb-1">
                          <FiChevronLeft className="group-hover:-translate-x-0.5 transition-transform" />
                          Previous Topic
                        </span>
                        <span className="text-sm font-semibold text-fg-2 group-hover:text-fg truncate w-full">
                          {prevTopic.name}
                        </span>
                      </button>
                    ) : <div />}

                    {nextTopic ? (
                      <button
                        onClick={() => {
                          setSelectedTopic(nextTopic);
                          scrollToReadingTop();
                        }}
                        className="group flex flex-col items-end p-4 rounded-xl border border-ink/[0.08] bg-card hover:border-brand/30 hover:bg-brand/[0.02] transition-colors text-right sm:col-start-2"
                      >
                        <span className="flex items-center gap-1.5 text-xs text-muted font-ui mb-1">
                          Next Topic
                          <FiChevronRight className="group-hover:translate-x-0.5 transition-transform text-brand" />
                        </span>
                        <span className="text-sm font-semibold text-fg-2 group-hover:text-fg truncate w-full">
                          {nextTopic.name}
                        </span>
                      </button>
                    ) : <div />}
                  </div>
                );
              })()}

            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted text-sm font-ui">
              Select a topic from the sidebar to start reading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}