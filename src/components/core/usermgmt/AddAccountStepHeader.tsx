import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { ArrowLeft, CheckCircle, Sun, Moon, Activity } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
  description?: string;
}

interface AddAccountStepHeaderProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  onBack?: () => void;
  title?: string;
  backButtonText?: string;
  showThemeToggle?: boolean;
}

// Dark mode hook
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  React.useEffect(() => {
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

export const AddAccountStepHeader: React.FC<AddAccountStepHeaderProps> = ({
                                                                            steps,
                                                                            currentStep,
                                                                            onStepClick,
                                                                            onBack,
                                                                            title = 'Add Account',
                                                                            backButtonText = 'Back to Accounts',
                                                                            showThemeToggle = true,
                                                                          }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const prefersReducedMotion = useReducedMotion();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update current time
  React.useEffect(() => {
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

  // Animation variants
  const buttonVariants = {
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.3 : 0.5, staggerChildren: 0.1 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  return (
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 mb-8"
      >
        {/* Modern Header */}
        <div className="flex items-center justify-between">
          {/* Back Button */}
          {onBack && (
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl border-slate-200 dark:border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{backButtonText}</span>
                </Button>
              </motion.div>
          )}

          {/* Title */}
          <div className="text-center flex-1">
            <motion.h1
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight"
            >
              {title}
            </motion.h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete the steps to set up the account
            </p>
          </div>

          {/* Right Section - Time & Dark Mode */}
          <div className="w-40 flex items-center justify-end gap-2">
            {/* Current Time */}
            <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <Activity size={14} />
              <span className="font-mono">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
            </div>

            {/* Dark Mode Toggle */}
            {showThemeToggle && (
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={toggleDarkMode}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>
            )}
          </div>
        </div>

        {/* Sleek Progress Steps */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 px-6 py-6 transition-all duration-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const stepNumber = step.id;
              const isCompleted = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;
              const isUpcoming = currentStep < stepNumber;
              const isClickable = step.id < currentStep;

              // Color based on step completion status
              const getStepColor = () => {
                if (isCompleted) return 'from-emerald-500 to-teal-600';
                if (isCurrent) return 'from-blue-500 to-indigo-600';
                return 'from-slate-500 to-gray-600';
              };

              return (
                  <React.Fragment key={step.id}>
                    <motion.div
                        variants={stepVariants}
                        className="flex flex-col items-center flex-1 relative group"
                    >
                      {/* Step Container with Progress */}
                      <motion.div
                          className="relative"
                          whileHover={isClickable && !prefersReducedMotion ? { scale: 1.05 } : {}}
                          whileTap={isClickable && !prefersReducedMotion ? { scale: 0.95 } : {}}
                      >
                        {/* Progress Ring */}
                        <div className="absolute inset-0 transform -rotate-90">
                          <svg className="w-16 h-16" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-slate-200 dark:text-slate-700"
                            />
                            <motion.path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={isCompleted ? "#10B981" : isCurrent ? "#3B82F6" : "transparent"}
                                strokeWidth="3"
                                strokeDasharray="100"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: isCompleted ? 0 : isCurrent ? 25 : 100 }}
                                transition={{ duration: prefersReducedMotion ? 0.4 : 0.6 }}
                                className="transition-all duration-500 ease-out"
                            />
                          </svg>
                        </div>

                        {/* Step Circle */}
                        <motion.button
                            type="button"
                            onClick={() => isClickable && onStepClick(step.id)}
                            className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                                isCompleted
                                    ? `bg-gradient-to-br ${getStepColor()} border-transparent text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 cursor-pointer hover:shadow-xl`
                                    : isCurrent
                                        ? 'border-blue-500 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-100 dark:shadow-blue-900/30 cursor-default'
                                        : isUpcoming
                                            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-default'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer'
                            } ${
                                isCurrent ? 'scale-110 ring-4 ring-blue-100 dark:ring-blue-900/30' : 'scale-100'
                            } ${isClickable && !prefersReducedMotion ? 'hover:scale-105 hover:shadow-lg' : ''}`}
                            disabled={!isClickable}
                        >
                          {isCompleted ? (
                              <CheckCircle className="w-6 h-6" />
                          ) : (
                              <Icon className="w-5 h-5" />
                          )}

                          {/* Step Number Badge */}
                          <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                              className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 ${
                                  isCompleted
                                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-500'
                                      : isCurrent
                                          ? 'bg-blue-500 text-white border-white'
                                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                              }`}
                          >
                            {stepNumber}
                          </motion.div>
                        </motion.button>
                      </motion.div>

                      {/* Step Title */}
                      <div className="text-center mt-4">
                    <span
                        className={`block text-sm font-semibold transition-colors ${
                            isCompleted || isCurrent
                                ? 'text-slate-800 dark:text-slate-200'
                                : 'text-slate-500 dark:text-slate-400'
                        }`}
                    >
                      {step.title}
                    </span>
                        {step.description && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {step.description}
                            </p>
                        )}
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`text-xs mt-1 font-medium transition-colors inline-block px-2 py-0.5 rounded-full ${
                                isCompleted
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                    : isCurrent
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                        >
                          {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                        </motion.span>
                      </div>
                    </motion.div>

                    {/* Connector Line with Progress */}
                    {index < steps.length - 1 && (
                        <div className="flex-1 mx-4 relative">
                          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: isCompleted
                                      ? '100%'
                                      : isCurrent
                                          ? '50%'
                                          : '0%'
                                }}
                                transition={{ duration: prefersReducedMotion ? 0.4 : 0.6, delay: 0.2 }}
                                className={`h-full rounded-full ${
                                    isCompleted
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                        : isCurrent
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                            : 'bg-transparent'
                                }`}
                            />
                          </div>

                          {/* Animated Progress Dot */}
                          {(isCompleted || isCurrent) && !prefersReducedMotion && (
                              <motion.div
                                  className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg ${
                                      isCompleted
                                          ? 'bg-emerald-500 shadow-emerald-300 dark:shadow-emerald-900/50'
                                          : 'bg-blue-500 shadow-blue-300 dark:shadow-blue-900/50'
                                  }`}
                                  animate={isCompleted
                                      ? { scale: [1, 1.2, 1] }
                                      : { y: [-2, 2, -2] }
                                  }
                                  transition={{ repeat: Infinity, duration: isCompleted ? 1.5 : 0.8 }}
                              />
                          )}
                        </div>
                    )}
                  </React.Fragment>
              );
            })}
          </div>

          {/* Progress Summary */}
          <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-slate-600 dark:text-slate-400">Current Step</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-600 dark:text-slate-400">Pending</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Step {currentStep} of {steps.length}
                </div>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  />
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {Math.round((currentStep / steps.length) * 100)}%
              </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
  );
};

export default AddAccountStepHeader;