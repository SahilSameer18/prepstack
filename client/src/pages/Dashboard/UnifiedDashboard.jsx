import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCode, FiCpu, FiPlus, FiLoader, FiTrash2, FiExternalLink,
  FiTarget, FiAward, FiTrendingUp, FiGrid
} from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import { useProject } from "../../hooks/useProject";
import { dsaSheet, getSheetProgress, getSheetBySlug } from "../../api/services/sheetService";
import { SkeletonProjectCard } from "../../components/ui/Skeletons";
import { useAuth } from "../../hooks/useAuth";

// ── Sheet accent colors matching SheetsDetail ─────────────────────────────
const SHEET_META = {
  "blind-75":     { accentColor: "#3b82f6", badge: "FAANG Favourite", badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  "neetcode-150": { accentColor: "#a855f7", badge: "Community Favourite", badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  "striver-sde":  { accentColor: "#ffa116", badge: "Most Popular", badgeColor: "text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/20" },
  "striver-a2z":  { accentColor: "#10b981", badge: "Beginner Friendly", badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  "love-babbar":  { accentColor: "#ec4899", badge: "Complete Coverage", badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
};
const getSheetMeta = (slug) =>
  SHEET_META[slug] || { accentColor: "#ffa116", badge: "Popular", badgeColor: "text-gray-400 bg-white/5 border-white/10" };

// ── Skeleton for DSA cards ────────────────────────────────────────────────
const SkeletonDSACard = () => (
  <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-28 rounded bg-white/[0.06]" />
      <div className="h-5 w-16 rounded-full bg-white/[0.06]" />
    </div>
    <div className="h-2.5 w-full rounded-full bg-white/[0.04]" />
    <div className="flex items-center justify-between">
      <div className="h-3 w-20 rounded bg-white/[0.06]" />
      <div className="h-3 w-12 rounded bg-white/[0.06]" />
    </div>
  </div>
);

// ── Mini circular progress ring ───────────────────────────────────────────
const MiniRing = ({ pct, color }) => {
  const r = 18, c = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90 flex-shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round" strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        style={{ transition: "stroke-dashoffset 0.8s ease", filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
    </svg>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { projects, getProjects, deleteProjectById, loading: projectsLoading } = useProject();
  const navigate = useNavigate();

  // DSA state
  const [dsaData, setDsaData] = useState([]);     // [{ sheet, solved, total }]
  const [dsaLoading, setDsaLoading] = useState(true);

  // Project delete modal
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch DSA progress ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchDSA = async () => {
      setDsaLoading(true);
      try {
        const sheetsRes = await dsaSheet();
        const sheets = sheetsRes?.data || [];

        const progressResults = await Promise.allSettled(
          sheets.map((s) =>
            getSheetProgress(s.slug).catch(() => ({ data: { solvedProblems: [] } }))
          )
        );

        // We need total problems per sheet — fetch full sheet details in parallel
        const detailResults = await Promise.allSettled(
          sheets.map((s) =>
            getSheetBySlug(s.slug).catch(() => null)
          )
        );

        const combined = sheets.map((sheet, i) => {
          const progressData = progressResults[i].status === "fulfilled"
            ? progressResults[i].value?.data
            : null;
          const solved = progressData?.solvedProblems?.length || 0;

          const detail = detailResults[i].status === "fulfilled" ? detailResults[i].value?.data : null;
          let total = 0;
          if (detail?.topics) {
            const linkSet = new Set();
            detail.topics.forEach((t) => {
              (t.problems || t.questions || []).forEach((p) => { if (p.link) linkSet.add(p.link); });
            });
            total = linkSet.size;
          }

          return { sheet, solved, total };
        });

        setDsaData(combined);
      } catch (err) {
        console.error("Failed to load DSA data", err);
      } finally {
        setDsaLoading(false);
      }
    };

    fetchDSA();
    getProjects();
  }, []);

  // ── Aggregates ──────────────────────────────────────────────────────────
  const totalSolved = dsaData.reduce((acc, d) => acc + d.solved, 0);
  const totalQuestions = dsaData.reduce((acc, d) => acc + d.total, 0);
  const overallPct = totalQuestions === 0 ? 0 : Math.round((totalSolved / totalQuestions) * 100);

  // ── Project delete handlers ─────────────────────────────────────────────
  const openDeleteModal = (e, id) => { e.stopPropagation(); setDeletingId(id); };
  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteProjectById(deletingId);
      await getProjects();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };
  const projectToDelete = projects.find((p) => p._id === deletingId);

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto page-enter text-white">

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeletingId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-white/[0.08] rounded-3xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 mx-auto">
                <FiTrash2 className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete Project Idea?</h3>
              <p className="text-gray-400 text-center text-sm mb-8">
                Are you sure you want to delete <span className="text-white font-semibold">"{projectToDelete?.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-300 font-semibold text-sm hover:bg-white/[0.1] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-3 h-12 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <FiLoader className="animate-spin" /> : "Delete Idea"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <FiGrid className="text-[#ffa116] text-lg" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#ffa116]">{user?.username || "Coder"}'s Dashboard</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
          Welcome back, <span className="text-[#ffa116]">{user?.username || "Coder"}</span>
        </h1>
        <p className="text-gray-500 text-sm">Track your DSA progress and manage your saved project ideas — all in one place.</p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 1: DSA TRACKER ──────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="mb-14">

        {/* Section heading + overall stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/20 flex items-center justify-center">
              <FiCode className="text-[#ffa116]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">DSA Tracker</h2>
              <p className="text-xs text-gray-500">Your progress across all practice sheets</p>
            </div>
          </div>
          <Link
            to="/dsa"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all"
          >
            View All Sheets <FiExternalLink className="text-xs" />
          </Link>
        </div>

        {/* Overall stat strip */}
        {!dsaLoading && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total Solved", value: totalSolved, icon: <FaCheckCircle className="text-emerald-400" />, color: "text-emerald-400" },
              { label: "Total Questions", value: totalQuestions, icon: <FiTarget className="text-blue-400" />, color: "text-blue-400" },
              { label: "Overall Progress", value: `${overallPct}%`, icon: <FiTrendingUp className="text-[#ffa116]" />, color: "text-[#ffa116]" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl px-4 py-4 flex flex-col items-center justify-center gap-1 text-center">
                <span className="text-lg">{stat.icon}</span>
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Per-sheet cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dsaLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonDSACard key={i} />)
            : dsaData.map(({ sheet, solved, total }) => {
                const meta = getSheetMeta(sheet.slug);
                const pct = total === 0 ? 0 : Math.round((solved / total) * 100);
                return (
                  <Link
                    key={sheet.slug}
                    to={`/dsa/${sheet.slug}`}
                    className="group relative bg-[#0f0f0f] border border-white/[0.05] hover:border-white/[0.15] rounded-2xl p-5 flex gap-4 items-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden"
                  >
                    {/* Glow */}
                    <div
                      className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300 pointer-events-none"
                      style={{ background: meta.accentColor }}
                    />

                    {/* Mini ring */}
                    <div className="relative flex-shrink-0">
                      <MiniRing pct={pct} color={meta.accentColor} />
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black" style={{ color: meta.accentColor }}>
                        {pct}%
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                          {meta.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-100 group-hover:text-white truncate transition-colors">{sheet.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: meta.accentColor }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 font-semibold whitespace-nowrap flex-shrink-0">
                          {solved} / {total}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* Total solved callout */}
        {!dsaLoading && totalSolved > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-center gap-3 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl px-5 py-4"
          >
            <FiAward className="text-emerald-400 text-xl flex-shrink-0" />
            <p className="text-sm text-gray-300">
              You have solved a total of{" "}
              <span className="text-emerald-400 font-black">{totalSolved} problems</span>{" "}
              across all sheets. Keep it up!
            </p>
          </motion.div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 2: PROJECT IDEAS ─────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <FiCpu className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">My Project Ideas</h2>
              <p className="text-xs text-gray-500">AI-generated projects saved for your resume</p>
            </div>
          </div>
          <Link
            to="/ai-projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffa116] text-black font-bold text-sm hover:bg-[#ffb84d] transition-all shadow-lg shadow-orange-500/20"
          >
            <FiPlus /> New Project Idea
          </Link>
        </div>

        {/* Grid */}
        {projectsLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonProjectCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0f0f0f] border border-dashed border-white/[0.07] rounded-3xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <FiCpu className="text-3xl text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-300 mb-2">No projects saved yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mb-7">
              Generate your first resume-worthy project idea using our AI generator.
            </p>
            <Link
              to="/ai-projects"
              className="px-8 py-3 rounded-xl bg-[#ffa116] text-black font-bold text-sm hover:bg-[#ffb84d] transition-all shadow-lg shadow-orange-500/20"
            >
              Generate Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  onClick={() => navigate(`/ai-projects/${project._id}`)}
                  className="group relative bg-[#0a0a0a] border border-white/[0.06] hover:border-[#ffa116]/30 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#ffa116]/5 hover:-translate-y-1.5 flex flex-col h-full overflow-hidden"
                >
                  {/* Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ffa116]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Difficulty badge */}
                  <div className="absolute top-5 right-5 z-10">
                    <span className={`text-[9px] uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full border ${
                      project.difficulty === "Beginner" ? "text-green-400 border-green-500/20 bg-green-500/10" :
                      project.difficulty === "Intermediate" ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/10" :
                      "text-red-400 border-red-500/20 bg-red-500/10"
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4 flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#ffa116] transition-colors mb-1 truncate pr-20">{project.title}</h3>
                    <p className="text-gray-400 text-xs italic line-clamp-1 mb-4">{project.tagline}</p>

                    {project.features?.length > 0 && (
                      <div className="space-y-1.5 mb-5 pl-1 border-l-2 border-white/[0.05] ml-1">
                        {project.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0 mt-1.5" />
                            <span className="text-[11px] text-gray-500 line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(project.techStack || project.domain) && (
                      <div className="flex flex-wrap gap-2">
                        {project.techStack && (
                          <span className="text-[9px] font-bold tracking-widest text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/20 rounded px-1.5 py-0.5 uppercase">
                            {project.techStack}
                          </span>
                        )}
                        {project.domain && (
                          <span className="text-[9px] font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5 uppercase">
                            {project.domain}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between relative z-10">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider whitespace-nowrap">
                      {new Date(project.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => openDeleteModal(e, project._id)}
                        className="w-8 h-8 rounded bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        title="Delete"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                      <div className="px-3 py-1.5 h-8 rounded bg-white/[0.05] border border-white/[0.1] flex items-center gap-1.5 text-[10px] font-bold text-gray-500 group-hover:text-black group-hover:bg-[#ffa116] group-hover:border-[#ffa116] group-hover:shadow-md group-hover:shadow-orange-500/20 transition-all duration-300">
                        VIEW FULL <FiExternalLink className="text-[10px]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default UnifiedDashboard;
