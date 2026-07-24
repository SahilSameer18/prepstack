import { RouterProvider } from "react-router-dom"
import { router } from './app.routes.jsx'
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { SheetProvider } from "./context/SheetContext";
import { Toaster } from 'react-hot-toast';

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
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#1a1a1a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1a1a1a',
            },
          },
        }}
      />
    </>
  )
}

export default App