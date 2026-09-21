import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCpu,
  FiPlus,
  FiLoader,
  FiTrash2,
  FiExternalLink,
  FiZap,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";
import { useProject } from "../../hooks/useProject";
import { SkeletonProjectCard } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";

// ── ProjectDash ────────────────────────────────────────────────────────────
// Owns its own filter/sort/delete state; reads projects from useProject hook.
const ProjectDash = () => {
  const { projects, deleteProjectById, loading: projectsLoading } =
    useProject();
  const navigate = useNavigate();

  // Filters
  const [projectSort, setProjectSort] = useState("newest");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");

  // Delete modal
  const [deletingId, setDeletingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // ── Delete handlers ──────────────────────────────────────────────────────
  const openDeleteModal = (e, project) => {
    e.stopPropagation();
    setDeletingId(project._id);
    setSelectedProject(project);
    setDeleteError(null);
  };
  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProjectById(deletingId);
      setDeletingId(null);
    } catch (err) {
      console.error("Delete failed", err);
      setDeleteError(
        err?.response?.data?.message || "Failed to delete project. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filtered / sorted list ───────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let filtered = (projects || []).filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.tagline?.toLowerCase().includes(projectSearch.toLowerCase());
      const matchesFilter =
        projectFilter === "all" || p.difficulty === projectFilter;
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      if (projectSort === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (projectSort === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (projectSort === "difficulty") {
        const diffOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
        return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
      }
      return 0;
    });

    return filtered;
  }, [projects, projectSort, projectFilter, projectSearch]);

  return (
    <>
      {/* ── Delete Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeletingId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#0c0c0e] border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-2xl text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
                <FiTrash2 className="text-xl text-rose-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">
                Delete Architecture Blueprint?
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                Are you sure you want to permanently delete{" "}
                <span className="text-white font-semibold font-mono">
                  "{selectedProject?.title}"
                </span>
                ? This specification cannot be recovered.
              </p>

              {/* Delete error */}
              {deleteError && (
                <div className="mb-4">
                  <InlineErrorAlert
                    message={deleteError}
                    onDismiss={() => setDeleteError(null)}
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2.5 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-medium text-xs sm:text-sm hover:bg-white/[0.08] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 h-11 rounded-xl bg-rose-600 text-white font-semibold text-xs sm:text-sm hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <FiLoader className="animate-spin text-sm" />
                  ) : (
                    "Delete Blueprint"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Section ─────────────────────────────────────────────────────── */}
      <section className="text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/25 flex items-center justify-center">
              <FiCpu className="text-[#ffa116] text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">System Architecture Blueprints</h2>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Saved engineering specifications and portfolio architectures
              </p>
            </div>
          </div>
          <Link
            to="/ai-projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl amber-specular-button text-black font-bold text-xs sm:text-sm self-start sm:self-auto min-h-[44px]"
          >
            <FiPlus className="text-sm" />
            <span>Compile Blueprint</span>
          </Link>
        </div>

        {/* Filters & Search */}
        {projects.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="text"
                placeholder="Search blueprints by title or stack..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0c0c0e] border border-white/[0.08] text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ffa116] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0c0c0e] border border-white/[0.08] text-xs sm:text-sm text-zinc-300 cursor-pointer hover:border-white/[0.15] transition-colors focus:outline-none focus:border-[#ffa116]"
              >
                <option value="all">All Tiers</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                value={projectSort}
                onChange={(e) => setProjectSort(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0c0c0e] border border-white/[0.08] text-xs sm:text-sm text-zinc-300 cursor-pointer hover:border-white/[0.15] transition-colors focus:outline-none focus:border-[#ffa116]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="difficulty">Complexity Tier</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!projectsLoading && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#0c0c0e] border border-white/[0.08] rounded-2xl text-center px-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-4">
              <FiCpu className="text-2xl text-zinc-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              No blueprints compiled yet
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
              Compile production-ready architectural project specifications tailored to your target tech stack with distributed systems challenges.
            </p>
            <Link
              to="/ai-projects"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl amber-specular-button text-black font-bold text-xs sm:text-sm min-h-[44px]"
            >
              <FiZap className="text-xs" /> Compile First Blueprint
            </Link>
          </div>
        ) : projectsLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonProjectCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/ai-projects/${project._id}`)}
                    className="group relative bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.2] rounded-2xl p-6 cursor-pointer transition-colors duration-200 flex flex-col h-full shadow-lg"
                  >
                    {/* Complexity badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {(project.techStack || project.domain) && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack && (
                            <span className="text-[9px] font-mono font-bold tracking-wider text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/25 rounded px-2 py-0.5 uppercase">
                              {project.techStack}
                            </span>
                          )}
                          {project.domain && (
                            <span className="text-[9px] font-mono font-semibold tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded px-2 py-0.5 uppercase">
                              {project.domain}
                            </span>
                          )}
                        </div>
                      )}
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border ml-auto ${
                          project.difficulty === "Beginner"
                            ? "text-emerald-400 border-emerald-500/25 bg-emerald-500/10"
                            : project.difficulty === "Intermediate"
                              ? "text-amber-400 border-amber-500/25 bg-amber-500/10"
                              : "text-rose-400 border-rose-500/25 bg-rose-500/10"
                        }`}
                      >
                        {project.difficulty}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mb-4 flex-1">
                      <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover:text-zinc-100 transition-colors mb-1 truncate">
                        {project.title}
                      </h3>
                      <p className="text-zinc-400 text-xs line-clamp-1 mb-4">
                        {project.tagline}
                      </p>

                      {project.features?.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {project.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116] flex-shrink-0 mt-1.5" />
                              <span className="line-clamp-1 leading-snug">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        {new Date(project.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => openDeleteModal(e, project)}
                          className="w-8 h-8 rounded-lg bg-rose-500/5 border border-rose-500/15 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          title="Delete Blueprint"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                        <div className="px-3 py-1.5 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] group-hover:border-white/[0.2] flex items-center gap-1.5 text-[11px] font-mono font-semibold text-zinc-300 group-hover:text-white transition-colors">
                          VIEW <FiExternalLink className="text-[10px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 bg-[#0c0c0e] border border-white/[0.08] rounded-2xl">
                  <FiAlertCircle className="mx-auto text-2xl text-zinc-500 mb-2" />
                  <p className="text-zinc-400 text-xs sm:text-sm font-mono">
                    No blueprints match current search query or tier filters.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </>
  );
};

export default ProjectDash;