import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from './pages/NotFound';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RouteSeo from "./seo/Seo";


// Lazy Loaded Routes
const Sheets = lazy(() => import('./pages/DsaSheets/Sheets'));
const SheetsDetail = lazy(() => import('./pages/DsaSheets/SheetsDetail'));
const Notes = lazy(() => import('./pages/csNotes/Notes'));
const NotesDetail = lazy(() => import('./pages/csNotes/NotesDetail'));
const Roadmap = lazy(() => import('./pages/roadmaps/Roadmap'));
const RoadmapDetail = lazy(() => import('./pages/roadmaps/RoadmapDetail'));
const AIProjectIdeas = lazy(() => import('./pages/project/AIProjectIdeas'));
const Analyzer = lazy(() => import('./pages/analyzer/Analyzer'));
const AnalyzerReport = lazy(() => import('./pages/analyzer/AnalyzerReport'));
const Resume = lazy(() => import('./pages/Resume'));
const Behavioral = lazy(() => import('./pages/Behavioral'));
const UnifiedDashboard = lazy(() => import('./pages/Dashboard/UnifiedDashboard'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/legal/TermsOfUse'));
const MyPlan = lazy(() => import('./pages/MyPlan'));
const MyPlanStudy = lazy(() => import('./pages/MyPlanStudy'));


export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [

      { path: "/", element: <Home /> },
      { path: '/my-plan', element: <MyPlan /> },
      { path: '/my-plan/study', element: <ProtectedRoute><MyPlanStudy /></ProtectedRoute> },

      {
        path: "/dsa",
        element: <Sheets />
      },
      // Reading is open to everyone; only saving progress needs an account (the pages ask when someone tries to save).
      {
        path: "/dsa/:slug",
        element: <SheetsDetail />
      },
      {
        path: "/notes",
        element: <Notes />
      },
      {
        path: "/notes/:subject",
        element: <NotesDetail />
      },
      {
        path: "/notes/:subject/:sectionId",
        element: <NotesDetail />
      },

      {
        path: "/roadmaps",
        element: <Roadmap />
      },
      {
        path: "/roadmaps/:slug",
        element: <RoadmapDetail />
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
        path: "/analyzer",
        element:
          <ProtectedRoute>
            <Analyzer />
          </ProtectedRoute>
      },
      {
        path: "/analyzer/:id",
        element:
          <ProtectedRoute>
            <AnalyzerReport />
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
        element: <Behavioral />
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
  { path: '/login', element: <><RouteSeo /><Login /></> },
  { path: '/register', element: <><RouteSeo /><Register /></> },
  { path: '/forgot-password', element: <><RouteSeo /><ForgotPassword /></> },
  { path: '/reset-password', element: <><RouteSeo /><ResetPassword /></> },
  { path: '*', element: <><RouteSeo /><NotFound /></> },
])
