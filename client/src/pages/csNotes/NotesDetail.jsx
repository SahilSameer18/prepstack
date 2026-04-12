import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiMenu, FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import { useNotes } from '../../hooks/useNotes';
import { motion, AnimatePresence } from 'framer-motion';

const SectionBlock = ({ title, items, icon: Icon, colorClass, bgClass, borderClass }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <div className={`mb-5 p-5 rounded-2xl border ${bgClass} ${borderClass} shadow-sm`}>
      <h4 className={`flex items-center gap-2 text-sm font-bold mb-3 uppercase tracking-wider ${colorClass}`}>
        {Icon && <Icon className="text-base" />}
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-gray-300">
            <span className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
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
  
  const [activeTopic, setActiveTopic] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (noteConfig && noteConfig.sections && noteConfig.sections.length > 0) {
      if (noteConfig.sections[0].topics && noteConfig.sections[0].topics.length > 0) {
        setActiveTopic(noteConfig.sections[0].topics[0]);
      }
    }
  }, [noteConfig]);

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
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !noteConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <FiAlertTriangle className="text-red-500 text-4xl mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Failed to load notes</h2>
        <p className="text-gray-400 mb-6 text-sm">{error || "Notes not found"}</p>
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
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#0a0a0a] sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/notes" className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <FiChevronLeft className="text-base" />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{subjectTitle}</p>
            <p className="text-sm font-semibold text-white truncate">{activeTopic?.name || 'Select topic'}</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:text-white text-xs font-medium transition-colors"
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
      <AnimatePresence>
        {(isSidebarOpen || true) && (
          <div
            className={`
              fixed md:sticky top-0 md:top-[80px]
              h-screen md:h-[calc(100vh-80px)]
              w-[280px] md:w-64
              bg-[#0c0c0c] md:bg-[#0d0d0d]
              border-r border-white/[0.07]
              z-50 md:z-auto
              flex flex-col
              transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.07] flex-shrink-0">
              <Link
                to="/notes"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <FiChevronLeft className="text-sm" />
                </div>
                <span className="font-medium">All Subjects</span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Subject Title */}
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.05] flex-shrink-0">
              <h2 className="text-base font-bold text-white mb-0.5">{subjectTitle}</h2>
              <p className="text-xs text-gray-500">{totalTopics} topics</p>
            </div>

            {/* Topic List */}
            <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
              <div className="px-3 space-y-5">
                {sections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1.5 px-2">
                      {section.title}
                    </p>
                    <ul className="space-y-0.5">
                      {section.topics.map((topic, tIdx) => {
                        const isActive = activeTopic?.name === topic.name;
                        return (
                          <li key={tIdx}>
                            <button
                              onClick={() => {
                                setActiveTopic(topic);
                                setIsSidebarOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 flex items-center justify-between group ${
                                isActive 
                                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' 
                                  : 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-100 border border-transparent'
                              }`}
                            >
                              <span className="truncate">{topic.name}</span>
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 ml-2" />}
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
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10">
          {activeTopic ? (
            <motion.div
              key={activeTopic.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
                <Link to="/notes" className="hover:text-gray-300 transition-colors">{subjectTitle}</Link>
                <FiChevronRight className="text-xs" />
                <span className="text-gray-400">{activeTopic.name}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 pb-4 border-b border-white/[0.08] leading-tight">
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
                  colorClass="text-white" bgClass="bg-white/[0.02]" borderClass="border-white/[0.08]" 
                />
              )}

              {activeTopic.followUps && (
                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-3">Common Follow-up Questions</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeTopic.followUps.map((q, idx) => (
                      <li key={idx} className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl text-gray-300 text-[13px] leading-relaxed">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 italic text-sm">
              Select a topic from the sidebar to start reading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}