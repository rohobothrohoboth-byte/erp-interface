// src/components/LoginForm.tsx

import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Field, FieldGroup, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { BorderBeam } from "../components/ui/border-beam";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { useLanguage } from "../i18n/LanguageContext";

type LoginFormProps = {
    className?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
} & Omit<React.ComponentProps<"div">, "onSubmit">;

export function LoginForm({ className, onSuccess, onError, ...props }: LoginFormProps) {
    // ✅ t is an object, not a function
    const { t, language } = useLanguage();
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<"error" | "success" | "info">("error");
    const [focusedField, setFocusedField] = useState<string | null>(null);

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

    // Clear alert on input change
    useEffect(() => {
        if (alertMessage) {
            setAlertMessage(null);
        }
    }, [code, password]);

    // ✅ Helper function to safely get translation with fallback
    const getTranslation = (key: string, fallback: string): string => {
        // Handle nested keys like 'login.title'
        const keys = key.split('.');
        let value: any = t;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback;
            }
        }

        return typeof value === 'string' ? value : fallback;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedCode = code.trim();
        const trimmedPassword = password.trim();

        // Validation with translations
        if (!trimmedCode) {
            setAlertMessage(getTranslation('login.errors.emptyCode', "Please enter your employee code."));
            setAlertType("error");
            return;
        }

        if (!trimmedPassword) {
            setAlertMessage(getTranslation('login.errors.emptyPassword', "Please enter your password."));
            setAlertType("error");
            return;
        }

        if (trimmedPassword.length < 6) {
            setAlertMessage(getTranslation('login.errors.shortPassword', "Password must be at least 6 characters."));
            setAlertType("error");
            return;
        }

        setIsLoading(true);
        setAlertMessage(null);

        try {
            if (typeof login !== 'function') {
                throw new Error(getTranslation('login.errors.serviceUnavailable', "Authentication service is not available."));
            }

            await login(trimmedCode, trimmedPassword);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error("Login failed:", error);

            let errorMessage = error?.message || error?.response?.data?.message || '';
            console.log('🔍 Raw error message:', errorMessage);

            // ✅ If the error is already translated, use it directly
            const amharicRegex = /[\u1200-\u137F]/;
            if (amharicRegex.test(errorMessage)) {
                setAlertMessage(errorMessage);
                setAlertType("error");
                if (onError) onError(errorMessage);
                setIsLoading(false);
                return;
            }

            // ✅ Use translated messages
            const lowerMessage = errorMessage.toLowerCase();
            let translatedMessage = getTranslation('login.errors.invalidCredentials', "Invalid credentials. Please check your employee code and password.");

            if (lowerMessage.includes("not found") || lowerMessage.includes("does not exist")) {
                translatedMessage = getTranslation('login.errors.codeNotFound', "Employee code not found. Please check and try again.");
            } else if (lowerMessage.includes("password") || lowerMessage.includes("credential") || lowerMessage.includes("invalid")) {
                translatedMessage = getTranslation('login.errors.invalidCredentials', "Invalid credentials. Please check your employee code and password.");
            } else if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
                translatedMessage = getTranslation('login.errors.networkError', "Network error. Please check your connection and try again.");
            } else if (lowerMessage.includes("timeout") || lowerMessage.includes("time out")) {
                translatedMessage = getTranslation('login.errors.timeoutError', "Request timed out. Please try again.");
            }

            // ✅ Always translate the default error message
            if (errorMessage === "Invalid username or password" ||
                errorMessage === "Invalid credentials" ||
                errorMessage === "Invalid employee code or password") {
                translatedMessage = getTranslation('login.errors.invalidCredentials', "Invalid credentials. Please check your employee code and password.");
            }

            setAlertMessage(translatedMessage);
            setAlertType("error");

            if (onError) {
                onError(translatedMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getAlertStyles = () => {
        if (alertType === "error") {
            return "border-red-200 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 dark:border-red-800";
        }
        if (alertType === "success") {
            return "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 dark:border-emerald-800";
        }
        return "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800";
    };

    const getAlertTextStyles = () => {
        if (alertType === "error") {
            return "text-red-700 dark:text-red-400";
        }
        if (alertType === "success") {
            return "text-emerald-700 dark:text-emerald-400";
        }
        return "text-blue-700 dark:text-blue-400";
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error banner */}
                <AnimatePresence mode="wait">
                    {alertMessage && (
                        <motion.div
                            key={alertMessage}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-start gap-3 rounded-xl border ${getAlertStyles()} px-4 py-3 shadow-sm`}
                        >
                            <AlertCircle size={16} className={`${getAlertTextStyles()} shrink-0 mt-0.5`} />
                            <p className={`text-sm font-medium leading-snug ${getAlertTextStyles()}`}>
                                {alertMessage}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Employee Code Field */}
                <div className="space-y-2">
                    <FieldLabel htmlFor="code" className="text-slate-700 dark:text-slate-300 font-medium">
                        {getTranslation('login.employeeCode', "Employee Code")}
                    </FieldLabel>
                    <div className="relative">
                        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                            focusedField === 'code' ? 'text-emerald-500' : 'text-slate-400'
                        }`}>
                            <User size={18} />
                        </div>
                        <Input
                            id="code"
                            type="text"
                            placeholder={getTranslation('login.employeeCodePlaceholder', "Enter your employee code")}
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onFocus={() => setFocusedField('code')}
                            onBlur={() => setFocusedField(null)}
                            disabled={isLoading}
                            autoComplete="username"
                            className={`pl-10 pr-4 py-3 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                focusedField === 'code' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''
                            }`}
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                            {getTranslation('login.password', "Password")}
                        </FieldLabel>
                        <button
                            type="button"
                            className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
                        >
                            {getTranslation('login.forgotPassword', "Forgot password?")}
                        </button>
                    </div>
                    <div className="relative">
                        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                            focusedField === 'password' ? 'text-emerald-500' : 'text-slate-400'
                        }`}>
                            <Lock size={18} />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={getTranslation('login.passwordPlaceholder', "Enter your password")}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            disabled={isLoading}
                            autoComplete="current-password"
                            className={`pl-10 pr-12 py-3 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                focusedField === 'password' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="relative pt-2">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl relative overflow-hidden group transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{getTranslation('login.signingIn', "Signing in...")}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                                <span>{getTranslation('login.signIn', "Sign In")}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>

                    {!isLoading && (
                        <BorderBeam
                            duration={8}
                            size={100}
                            colorFrom="#10b981"
                            colorTo="#14b8a6"
                            className="rounded-xl pointer-events-none"
                        />
                    )}
                </div>

                {/* Demo Credentials Hint */}
                <div className="text-center pt-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        {getTranslation('login.demoHint', "Use your registered employee code and password")}
                    </p>
                </div>
            </form>
        </div>
    );
}

// ============================================================
// WRAPPER CARD VERSION
// ============================================================

type LoginCardProps = {
    title?: string;
    subtitle?: string;
} & LoginFormProps;

export function LoginCard({
                              title,
                              subtitle,
                              className,
                              onSuccess,
                              onError,
                              ...props
                          }: LoginCardProps) {
    const { t } = useLanguage();

    const getTranslation = (key: string, fallback: string): string => {
        const keys = key.split('.');
        let value: any = t;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback;
            }
        }
        return typeof value === 'string' ? value : fallback;
    };

    return (
        <div className={cn("flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4", className)}>
            <Card className="w-full max-w-md shadow-xl border-white/20 dark:border-slate-700/50 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {title || getTranslation('login.title', "Welcome Back")}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {subtitle || getTranslation('login.subtitle', "Enter your credentials to access your account")}
                        </p>
                    </div>

                    <LoginForm
                        onSuccess={onSuccess}
                        onError={onError}
                        {...props}
                    />
                </CardContent>
            </Card>
        </div>
    );
}