import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Field, FieldGroup, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { BorderBeam } from "../components/ui/border-beam";
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";

type LoginFormProps = {
  className?: string;
} & Omit<React.ComponentProps<"div">, "onSubmit">;

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  
  const login = useAuthStore((s) => s.login);
  
  // Auto-clear alert after 6 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !password) {
      setAlertMessage("Please enter both your employee code and password.");
      return;
    }

    setIsLoading(true);
    setAlertMessage(null);

    try {
      await login(code, password);
    } catch (error: any) {
      console.error("Login failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid credentials. Please check your employee code and password.";

      setAlertMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-20">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center ">
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back
                </h1>
                <p className=" text-balance text-gray-500">
                  Login to your BDA ERP account
                </p>
              </div>

              {/* Error banner */}
              {alertMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle
                    size={16}
                    className="text-red-500 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-700 font-medium leading-snug">
                    {alertMessage}
                  </p>
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="code" className="text-gray-700">
                  Employee Code
                </FieldLabel>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter your employee code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-gray-700">
                    Password
                  </FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </Field>

              <Field>
                <div className="relative">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2 relative overflow-hidden"
                  >
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                  {!isLoading && (
                    <BorderBeam
                      duration={8}
                      size={100}
                      colorFrom="#3b82f6"
                      colorTo="#60a5fa"
                      className="rounded-md"
                    />
                  )}
                </div>
              </Field>
            </FieldGroup>
          </form>

          <div className="bg-linear-to-br from-blue-600 to-blue-800 relative hidden md:flex flex-col items-center justify-center p-10">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                <img
                  src="/bda-logo-1.png"
                  alt="BDA Logo"
                  className="w-14 h-14 rounded-full border-2 border-gray-200 object-cover"
                />
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
              Welcome back to BDA ERP
            </h1>

            {/* Subtext */}
            <p className="text-white/90 text-center max-w-md text-lg">
              Securely access your business tools and manage your operations in
              one place.
            </p>

            {/* Decorative elements */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <div className="w-24 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
