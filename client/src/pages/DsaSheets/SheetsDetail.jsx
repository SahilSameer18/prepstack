import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSheetBySlug, getSheetProgress, toggleProblem } from '../../api/services/sheetService';
import { FaCheckCircle, FaRegCircle, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaTag } from 'react-icons/fa';

// Loader component
const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa116]"></div>
  </div>
);

// Platform icons based on link
const getPlatformIcon = (link) => {
  if (!link) return null;
  const l = link.toLowerCase();

  if (l.includes('leetcode.com')) {
    return <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" className="w-4 h-4 object-contain filter invert opacity-80" />;
  } else if (l.includes('geeksforgeeks.org')) {
    return <img src="https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_favicon.png" alt="GFG" className="w-4 h-4 object-contain opacity-80" />;
  } else if (l.includes('codingninjas.com')) {
    return <img src="https://www.codingninjas.com/favicon.ico" alt="CodingNinjas" className="w-4 h-4 object-contain opacity-80" />;
  } else if (l.includes('takeuforward.org')) {
    return <img src="https://takeuforward.org/wp-content/uploads/2021/08/tuf-logo-1.png" alt="TUF" className="w-4 h-4 object-contain opacity-80" />;
  } else if (l.includes('interviewbit.com')) {
    return <img src="https://www.interviewbit.com/favicon.ico" alt="InterviewBit" className="w-4 h-4 object-contain opacity-80" />;
  }
  return <FaExternalLinkAlt className="text-gray-400 text-sm" />;
};

const getDifficultyColor = (diff) => {
  if (!diff) return 'text-gray-400';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'text-green-500';
  if (d === 'medium') return 'text-yellow-500';
  if (d === 'hard') return 'text-red-500';
  return 'text-gray-400';
};

const SheetsDetail = () => {
  const { slug } = useParams();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Array of tracked problemLinks for progress state
  const [solved, setSolved] = useState([]);

  // Accordion state (stores open topic indices)
  const [openTopics, setOpenTopics] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sheetRes, progressRes] = await Promise.all([
          getSheetBySlug(slug),
          getSheetProgress(slug).catch(() => ({ data: { solvedProblems: [] } }))
        ]);

        if (sheetRes.success && sheetRes.data) {
          setSheet(sheetRes.data);
        }

        if (progressRes.success || progressRes.data) {
          setSolved(progressRes.data?.solvedProblems || []);
        }
      } catch (err) {
        console.error('Error fetching sheet data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const toggleTopic = (index) => {
    const newOpen = new Set(openTopics);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenTopics(newOpen);
  };

  const handleToggleProblem = async (e, link) => {
    e.stopPropagation(); 
    
    // Check current state just for the toggle
    const isSolved = solved.includes(link);
    
    // Functional update to avoid race conditions
    setSolved((prevSolved) => {
      if (prevSolved.includes(link)) {
        return prevSolved.filter(l => l !== link);
      } else {
        return [...prevSolved, link];
      }
    });

    try {
      await toggleProblem(slug, link);
    } catch (err) {
      console.error('Failed to toggle problem', err);
      // Revert optimism if failed
      setSolved((prevSolved) => {
        if (isSolved) {
          return [...prevSolved, link];
        } else {
          return prevSolved.filter(l => l !== link);
        }
      });
    }
  };

  if (loading) return <Loader />;
  if (!sheet) return <div className="text-center py-20 text-white">Sheet not found</div>;

  // Compute unique problems in the sheet to avoid incrementing by 2 for duplicates
  const allLinksInSheet = new Set();
  (sheet.topics || []).forEach(t => {
    const problems = t.problems || t.questions || [];
    problems.forEach(p => {
      if (p.link) allLinksInSheet.add(p.link);
    });
  });

  const totalProblems = allLinksInSheet.size;
  const totalSolvedCount = solved.filter(link => allLinksInSheet.has(link)).length;
  const progressPercentage = totalProblems === 0 ? 0 : Math.round((totalSolvedCount / totalProblems) * 100);

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto page-enter text-white">
      {/* Header Section */}
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between relative overflow-hidden">
        <div className="flex-1">
          <h1 className="text-3xl font-black mb-3 text-[#ffa116]">{sheet.name}</h1>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed max-w-2xl">{sheet.description || "A comprehensive DSA sheet to master your interview prep."}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Source: </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-gray-300">Default Source</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-gray-400">Popular</span>
          </div>
        </div>

        {/* Circular Progress representation */}
        <div className="flex flex-col items-center justify-center bg-black/40 rounded-full w-36 h-36 border-4 border-white/[0.1] relative">
          <div className="absolute inset-0 rounded-full border-4 border-[#ffa116]" style={{ clipPath: `polygon(50% 50%, 50% 0, ${progressPercentage < 50 ? 50 + progressPercentage : 100}% ${progressPercentage < 25 ? 0 : (progressPercentage < 50 ? 50 : 100)}%, ...` /* Approximating circle visually, or we just rely on CSS conic-gradient */ }}></div>
          {/* using conic-gradient for the perfect circle progress */}
          <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#ffa116 ${progressPercentage}%, transparent 0)` }}></div>
          <div className="absolute inset-2 bg-[#111] rounded-full flex flex-col items-center justify-center z-10">
            <span className="text-2xl font-bold text-white">{totalSolvedCount}</span>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{totalProblems}</span>
          </div>
        </div>
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-4">
        {(sheet.topics || []).map((topic, index) => {
          const isOpen = openTopics.has(index);
          const problems = topic.problems || topic.questions || [];
          const topicSolvedCount = problems.filter(p => solved.includes(p.link)).length;
          const topicTotal = problems.length;

          return (
            <div key={index} className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleTopic(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-200">{topic.title || topic.topic || `Topic ${index + 1}`}</h2>
                  <span className="text-xs font-semibold text-gray-500 bg-white/[0.05] px-2 py-1 rounded">{topicSolvedCount} / {topicTotal}</span>
                </div>
                {isOpen ? <FaChevronUp className="text-gray-500 text-sm" /> : <FaChevronDown className="text-gray-500 text-sm" />}
              </button>

              {/* Accordion Content (Problem List) */}
              {isOpen && (
                <div className="border-t border-white/[0.06] bg-black/40">
                  {problems.map((problem, pIdx) => {
                    const isCompleted = solved.includes(problem.link);
                    return (
                      <div
                        key={pIdx}
                        className="group flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.03] transition-colors gap-3"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Complete Toggle Circle */}
                          <div
                            onClick={(e) => handleToggleProblem(e, problem.link)}
                            className="cursor-pointer text-xl text-gray-500 hover:text-[#ffa116] transition-colors flex-shrink-0"
                          >
                            {isCompleted ? <FaCheckCircle className="text-green-500" /> : <FaRegCircle />}
                          </div>

                          {/* Title */}
                          <span className={`text-sm font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white transition-colors'}`}>
                            {problem.title}
                          </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-4 pl-10 md:pl-0">
                          {/* Platform Icon with Link */}
                          <a 
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-1.5 rounded-md bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-[#ffa116]/50 transition-all" 
                            title="View Problem"
                          >
                            {getPlatformIcon(problem.link)}
                          </a>

                          {/* Difficulty */}
                          <div className={`w-20 text-center text-xs font-bold ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty || 'Medium'}
                          </div>

                          {/* Tags */}
                          {problem.tags && problem.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 w-32 truncate">
                              {problem.tags.slice(0, 2).map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] uppercase font-semibold text-gray-400 bg-white/[0.05] border border-white/[0.1] px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                              {problem.tags.length > 2 && <span className="text-[10px] text-gray-500">+{problem.tags.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default SheetsDetail;
