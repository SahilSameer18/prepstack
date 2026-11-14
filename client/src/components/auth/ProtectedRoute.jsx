import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import PageLoader from "../ui/PageLoader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="Verifying your session..." />;
  }

  if (!user) {
    const returnTo = location.pathname + location.search + location.hash;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <div className="page-enter">{children}</div>;
};

export default ProtectedRoute;


