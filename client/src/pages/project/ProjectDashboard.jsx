import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiExternalLink, FiCpu, FiPlus, FiLoader, FiAlertCircle, FiX, FiCheck } from "react-icons/fi";
import { useProject } from "../../hooks/useProject";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonProjectCard } from "../../components/ui/Skeletons";

const ProjectDashboard = () => {
  const { projects, getProjects, deleteProjectById, loading } = useProject();
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects();
  }, []);

  const openDeleteModal = (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteProjectById(deletingId);
      await getProjects();
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/ai-projects/${id}`);
  };

  const projectToDelete = projects.find(p => p._id === deletingId);

  return (
    <div className="px-6 pb-12 max-w-7xl mx-auto relative min-h-[60vh] page-enter">
      
      {/* Delete Confirmation Modal Overlay */}
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
              className="relative w-full max-w-md bg-[#111] border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black shadow-inner"
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pt-2">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            My Saved <span className="text-[#ffa116]">Project Ideas</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Manage and revisit the unique projects generated for you.
          </p>
        </div>
        <Link
          to="/ai-projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffa116] text-black font-bold text-sm hover:bg-[#ffb84d] transition-all shadow-lg shadow-orange-500/20"
        >
          <FiPlus /> New Project Idea
        </Link>
      </div>

      {/* Projects Grid */}
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#111] border border-dashed border-white/[0.08] rounded-3xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
            <FiCpu className="text-3xl text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No projects saved yet</h3>
          <p className="text-gray-500 text-sm max-w-xs mb-8">
            Generate your first resume-worthy project idea using our AI generator.
          </p>
          <Link
            to="/ai-projects"
            className="px-8 py-3.5 rounded-xl bg-[#ffa116] text-black font-bold text-sm hover:bg-[#ffb84d] transition-all shadow-lg shadow-orange-500/20"
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
                onClick={() => handleCardClick(project._id)}
                className="group relative bg-[#0a0a0a] border border-white/[0.06] hover:border-[#ffa116]/30 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#ffa116]/5 hover:-translate-y-1.5 flex flex-col h-full overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffa116]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Difficulty Badge */}
                <div className="absolute top-5 right-5 z-10">
                  <span className={`text-[9px] uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full border ${
                    project.difficulty === 'Beginner' ? 'text-green-400 border-green-500/20 bg-green-500/10 shadow-sm shadow-green-500/5' :
                    project.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10 shadow-sm shadow-yellow-500/5' :
                    'text-red-400 border-red-500/20 bg-red-500/10 shadow-sm shadow-red-500/5'
                  }`}>
                    {project.difficulty}
                  </span>
                </div>

                {/* Content */}
                <div className="mb-4 flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#ffa116] transition-colors mb-1 truncate pr-20 text-ellipsis overflow-hidden">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-xs italic line-clamp-1 mb-4">{project.tagline}</p>
                  
                  {/* Features Preview */}
                  {project.features && project.features.length > 0 && (
                    <div className="space-y-1.5 mb-5 pl-1 border-l-2 border-white/[0.05] ml-1">
                      {project.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0 mt-1.5" />
                          <span className="text-[11px] text-gray-500 line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chips (Domain / Stack) - only show if data exists */}
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

                <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between relative z-10">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider whitespace-nowrap">
                    {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => openDeleteModal(e, project._id)}
                      className="w-8 h-8 rounded bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
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
    </div>
  );
};

export default ProjectDashboard;
