import SelectField from "../../components/ui/SelectField";
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cpu, Plus, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import { useProject } from "../../hooks/useProject";
import { SkeletonProjectCard, InlineSpinner } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { EmptyState } from "../../components/ui/StateComponents";

// ── ProjectDash ────────────────────────────────────────────────────────────
// Owns its own filter/sort/delete state; reads projects from useProject hook.
const ProjectDash = () => {
  const { projects, projectsTotal, hasMoreProjects, loadingMoreProjects, loadMoreProjects, deleteProjectById, loading: projectsLoading } =
    useProject();
  const calm = useReducedMotion();

  // Filters
  const [projectSort, setProjectSort] = useState("newest");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");

  const [loadMoreError, setLoadMoreError] = useState(null);
  const handleLoadMore = async () => {
    setLoadMoreError(null);
    try {
      await loadMoreProjects();
    } catch (err) {
      setLoadMoreError(err.message);
    }
  };

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
              transition={{ duration: 0.2 }}
              onClick={() => !isDeleting && setDeletingId(null)}
              className="absolute inset-0 bg-scrim/50 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Delete project idea"
              initial={calm ? { opacity: 0 } : { opacity: 0, transform: "translate3d(0, 12px, 0) scale(0.97)" }}
              animate={{ opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="surface-card relative w-full max-w-md p-6 text-left shadow-2xl sm:p-8"
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-bad-solid/25 bg-bad-solid/10 text-2xl text-bad">
                <Trash weight="duotone" aria-hidden="true" />
              </span>
              <h3 className="mb-2 font-display text-2xl font-bold tracking-tight text-fg">
                Delete this project idea?
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-muted">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-fg">
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
                  className="titanium-button h-11 flex-1 cursor-pointer rounded-xl text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-bad-solid text-sm font-bold text-fg shadow-lg shadow-bad-solid/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <InlineSpinner size={14} color="currentColor" />
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
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-fg">Project ideas</h2>
          <Link to="/ai-projects" className="group inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-brand">
            <Plus aria-hidden="true" /> Generate idea
          </Link>
        </div>

        {/* Filters & Search */}
        {projects.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <MagnifyingGlass aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                aria-label="Search project ideas"
                placeholder="Search ideas by title or stack..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full rounded-xl border border-ink/[0.14] bg-card py-3 pl-11 pr-4 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-200 placeholder-faint hover:border-ink/[0.24] focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)]"
              />
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2 md:w-80">
              <SelectField
                aria-label="Filter project ideas by difficulty"
                value={projectFilter}
                onValueChange={setProjectFilter}
                options={[
                  { value: "all", label: "All levels" },
                  { value: "Beginner", label: "Beginner" },
                  { value: "Intermediate", label: "Intermediate" },
                  { value: "Advanced", label: "Advanced" },
                ]}
              />
              <SelectField
                aria-label="Sort project ideas"
                value={projectSort}
                onValueChange={setProjectSort}
                options={[
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                  { value: "difficulty", label: "Difficulty" },
                ]}
              />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!projectsLoading && projects.length === 0 ? (
          <EmptyState
            icon={Cpu}
            title="No project ideas yet"
            text="Generate a project idea for your tech stack and level, with real-world challenges to solve."
            action={{ label: "Generate your first idea", to: "/ai-projects" }}
          />
        ) : projectsLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonProjectCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div key={project._id} className="surface-card surface-card-link relative flex h-full flex-col p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate font-ui text-sm font-semibold text-brand">
                        {[project.techStack, project.domain].filter(Boolean).join(" · ")}
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 font-ui text-xs font-semibold ${
                          project.difficulty === "Beginner"
                            ? "border-ok-solid/30 text-ok"
                            : project.difficulty === "Intermediate"
                              ? "border-warn-solid/30 text-warn"
                              : "border-bad-solid/30 text-bad"
                        }`}
                      >
                        {project.difficulty}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-xl font-bold leading-snug tracking-tight text-fg">
                      <Link to={`/ai-projects/${project._id}`} className="after:absolute after:inset-0 after:rounded-2xl">
                        {project.title}
                      </Link>
                    </h3>
                    {project.tagline && <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{project.tagline}</p>}

                    <div className="mt-6 flex items-center justify-between border-t border-ink/[0.08] pt-4">
                      <p className="text-sm text-muted">
                        {new Date(project.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                      <button
                        onClick={(e) => openDeleteModal(e, project)}
                        className="relative z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-xl text-muted transition-colors hover:bg-bad-solid/10 hover:text-bad sm:h-9 sm:w-9"
                        title="Delete project idea"
                        aria-label={`Delete project idea ${project.title}`}
                      >
                        <Trash aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  className="col-span-full"
                  icon={MagnifyingGlass}
                  title="No matching ideas"
                  text="No project ideas match your search or filters."
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* How many are shown, and the button for the next 20 */}
        {projects.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-center text-sm text-muted">
              Showing {projects.length} of {projectsTotal ?? projects.length} ideas
              {hasMoreProjects && (projectSearch || projectFilter !== "all") ? ". Search and filters work on the ideas shown so far." : ""}
            </p>
            {hasMoreProjects && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMoreProjects}
                className="titanium-button inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMoreProjects ? (<><InlineSpinner size={14} color="currentColor" /><span>Loading...</span></>) : "Load more"}
              </button>
            )}
            <InlineErrorAlert message={loadMoreError} onDismiss={() => setLoadMoreError(null)} />
          </div>
        )}
      </section>
    </>
  );
};

export default ProjectDash;
