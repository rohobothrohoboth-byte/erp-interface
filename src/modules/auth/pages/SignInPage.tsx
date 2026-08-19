// SignInPage.tsx - Navy Blue & Gold Theme

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useCompanyStore } from "@/shared/stores/company.store";
import { useLanguage, LanguageSelector } from '@/shared/i18n/index';
import { Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Briefcase, Globe, Sparkles } from "lucide-react";

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
  const { company, isLoading: companyLoading, fetchPublicCompany } = useCompanyStore();

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

  useEffect(() => {
    if (!company && !companyLoading) {
      fetchPublicCompany();
    }
  }, [company, companyLoading, fetchPublicCompany]);

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
      const message = error?.response?.data?.message || error?.message || t.invalidCredentials;
      setAlertMessage(message);
      setIsLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-[#c9a84c]/30 rounded-full" />
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[#c9a84c] font-medium mt-4">{t.signingIn || "Loading..."}</p>
          </div>
        </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Language Selector - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageSelector />
        </div>

        {/* Decorative Navy & Gold Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#c9a84c]/5 via-transparent to-[#c9a84c]/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c9a84c]/5 rounded-full blur-3xl" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#c9a84c]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#c9a84c]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Background Grid with Gold dots */}
        <div className="fixed inset-0 bg-grid-gold [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

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
            {/* Glow effect on hover - Gold */}
            <div
                className={`absolute -inset-1 bg-gradient-to-r from-[#c9a84c]/40 via-[#d4af37]/40 to-[#c9a84c]/40 rounded-2xl blur-xl transition-opacity duration-500 ${
                    isHovered ? "opacity-60" : "opacity-0"
                }`}
            />

            <div className="relative bg-[#0d1f3c]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#c9a84c]/20 overflow-hidden">
              {/* Top Accent Line - Gold */}
              <div className="h-1.5 bg-gradient-to-r from-[#c9a84c] via-[#d4af37] to-[#c9a84c]" />

              {/* Form Header - Now with Dynamic Logo */}
              <div className="px-8 pt-8 pb-4 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full shadow-2xl mb-4 overflow-hidden bg-[#0a1628] border-2 border-[#c9a84c] shadow-[#c9a84c]/20"
                >
                  {companyLoading ? (
                      <div className="w-full h-full animate-pulse bg-[#c9a84c]/10" />
                  ) : company?.logoUrl ? (
                      <img
                          src={company.logoUrl}
                          alt={company.name || "Company Logo"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const fallback = document.createElement('span');
                              fallback.className = 'w-full h-full flex items-center justify-center text-4xl font-bold text-[#d4af37]';
                              fallback.textContent = company?.name?.charAt(0)?.toUpperCase() || 'B';
                              parent.appendChild(fallback);
                            }
                          }}
                      />
                  ) : (
                      <span className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#d4af37]">
                    {company?.name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                  )}
                </motion.div>

                {/* Dynamic Company Name - Gold Text */}
                <h2 className="text-2xl font-bold text-[#d4af37] tracking-wide">
                  {company?.name || 'RST ERP'}
                </h2>

                {/* Dynamic Slogan - Gold with Sparkle */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Sparkles className="w-4 h-4 text-[#c9a84c]" />
                  <p className="text-sm text-[#c9a84c]/70 font-medium italic tracking-wide">
                    {company?.motto || t.enterCredentials || "Enter your credentials to access your account"}
                  </p>
                  <Sparkles className="w-4 h-4 text-[#c9a84c]" />
                </div>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9a84c]/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/50" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9a84c]/50" />
                </div>
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
                            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 shadow-sm shadow-red-500/10"
                        >
                          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-red-400 font-medium leading-snug">
                            {alertMessage}
                          </p>
                        </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Employee Code Field */}
                  <div className="space-y-2">
                    <label
                        htmlFor="code"
                        className="text-sm font-medium text-[#c9a84c]/80"
                    >
                      {t.employeeCode || "Employee Code"}
                    </label>
                    <div className="relative">
                      <div
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                              focusedField === "code" ? "text-[#d4af37]" : "text-[#c9a84c]/50"
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
                                  ? "border-[#d4af37] ring-2 ring-[#d4af37]/20"
                                  : "border-[#c9a84c]/20"
                          } rounded-xl transition-all text-white bg-white/5 placeholder:text-[#c9a84c]/30 focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                          htmlFor="password"
                          className="text-sm font-medium text-[#c9a84c]/80"
                      >
                        {t.password || "Password"}
                      </label>
                      <button
                          type="button"
                          className="text-xs text-[#d4af37] hover:text-[#c9a84c] font-medium transition-colors"
                      >
                        {t.forgotPassword || "Forgot password?"}
                      </button>
                    </div>
                    <div className="relative">
                      <div
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                              focusedField === "password" ? "text-[#d4af37]" : "text-[#c9a84c]/50"
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
                                  ? "border-[#d4af37] ring-2 ring-[#d4af37]/20"
                                  : "border-[#c9a84c]/20"
                          } rounded-xl transition-all text-white bg-white/5 placeholder:text-[#c9a84c]/30 focus:outline-none`}
                      />
                      <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#c9a84c]/50 hover:text-[#d4af37] transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button - Gold */}
                  <div className="relative pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#c9a84c] via-[#d4af37] to-[#c9a84c] hover:from-[#d4af37] hover:via-[#c9a84c] hover:to-[#d4af37] text-[#0a1628] font-bold py-3 rounded-xl relative overflow-hidden group transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#c9a84c]/20"
                    >
                      {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#0a1628] border-t-transparent rounded-full animate-spin" />
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
                      <div className="absolute -inset-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent animate-shimmer" />
                    </div>
                  </div>

                  {/* Demo Hint */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-[#c9a84c]/40">
                      {t.demoHint || "Use your registered employee code and password"}
                    </p>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-white/5 border-t border-[#c9a84c]/10 text-center">
                <p className="text-xs text-[#c9a84c]/40">
                  {t.needHelp || "Need help?"}{" "}
                  <button className="text-[#d4af37] hover:text-[#c9a84c] font-medium transition-colors">
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
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-[#0d1f3c]/60 backdrop-blur-sm rounded-full shadow-sm border border-[#c9a84c]/10">
              <span className="text-xs text-[#c9a84c]/40">© 2024 {company?.name || 'RST ERP'}</span>
              <span className="w-px h-3 bg-[#c9a84c]/20" />
              <span className="text-xs text-[#c9a84c]/40">{t.privacyPolicy || "Privacy Policy"}</span>
              <span className="w-px h-3 bg-[#c9a84c]/20" />
              <span className="text-xs text-[#c9a84c]/40">{t.termsOfService || "Terms of Service"}</span>
              <span className="w-px h-3 bg-[#c9a84c]/20" />
              <span className="text-xs text-[#c9a84c]/40">v3.0.0</span>
            </div>
          </motion.div>
        </motion.div>

        <style>{`
        .bg-grid-gold {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23c9a84c' stroke-opacity='0.05'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 32px 32px;
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