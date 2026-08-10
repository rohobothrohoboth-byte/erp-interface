// RST_ERP_UI/src/components/core/usermgmt/steps/AccountReviewStep.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2, ChevronLeft, Shield, Key, UserCheck, Clock,
    AlertTriangle, ChevronDown, ChevronUp,
    Eye, EyeOff, Copy, HelpCircle, Sun, Moon, Activity,
    Sparkles, Lock, Users, Building2, Briefcase
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface AccountReviewStepProps {
    employeeName: string;
    employeeCode: string;
    employeeDept?: string;
    formData: {
        step1: {
            password: string;
            confirmPassword: string;
            role: string;
            roleName?: string;
            modules: string[];
            moduleNames?: string[];
        };
        step2: {
            permissions: string[];
            permissionNames?: string[];
        };
        step3: {
            apiPermissions: string[];
            apiPermissionNames?: string[];
        };
    };
    onSubmit: () => void;
    onBack: () => void;
    isLoading: boolean;
}

// Dark mode hook
const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return { isDarkMode, toggleDarkMode };
};

function HelpTooltip({ text }: { text: string }) {
    return (
        <div className="group relative inline-block ml-1">
            <HelpCircle className="w-3 h-3 text-slate-400 dark:text-slate-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                {text}
            </div>
        </div>
    );
}

export function AccountReviewStep({
                                      employeeName,
                                      employeeCode,
                                      employeeDept,
                                      formData,
                                      onSubmit,
                                      onBack,
                                      isLoading
                                  }: AccountReviewStepProps) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [showPassword, setShowPassword] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        modules: true,
        menus: false,
        actions: false,
    });
    const [currentTime] = useState(new Date());

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const initials = employeeName
        .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const totalPermissions = formData.step2.permissions.length + formData.step3.apiPermissions.length;

    const hasHighRiskPermissions = formData.step3.apiPermissions.some(id =>
        id.toLowerCase().includes('delete') ||
        id.toLowerCase().includes('admin') ||
        id.toLowerCase().includes('grant')
    );

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const moduleDisplayNames = formData.step1.moduleNames?.length
        ? formData.step1.moduleNames
        : formData.step1.modules;

    // Direct create function with logging
    const handleDirectCreate = () => {
        console.log('🔴🔴🔴 CREATE ACCOUNT BUTTON CLICKED DIRECTLY 🔴🔴🔴');
        console.log('Form Data:', formData);
        console.log('Total Permissions:', totalPermissions);
        console.log('Calling onSubmit function...');
        onSubmit();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 mb-3">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Review & Confirm</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please verify all information before submitting</p>
            </div>

            {/* Warning for high-risk permissions */}
            {hasHighRiskPermissions && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">High-Risk Permissions Detected</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            This account has been granted delete or administrative permissions. Please ensure this is intended.
                        </p>
                    </div>
                </div>
            )}

            {/* Employee Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-5 border border-emerald-100 dark:border-emerald-800">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {initials}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 dark:bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{employeeName}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400">{employeeCode}</span>
                            {employeeDept && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{employeeDept}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">New Account</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Info */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Details</p>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {formData.step1.roleName || formData.step1.role || '—'}
              </span>
                        </div>
                        <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                Modules
                <HelpTooltip text="Modules this account can access" />
              </span>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {moduleDisplayNames.slice(0, 2).map(name => (
                                    <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                    {typeof name === 'string' && name.length > 30 ? name.slice(0, 27) + '...' : name}
                  </span>
                                ))}
                                {moduleDisplayNames.length > 2 && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500">+{moduleDisplayNames.length - 2}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Password</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                    {showPassword ? formData.step1.password : '••••••••'}
                                </code>
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                    onClick={() => navigator.clipboard.writeText(formData.step1.password)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions Summary */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Permissions Summary</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Menu Permissions</span>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {formData.step2.permissions.length} menu{formData.step2.permissions.length !== 1 ? 's' : ''}
              </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 dark:text-slate-400">API Actions</span>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {formData.step3.apiPermissions.length} action{formData.step3.apiPermissions.length !== 1 ? 's' : ''}
              </span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                                <span>Total permissions granted</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalPermissions}</span>
                            </div>
                            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((totalPermissions / 100) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-2">
                {/* Modules Section */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    <button
                        onClick={() => toggleSection('modules')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selected Modules ({moduleDisplayNames.length})</span>
                        {expandedSections.modules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedSections.modules && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex flex-wrap gap-2">
                                {moduleDisplayNames.map(name => (
                                    <span key={name} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    {name}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions - SIMPLE BUTTONS WITH LOGGING */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                    variant="outline"
                    onClick={() => {
                        console.log('🔴 BACK BUTTON CLICKED');
                        onBack();
                    }}
                    disabled={isLoading}
                    className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>

                <button
                    onClick={handleDirectCreate}
                    disabled={isLoading}
                    style={{
                        padding: '10px 32px',
                        background: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(20, 184, 166))',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.5 : 1
                    }}
                    className="create-account-btn"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            CREATE ACCOUNT (DIRECT)
                        </>
                    )}
                </button>
            </div>

            {/* Debug Info */}
            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                <p className="font-mono text-slate-600 dark:text-slate-400">
                    Debug: Total Permissions = {totalPermissions} (Menus: {formData.step2.permissions.length}, API: {formData.step3.apiPermissions.length})
                </p>
                <p className="font-mono text-slate-600 dark:text-slate-400 mt-1">
                    User ID: {localStorage.getItem('userId') || 'Not set'}
                </p>
            </div>
        </div>
    );
}