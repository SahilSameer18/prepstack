import { generateProjectIdea, getAllProjects, getProjectById as fetchProjectById, deleteProject } from "../api/services/projectService";
import { useParams } from 'react-router-dom'
import { ProjectContext } from '../context/ProjectContext'
import { useContext, useEffect } from "react";
import { extractError } from "../utils/extractError";


export const useProject = () => {

  const context = useContext(ProjectContext);
  const { projectId } = useParams()

  if(!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }

  const { project, setProject, projects, setProjects, loading, setLoading } = context;

  const generateProject = async (data) => {
    setLoading(true);
    try {
      const response = await generateProjectIdea(data);
      setProject(response?.project || response);
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to generate project idea. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getProjects = async () => {
    setLoading(true);
    try {
      const response = await getAllProjects();
      setProjects(response?.projects || response);
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to fetch projects. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = async (projectId) => {
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
  };

  const deleteProjectById = async (projectId) => {
    setLoading(true);
    try {
      const response = await deleteProject(projectId);
      setProject(null);
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to delete project. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(projectId) {
      getProjectById(projectId);
    }
  }, [projectId])

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
    deleteProjectById
  }
}