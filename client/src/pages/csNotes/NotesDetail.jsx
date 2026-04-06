import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiMenu, FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import { useNotes } from '../../hooks/useNotes';
import { motion, AnimatePresence } from 'framer-motion';

const SectionBlock = ({ title, items, icon: Icon, colorClass, bgClass, borderClass }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <div className={`mb-6 p-5 rounded-2xl border ${bgClass} ${borderClass} shadow-lg`}>
      <h4 className={`flex items-center gap-2 text-base font-bold mb-3 ${colorClass}`}>
        {Icon && <Icon className="text-lg" />}
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-gray-300">
            <span className={`mt-[6px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
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

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] -mt-6">
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#0a0a0a] sticky top-0 z-40">
        <span className="font-bold text-white text-sm truncate max-w-[200px]">{activeTopic?.name || subjectTitle}</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-md">
          <FiMenu className="text-lg" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed md:sticky top-0 md:top-[80px] h-screen md:h-[calc(100vh-80px)] w-64 bg-[#0d0d0d] border-r border-white/5 shadow-2xl z-50 transition-transform duration-300 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <Link to="/notes" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[13px] font-medium">
            <FiChevronLeft className="text-base" /> Back
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1">
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="p-3">
          <h2 className="text-lg font-bold px-2 mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {subjectTitle}
          </h2>
          
          <div className="space-y-4">
            {sections.map((section, sIdx) => (
              <div key={sIdx}>
                <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2 px-2">
                  {section.title}
                </h3>
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-200 ${
                            isActive 
                              ? 'bg-blue-500/10 text-blue-400 font-medium' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                        >
                          {topic.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
        <div className="max-w-3xl mx-auto">
          {activeTopic ? (
            <motion.div
              key={activeTopic.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 pb-4 border-b border-white/[0.08]">
                {activeTopic.name}
              </h1>

              <SectionBlock 
                title="Concept" 
                items={activeTopic.concept} 
                icon={FiInfo}
                colorClass="text-blue-400" bgClass="bg-blue-500/[0.04]" borderClass="border-blue-500/10" 
              />

              <SectionBlock 
                title="Deep Insight" 
                items={activeTopic.deepInsight} 
                icon={FiInfo}
                colorClass="text-purple-400" bgClass="bg-purple-500/[0.04]" borderClass="border-purple-500/10" 
              />

              <SectionBlock 
                title="Why it matters" 
                items={activeTopic.why} 
                colorClass="text-amber-400" bgClass="bg-amber-500/[0.04]" borderClass="border-amber-500/10" 
              />

              <SectionBlock 
                title="Real World Examples" 
                items={activeTopic.realWorld} 
                icon={FiCheckCircle}
                colorClass="text-emerald-400" bgClass="bg-emerald-500/[0.04]" borderClass="border-emerald-500/10" 
              />

              <SectionBlock 
                title="Common Traps / Gotchas" 
                items={activeTopic.traps} 
                icon={FiAlertTriangle}
                colorClass="text-red-400" bgClass="bg-red-500/[0.04]" borderClass="border-red-500/10" 
              />

              <SectionBlock 
                title="How to Answer in Interview" 
                items={activeTopic.interviewAnswer} 
                icon={FiMessageSquare}
                colorClass="text-[#ffa116]" bgClass="bg-[#ffa116]/[0.04]" borderClass="border-[#ffa116]/10" 
              />

              {activeTopic.flow && (
                <SectionBlock 
                  title="Flow Step-by-Step" 
                  items={activeTopic.flow} 
                  colorClass="text-cyan-400" bgClass="bg-cyan-500/[0.04]" borderClass="border-cyan-500/10" 
                />
              )}

              {activeTopic.conditions && (
                <SectionBlock 
                  title="Conditions" 
                  items={activeTopic.conditions} 
                  colorClass="text-yellow-400" bgClass="bg-yellow-500/[0.04]" borderClass="border-yellow-500/10" 
                />
              )}

              {activeTopic.pcbContains && (
                <SectionBlock 
                  title="PCB Contains" 
                  items={activeTopic.pcbContains} 
                  colorClass="text-teal-400" bgClass="bg-teal-500/[0.04]" borderClass="border-teal-500/10" 
                />
              )}

              {activeTopic.solution && (
                <SectionBlock 
                  title="Solution Concept" 
                  items={activeTopic.solution} 
                  colorClass="text-emerald-400" bgClass="bg-emerald-500/[0.04]" borderClass="border-emerald-500/10" 
                />
              )}

              {activeTopic.list && (
                <SectionBlock 
                  title="Key Takeaways" 
                  items={activeTopic.list} 
                  colorClass="text-white" bgClass="bg-white/[0.02]" borderClass="border-white/10" 
                />
              )}

              {activeTopic.followUps && (
                <div className="mt-8 pt-6 border-t border-white/[0.05]">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Common Follow-up Questions</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeTopic.followUps.map((q, idx) => (
                      <li key={idx} className="bg-white/[0.03] border border-white/[0.05] p-3 rounded-xl text-gray-300 text-[13px]">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </motion.div>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-500 italic text-sm">
               Select a topic from the sidebar to start reading.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}