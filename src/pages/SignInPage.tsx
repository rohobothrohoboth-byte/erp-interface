import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useLanguage, LanguageSelector } from '../i18n';
import { Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Briefcase, Globe } from "lucide-react";

const SignInPage: React.FC = () => {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoadingAuth = useAuthStore(s => s.isLoading);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  // Auto-clear alert after 6 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (isAuthenticated) {
      navigate("/modules", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !password) {
      setAlertMessage(t.invalidCredentials || "Please enter both your employee code and password.");
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
          t.invalidCredentials;

      setAlertMessage(message);
      setIsLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 rounded-full" />
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-medium mt-4">{t.signingIn || "Loading..."}</p>
          </div>
        </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-4 relative">
        {/* Language Selector - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageSelector />
        </div>

        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Main Container */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full max-w-md mx-auto"
        >
          {/* Login Card */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative"
          >
            {/* Glow effect on hover */}
            <div
                className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-xl transition-opacity duration-500 ${
                    isHovered ? "opacity-50" : "opacity-0"
                }`}
            />

            <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden">
              {/* Top Accent Line */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              {/* Form Header */}
              <div className="px-8 pt-8 pb-4 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4"
                >
                  <Briefcase className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {t.welcomeBack || "Welcome Back"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t.enterCredentials || "Enter your credentials to access your account"}
                </p>
              </div>

              {/* Form */}
              <div className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error banner */}
                  <AnimatePresence>
                    {alertMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="flex items-start gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 px-4 py-3 shadow-sm"
                        >
                          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700 dark:text-red-400 font-medium leading-snug">
                            {alertMessage}
                          </p>
                        </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Employee Code Field */}
                  <div className="space-y-2">
                    <label
                        htmlFor="code"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {t.employeeCode || "Employee Code"}
                    </label>
                    <div className="relative">
                      <div
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                              focusedField === "code" ? "text-emerald-500" : "text-slate-400"
                          }`}
                      >
                        <User size={18} />
                      </div>
                      <input
                          id="code"
                          type="text"
                          placeholder={t.employeeCode || "Enter your employee code"}
                          required
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onFocus={() => setFocusedField("code")}
                          onBlur={() => setFocusedField(null)}
                          disabled={isLoading}
                          autoComplete="username"
                          className={`w-full pl-10 pr-4 py-3 border ${
                              focusedField === "code"
                                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                                  : "border-slate-200 dark:border-slate-700"
                          } rounded-xl transition-all text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                          htmlFor="password"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        {t.password || "Password"}
                      </label>
                      <button
                          type="button"
                          className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium transition-colors"
                      >
                        {t.forgotPassword || "Forgot password?"}
                      </button>
                    </div>
                    <div className="relative">
                      <div
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                              focusedField === "password" ? "text-emerald-500" : "text-slate-400"
                          }`}
                      >
                        <Lock size={18} />
                      </div>
                      <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t.password || "Enter your password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField(null)}
                          disabled={isLoading}
                          autoComplete="current-password"
                          className={`w-full pl-10 pr-12 py-3 border ${
                              focusedField === "password"
                                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                                  : "border-slate-200 dark:border-slate-700"
                          } rounded-xl transition-all text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none`}
                      />
                      <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="relative pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl relative overflow-hidden group transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t.signingIn || "Signing in..."}</span>
                          </div>
                      ) : (
                          <div className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                            <span>{t.signIn || "Sign In"}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                      )}
                    </button>

                    {/* Border beam effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute -inset-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>

                  {/* Demo Hint */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {t.demoHint || "Use your registered employee code and password"}
                    </p>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.needHelp || "Need help?"}{" "}
                  <button className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium transition-colors">
                    {t.contactSupport || "Contact support"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-8"
          >
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-800/50">
              <span className="text-xs text-slate-400 dark:text-slate-500">© 2024 RST ERP</span>
              <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500">{t.privacyPolicy || "Privacy Policy"}</span>
              <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500">{t.termsOfService || "Terms of Service"}</span>
              <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500">v3.0.0</span>
            </div>
          </motion.div>
        </motion.div>

        <style>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 32px 32px;
        }
        .dark .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
      </div>
  );
};

export default SignInPage;