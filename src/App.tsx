// src/App.tsx - Fixed with Error Boundaries and Suspense Exception handling

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/queryClient";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useEffect, lazy, Suspense, useState, useRef, Component } from "react";
import { Toaster } from 'react-hot-toast';
import api from "@/shared/services/api";

// Contexts
import { LanguageProvider } from '@/shared/i18n/index';
import { NotificationProvider } from '@/shared/contexts/NotificationContext';

// Components
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import { PageLoader } from '@/shared/components/ui/page-loader';

// ✅ Error Boundary Class - FIXED to ignore Suspense exceptions
class LazyErrorBoundary extends Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        // ✅ Ignore Suspense Exceptions - these are internal React errors
        if (error?.message?.includes('Suspense Exception') ||
            error?.message?.includes('This is not a real error')) {
            console.log('⏳ Suspense Exception caught - letting React handle it');
            return { hasError: false, error: null };
        }

        console.error('❌ Lazy loading error:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // ✅ Don't log Suspense Exceptions
        if (error?.message?.includes('Suspense Exception') ||
            error?.message?.includes('This is not a real error')) {
            return;
        }
        console.error('❌ Lazy loading error details:', {
            error,
            componentStack: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center border border-red-200 dark:border-red-800 shadow-xl">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Failed to Load Module</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {this.state.error?.message || 'An error occurred while loading this component.'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

// ✅ Safe lazy wrapper with error handling - FIXED
const safeLazy = (importFn: () => Promise<any>) => {
    return lazy(() =>
        importFn().catch((error) => {
            // ✅ Check if it's a Suspense Exception - don't handle it
            if (error?.message?.includes('Suspense Exception') ||
                error?.message?.includes('This is not a real error')) {
                // ✅ Re-throw the Suspense Exception to let React handle it
                throw error;
            }

            console.error('❌ Lazy import failed:', error);
            // Return a fallback component for real errors
            return {
                default: () => (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center border border-red-200 dark:border-red-800 shadow-xl">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Component Load Error</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {error?.message || 'Failed to load component. Please try again.'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                ),
            };
        })
    );
};

// ✅ Lazy imports with error handling
const Layout = safeLazy(() => import("@/shared/layout/layout"));
const SignInPage = safeLazy(() => import("@/modules/auth/pages/SignInPage"));
const Modules = safeLazy(() => import("@/shared/pages/Modules"));
const ProfilePage = safeLazy(() => import("@/modules/profile/pages/ProfilePage"));
const NotFoundPage = safeLazy(() => import("@/shared/pages/NotFoundPage"));
const TaskManagement = safeLazy(() => import('@/modules/task/pages/TaskManagement'));
const EditTaskPage = safeLazy(() => import('@/modules/task/pages/EditTaskPage'));
const TaskCalendar = safeLazy(() => import('@/modules/dashboard/components/TaskCalendar'));
const Setup = safeLazy(() => import("@/modules/auth/pages/Setup"));
const VacanciesPage = safeLazy(() => import("@/modules/vacancy/pages/VacanciesPage"));
import PublicFileView from '@/shared/pages/public/PublicFileView';

// ✅ Direct imports (not lazy)
import { financeRoutes, financeSidebarRoutes } from './routes/finance.routes';
import { allRoutes } from './routes';

// Module Dashboard Components
import Dashboard from "@/modules/hr/pages/ModuleDashboard";
import CoreDashboard from "@/modules/core/pages/ModuleDashboard";
import FinanceDashboard from "@/modules/finance/pages/ModuleDashboard";
import CRMDashboard from "@/modules/crm/pages/ModuleDashboard";
import InventoryDashboard from "@/modules/inventory/pages/ModuleDashboard";
import Procurement from "@/modules/procurement/pages/ModuleDashboard";
import FileDashboard from "@/modules/file/pages/ModuleDashboard";
import PlanDevDashboard from "@/modules/plandev/pages/ModuleDashboard";
import ProjectManagementDashboard from "@/modules/project/pages/ModuleDashboard";

function App() {
    const init = useAuthStore((s) => s.init);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);

    const initCalledRef = useRef(false);
    const [isSetupRequired, setIsSetupRequired] = useState<boolean | null>(null);
    const [isCheckingSetup, setIsCheckingSetup] = useState(true);
    const setupCacheKey = 'setup_status';
    const setupCacheExpiry = 300000; // 5 minutes

    // ✅ Check if system needs setup
    useEffect(() => {
        const checkSetup = async () => {
            try {
                const cached = localStorage.getItem(setupCacheKey);
                if (cached) {
                    const { status, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < setupCacheExpiry) {
                        setIsSetupRequired(!status?.isSetupComplete);
                        setIsCheckingSetup(false);
                        return;
                    }
                }

                const response = await api.get('/auth/v1/Setup/status', {
                    timeout: 5000
                });
                const status = response.data?.data;

                localStorage.setItem(setupCacheKey, JSON.stringify({
                    status,
                    timestamp: Date.now()
                }));

                setIsSetupRequired(!status?.isSetupComplete);
            } catch (error) {
                const cached = localStorage.getItem(setupCacheKey);
                if (cached) {
                    const { status } = JSON.parse(cached);
                    setIsSetupRequired(!status?.isSetupComplete);
                } else {
                    setIsSetupRequired(true);
                }
            } finally {
                setIsCheckingSetup(false);
            }
        };
        checkSetup();
    }, []);

    useEffect(() => {
        if (initCalledRef.current) return;
        initCalledRef.current = true;
        init();
    }, []);

    // ✅ Show loading while checking setup or auth
    if (isCheckingSetup || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
                    <p className="text-slate-500 dark:text-slate-400">
                        {isCheckingSetup ? 'Checking system setup...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    // ✅ If setup is required, show Setup page
    if (isSetupRequired) {
        return (
            <LanguageProvider>
                <QueryClientProvider client={queryClient}>
                    <NotificationProvider>
                        <BrowserRouter>
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route path="*" element={<Setup />} />
                                    <Route path="/setup" element={<Setup />} />
                                </Routes>
                            </Suspense>
                            <Toaster position="top-right" />
                        </BrowserRouter>
                    </NotificationProvider>
                </QueryClientProvider>
            </LanguageProvider>
        );
    }

    return (
        <LanguageProvider>
            <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                    <BrowserRouter>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<Navigate to={isAuthenticated ? "/modules" : "/login"} replace />} />
                                <Route path="/login" element={<SignInPage />} />

                                <Route path="/public/file/:token" element={<PublicFileView />} />

                                <Route path="/public/share/:token" element={<PublicFileView />} />
                                <Route path="/share/:token" element={<PublicFileView />} />
                                <Route path="/file/share/:token" element={<PublicFileView />} />
                                {/* ✅ Protected Routes with Error Boundaries */}
                                <Route element={<ProtectedRoute />}>
                                    <Route element={<Layout />}>
                                        {/* Module Dashboards */}
                                        <Route
                                            path="/hr"
                                            element={
                                                <LazyErrorBoundary>
                                                    <Dashboard />
                                                </LazyErrorBoundary>
                                            }
                                        />
                                        <Route
                                            path="/core"
                                            element={
                                                <LazyErrorBoundary>
                                                    <CoreDashboard />
                                                </LazyErrorBoundary>
                                            }
                                        />
                                        <Route
                                            path="/finance"
                                            element={
                                                <LazyErrorBoundary>
                                                    <FinanceDashboard />
                                                </LazyErrorBoundary>
                                            }
                                        />
                                        <Route
                                            path="/crm"
                                            element={
                                                <LazyErrorBoundary>
                                                    <CRMDashboard />
                                                </LazyErrorBoundary>
                                            }
                                        />
                                        <Route
                                            path="/inventory"
                                            element={
                                                <LazyErrorBoundary>
                                                    <InventoryDashboard />
                                                </LazyErrorBoundary>
                                            }
                                        />
                                        <Route
                                            path="/procurement"
                                            element={
                                                <LazyErrorBoundary>
                                                    <Procurement />
                                                </LazyErrorBoundary>
                                            }
                                        />
                                        <Route
                                            path="/file"
                                            element={
                                                <LazyErrorBoundary>
                                                    <FileDashboard />
                                                </LazyErrorBoundary>
                                            }
                                        />
                                        <Route
                                            path="/plandev"
                                            element={
                                                <LazyErrorBoundary>
                                                    <PlanDevDashboard />
                                                </LazyErrorBoundary>
                                            }
                                        />
                                        <Route
                                            path="/project-management"
                                            element={
                                                <LazyErrorBoundary>
                                                    <ProjectManagementDashboard />
                                                </LazyErrorBoundary>
                                            }
                                        />

                                        {/* ✅ FINANCE ROUTES */}
                                        {financeRoutes.map((route) => {
                                            if (route.index) return null;
                                            return (
                                                <Route
                                                    key={route.path}
                                                    path={route.path}
                                                    element={
                                                        <LazyErrorBoundary>
                                                            {route.element}
                                                        </LazyErrorBoundary>
                                                    }
                                                />
                                            );
                                        })}

                                        {/* Other Routes */}
                                        {allRoutes.map((route) => {
                                            const moduleNames = ['hr', 'core', 'finance', 'crm', 'inventory', 'procurement', 'file', 'plandev', 'project-management'];
                                            if (moduleNames.includes(route.path) && route.index) return null;
                                            if (moduleNames.some(name => route.path === name)) return null;
                                            if (financeRoutes.some(fr => fr.path === route.path)) return null;
                                            return (
                                                <Route
                                                    key={route.path}
                                                    path={route.path}
                                                    element={
                                                        <LazyErrorBoundary>
                                                            {route.element}
                                                        </LazyErrorBoundary>
                                                    }
                                                />
                                            );
                                        })}
                                    </Route>

                                    {/* Standalone Routes */}
                                    <Route path="/modules" element={<Modules />} />
                                    <Route path="/TaskCalendar" element={<TaskCalendar />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
                                    <Route path="/page/task" element={<TaskManagement />} />
                                    <Route path="/vacancies" element={<VacanciesPage />} />
                                    <Route path="/vacancies/:id" element={<VacanciesPage />} />



                                </Route>

                                {/* 404 Route */}
                                <Route path="/404" element={<NotFoundPage />} />
                                <Route path="*" element={<Navigate to={isAuthenticated ? "/404" : "/login"} replace />} />
                            </Routes>
                        </Suspense>
                    </BrowserRouter>

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: { background: '#363636', color: '#fff', borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
                            success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' }, style: { background: '#059669' } },
                            error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' }, style: { background: '#dc2626' } },
                            loading: { style: { background: '#3b82f6' } },
                        }}
                    />
                </NotificationProvider>
            </QueryClientProvider>
        </LanguageProvider>
    );
}

export default App;