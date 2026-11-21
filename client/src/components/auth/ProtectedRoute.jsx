import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import PageLoader from "../ui/PageLoader";
import { PageErrorState } from "../ui/ErrorComponents";

const ProtectedRoute = ({ children }) => {
  const { user, loading, authError, retrySession } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="Verifying your session..." />;
  }

  // The server could not be reached, so we do not know whether this person is signed in: ask again instead of sending them to log in.
  if (!user && authError) {
    return <PageErrorState message={authError} onRetry={retrySession} backTo="/" backLabel="Go Home" />;
  }

  if (!user) {
    const returnTo = location.pathname + location.search + location.hash;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <div className="page-enter">{children}</div>;
};

export default ProtectedRoute;
