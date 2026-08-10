// steps/ReviewStep.tsx (FIXED - with API call)
import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    CheckCircle2, ChevronLeft, Layout, Shield, Key, UserCheck, Clock,
    AlertTriangle, ChevronDown, ChevronUp, Download, FileText,
    Eye, EyeOff, Copy, Check, X, HelpCircle, Sun, Moon, Activity,
    Sparkles, Lock, Users, Menu, Grid3x3, Building2, Mail, Phone
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { EmpSearchRes } from '@/modules/core/types/EmpSearchRes';
import type { WizardFormData } from '@/modules/core/components/usermgmt/v2/AddAccountWizard';

import { accountApi } from '@/modules/auth/services/account/account.api';
import type { UUID } from '@/modules/auth/types/registration';
import toast from 'react-hot-toast';

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

// Helper component for tooltips
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

interface Props {
    employee: EmpSearchRes;
    formData: WizardFormData;
    onFinish: () => void | Promise<void>;
    onBack: () => void;
    isSubmitting?: boolean;
    userId?: string;
}

// Confirmation Modal Component
function ConfirmationModal({
                               isOpen,
                               onConfirm,
                               onCancel,
                               employeeName,
                               permissionCount,
                               isLoading
                           }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    employeeName: string;
    permissionCount: number;
    isLoading: boolean;
}) {
    const prefersReducedMotion = useReducedMotion();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: prefersReducedMotion ? 0.15 : 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirm Account Creation</h3>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            You are about to create an account for <span className="font-semibold text-slate-800 dark:text-slate-200">{employeeName}</span> with <span className="font-semibold text-emerald-600 dark:text-emerald-400">{permissionCount}</span> permissions.
                        </p>

                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6">
                            <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span>This action cannot be undone. Please verify all permissions before confirming.</span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={onCancel}
                                variant="outline"
                                className="flex-1 rounded-xl"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" /> Confirm
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Permission Details Modal
function PermissionDetailsModal({
                                    isOpen,
                                    onClose,
                                    formData
                                }: {
    isOpen: boolean;
    onClose: () => void;
    formData: WizardFormData;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: prefersReducedMotion ? 0.15 : 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Detailed Permission Report</h3>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Modules Section */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selected Modules</p>
                                </div>
                                <div className="p-3">
                                    <div className="flex flex-wrap gap-2">
                                        {formData.step1.moduleNames.map(name => (
                                            <span key={name} className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Menus Section */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Menu Permissions ({formData.step2.menuIds.length})</p>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {formData.step2.menuIds.length} menu{formData.step2.menuIds.length !== 1 ? 's' : ''} selected
                                    </p>
                                    {formData.step2.menuIds.length > 0 && (
                                        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                            <div className="bg-emerald-500 dark:bg-emerald-600 h-1.5 rounded-full" style={{ width: '100%' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Access Actions ({formData.step3.accessIds.length})</p>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {formData.step3.accessIds.length} action{formData.step3.accessIds.length !== 1 ? 's' : ''} selected
                                    </p>
                                    {formData.step3.accessIds.length > 0 && (
                                        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                            <div className="bg-emerald-500 dark:bg-emerald-600 h-1.5 rounded-full" style={{ width: '100%' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Credentials</p>
                                </div>
                                <div className="p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Password</span>
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
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button onClick={onClose} className="flex-1 rounded-xl">
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function ReviewStep({ employee, formData, userId, onFinish, onBack }: Props) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const prefersReducedMotion = useReducedMotion();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        modules: true,
        menus: false,
        actions: false,
    });

    // Update current time
    useState(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearTimeout(timer);
    }, []);

    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const initials = (employee.empFullName ?? '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const totalPermissions = formData.step2.menuIds.length + formData.step3.accessIds.length;

    const hasHighRiskPermissions = formData.step3.accessIds.some(id =>
        id.toLowerCase().includes('delete') ||
        id.toLowerCase().includes('admin') ||
        id.toLowerCase().includes('grant')
    );

    // FIXED: This now actually calls the API
    // steps/ReviewStep.tsx - Update to save real data
// In the handleConfirm function, replace with:

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onFinish();
            setShowConfirmation(false);
        } catch (error: any) {
            console.error('CONFIRMATION ERROR:', error);
            toast.error(error?.response?.data?.message || error?.message || 'Failed to confirm');
        } finally {
            setIsLoading(false);
        }
    };

    const buttonVariants = {
        hover: { scale: prefersReducedMotion ? 1 : 1.02 },
        tap: { scale: prefersReducedMotion ? 1 : 0.98 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 transition-colors duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 mb-3">
                            <CheckCircle2 className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Review & Confirm</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please verify all information before submitting</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Activity size={14} />
                            <span className="font-mono">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
                        </div>
                        <button onClick={toggleDarkMode} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>

                {/* Warning for high-risk permissions */}
                <AnimatePresence>
                    {hasHighRiskPermissions && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 mb-6"
                        >
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">High-Risk Permissions Detected</p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                    This account has been granted delete or administrative permissions. Please ensure this is intended.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Employee Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-5 border border-emerald-100 dark:border-emerald-800 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {initials}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 dark:bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900"></div>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{employee.empFullName}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className="text-sm text-slate-500 dark:text-slate-400">{employee.code}</span>
                                {employee.dept && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{employee.dept}</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                                    {formData.step1.roleName || formData.step1.roleId || '—'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    Modules
                                    <HelpTooltip text="Modules this account can access" />
                                </span>
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {formData.step1.moduleNames.slice(0, 2).map(name => (
                                        <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                                            {name}
                                        </span>
                                    ))}
                                    {formData.step1.moduleNames.length > 2 && (
                                        <span className="text-xs text-slate-400 dark:text-slate-500">+{formData.step1.moduleNames.length - 2}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Password</span>
                                <span className="text-sm text-emerald-600 dark:text-emerald-400">••••••••</span>
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
                            <button
                                onClick={() => setShowDetails(true)}
                                className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
                            >
                                View Details →
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Menu Permissions</span>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {formData.step2.menuIds.length} menu{formData.step2.menuIds.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Access Actions</span>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {formData.step3.accessIds.length} action{formData.step3.accessIds.length !== 1 ? 's' : ''}
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
                <div className="space-y-2 mb-6">
                    {/* Modules Section */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        <button
                            onClick={() => toggleSection('modules')}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selected Modules ({formData.step1.moduleNames.length})</span>
                            {expandedSections.modules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <AnimatePresence>
                            {expandedSections.modules && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex flex-wrap gap-2">
                                            {formData.step1.moduleNames.map(name => (
                                                <span key={name} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Menus Section */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        <button
                            onClick={() => toggleSection('menus')}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Menu Permissions ({formData.step2.menuIds.length})</span>
                            {expandedSections.menus ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <AnimatePresence>
                            {expandedSections.menus && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {formData.step2.menuIds.length} menu{formData.step2.menuIds.length !== 1 ? 's' : ''} will be accessible
                                        </p>
                                        {formData.step2.menuIds.length > 0 && (
                                            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                <div className="bg-emerald-500 dark:bg-emerald-600 h-2 rounded-full" style={{ width: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={onBack}
                            disabled={isLoading}
                            className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowDetails(true)}
                            disabled={isLoading}
                            className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <FileText className="w-4 h-4" /> Export Report
                        </Button>
                    </div>
                    <Button
                        onClick={() => setShowConfirmation(true)}
                        disabled={isLoading}
                        className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl px-8 py-2.5 shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Create Account
                    </Button>
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={showConfirmation}
                onConfirm={handleConfirm}
                onCancel={() => setShowConfirmation(false)}
                employeeName={employee.empFullName || ''}
                permissionCount={totalPermissions}
                isLoading={isLoading}
            />

            <PermissionDetailsModal
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
                formData={formData}
            />

            <style>{`
                .bg-grid-slate-100 {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                    background-repeat: repeat;
                    background-size: 32px 32px;
                }
                .dark .bg-grid-slate-100 {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
            `}</style>
        </div>
    );
}