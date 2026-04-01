import React, { createContext, useState } from 'react'

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <ProjectContext.Provider value={{ project, setProject, projects, setProjects, loading, setLoading }}>
      {children}
    </ProjectContext.Provider>
  )
}

export default ProjectContext