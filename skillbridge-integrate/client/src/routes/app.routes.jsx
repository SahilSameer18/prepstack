import { createBrowserRouter } from 'react-router';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Protected from '../components/auth/Protected';
import Home from '../pages/home/Home';
import Form from '../pages/form/Form';
import InterviewReport from '../pages/interviewReports/InterviewReport';
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/profile/Profile';
import AppLayout from '../layouts/AppLayout';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    // AppLayout wraps everything (Navbar + Outlet)
    path: '/',
    element: <AppLayout />,
    children: [
      {
        // Landing is PUBLIC — no Protected wrapper
        index: true,
        element: <Home />,
      },
      {
        // All app routes below require login
        path: '/generate',
        element: (
          <Protected>
            <Form />
          </Protected>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <Protected>
            <Dashboard />
          </Protected>
        ),
      },
      {
        path: '/profile',
        element: (
          <Protected>
            <Profile />
          </Protected>
        ),
      },
      {
        path: '/interview/:interviewId',
        element: (
          <Protected>
            <InterviewReport />
          </Protected>
        ),
      },
      {
        // Catch-all 404 inside the layout (keeps Navbar visible)
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

