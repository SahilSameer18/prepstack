import { RouterProvider } from "react-router-dom"
import { router } from './app.routes.jsx'
import { AuthProvider } from "./context/AuthContext";

function App() {

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  )
}

export default App
