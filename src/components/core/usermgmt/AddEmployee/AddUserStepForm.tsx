import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { User, Printer, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BasicInfoStep } from '../../../hr/employee/AddEmployee/steps/BasicInfoStep';
import { BasicInfoReviewStep } from './InfoReviewStep';
import { AddEmployeeStepHeader } from './AddUserEmployeeHeader';
import { usermgmtService } from '../../../../services/core/usermgtservice';
import { useEmpAddStore } from '../../../../stores/hr/empAdd.store';
import type { Step1Dto, EmpAddPrintDto } from '../../../../types/hr/employee/empAddDto';
import type { UUID } from 'crypto';

const steps = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Print', icon: Printer },
];

interface AddUserStepFormProps {
  onBackToUsers: () => void;
  onUserAdded: () => void;
}

export const AddUserStepForm: React.FC<AddUserStepFormProps> = ({
  onBackToUsers,
  onUserAdded,
}) => {
  const { adminCurrentStep, setAdminEmployeeId, setAdminStep, resetAdmin } = useEmpAddStore();

  const [currentStep, setCurrentStep] = useState(adminCurrentStep);
  const [basicInfoData, setBasicInfoData] = useState<Partial<Step1Dto & { branchId: UUID; jobGradeStepId: UUID }>>({});
  const [step2Data, setStep2Data] = useState<EmpAddPrintDto | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formContainerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setAdminStep(step);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (formContainerRef.current) formContainerRef.current.scrollTop = 0;
    if (stepContentRef.current) stepContentRef.current.scrollTop = 0;
  };

  useEffect(() => { scrollToTop(); }, [currentStep]);

  const handleBasicInfoComplete = async (data: Step1Dto & { branchId: UUID }) => {
    setLoading(true);
    setError(null);
    try {
      setBasicInfoData(data);
      if (data.File) {
        const reader = new FileReader();
        reader.onloadend = () => setPhotoData(reader.result as string);
        reader.readAsDataURL(data.File);
      }
      const result = await usermgmtService.addEmployeeStep1(data);
      setAdminEmployeeId(result.id);
      const step2Response = await usermgmtService.getEmployeeStep2Data(result.id);
      setStep2Data(step2Response);
      goToStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    setLoading(true);
    setError(null);
    try {
      resetAdmin();
      onUserAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to complete employee creation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const el = document.getElementById('basic-info-section');
      if (!el) return;
      const clone = el.cloneNode(true) as HTMLElement;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
        .map((n) => n.outerHTML).join('\n');
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Employee Basic Information</title>${styles}</head><body><div>${clone.outerHTML}</div></body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    }, 50);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={basicInfoData}
            onNext={handleBasicInfoComplete}
            onBack={onBackToUsers}
            loading={loading}
          />
        );
      case 2:
        return (
          <BasicInfoReviewStep
            step1Data={basicInfoData as Step1Dto & { branchId: UUID }}
            step2Data={step2Data}
            photo={photoData}
            onBack={() => { goToStep(1); setError(null); }}
            onConfirm={handleConfirmAndSave}
            onPrint={handlePrint}
            loading={loading}
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
          onStepClick={(step) => { if (step < currentStep) goToStep(step); }}
          title="Add New Employee"
        />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto pl-3 text-red-800 hover:text-red-900">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
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
