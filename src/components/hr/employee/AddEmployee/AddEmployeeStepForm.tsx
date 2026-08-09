import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { GuarantorStep } from './steps/GurantorStep';
import { ReviewStep } from './steps/ReviewStep';
import { AddEmployeeStepHeader } from './AddEmployeeStepHeader';
import { empApi } from '../../../../services/hr/employee/emp.api';
import type { Step1Dto, Step2Dto, EmpAddRes, UUID } from '../../../../types/hr/employee/empAddDto';
import { useEmpAddStore } from '../../../../stores/hr/empAdd.store';
import { useLanguage } from '../../../../i18n/LanguageContext';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '../../../../services/hr/dashboard/dashboard.key';
// ============================================================
// TYPES
// ============================================================

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface AddEmployeeStepFormProps {
  onBackToEmployees: () => void;
  onEmployeeAdded: (result: any) => void;
}

// ============================================================
// STEP CONFIGURATION
// ============================================================

const getSteps = (t: any): Step[] => [
  {
    id: 1,
    title: t.basicInformation || 'Basic Information',
    icon: User,
    description: t.personalEmploymentDetails || 'Personal & employment details'
  },
  {
    id: 2,
    title: t.guarantorDetails || 'Guarantor Details',
    icon: Shield,
    description: t.guarantorInformation || 'Guarantor information'
  },
  {
    id: 3,
    title: t.reviewSubmit || 'Review & Submit',
    icon: CheckCircle,
    description: t.verifyAndConfirm || 'Verify and confirm'
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export const AddEmployeeStepForm: React.FC<AddEmployeeStepFormProps> = ({
                                                                          onBackToEmployees,
                                                                          onEmployeeAdded,
                                                                        }) => {
  const { t } = useLanguage();
  const steps = getSteps(t);

  // Store state
  const {
    hrEmployeeId,
    hrCurrentStep,
    setHrEmployeeId,
    setHrStep,
    resetHr,
  } = useEmpAddStore();

  // Local state
  const [currentStep, setCurrentStep] = useState(hrCurrentStep || 1);
  const [formData, setFormData] = useState<{ step1: any; step4: any }>({
    step1: {},
    step4: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Refs
  const formContainerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // NAVIGATION
  // ============================================================

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setHrStep(step);
    setError(null);
    setErrorSummary([]);
    scrollToTop();
  }, [setHrStep]);

  const scrollToTop = useCallback(() => {
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Also scroll the container if it exists
    if (formContainerRef.current) {
      formContainerRef.current.scrollTop = 0;
    }
    if (stepContentRef.current) {
      stepContentRef.current.scrollTop = 0;
    }
  }, []);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    } else {
      resetHr();
      onBackToEmployees();
    }
  }, [currentStep, goToStep, resetHr, onBackToEmployees]);

  // ============================================================
  // CLEAR DATA
  // ============================================================

  const clearTemporaryData = useCallback(() => {
    resetHr();
    setFormData({ step1: {}, step4: {} });
    setCurrentStep(1);
    setError(null);
    setErrorSummary([]);
  }, [resetHr]);

  // ============================================================
  // STEP 1: BASIC INFO
  // ============================================================

  const handleStep1Submit = useCallback(async (step1Data: Step1Dto & { branchId: UUID }) => {
    setLoading(true);
    setError(null);
    setErrorSummary([]);

    try {
      const result: EmpAddRes = await empApi.addStep1(step1Data);

      setHrEmployeeId(result.id);
      setFormData((prev) => ({ ...prev, step1: step1Data }));

      toast.success(t.basicInfoSaved || 'Basic information saved successfully!');
      goToStep(2);
    } catch (error: any) {
      const errorMessages = extractErrorMessages(error);
      setErrorSummary(errorMessages);
      setError(errorMessages.length > 0 ? errorMessages[0] : t.failedToCreateEmployee || 'Failed to create employee.');
      toast.error(errorMessages.length > 0 ? errorMessages[0] : t.failedToCreateEmployee || 'Failed to create employee.');
    } finally {
      setLoading(false);
    }
  }, [setHrEmployeeId, goToStep, t]);

  // ============================================================
  // STEP 2: GUARANTOR
  // ============================================================

  const handleStep2Submit = useCallback(async (step4Data: Step2Dto) => {
    if (!hrEmployeeId) {
      const msg = t.missingEmployeeId || 'Employee ID is missing. Please complete Step 1 first.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorSummary([]);

    try {
      const result: EmpAddRes = await empApi.addStep4({
        ...step4Data,
        employeeId: hrEmployeeId
      });

      setFormData((prev) => ({ ...prev, step4: step4Data }));

      toast.success(t.guarantorInfoSaved || 'Guarantor information saved successfully!');
      goToStep(3);
    } catch (error: any) {
      const errorMessages = extractErrorMessages(error);
      setErrorSummary(errorMessages);
      setError(errorMessages.length > 0 ? errorMessages[0] : t.failedToSaveGuarantor || 'Failed to save guarantor information.');
      toast.error(errorMessages.length > 0 ? errorMessages[0] : t.failedToSaveGuarantor || 'Failed to save guarantor information.');
    } finally {
      setLoading(false);
    }
  }, [hrEmployeeId, goToStep, t]);

  // ============================================================
  // STEP 3: REVIEW & SUBMIT
  // ============================================================

  const handleEmployeeAdded = async (result: any) => {
    // ✅ Invalidate dashboard cache
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.pending() });

    // ✅ Invalidate employee list cache
    await queryClient.invalidateQueries({ queryKey: ['employees'] });

    // Show success message
    toast.success('Employee added successfully!');

    // Navigate back
    navigate('/hr/employees/record');
  };
  // ============================================================
  // HELPER: Extract Error Messages
  // ============================================================

  const extractErrorMessages = (error: any): string[] => {
    const messages: string[] = [];

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;

      if (typeof errors === 'object') {
        Object.entries(errors).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            value.forEach((msg: string) => {
              messages.push(`${field}: ${msg}`);
            });
          } else if (typeof value === 'string') {
            messages.push(`${field}: ${value}`);
          }
        });
      }
    } else if (error.response?.data?.message) {
      messages.push(error.response.data.message);
    } else if (error.message) {
      messages.push(error.message);
    }

    return messages.length > 0 ? messages : ['An unexpected error occurred'];
  };

  // ============================================================
  // EFFECT: Sync store with local step
  // ============================================================

  useEffect(() => {
    if (hrCurrentStep !== currentStep) {
      setCurrentStep(hrCurrentStep);
    }
  }, [hrCurrentStep]);

  // ============================================================
  // EFFECT: Scroll to top on step change
  // ============================================================

  useEffect(() => {
    scrollToTop();
  }, [currentStep, scrollToTop]);

  // ============================================================
  // RENDER STEP
  // ============================================================

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
            <BasicInfoStep
                data={formData.step1}
                onNext={handleStep1Submit}
                onBack={handleBack}
                loading={loading}
            />
        );
      case 2:
        return (
            <GuarantorStep
                data={formData.step4}
                onNext={handleStep2Submit}
                onBack={handleBack}
                employeeId={hrEmployeeId as UUID}
                loading={loading}
            />
        );
      case 3:
        return (
            <ReviewStep
                employeeId={hrEmployeeId as any}
                onBack={handleBack}
                loading={loading}
                onClearTempData={() => {
                  clearTemporaryData();
                  onEmployeeAdded({ id: hrEmployeeId });
                }}
            />
        );
      default:
        return null;
    }
  }, [currentStep, formData, handleStep1Submit, handleStep2Submit, handleBack, loading, hrEmployeeId, clearTemporaryData, onEmployeeAdded]);

  // ============================================================
  // GET CURRENT STEP INFO
  // ============================================================

  const currentStepInfo = steps[currentStep - 1];

  // ============================================================
  // RENDER
  // ============================================================

  return (
      <div className="min-h-screen" ref={formContainerRef}>
        {/* Success Message Toast */}
        <AnimatePresence>
          {successMessage && (
              <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-20 right-4 z-50"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-6xl">
          {/* Header Section */}
          <div className="mb-8">
            <AddEmployeeStepHeader
                steps={steps}
                currentStep={currentStep}
                title={t.addNewEmployee || "Add New Employee"}
                subtitle={t.completeStepsToAddEmployee || "Complete the following steps to add a new employee"}
                onStepClick={goToStep}
            />
          </div>

          {/* Current Step Indicator */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  {currentStepInfo?.icon && (
                      <currentStepInfo.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentStepInfo?.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {currentStepInfo?.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {t.step || 'Step'} {currentStep} {t.of || 'of'} {steps.length}
                                    </span>
                    <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Error Summary Display */}
          <AnimatePresence>
            {(error || errorSummary.length > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                >
                  <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-200 dark:bg-red-900/50 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                            {t.validationErrors || 'Validation Errors'}
                          </h3>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errorSummary.length > 0
                                ? `${errorSummary.length} error(s) found`
                                : t.pleaseFixErrors || 'Please fix the errors below'}
                          </p>
                        </div>
                      </div>
                      <button
                          onClick={() => {
                            setError(null);
                            setErrorSummary([]);
                          }}
                          className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4 space-y-2 max-h-40 overflow-y-auto">
                      {errorSummary.length > 0 ? (
                          errorSummary.map((err, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{err}</span>
                              </div>
                          ))
                      ) : (
                          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Main Form Container */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div
                ref={stepContentRef}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden"
            >
              {/* Top accent gradient line */}
              <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

              {/* Form Content */}
              <div className="p-6 lg:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Progress Footer */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex-wrap justify-center">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>{t.autoSaveEnabled || 'Auto-save enabled'}</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>{t.secureConnection || 'Secure connection'}</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                <span>{t.dataEncrypted || 'Data encrypted'}</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t.progress || 'Progress'}: {Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default AddEmployeeStepForm;