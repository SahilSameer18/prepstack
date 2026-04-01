import { RouterProvider } from "react-router-dom"
import { router } from './app.routes.jsx'
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";

function App() {

  return (
    <>
      <AuthProvider>
        <ProjectProvider>
          <RouterProvider router={router} />
        </ProjectProvider>
      </AuthProvider>
    </>
  )
}

export default App
