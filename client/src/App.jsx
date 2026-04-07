import { RouterProvider } from "react-router-dom"
import { router } from './app.routes.jsx'
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { SheetProvider } from "./context/SheetContext";

function App() {

  return (
    <>
      <AuthProvider>
        <ProjectProvider>
          <SheetProvider>
            <RouterProvider router={router} />
          </SheetProvider>
        </ProjectProvider>
      </AuthProvider>
    </>
  )
}

export default App
