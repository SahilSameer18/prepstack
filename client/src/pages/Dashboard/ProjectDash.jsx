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
  const { projects, getProjects, deleteProjectById, loading: projectsLoading } =
    useProject();
  const navigate = useNavigate();

  // Filters
  const [projectSort, setProjectSort] = useState("newest");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");

  // Delete modal
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // ── Delete handlers ──────────────────────────────────────────────────────
  const openDeleteModal = (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    setDeleteError(null);
  };
  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProjectById(deletingId);
      await getProjects();
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
  const projectToDelete = projects.find((p) => p._id === deletingId);

  // ── Filtered / sorted list ───────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.tagline.toLowerCase().includes(projectSearch.toLowerCase());
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-white/[0.08] rounded-3xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 mx-auto">
                <FiTrash2 className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Delete Project Idea?
              </h3>
              <p className="text-gray-400 text-center text-sm mb-6">
                Are you sure you want to delete{" "}
                <span className="text-white font-semibold">
                  "{projectToDelete?.title}"
                </span>
                ? This action cannot be undone.
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
                  className="flex-1 py-3 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-300 font-semibold text-sm hover:bg-white/[0.1] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-3 h-12 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    "Delete Idea"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Section ─────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <FiCpu className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">My Project Ideas</h2>
              <p className="text-xs text-gray-500">
                AI-generated projects for your resume
              </p>
            </div>
          </div>
          <Link
            to="/ai-projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffa116] text-black font-bold text-sm hover:bg-[#ffb84d] transition-all shadow-lg shadow-orange-500/20"
          >
            <FiPlus /> New Idea
          </Link>
        </div>

        {/* Filters & Search */}
        {projects.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ffa116]/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-gray-300 cursor-pointer hover:border-white/[0.12] transition-all focus:outline-none focus:border-[#ffa116]/50"
              >
                <option value="all">All Difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                value={projectSort}
                onChange={(e) => setProjectSort(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-gray-300 cursor-pointer hover:border-white/[0.12] transition-all focus:outline-none focus:border-[#ffa116]/50"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!projectsLoading && projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-[#0f0f0f] border border-dashed border-white/[0.07] rounded-3xl text-center"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5"
            >
              <FiCpu className="text-3xl text-gray-600" />
            </motion.div>
            <h3 className="text-lg font-bold text-gray-300 mb-2">
              No projects saved yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mb-7">
              Generate your first resume-worthy project idea powered by AI.
            </p>
            <Link
              to="/ai-projects"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#ffa116] text-black font-bold text-sm hover:bg-[#ffb84d] transition-all shadow-lg shadow-orange-500/20"
            >
              <FiZap className="text-sm" /> Generate Now
            </Link>
          </motion.div>
        ) : projectsLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonProjectCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
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
                      <span
                        className={`text-[9px] uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full border ${
                          project.difficulty === "Beginner"
                            ? "text-green-400 border-green-500/20 bg-green-500/10"
                            : project.difficulty === "Intermediate"
                              ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
                              : "text-red-400 border-red-500/20 bg-red-500/10"
                        }`}
                      >
                        {project.difficulty}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mb-4 flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#ffa116] transition-colors mb-1 truncate pr-20">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 text-xs italic line-clamp-1 mb-4">
                        {project.tagline}
                      </p>

                      {project.features?.length > 0 && (
                        <div className="space-y-1.5 mb-5 pl-1 border-l-2 border-white/[0.05] ml-1">
                          {project.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0 mt-1.5" />
                              <span className="text-[11px] text-gray-500 line-clamp-1">
                                {feature}
                              </span>
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
                        {new Date(project.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
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
                          VIEW <FiExternalLink className="text-[10px]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-10"
                >
                  <FiAlertCircle className="mx-auto text-2xl text-gray-600 mb-3" />
                  <p className="text-gray-500 text-sm">
                    No projects match your search or filters
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </>
  );
};

export default ProjectDash;