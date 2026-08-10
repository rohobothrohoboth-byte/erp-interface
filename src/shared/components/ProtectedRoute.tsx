import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const token = useAuthStore((s) => s.token);



  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
    );
  }

  if (!isAuthenticated) {

    return <Navigate to="/login" replace />;
  }


  return <Outlet />;
}

export default ProtectedRoute;