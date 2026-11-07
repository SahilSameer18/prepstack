import { RouterProvider } from "react-router-dom"
import { router } from './app.routes.jsx'
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <>
      <AuthProvider>
        <ProjectProvider>
          <RouterProvider router={router} />
        </ProjectProvider>
      </AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--elevated)',
            color: 'var(--fg)',
            border: '1px solid color-mix(in srgb, var(--ink) 10%, transparent)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 12px color-mix(in srgb, var(--shadow) 50%, transparent)',
          },
          success: {
            iconTheme: {
              primary: 'var(--toast-ok)',
              secondary: 'var(--elevated)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--toast-bad)',
              secondary: 'var(--elevated)',
            },
          },
        }}
      />
    </>
  )
}

export default App
