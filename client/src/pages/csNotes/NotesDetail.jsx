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
      <h4 className={`flex items-center gap-2 text-xs font-mono font-bold mb-3 uppercase tracking-wider ${colorClass}`}>
        {Icon && <Icon className="text-sm" />}
        {title}
      </h4>
      <ul className="space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-zinc-200">
            <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
            <span className="leading-relaxed text-sm">{item}</span>
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
        <FiAlertTriangle className="text-rose-500 text-4xl mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Failed to load notes</h2>
        <p className="text-zinc-400 mb-6 text-sm">{error || "Notes not found"}</p>
        <Link to="/notes" className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors text-sm">
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
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#0c0c0e] sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/notes" className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
            <FiChevronLeft className="text-base" />
          </Link>
          <div className="min-w-0 text-left">
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest font-semibold">{subjectTitle}</p>
            <p className="text-sm font-semibold text-white truncate">{activeTopic?.name || 'Select topic'}</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-zinc-200 hover:text-white text-xs font-medium transition-colors"
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
            className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <div
        className={`
          fixed md:sticky top-0 md:top-[80px]
          h-screen md:h-[calc(100vh-80px)]
          w-[280px] md:w-64
          bg-[#0c0c0e]
          border-r border-white/[0.08]
          z-50 md:z-auto
          flex flex-col
          transition-transform duration-200 ease-in-out text-left
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.08] flex-shrink-0">
          <Link
            to="/notes"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm group"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <FiChevronLeft className="text-sm" />
            </div>
            <span className="font-medium">All Subjects</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        </div>

        {/* Subject Title */}
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="font-display text-base font-bold text-white mb-0.5">{subjectTitle}</h2>
          <p className="font-mono text-xs text-zinc-400">{totalTopics} topics</p>
        </div>

        {/* Topic List */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          <div className="px-3 space-y-5">
            {sections.map((section, sIdx) => (
              <div key={sIdx}>
                <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 px-2">
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
                              ? 'bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/25 font-semibold' 
                              : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent'
                          }`}
                        >
                          <span className="truncate">{topic.name}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116] flex-shrink-0 ml-2" />}
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
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-5 font-mono">
                <Link to="/notes" className="hover:text-zinc-200 transition-colors">{subjectTitle}</Link>
                <FiChevronRight className="text-xs text-zinc-600" />
                <span className="text-zinc-200 truncate">{activeTopic.name}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-6 pb-4 border-b border-white/[0.08] leading-tight text-left">
                {activeTopic.name}
              </h1>

              <SectionBlock 
                title="Concept" 
                items={activeTopic.concept} 
                icon={FiInfo}
                colorClass="text-blue-400" bgClass="bg-blue-500/[0.04]" borderClass="border-blue-500/[0.12]" 
              />

              <SectionBlock 
                title="Deep Insight" 
                items={activeTopic.deepInsight} 
                icon={FiInfo}
                colorClass="text-purple-400" bgClass="bg-purple-500/[0.04]" borderClass="border-purple-500/[0.12]" 
              />

              <SectionBlock 
                title="Why it matters" 
                items={activeTopic.why} 
                colorClass="text-amber-400" bgClass="bg-amber-500/[0.04]" borderClass="border-amber-500/[0.12]" 
              />

              <SectionBlock 
                title="Real World Examples" 
                items={activeTopic.realWorld} 
                icon={FiCheckCircle}
                colorClass="text-emerald-400" bgClass="bg-emerald-500/[0.04]" borderClass="border-emerald-500/[0.12]" 
              />

              <SectionBlock 
                title="Common Traps / Gotchas" 
                items={activeTopic.traps} 
                icon={FiAlertTriangle}
                colorClass="text-red-400" bgClass="bg-red-500/[0.04]" borderClass="border-red-500/[0.12]" 
              />

              <SectionBlock 
                title="How to Answer in Interview" 
                items={activeTopic.interviewAnswer} 
                icon={FiMessageSquare}
                colorClass="text-[#ffa116]" bgClass="bg-[#ffa116]/[0.04]" borderClass="border-[#ffa116]/[0.12]" 
              />

              {activeTopic.flow && (
                <SectionBlock 
                  title="Flow Step-by-Step" 
                  items={activeTopic.flow} 
                  colorClass="text-cyan-400" bgClass="bg-cyan-500/[0.04]" borderClass="border-cyan-500/[0.12]" 
                />
              )}

              {activeTopic.conditions && (
                <SectionBlock 
                  title="Conditions" 
                  items={activeTopic.conditions} 
                  colorClass="text-yellow-400" bgClass="bg-yellow-500/[0.04]" borderClass="border-yellow-500/[0.12]" 
                />
              )}

              {activeTopic.pcbContains && (
                <SectionBlock 
                  title="PCB Contains" 
                  items={activeTopic.pcbContains} 
                  colorClass="text-teal-400" bgClass="bg-teal-500/[0.04]" borderClass="border-teal-500/[0.12]" 
                />
              )}

              {activeTopic.solution && (
                <SectionBlock 
                  title="Solution Concept" 
                  items={activeTopic.solution} 
                  colorClass="text-emerald-400" bgClass="bg-emerald-500/[0.04]" borderClass="border-emerald-500/[0.12]" 
                />
              )}

              {activeTopic.list && (
                <SectionBlock 
                  title="Key Takeaways" 
                  items={activeTopic.list} 
                  colorClass="text-zinc-300" bgClass="bg-white/[0.02]" borderClass="border-white/[0.08]" 
                />
              )}

              {activeTopic.followUps && (
                <div className="mt-8 pt-6 border-t border-white/[0.08] text-left">
                  <h4 className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3.5">
                    Interview Follow-up Questions
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeTopic.followUps.map((q, idx) => (
                      <li key={idx} className="bg-[#0c0c0e] border border-white/[0.08] p-4 rounded-xl text-zinc-300 text-xs sm:text-sm leading-relaxed hover:border-white/[0.15] transition-colors">
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
                  <div className="mt-12 pt-8 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {prevTopic ? (
                      <button
                        onClick={() => {
                          setSelectedTopic(prevTopic);
                          scrollToReadingTop();
                        }}
                        className="group flex flex-col items-start p-4 rounded-xl border border-white/[0.08] bg-[#0c0c0e] hover:border-white/[0.2] hover:bg-white/[0.02] transition-colors text-left"
                      >
                        <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mb-1">
                          <FiChevronLeft className="group-hover:-translate-x-0.5 transition-transform" />
                          Previous Topic
                        </span>
                        <span className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate w-full">
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
                        className="group flex flex-col items-end p-4 rounded-xl border border-white/[0.08] bg-[#0c0c0e] hover:border-[#ffa116]/30 hover:bg-[#ffa116]/[0.02] transition-colors text-right sm:col-start-2"
                      >
                        <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mb-1">
                          Next Topic
                          <FiChevronRight className="group-hover:translate-x-0.5 transition-transform text-[#ffa116]" />
                        </span>
                        <span className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate w-full">
                          {nextTopic.name}
                        </span>
                      </button>
                    ) : <div />}
                  </div>
                );
              })()}

            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 text-zinc-400 text-sm font-mono">
              Select a topic from the sidebar to start reading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}