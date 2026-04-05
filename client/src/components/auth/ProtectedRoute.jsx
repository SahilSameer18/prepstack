import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import PageLoader from "../ui/PageLoader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Verifying your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <div className="page-enter">{children}</div>;
};

export default ProtectedRoute;
