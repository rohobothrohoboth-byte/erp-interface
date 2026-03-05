import React from "react";
import { LoginForm } from "../components/login-form";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SignInPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we are truly authenticated AND not loading
    if (isLoading) return;

    if (isAuthenticated) {
      console.log("SignInPage: authenticated → redirecting to /modules");
      navigate("/modules", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Safety guard: never show form if authenticated
  if (isLoading) {
    return 
  }

  if (isAuthenticated) {
    return null; // prevent rendering form → stops any render loop
  }

  // Only show form when definitely NOT authenticated
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
};

export default SignInPage;