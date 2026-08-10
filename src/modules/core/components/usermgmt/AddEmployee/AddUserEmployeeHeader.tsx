import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle, User, Shield, CheckSquare } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface AddEmployeeStepHeaderProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  title?: string;
}

export const AddEmployeeStepHeader: React.FC<AddEmployeeStepHeaderProps> = ({
                                                                              steps,
                                                                              currentStep,
                                                                              onStepClick,
                                                                              title = 'Add Employee',
                                                                            }) => {
  const prefersReducedMotion = useReducedMotion();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.3,
        type: prefersReducedMotion ? "tween" : "spring",
        stiffness: prefersReducedMotion ? 0 : 200,
      },
    },
  };

  const lineVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: { duration: prefersReducedMotion ? 0.4 : 0.6, delay: 0.3 },
    },
  };

  return (
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 mb-8"
      >
        {/* Modern Header */}
        <div className="relative">
          <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4"
            >
              <User className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Complete the steps below to add a new employee to the system
            </p>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 px-6 py-6">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const stepNumber = step.id;
              const isCompleted = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;
              const isUpcoming = currentStep < stepNumber;
              const isClickable = step.id < currentStep;

              return (
                  <React.Fragment key={step.id}>
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center flex-1 relative max-w-xs"
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
                                stroke="#E5E7EB"
                                strokeWidth="3"
                                className="dark:stroke-slate-700"
                            />
                            <motion.path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={isCompleted ? "#10B981" : isCurrent ? "#EF4444" : "transparent"}
                                strokeWidth="3"
                                strokeDasharray="100"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: isCompleted ? 0 : isCurrent ? 25 : 100 }}
                                transition={{ duration: prefersReducedMotion ? 0.4 : 0.6, ease: "easeOut" }}
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
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 cursor-pointer hover:shadow-xl'
                                    : isCurrent
                                        ? 'border-amber-500 bg-white dark:bg-slate-800 text-amber-600 shadow-lg shadow-amber-100 dark:shadow-amber-900/30 cursor-default'
                                        : isUpcoming
                                            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-default'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer'
                            } ${
                                isCurrent ? 'scale-110 ring-4 ring-amber-100 dark:ring-amber-900/30' : 'scale-100'
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
                                          ? 'bg-amber-500 text-white border-white'
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
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`text-xs mt-1 font-medium transition-colors ${
                                isCompleted
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : isCurrent
                                        ? 'text-amber-500 dark:text-amber-400'
                                        : 'text-slate-400 dark:text-slate-500'
                            }`}
                        >
                          {isCompleted ? 'Complete' : isCurrent ? 'In Progress' : 'Pending'}
                        </motion.span>
                      </div>
                    </motion.div>

                    {/* Connector Line */}
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
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
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
                                          : 'bg-amber-500 shadow-amber-300 dark:shadow-amber-900/50'
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
              transition={{ delay: 0.4 }}
              className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-slate-600 dark:text-slate-400">Current Step</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-600 dark:text-slate-400">Pending</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step {currentStep} of {steps.length} • {Math.round((currentStep / steps.length) * 100)}% Complete
              </p>
              <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
  );
};

export default AddEmployeeStepHeader;