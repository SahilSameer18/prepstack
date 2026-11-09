import { generateProjectIdea, getAllProjects, getProjectById as fetchProjectById, deleteProject } from "../api/services/projectService";
import { ProjectContext } from '../context/ProjectContext';
import { useContext, useCallback } from "react";
import { extractError } from "../utils/extractError";

export const useProject = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }

  const {
    project, setProject, projects, setProjects, loading, setLoading,
    projectsTotal, setProjectsTotal, hasMoreProjects, setHasMoreProjects, loadingMoreProjects, setLoadingMoreProjects,
  } = context;

  const generateProject = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await generateProjectIdea(data);
      const newProj = response?.data?.project || response?.project || response;
      setProject(newProj);
      if (newProj && newProj._id) {
        setProjects((prev) => [newProj, ...(prev || [])]);
        setProjectsTotal((n) => (n === null ? n : n + 1));
      }
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to generate project idea. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [setProject, setProjects, setProjectsTotal, setLoading]);

  // First page (the newest 20). Also learns the true total and whether there is more to load.
  const getProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllProjects();
      const data = response?.data || response;
      const list = data?.projects || (Array.isArray(response) ? response : []);
      setProjects(list);
      setProjectsTotal(typeof data?.total === 'number' ? data.total : list.length);
      setHasMoreProjects(Boolean(data?.hasMore));
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to fetch projects. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [setProjects, setProjectsTotal, setHasMoreProjects, setLoading]);

  // Next 20 (older) ideas, added after the ones already shown. Asks for "everything older than the last idea we have".
  const loadMoreProjects = useCallback(async () => {
    const last = projects?.[projects.length - 1];
    if (!last?._id || loadingMoreProjects) return;
    setLoadingMoreProjects(true);
    try {
      const response = await getAllProjects(last._id);
      const data = response?.data || response;
      const next = data?.projects || [];
      setProjects((prev) => {
        const seen = new Set((prev || []).map((p) => p._id));
        return [...(prev || []), ...next.filter((p) => !seen.has(p._id))];
      });
      if (typeof data?.total === 'number') setProjectsTotal(data.total);
      setHasMoreProjects(Boolean(data?.hasMore));
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to load more project ideas. Please try again.'));
    } finally {
      setLoadingMoreProjects(false);
    }
  }, [projects, loadingMoreProjects, setProjects, setProjectsTotal, setHasMoreProjects, setLoadingMoreProjects]);

  const getProjectById = useCallback(async (projectId) => {
    setLoading(true);
    try {
      const response = await fetchProjectById(projectId);
      setProject(response?.data?.project || response?.project || response);
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to fetch project. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [setProject, setLoading]);

  const deleteProjectById = useCallback(async (projectId) => {
    setLoading(true);
    try {
      const response = await deleteProject(projectId);
      // Optimistically remove deleted project from local state
      setProjects((prev) => (prev || []).filter((p) => p._id !== projectId));
      setProjectsTotal((n) => (n === null ? n : Math.max(0, n - 1)));
      setProject((curr) => (curr?._id === projectId ? null : curr));
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to delete project. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [setProjects, setProject, setProjectsTotal, setLoading]);

  return {
    project,
    setProject,
    projects,
    setProjects,
    loading,
    setLoading,
    projectsTotal,
    hasMoreProjects,
    loadingMoreProjects,
    generateProject,
    getProjects,
    loadMoreProjects,
    getProjectById,
    deleteProjectById,
  };
};


