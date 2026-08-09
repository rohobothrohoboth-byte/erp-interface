import { motion, useReducedMotion } from "framer-motion";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  User,
  Building2,
  Briefcase,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import type { EmpSearchRes } from "../../../types/core/EmpSearchRes";

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

interface EmployeeListProps {
  employees: EmpSearchRes[];
  onAddAccount: () => void;
  onViewDetails?: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
                                                     employees,
                                                     onAddAccount,
                                                     onViewDetails,
                                                   }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const prefersReducedMotion = useReducedMotion();
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

  const getInitials = (name: string | undefined | null): string => {
    if (!name || name.trim() === "") return "??";
    try {
      return name
          .split(' ')
          .filter(word => word.length > 0)
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);
    } catch (error) {
      console.error('Error getting initials:', error);
      return "??";
    }
  };

  const getDisplayValue = (value: string | undefined | null, fallback: string = "N/A"): string => {
    return value && value.trim() !== "" ? value : fallback;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.3 },
    },
  };

  const buttonVariants = {
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 },
  };

  // If no employees, show empty state
  if (!employees || employees.length === 0) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No employees found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">No employees are available for account creation.</p>
          </div>
        </div>
    );
  }

  const employee = employees[0];

  const {
    code = "EMP0012345",
    empFullName = "John Doe",
    empFullNameAm = "",
    gender = "male",
    dept = "Human Resources",
    position = "HR Manager",
    email,
    phone,
    employmentDate,
  } = employee;

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 dark:from-emerald-400/5 dark:to-teal-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 dark:from-blue-400/5 dark:to-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Employee Selection</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Create User Account
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select an employee to create a system account
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Current Time */}
              <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Activity size={14} />
                <span className="font-mono">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
            </div>
          </div>

          <motion.div
              className="max-w-2xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
          >
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden transition-colors duration-200">
              {/* Top Accent Line */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column - Photo with Code */}
                  <motion.div variants={itemVariants} className="lg:w-2/5 space-y-4">
                    {/* Photo Container */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-30" />
                      <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg">
                        {/* Image attempt */}
                        <img
                            src={`data:image/png;base64,${employee.photo}`}
                            alt={getDisplayValue(empFullName, "Employee")}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                        />
                        {/* Fallback - Show initials */}
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                          <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                            {getInitials(empFullName)}
                          </div>
                        </div>
                      </div>

                      {/* Code Display */}
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          {getDisplayValue(code)}
                        </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Column - Employee Details */}
                  <motion.div variants={itemVariants} className="lg:w-3/5 space-y-5">
                    {/* Name Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                          {getDisplayValue(empFullName)}
                        </h2>
                      </div>
                      {empFullNameAm && empFullNameAm.trim() !== "" && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-8">
                            {empFullNameAm}
                          </p>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DetailItem
                          icon={<Building2 className="w-4 h-4" />}
                          label="Department"
                          value={getDisplayValue(dept)}
                      />
                      <DetailItem
                          icon={<Briefcase className="w-4 h-4" />}
                          label="Position"
                          value={getDisplayValue(position)}
                      />
                      <DetailItem
                          icon={<Users className="w-4 h-4" />}
                          label="Gender"
                          value={getDisplayValue(gender).toLowerCase()}
                      />
                      {email && (
                          <DetailItem
                              icon={<Mail className="w-4 h-4" />}
                              label="Email"
                              value={email}
                          />
                      )}
                      {phone && (
                          <DetailItem
                              icon={<Phone className="w-4 h-4" />}
                              label="Phone"
                              value={phone}
                          />
                      )}
                      {employmentDate && (
                          <DetailItem
                              icon={<Calendar className="w-4 h-4" />}
                              label="Employment Date"
                              value={new Date(employmentDate).toLocaleDateString()}
                          />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-3">
                      <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={onAddAccount}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                      >
                        <Sparkles className="w-4 h-4" />
                        Create Account for {getDisplayValue(empFullName).split(' ')[0]}
                      </motion.button>

                      {onViewDetails && (
                          <button
                              onClick={onViewDetails}
                              className="w-full text-center text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            View full employee details →
                          </button>
                      )}
                    </div>

                    {/* Info Note */}
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-start gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 mt-0.5" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Creating an account will give this employee access to the ERP system based on assigned permissions.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Ready for account creation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>Secure setup</span>
                  </div>
                </div>
              </div>
            </Card>
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
};

// Detail Item Component
interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
      <div className="text-slate-400 dark:text-slate-500 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          {value}
        </p>
      </div>
    </div>
);

export default EmployeeList;