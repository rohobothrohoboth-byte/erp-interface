import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

function ProtectedRoute() {
  const  isAuthenticated= useAuthStore((s) => s.isAuthenticated); 
   const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
export default ProtectedRoute;
