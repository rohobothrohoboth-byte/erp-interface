import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Shield, Stamp, PenTool, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BiographicalStep } from './steps/BiographicalStep';
import { GuarantorStep } from './steps/GuarantorStep';
import { StampStep } from './steps/StampStep';
import { SignatureStep } from './steps/SignatureStep';
import { EditEmployeeStepHeader } from './EditEmployeeStepHeader';
import { empApi } from '../../../../services/hr/employee/emp.api';
import { empModApi } from '../../../../services/hr/employee/empMod.api';
import { showToast } from '../../../../layout/layout';
import { Relation } from '../../../../types/enum';
import { useQueryClient } from '@tanstack/react-query';
import { empDetailKeys } from '../../../../services/hr/employee/empDetail/empDetail.queries';
import type { EmpModBasicDto, EmpModBioDto, EmpModGuarDto } from '../../../../types/hr/employee/empModDto';
import type { UUID } from 'crypto';

const steps = [
  { id: 1, title: 'Basic Info', icon: User, description: 'Personal and employment details', color: 'blue' },
  { id: 2, title: 'Biographical', icon: FileText, description: 'Personal background info', color: 'purple' },
  { id: 3, title: 'Guarantor', icon: Shield, description: 'Guarantor information', color: 'amber' },
  { id: 4, title: 'Stamp', icon: Stamp, description: 'Official stamp upload', color: 'emerald' },
  { id: 5, title: 'Signature', icon: PenTool, description: 'Digital signature upload', color: 'rose' },
];

interface EditEmployeeStepFormProps {
  employeeId: UUID;
  onBackToEmployees: () => void;
  onEmployeeUpdated: (result: any) => void;
}

export const EditEmployeeStepForm: React.FC<EditEmployeeStepFormProps> = ({
                                                                            employeeId,
                                                                            onBackToEmployees,
                                                                            onEmployeeUpdated,
                                                                          }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: {} as any,
    step2: {},
    step4: {},
    stamp: null as File | null,
    signature: null as File | null,
  });
  const [employeeHeaderData, setEmployeeHeaderData] = useState<any>(null);
  const [employeeNames, setEmployeeNames] = useState({ department: '', position: '', branch: '', jobGrade: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Invalidate all cache namespaces
  const invalidateAll = (section: 'basic' | 'bio' | 'guarantor' | 'photo') => {
    queryClient.invalidateQueries({ queryKey: empDetailKeys[section](employeeId) });
    queryClient.invalidateQueries({ queryKey: empDetailKeys.info(employeeId) });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  // Scroll to top when step changes
  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (formContainerRef.current) formContainerRef.current.scrollTop = 0;
    if (stepContentRef.current) stepContentRef.current.scrollTop = 0;
  };

  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Load employee data on mount
  useEffect(() => {
    const loadEmployeeData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [basic, bio, guar] = await Promise.all([
          empApi.getModBasic(employeeId),
          empApi.getModBio(employeeId),
          empApi.getModGuar(employeeId),
        ]);

        const mappedData = {
          step1: {
            id: basic.id ?? '',
            rowVersion: basic.rowVersion ?? '',
            isDeleted: false,
            firstName: basic.firstName ?? '',
            firstNameAm: basic.firstNameAm ?? '',
            middleName: basic.middleName ?? '',
            middleNameAm: basic.middleNameAm ?? '',
            lastName: basic.lastName ?? '',
            lastNameAm: basic.lastNameAm ?? '',
            nationality: basic.nationality ?? '',
            gender: basic.gender ?? '',
            employmentDate: basic.employmentDate ? basic.employmentDate.split('T')[0] : '',
            branchId: basic.branchId ?? '',
            jobGradeId: basic.jobGradeId ?? '',
            jgStepId: basic.jgStepId ?? '',
            positionId: basic.positionId ?? '',
            departmentId: basic.departmentId ?? '',
            employmentType: basic.employmentType ?? '',
            employmentNature: basic.employmentNature ?? '',
            workArrangement: basic.workArrangement ?? '',
            file: null,
          },
          step2: {
            id: bio.id ?? '',
            rowVersion: bio.rowVersion ?? '',
            isDeleted: false,
            employeeId: employeeId as UUID,
            hasData: true,
            birthDate: bio.birthDate ? bio.birthDate.split('T')[0] : '',
            birthLocation: bio.birthLocation ?? '',
            motherFullName: bio.motherFullName ?? '',
            maritalStatus: bio.maritalStatus ?? '',
            tin: bio.tin ?? '',
            bankAccountNo: bio.bankAccountNo ?? '',
            pensionNumber: bio.pensionNumber ?? '',
            addressType: bio.addressType ?? '',
            country: bio.country ?? '',
            region: bio.region ?? '',
            subcity: bio.subcity ?? '',
            zone: bio.zone ?? '',
            woreda: bio.woreda ?? '',
            kebele: bio.kebele ?? '',
            houseNo: bio.houseNo ?? '',
            telephone: bio.telephone ?? '',
            poBox: bio.poBox ?? '',
            fax: bio.fax ?? '',
            email: bio.email ?? '',
            website: bio.website ?? '',
          },
          step4: {
            id: guar.id ?? '',
            rowVersion: guar.rowVersion ?? '',
            isDeleted: false,
            employeeId: employeeId as UUID,
            hasData: true,
            firstName: guar.firstName ?? '',
            middleName: guar.middleName ?? '',
            lastName: guar.lastName ?? '',
            nationality: guar.nationality ?? '',
            gender: guar.gender ?? '',
            relation: Object.entries(Relation).find(([, v]) => v === guar.relation)?.[0] ?? guar.relation ?? '',
            addressType: guar.addressType ?? '',
            country: guar.country ?? '',
            region: guar.region ?? '',
            subcity: guar.subcity ?? '',
            zone: guar.zone ?? '',
            woreda: guar.woreda ?? '',
            kebele: guar.kebele ?? '',
            houseNo: guar.houseNo ?? '',
            telephone: guar.telephone ?? '',
            poBox: guar.poBox ?? '',
            fax: guar.fax ?? '',
            email: guar.email ?? '',
            website: guar.website ?? '',
            file: null,
          },
          stamp: null,
          signature: null,
        };

        const stored = sessionStorage.getItem('selectedEmployee');
        const headerSource = stored ? JSON.parse(stored) : {};

        setEmployeeHeaderData({
          photo: headerSource.photo ?? basic.photo,
          fullName: headerSource.empFullName ?? `${basic.firstName} ${basic.middleName} ${basic.lastName}`.trim(),
          fullNameAm: headerSource.empFullNameAm,
          position: headerSource.position ?? basic.position,
          department: headerSource.department ?? basic.department,
          code: headerSource.code ?? basic.code,
        });

        setEmployeeNames({
          department: headerSource.department ?? basic.department ?? '',
          position: headerSource.position ?? basic.position ?? '',
          branch: headerSource.branch ?? basic.branch ?? '',
          jobGrade: headerSource.jobGrade ?? basic.jobGrade ?? '',
        });

        setFormData(mappedData);
        setInitialDataLoaded(true);
      } catch (err) {
        console.error('Failed to load employee data:', err);
        setError('Failed to load employee data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) loadEmployeeData();
  }, [employeeId]);

  const handleStep1Submit = async (step1Data: EmpModBasicDto) => {
    setLoading(true);
    setError(null);
    try {
      await empModApi.updateBasic(employeeId, step1Data);
      setFormData({ ...formData, step1: step1Data });
      invalidateAll('basic');
      if (step1Data.file) invalidateAll('photo');
      scrollToTop();
      showSuccess('Basic information updated successfully!');
      showToast.success('Basic information updated successfully!');
    } catch (error) {
      console.error('Failed to update employee basic info:', error);
      setError('Failed to update employee information. Please try again.');
      showToast.error('Failed to update basic information.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (step2Data: EmpModBioDto) => {
    setLoading(true);
    setError(null);
    try {
      await empModApi.updateBio(employeeId, step2Data);
      setFormData({ ...formData, step2: step2Data });
      invalidateAll('bio');
      scrollToTop();
      showSuccess('Biographical information updated successfully!');
      showToast.success('Biographical information updated successfully!');
    } catch (error) {
      console.error('Failed to update biographical info:', error);
      setError('Failed to save biographical information. Please try again.');
      showToast.error('Failed to update biographical information.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Submit = async (step4Data: EmpModGuarDto) => {
    setLoading(true);
    setError(null);
    try {
      await empModApi.updateGuar(employeeId, step4Data);
      setFormData({ ...formData, step4: step4Data });
      invalidateAll('guarantor');
      scrollToTop();
      showSuccess('Guarantor information updated successfully!');
      showToast.success('Guarantor information updated successfully!');
    } catch (error) {
      console.error('Failed to update guarantor info:', error);
      setError('Failed to save guarantor information. Please try again.');
      showToast.error('Failed to update guarantor information.');
    } finally {
      setLoading(false);
    }
  };

  const handleStampSubmit = async (stampFile: File | null) => {
    setLoading(true);
    setError(null);
    try {
      if (stampFile) {
        await empModApi.updateStamp({ id: employeeId, employeeId, file: stampFile });
      }
      setFormData({ ...formData, stamp: stampFile });
      scrollToTop();
      showSuccess('Stamp uploaded successfully!');
      showToast.success('Stamp uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload stamp:', error);
      setError('Failed to upload stamp. Please try again.');
      showToast.error('Failed to upload stamp.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSubmit = async (signatureFile: File | null) => {
    setLoading(true);
    setError(null);
    try {
      if (signatureFile) {
        await empModApi.updateSign({ id: employeeId, employeeId, file: signatureFile });
      }
      setFormData({ ...formData, signature: signatureFile });
      scrollToTop();
      showSuccess('Signature uploaded successfully!');
      showToast.success('Signature uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload signature:', error);
      setError('Failed to upload signature. Please try again.');
      showToast.error('Failed to upload signature.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (stepId: number) => {
    scrollToTop();
    setCurrentStep(stepId);
  };

  const renderStep = () => {
    if (!initialDataLoaded && loading) {
      return (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 rounded-full" />
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-slate-600 font-medium mt-4">Loading employee data...</p>
            </div>
          </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
            <BasicInfoStep
                data={formData.step1}
                onNext={handleStep1Submit}
                onBack={() => {}}
                loading={loading}
                isEditMode={true}
                initialDepartmentName={employeeNames.department}
                initialPositionName={employeeNames.position}
                initialBranchName={employeeNames.branch}
                initialJobGradeName={employeeNames.jobGrade}
            />
        );
      case 2:
        return (
            <BiographicalStep
                data={formData.step2}
                onNext={handleStep2Submit}
                employeeId={employeeId}
                loading={loading}
                isEditMode={true}
            />
        );
      case 3:
        return (
            <GuarantorStep
                data={formData.step4}
                onNext={handleStep4Submit}
                onBack={() => {}}
                employeeId={employeeId}
                loading={loading}
                isEditMode={true}
            />
        );
      case 4:
        return <StampStep stampFile={formData.stamp} onNext={handleStampSubmit} loading={loading} />;
      case 5:
        return <SignatureStep signatureFile={formData.signature} onNext={handleSignatureSubmit} loading={loading} />;
      default:
        return null;
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 pb-8" ref={formContainerRef}>
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Toast */}
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

        <div className="relative container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <EditEmployeeStepHeader
              steps={steps}
              currentStep={currentStep}
              onBack={onBackToEmployees}
              onTabClick={handleTabClick}
              title="Edit Employee"
              backButtonText="Back to Employees"
              employeeId={employeeId}
              employeeData={employeeHeaderData}
          />

          {/* Error Display */}
          <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                >
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-700" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-red-800">Error</h3>
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                      <button
                          onClick={() => setError(null)}
                          className="text-red-700 hover:text-red-900 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Current Step Indicator */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
          >
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {steps[currentStep - 1]?.icon && React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 text-emerald-600" })}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{steps[currentStep - 1]?.title}</h3>
                  <p className="text-sm text-slate-500">{steps[currentStep - 1]?.description}</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Step {currentStep} of {steps.length}</span>
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                          className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Container */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div
                ref={stepContentRef}
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

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

          {/* Footer */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Auto-save enabled</span>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>Secure connection</span>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                <span>Changes tracked</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Custom CSS */}
        <style>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 32px 32px;
        }
      `}</style>
      </div>
  );
};