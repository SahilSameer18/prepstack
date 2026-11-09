import React, { createContext, useState, useMemo } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  // The list loads 20 at a time: how many ideas exist in total, whether more can be loaded, and whether a page is loading
  const [projectsTotal, setProjectsTotal] = useState(null);
  const [hasMoreProjects, setHasMoreProjects] = useState(false);
  const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);

  const value = useMemo(
    () => ({
      project,
      setProject,
      projects,
      setProjects,
      loading,
      setLoading,
      projectsTotal,
      setProjectsTotal,
      hasMoreProjects,
      setHasMoreProjects,
      loadingMoreProjects,
      setLoadingMoreProjects,
    }),
    [project, projects, loading, projectsTotal, hasMoreProjects, loadingMoreProjects]
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export default ProjectContext

