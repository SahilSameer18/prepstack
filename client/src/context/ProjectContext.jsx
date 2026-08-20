import React, { createContext, useState, useMemo } from 'react'

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const value = useMemo(
    () => ({
      project,
      setProject,
      projects,
      setProjects,
      loading,
      setLoading,
    }),
    [project, projects, loading]
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export default ProjectContext


