import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSheetBySlug, getSheetProgress, toggleProblem } from '../../api/services/sheetService';
import { FaCheckCircle, FaRegCircle, FaChevronDown, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';
import { FiArrowLeft, FiTarget, FiAward } from 'react-icons/fi';

// ── Unique sheet metadata ──────────────────────────────────────────────────
const SHEET_META = {
  'blind-75': {
    description: 'A curated list of 75 essential LeetCode problems hand-picked to cover every core pattern. The go-to list for FAANG prep — if you can solve these, you can handle most coding rounds.',
    badge: 'FAANG Favourite',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    accentColor: '#3b82f6',
    sourceName: 'LeetCode Discuss',
    sourceUrl: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions'
  },
  'neetcode-150': {
    description: 'NeetCode\'s expertly curated 150 problems — a superset of Blind 75 with added depth. Covers every key algorithmic pattern with optimised solutions and video explanations.',
    badge: 'Community Favourite',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    accentColor: '#a855f7',
    sourceName: 'NeetCode.io',
    sourceUrl: 'https://neetcode.io/practice'
  },
  'striver-sde': {
    description: 'Striver\'s legendary SDE sheet — 191 handpicked problems to take you from beginner to job-ready. Follows a structured topic-by-topic progression, perfect for systematic interview prep.',
    badge: 'Most Popular',
    badgeColor: 'text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/20',
    accentColor: '#ffa116',
    sourceName: 'takeUforward',
    sourceUrl: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/'
  },
  'striver-a2z': {
    description: 'The ultimate A-to-Z DSA course by Striver covering 450+ problems from absolute basics to advanced. Best for those starting from scratch and building a rock-solid foundation.',
    badge: 'Beginner Friendly',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    accentColor: '#10b981',
    sourceName: 'takeUforward',
    sourceUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/'
  },
  'love-babbar': {
    description: 'Love Babbar\'s comprehensive 450-problem DSA sheet — a thorough grind ensuring complete coverage of every data structure and algorithm needed to crack top tech companies.',
    badge: 'Complete Coverage',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    accentColor: '#ec4899',
    sourceName: 'CodeHelp / GFG',
    sourceUrl: 'https://practice.geeksforgeeks.org/explore?page=1&sprint=a663236c31453b969852f9ea22507634'
  },
};

const getSheetMeta = (slug) =>
  SHEET_META[slug] || {
    description: 'A comprehensive DSA problem sheet to master your interview preparation and crack top tech companies.',
    badge: 'Popular',
    badgeColor: 'text-gray-400 bg-white/5 border-white/10',
    accentColor: '#ffa116',
    sourceName: 'Official Source',
    sourceUrl: '#'
  };

// ── Loader ─────────────────────────────────────────────────────────────────
const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa116]" />
  </div>
);

// ── Platform icon resolver ─────────────────────────────────────────────────
const getPlatformIcon = (link) => {
  if (!link) return null;
  const l = link.toLowerCase();
  if (l.includes('leetcode.com'))
    return <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" className="w-4 h-4 object-contain filter invert opacity-80" />;
  if (l.includes('geeksforgeeks.org'))
    return <img src="https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_favicon.png" alt="GFG" className="w-4 h-4 object-contain opacity-80" />;
  if (l.includes('codingninjas.com'))
    return <img src="https://www.codingninjas.com/favicon.ico" alt="CodingNinjas" className="w-4 h-4 object-contain opacity-80" />;
  if (l.includes('takeuforward.org') || l.includes('tuf'))
  return (
    <img
      src="https://takeuforward.org/favicon.ico"
      alt="TUF"
      className="w-4 h-4 object-contain opacity-80"
    />
  );
  if (l.includes('interviewbit.com'))
    return <img src="https://www.interviewbit.com/favicon.ico" alt="InterviewBit" className="w-4 h-4 object-contain opacity-80" />;
  return <FaExternalLinkAlt className="text-gray-400 text-xs" />;
};

const getDifficultyColor = (diff) => {
  if (!diff) return 'text-gray-400';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'text-emerald-400';
  if (d === 'medium') return 'text-yellow-400';
  if (d === 'hard') return 'text-red-400';
  return 'text-gray-400';
};

const getDifficultyBg = (diff) => {
  if (!diff) return 'bg-white/[0.04] border-white/[0.07]';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'bg-emerald-500/[0.08] border-emerald-500/20';
  if (d === 'medium') return 'bg-yellow-500/[0.08] border-yellow-500/20';
  if (d === 'hard') return 'bg-red-500/[0.08] border-red-500/20';
  return 'bg-white/[0.04] border-white/[0.07]';
};

// ── Circular Progress Ring ─────────────────────────────────────────────────
const ProgressRing = ({ percentage, solved, total, accentColor }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
        {/* Background track */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease', filter: `drop-shadow(0 0 6px ${accentColor}80)` }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white leading-none">{solved}</span>
        <span className="text-[11px] text-gray-500 font-semibold mt-0.5">/ {total}</span>
        <span className="text-[9px] text-gray-600 uppercase tracking-widest mt-1 font-bold">Solved</span>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const SheetsDetail = () => {
  const { slug } = useParams();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solved, setSolved] = useState([]);
  const [openTopics, setOpenTopics] = useState(new Set());

  const meta = getSheetMeta(slug);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sheetRes, progressRes] = await Promise.all([
          getSheetBySlug(slug),
          getSheetProgress(slug).catch(() => ({ data: { solvedProblems: [] } }))
        ]);
        if (sheetRes.success && sheetRes.data) setSheet(sheetRes.data);
        if (progressRes.success || progressRes.data) setSolved(progressRes.data?.solvedProblems || []);
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
    if (newOpen.has(index)) newOpen.delete(index);
    else newOpen.add(index);
    setOpenTopics(newOpen);
  };

  const handleToggleProblem = async (e, link) => {
    e.stopPropagation();
    const isSolved = solved.includes(link);
    setSolved((prev) => isSolved ? prev.filter(l => l !== link) : [...prev, link]);
    try {
      await toggleProblem(slug, link);
    } catch (err) {
      console.error('Failed to toggle problem', err);
      setSolved((prev) => isSolved ? [...prev, link] : prev.filter(l => l !== link));
    }
  };

  if (loading) return <Loader />;
  if (!sheet) return <div className="text-center py-20 text-white">Sheet not found</div>;

  const allLinksInSheet = new Set();
  (sheet.topics || []).forEach(t => {
    (t.problems || t.questions || []).forEach(p => { if (p.link) allLinksInSheet.add(p.link); });
  });

  const totalProblems = allLinksInSheet.size;
  const totalSolvedCount = solved.filter(link => allLinksInSheet.has(link)).length;
  const progressPercentage = totalProblems === 0 ? 0 : Math.round((totalSolvedCount / totalProblems) * 100);

  return (
    <div className="px-4 md:px-6 py-8 max-w-5xl mx-auto page-enter text-white">

      {/* Back link */}
      <Link to="/dsa" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-200 text-sm mb-6 transition-colors group">
        <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
        Back to Sheets
      </Link>

      {/* ── Header Card ── */}
      <div className="relative bg-[#0f0f0f] border border-white/[0.07] rounded-2xl p-6 md:p-8 mb-8 overflow-hidden">
        {/* Subtle glow blob */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: meta.accentColor }}
        />

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${meta.badgeColor}`}>
                {meta.badge}
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-gray-400 uppercase tracking-wider">
                {totalProblems} Problems
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight" style={{ color: meta.accentColor }}>
              {sheet.name}
            </h1>

            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-5">
              {meta.description}
            </p>

            {/* Stats row & Source */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-2">
                  <FiTarget className="text-sm" style={{ color: meta.accentColor }} />
                  <span className="text-sm text-gray-300 font-medium">{totalSolvedCount} solved</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward className="text-sm text-gray-500" />
                  <span className="text-sm text-gray-400">{totalProblems - totalSolvedCount} remaining</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 md:w-32 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progressPercentage}%`, background: meta.accentColor }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-400">{progressPercentage}%</span>
                </div>
              </div>

              {/* SOURCE LINK (Downside of status bar) */}
              {meta.sourceUrl && meta.sourceUrl !== '#' && (
                <a 
                  href={meta.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.2] transition-all w-max shadow-sm"
                >
                  <span>Official Source: {meta.sourceName}</span>
                  <FaExternalLinkAlt className="text-[10px] text-gray-500" />
                </a>
              )}
            </div>
          </div>

          {/* Right: circular progress */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <ProgressRing
              percentage={progressPercentage}
              solved={totalSolvedCount}
              total={totalProblems}
              accentColor={meta.accentColor}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Progress</span>
          </div>
        </div>
      </div>

      {/* ── Topics Accordion ── */}
      <div className="space-y-3">
        {(sheet.topics || []).map((topic, index) => {
          const isOpen = openTopics.has(index);
          const problems = topic.problems || topic.questions || [];
          const topicSolvedCount = problems.filter(p => solved.includes(p.link)).length;
          const topicTotal = problems.length;
          const topicPct = topicTotal === 0 ? 0 : Math.round((topicSolvedCount / topicTotal) * 100);

          return (
            <div key={index} className={`bg-[#0f0f0f] border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'border-white/[0.1]' : 'border-white/[0.05] hover:border-white/[0.09]'}`}>
              {/* Accordion Header */}
              <button
                onClick={() => toggleTopic(index)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                    <span className="text-sm font-black text-white">{index + 1}</span>
                  </div>
                  <div className="min-w-0 text-left">
                    <h2 className="text-sm md:text-base font-bold text-gray-100 truncate">{topic.title || topic.topic || `Topic ${index + 1}`}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-1 w-16 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${topicPct}%`, background: meta.accentColor, opacity: 0.8 }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">{topicSolvedCount}/{topicTotal}</span>
                    </div>
                  </div>
                </div>
                {isOpen
                  ? <FaChevronUp className="text-gray-600 text-xs flex-shrink-0" />
                  : <FaChevronDown className="text-gray-600 text-xs flex-shrink-0" />
                }
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="border-t border-white/[0.05]">
                  {problems.map((problem, pIdx) => {
                    const isCompleted = solved.includes(problem.link);
                    return (
                      <div
                        key={pIdx}
                        className={`group flex flex-col md:flex-row md:items-center justify-between px-5 py-3.5 border-b border-white/[0.03] last:border-b-0 transition-colors gap-3 ${isCompleted ? 'bg-emerald-500/[0.02]' : 'hover:bg-white/[0.02]'}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Toggle */}
                          <button
                            onClick={(e) => handleToggleProblem(e, problem.link)}
                            className="flex-shrink-0 text-lg text-gray-600 hover:scale-110 transition-all"
                            style={isCompleted ? { color: '#10b981' } : {}}
                          >
                            {isCompleted ? <FaCheckCircle /> : <FaRegCircle />}
                          </button>

                          {/* Title */}
                          <span className={`text-sm font-medium truncate transition-colors ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-200 group-hover:text-white'}`}>
                            {pIdx + 1}. {problem.title}
                          </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-3 pl-9 md:pl-0 flex-shrink-0">
                          {/* Tags */}
                          {problem.tags && problem.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {problem.tags.slice(0, 2).map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] font-semibold text-gray-500 bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 rounded-md">
                                  {tag}
                                </span>
                              ))}
                              {problem.tags.length > 2 && <span className="text-[10px] text-gray-600">+{problem.tags.length - 2}</span>}
                            </div>
                          )}

                          {/* Difficulty */}
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getDifficultyColor(problem.difficulty)} ${getDifficultyBg(problem.difficulty)}`}>
                            {problem.difficulty || 'Medium'}
                          </span>

                          {/* Platform Link */}
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Problem"
                            className="flex items-center justify-center p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/20 transition-all"
                          >
                            {getPlatformIcon(problem.link)}
                          </a>
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
