import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageContext';

// ============================================================
// TYPES
// ============================================================

interface Step {
    id: number;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface AddEmployeeStepHeaderProps {
    steps: Step[];
    currentStep: number;
    title: string;
    subtitle?: string;
    onStepClick?: (step: number) => void;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const AddEmployeeStepHeader: React.FC<AddEmployeeStepHeaderProps> = ({
                                                                                steps,
                                                                                currentStep,
                                                                                title,
                                                                                subtitle,
                                                                                onStepClick,
                                                                            }) => {
    const { t } = useLanguage();
    const defaultSubtitle = t.completeStepsToAddEmployee || "Complete the following steps to add a new employee";

    // ============================================================
    // GET STEP STATUS
    // ============================================================

    const getStepStatus = (stepNumber: number) => {
        if (stepNumber < currentStep) return 'completed';
        if (stepNumber === currentStep) return 'current';
        return 'pending';
    };

    const getStepStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    circle: 'bg-emerald-500 text-white ring-0',
                    text: 'text-slate-700 dark:text-slate-300',
                    badge: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
                    badgeText: t.done || 'Done',
                    line: 'bg-emerald-500',
                };
            case 'current':
                return {
                    circle: 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30',
                    text: 'text-slate-700 dark:text-slate-300 font-semibold',
                    badge: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
                    badgeText: t.current || 'Current',
                    line: 'bg-blue-500 w-1/2',
                };
            default:
                return {
                    circle: 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 ring-0',
                    text: 'text-slate-400 dark:text-slate-500',
                    badge: 'bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500',
                    badgeText: t.pending || 'Pending',
                    line: 'w-0',
                };
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="space-y-6">
            {/* Title Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
            >
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {subtitle || defaultSubtitle}
                </p>
            </motion.div>

            {/* Progress Steps - Desktop */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="hidden md:flex items-center justify-between">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const status = getStepStatus(stepNumber);
                        const styles = getStepStyles(status);
                        const IconComponent = step.icon;
                        const isClickable = status === 'completed' || status === 'current';

                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    {/* Circle */}
                                    <button
                                        onClick={() => isClickable && onStepClick?.(stepNumber)}
                                        disabled={!isClickable}
                                        className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center transition-all
                                            ${styles.circle}
                                            ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                                        `}
                                        aria-label={`${step.title} - ${status}`}
                                    >
                                        {status === 'completed' ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <IconComponent className="w-5 h-5" />
                                        )}
                                    </button>

                                    {/* Label */}
                                    <span className={`text-xs font-medium mt-2 ${styles.text}`}>
                                        {step.title}
                                    </span>

                                    {/* Status Badge */}
                                    <span className={`text-[10px] mt-0.5 px-2 py-0.5 rounded-full ${styles.badge}`}>
                                        {styles.badgeText}
                                    </span>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 mx-3 h-0.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                status === 'completed' ? 'bg-emerald-500 w-full' :
                                                    status === 'current' ? 'bg-blue-500 w-1/2' : 'w-0'
                                            }`}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Progress Steps - Mobile */}
                <div className="md:hidden flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        ${currentStep > 1 ? 'bg-emerald-500' : 'bg-blue-600'}
                        text-white flex-shrink-0
                    `}>
                        {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t.step || 'Step'} {currentStep} {t.of || 'of'} {steps.length}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {steps[currentStep - 1].title}
                        </p>
                        <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-blue-500 rounded-full"
                            />
                        </div>
                    </div>

                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {Math.round((currentStep / steps.length) * 100)}%
                    </span>
                </div>

                {/* Progress Summary - Optional */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 hidden md:flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                            <span>{t.completed || 'Completed'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                            <span>{t.inProgress || 'In Progress'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-slate-600 rounded-full" />
                            <span>{t.pending || 'Pending'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            {t.step || 'Step'} {currentStep} {t.of || 'of'} {steps.length}
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{steps[currentStep - 1]?.title}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEmployeeStepHeader;