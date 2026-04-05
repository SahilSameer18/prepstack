import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Sheets from "./pages/DsaSheets/Sheets";
import Notes from "./pages/csNotes/Notes";
import Roadmap from "./pages/roadmaps/Roadmap";
import RoadmapDetail from "./pages/roadmaps/RoadmapDetail";
import AIProjectIdeas from "./pages/project/AIProjectIdeas";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Resume from './pages/Resume';
import Behavioral from './pages/Behavioral';
import NotFound from './pages/NotFound';
import Quiz from './pages/Quiz';
import Aptitute from './pages/Aptitute';
import ProjectDashboard from "./pages/project/ProjectDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";


export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [

      { path: "/", element: <Home /> },

      {
        path: "/dsa",
        element:
          <ProtectedRoute>
            <Sheets />
          </ProtectedRoute>
      },
      {
        path: "/notes",
        element:
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
      },

      {
        path: "/roadmaps",
        element:
          <ProtectedRoute>
            <Roadmap />
          </ProtectedRoute>
      },
      {
        path: "/roadmaps/:id",
        element:
          <ProtectedRoute>
            <RoadmapDetail />
          </ProtectedRoute>
      },
      {
        path: "/ai-projects",
        element:
          <ProtectedRoute>
            <AIProjectIdeas />
          </ProtectedRoute>
      },
      {
        path: "/ai-projects/:projectId",
        element:
          <ProtectedRoute>
            <AIProjectIdeas />
          </ProtectedRoute>
      },
      {
        path: "/project-dashboard",
        element:
          <ProtectedRoute>
            <ProjectDashboard />
          </ProtectedRoute>
      },
      {
        path: "/resume",
        element:
          <ProtectedRoute>
            <Resume />
          </ProtectedRoute>
      },
      {
        path: "/behavioral",
        element:
          <ProtectedRoute>
            <Behavioral />
          </ProtectedRoute>
      },
      {
        path: "/quiz",
        element:
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
      },
      {
        path: "/aptitude",
        element:
          <ProtectedRoute>
            <Aptitute />
          </ProtectedRoute>
      },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '*', element: <NotFound /> },
])