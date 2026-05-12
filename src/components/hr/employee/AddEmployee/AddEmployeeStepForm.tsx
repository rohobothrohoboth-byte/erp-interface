import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { User, Shield, CheckCircle } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { GuarantorStep } from './steps/GurantorStep';
import { ReviewStep } from './steps/ReviewStep';
import { AddEmployeeStepHeader } from './AddEmployeeStepHeader';
import { empApi } from '../../../../services/hr/employee/emp.api';
import type { Step1Dto, Step2Dto, EmpAddRes, UUID } from '../../../../types/hr/employee/empAddDto';
import { useEmpAddStore } from '../../../../stores/hr/empAdd.store';

const steps = [
  { id: 1, title: 'Basic Info', icon: User },
  // { id: 2, title: 'Biographical', icon: FileText },
  // { id: 3, title: 'Emergency Contact', icon: Users },
  { id: 2, title: 'Guarantor', icon: Shield },
  { id: 3, title: 'Print', icon: CheckCircle },
];

interface AddEmployeeStepFormProps {
  onBackToEmployees: () => void;
  onEmployeeAdded: (result: any) => void;
}

export const AddEmployeeStepForm: React.FC<AddEmployeeStepFormProps> = ({
  onBackToEmployees,
  onEmployeeAdded,
}) => {
  const {
    hrEmployeeId,
    hrCurrentStep,
    setHrEmployeeId,
    setHrStep,
    resetHr,
  } = useEmpAddStore();

  const [currentStep, setCurrentStep] = useState(hrCurrentStep);
  const [formData, setFormData] = useState({ step1: {}, step4: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  // Keep store in sync with local step
  const goToStep = (step: number) => {
    setCurrentStep(step);
    setHrStep(step);
  };

  // Scroll to top when step changes
  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    
    if (document.body) {
      document.body.scrollTop = 0;
    }
    
    if (formContainerRef.current) {
      formContainerRef.current.scrollTop = 0;
    }
    
    if (stepContentRef.current) {
      stepContentRef.current.scrollTop = 0;
    }
  };

  // Clear all temporary data
  const clearTemporaryData = () => {
    resetHr();
    setFormData({ step1: {}, step4: {} });
    setCurrentStep(1);
  };

  const handleStep1Submit = async (step1Data: Step1Dto & { branchId: UUID }) => {
    setLoading(true);
    setError(null);
    try {
      const result: EmpAddRes = await empApi.addStep1(step1Data);
      setHrEmployeeId(result.id);
      setFormData((prev) => ({ ...prev, step1: step1Data }));
      scrollToTop();
      goToStep(2);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2 submission with service call
  // const handleStep2Submit = async (step2Data: Step2Dto) => { ... };

  // Handle Step 3 submission with service call
  // const handleStep3Submit = async (step3Data: Step3Dto) => { ... };

  const handleStep4Submit = async (step4Data: Step2Dto) => {
    if (!hrEmployeeId) {
      setError('Employee ID is missing. Please complete Step 1 first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result: EmpAddRes = await empApi.addStep4({ ...step4Data, employeeId: hrEmployeeId });
      console.log('Guarantor added successfully:', result);
      setFormData((prev) => ({ ...prev, step4: step4Data }));
      scrollToTop();
      goToStep(3);
    } catch (error) {
      setError('Failed to save guarantor information. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // const handleStep5Submit = async () => { ... };

  const handleBack = () => {
    scrollToTop();
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    } else {
      clearTemporaryData();
      onBackToEmployees();
    }
  };

  

  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const renderStep = () => {
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
      // case 2: BiographicalStep — commented out
      // case 3: EmergencyContactStep — commented out
      case 2:
        return (
          <GuarantorStep
            data={formData.step4}
            onNext={handleStep4Submit}
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
            onClearTempData={() => { clearTemporaryData(); onEmployeeAdded({ id: hrEmployeeId }); }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" ref={formContainerRef}>
      <div className="mx-auto">
        <AddEmployeeStepHeader
          steps={steps}
          currentStep={currentStep}
          title="Add New Employee"
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-800 hover:text-red-900"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div 
          ref={stepContentRef}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 px-8 py-4"
        >
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};