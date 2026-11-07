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
              className="absolute inset-0 bg-scrim/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 26, stiffness: 360 }}
              className="relative w-full max-w-md bg-card border border-ink/[0.1] rounded-2xl p-6 sm:p-8 shadow-2xl text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-bad-solid/10 border border-bad-solid/20 flex items-center justify-center mb-5">
                <FiTrash2 className="text-xl text-bad" />
              </div>
              <h3 className="font-display text-lg font-bold text-fg mb-2">
                Delete this project idea?
              </h3>
              <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                Are you sure you want to permanently delete{" "}
                <span className="text-fg font-semibold font-ui">
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
                  className="flex-1 py-2.5 h-11 rounded-xl bg-ink/[0.04] border border-ink/[0.08] text-fg-3 font-medium text-xs sm:text-sm hover:bg-ink/[0.08] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 h-11 rounded-xl bg-bad-solid text-fg font-semibold text-xs sm:text-sm hover:bg-bad-solid transition-colors shadow-lg shadow-bad-solid/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <FiLoader className="animate-spin text-sm" />
                  ) : (
                    "Delete project idea"
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
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center">
              <FiCpu className="text-brand text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-fg">Project ideas</h2>
              <p className="text-xs font-ui text-muted mt-0.5">
                Project ideas you generated and saved
              </p>
            </div>
          </div>
          <Link
            to="/ai-projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl amber-specular-button text-on-brand font-bold text-xs sm:text-sm self-start sm:self-auto min-h-[44px]"
          >
            <FiPlus className="text-sm" />
            <span>Generate idea</span>
          </Link>
        </div>

        {/* Filters & Search */}
        {projects.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
              <input
                type="text"
                placeholder="Search ideas by title or stack..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-ink/[0.08] text-xs sm:text-sm text-fg placeholder-faint focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-card border border-ink/[0.08] text-xs sm:text-sm text-fg-3 cursor-pointer hover:border-ink/[0.15] transition-colors focus:outline-none focus:border-brand"
              >
                <option value="all">All Tiers</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                value={projectSort}
                onChange={(e) => setProjectSort(e.target.value)}
                className="px-3 py-2 rounded-xl bg-card border border-ink/[0.08] text-xs sm:text-sm text-fg-3 cursor-pointer hover:border-ink/[0.15] transition-colors focus:outline-none focus:border-brand"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!projectsLoading && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-ink/[0.08] rounded-2xl text-center px-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-ink/[0.03] border border-ink/[0.08] flex items-center justify-center mb-4">
              <FiCpu className="text-2xl text-muted" />
            </div>
            <h3 className="font-display text-lg font-bold text-fg mb-2">
              No project ideas yet
            </h3>
            <p className="text-muted text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
              Generate a project idea for your tech stack and level, with real-world challenges to solve.
            </p>
            <Link
              to="/ai-projects"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl amber-specular-button text-on-brand font-bold text-xs sm:text-sm min-h-[44px]"
            >
              <FiZap className="text-xs" /> Generate your first idea
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
                    className="group relative titanium-card rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col h-full shadow-lg overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent group-hover:via-brand/40 transition-all" />
                    {/* Complexity badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {(project.techStack || project.domain) && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack && (
                            <span className="text-xs font-ui font-bold tracking-wider text-brand bg-brand/10 border border-brand/25 rounded px-2 py-0.5 uppercase">
                              {project.techStack}
                            </span>
                          )}
                          {project.domain && (
                            <span className="text-xs font-ui font-semibold tracking-wider text-violet bg-violet-solid/10 border border-violet-solid/20 rounded px-2 py-0.5">
                              {project.domain}
                            </span>
                          )}
                        </div>
                      )}
                      <span
                        className={`text-xs font-ui uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border ml-auto ${
                          project.difficulty === "Beginner"
                            ? "text-ok border-ok-solid/25 bg-ok-solid/10"
                            : project.difficulty === "Intermediate"
                              ? "text-warn border-warn-solid/25 bg-warn-solid/10"
                              : "text-bad border-bad-solid/25 bg-bad-solid/10"
                        }`}
                      >
                        {project.difficulty}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mb-4 flex-1">
                      <h3 className="text-base sm:text-lg font-display font-bold text-fg group-hover:text-fg-1 transition-colors mb-1 truncate">
                        {project.title}
                      </h3>
                      <p className="text-muted text-xs line-clamp-1 mb-4">
                        {project.tagline}
                      </p>

                      {project.features?.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {project.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-fg-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0 mt-1.5" />
                              <span className="line-clamp-1 leading-snug">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-ink/[0.06] flex items-center justify-between">
                      <p className="text-xs font-ui text-muted">
                        {new Date(project.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => openDeleteModal(e, project)}
                          className="w-11 h-11 sm:w-8 sm:h-8 rounded-lg bg-bad-solid/5 border border-bad-solid/15 flex items-center justify-center text-bad hover:bg-bad-solid hover:text-fg transition-colors cursor-pointer"
                          title="Delete project idea"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                        <div className="px-3 py-1.5 h-8 rounded-lg bg-ink/[0.04] border border-ink/[0.08] group-hover:border-ink/[0.2] flex items-center gap-1.5 text-xs font-ui font-semibold text-fg-3 group-hover:text-fg transition-colors">
                          VIEW <FiExternalLink className="text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 bg-card border border-ink/[0.08] rounded-2xl">
                  <FiAlertCircle className="mx-auto text-2xl text-muted mb-2" />
                  <p className="text-muted text-xs sm:text-sm font-ui">
                    No project ideas match your search or filters.
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