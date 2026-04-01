import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-[#ffa116]/20 border-t-[#ffa116] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
