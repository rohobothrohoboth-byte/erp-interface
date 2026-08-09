import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Shield, Sparkles, Sun, Moon, Activity } from "lucide-react";
import { AddAccountWizard } from "../../../components/core/usermgmt/v2/AddAccountWizard";
import { usermgmtApi } from "../../../services/core/usermgmt/usermgmt.api";
import { Button } from "../../../components/ui/button";

// Dark mode hook
const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    return { isDarkMode, toggleDarkMode };
};

// Info Card Component
const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-1">
            <div className="text-slate-400 dark:text-slate-500">{icon}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
    </div>
);

export default function AddAccountPage() {
    const { empId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearTimeout(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    useEffect(() => {
        // First check if employee was passed via state (from navigation)
        const stateEmployee = (location.state as any)?.employee;

        if (stateEmployee) {
            console.log('Employee received from state:', stateEmployee);
            setEmployee(stateEmployee);
            setLoading(false);
            setError(null);
            return;
        }

        // If no employee in state but we have empId in URL, fetch it
        if (empId) {
            const fetchEmployee = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const list = await usermgmtApi.getAllEmployees();
                    const emp = list.find((e) => e.id === empId);

                    if (!emp) {
                        setError("Employee not found");
                    } else {
                        setEmployee(emp);
                    }
                } catch (err) {
                    console.error("Failed to fetch employee:", err);
                    setError("Failed to load employee data. Please try again.");
                } finally {
                    setLoading(false);
                }
            };

            fetchEmployee();
        } else {
            setError("No employee information provided. Please go back and select an employee.");
            setLoading(false);
        }
    }, [empId, location]);

    const handleBackToAccounts = useCallback(() => {
        navigate("/core/users");
    }, [navigate]);

    const handleAccountAdded = useCallback(() => {
        navigate("/core/users");
    }, [navigate]);

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full" />
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium mt-4">Loading employee data...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200 flex items-center justify-center p-4">
                <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-2xl p-8 text-center border border-red-200 dark:border-red-800 max-w-md">
                    <div className="w-16 h-16 bg-red-200 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Data</h3>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button
                        onClick={handleBackToAccounts}
                        className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!employee) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

            {/* Decorative Elements */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 dark:from-emerald-400/5 dark:to-teal-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 dark:from-blue-400/5 dark:to-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative container mx-auto px-4 py-6 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">User Management</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                            Create User Account
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Set up a new system account for employee: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{employee.empFullName || employee.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Current Time */}
                        <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Activity size={14} />
                            <span className="font-mono">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
                        </div>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Back Button */}
                        <Button
                            variant="outline"
                            onClick={handleBackToAccounts}
                            className="gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Users
                        </Button>
                    </div>
                </div>

                {/* Employee Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                >
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-6 py-4 border-b border-emerald-100 dark:border-emerald-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                    <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Employee Information</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Account will be created for this employee</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <InfoCard
                                    label="Employee Name"
                                    value={employee.empFullName || employee.name}
                                    icon={<UserPlus className="w-4 h-4" />}
                                />
                                <InfoCard
                                    label="Employee Code"
                                    value={employee.code || "N/A"}
                                    icon={<Shield className="w-4 h-4" />}
                                />
                                <InfoCard
                                    label="Department"
                                    value={employee.department || employee.dept || "N/A"}
                                    icon={<Activity className="w-4 h-4" />}
                                />
                                <InfoCard
                                    label="Position"
                                    value={employee.position || "N/A"}
                                    icon={<Sparkles className="w-4 h-4" />}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Account Creation Form - Using v2 Wizard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <AddAccountWizard
                        employee={employee}
                        onDone={handleAccountAdded}
                        onCancel={handleBackToAccounts}
                    />
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span>Secure Account Creation</span>
                        </div>
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Shield className="w-3 h-3" />
                            <span>Role-based Access</span>
                        </div>
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <UserPlus className="w-3 h-3" />
                            <span>Audit Log Enabled</span>
                        </div>
                    </div>
                </motion.div>
            </div>

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