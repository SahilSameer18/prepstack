import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Sheets from "./pages/Sheets";
import Notes from "./pages/Notes";
import Roadmap from "./pages/Roadmap";
import RoadmapDetail from "./pages/RoadmapDetail";
import AIProjectIdeas from "./pages/AIProjectIdeas";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Resume from './pages/Resume';
import Behavioral from './pages/Behavioral';
import NotFound from './pages/NotFound';
import Quiz from './pages/Quiz';
import Aptitute from './pages/Aptitute';



// Protected route wrapper
// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();
//   return user ? children : <Navigate to="/login" replace />;
// };


export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/dsa", element: <Sheets /> },
      { path: "/notes", element: <Notes /> },
      { path: "/roadmaps", element: <Roadmap /> },
      { path: "/roadmaps/:id", element: <RoadmapDetail /> },
      { path: "/ai-projects", element: <AIProjectIdeas /> },
      { path: "/resume", element: <Resume /> },
      { path: "/behavioral", element: <Behavioral /> },
      { path: "/quiz", element: <Quiz /> },
      { path: "/aptitude", element: <Aptitute /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '*', element: <NotFound /> },
])