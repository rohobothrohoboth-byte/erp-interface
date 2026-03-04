import { useAuth } from "../contexts/AuthContext"; // Adjust path
import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
export default ProtectedRoute;
