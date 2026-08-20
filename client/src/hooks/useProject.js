import { generateProjectIdea, getAllProjects, getProjectById as fetchProjectById, deleteProject } from "../api/services/projectService";
import { ProjectContext } from '../context/ProjectContext';
import { useContext, useCallback } from "react";
import { extractError } from "../utils/extractError";

export const useProject = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }

  const { project, setProject, projects, setProjects, loading, setLoading } = context;

  const generateProject = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await generateProjectIdea(data);
      const newProj = response?.project || response;
      setProject(newProj);
      if (newProj && newProj._id) {
        setProjects((prev) => [newProj, ...(prev || [])]);
      }
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to generate project idea. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [setProject, setProjects, setLoading]);

  const getProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllProjects();
      setProjects(response?.projects || response || []);
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to fetch projects. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [setProjects, setLoading]);

  const getProjectById = useCallback(async (projectId) => {
    setLoading(true);
    try {
      const response = await fetchProjectById(projectId);
      setProject(response?.project || response);
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
      setProject((curr) => (curr?._id === projectId ? null : curr));
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to delete project. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [setProjects, setProject, setLoading]);

  return {
    project,
    setProject,
    projects,
    setProjects,
    loading,
    setLoading,
    generateProject,
    getProjects,
    getProjectById,
    deleteProjectById,
  };
};


