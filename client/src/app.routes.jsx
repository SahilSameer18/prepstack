import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from './pages/NotFound';
import ProtectedRoute from "./components/auth/ProtectedRoute";


// Lazy Loaded Routes
const Sheets = lazy(() => import('./pages/DsaSheets/Sheets'));
const SheetsDetail = lazy(() => import('./pages/DsaSheets/SheetsDetail'));
const Notes = lazy(() => import('./pages/csNotes/Notes'));
const NotesDetail = lazy(() => import('./pages/csNotes/NotesDetail'));
const Roadmap = lazy(() => import('./pages/roadmaps/Roadmap'));
const RoadmapDetail = lazy(() => import('./pages/roadmaps/RoadmapDetail'));
const AIProjectIdeas = lazy(() => import('./pages/project/AIProjectIdeas'));
const Resume = lazy(() => import('./pages/Resume'));
const Behavioral = lazy(() => import('./pages/Behavioral'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Aptitude = lazy(() => import('./pages/Aptitude'));
const UnifiedDashboard = lazy(() => import('./pages/Dashboard/UnifiedDashboard'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/legal/TermsOfUse'));


export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [

      { path: "/", element: <Home /> },

      {
        path: "/dsa",
        element: <Sheets />
      },
      {
        path: "/dsa/:slug",
        element:
          <ProtectedRoute>
            <SheetsDetail />
          </ProtectedRoute>
      },
      {
        path: "/notes",
        element: <Notes />
      },
      {
        path: "/notes/:subject",
        element:
          <ProtectedRoute>
            <NotesDetail />
          </ProtectedRoute>
      },

      {
        path: "/roadmaps",
        element: <Roadmap />
      },
      {
        path: "/roadmaps/:slug",
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
        path: "/dashboard",
        element:
          <ProtectedRoute>
            <UnifiedDashboard />
          </ProtectedRoute>
      },
      {
        path: "/profile",
        element:
          <ProtectedRoute>
            <Profile />
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
        element: <Quiz />
      },
      {
        path: "/aptitude",
        element: <Aptitude />
      },
      {
        path: "/privacy",
        element: <PrivacyPolicy />
      },
      {
        path: "/terms",
        element: <TermsOfUse />
      },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '*', element: <NotFound /> },
])
