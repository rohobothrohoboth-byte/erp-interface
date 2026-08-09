// AddUserStepForm.tsx - FIXED DATA HANDLING

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { User, Printer, CheckCircle, Sun, Moon, Activity, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BasicInfoStep } from '../../../hr/employee/AddEmployee/steps/BasicInfoStep';
import { BasicInfoReviewStep } from './InfoReviewStep';
import { AddEmployeeStepHeader } from './AddUserEmployeeHeader';
import { empApi } from '../../../../services/hr/employee/emp.api';
import { useEmpAddStore } from '../../../../stores/hr/empAdd.store';
import type { Step1Dto, EmpAddPrintDto } from '../../../../types/hr/employee/empAddDto';
import type { UUID } from 'crypto';
import toast from 'react-hot-toast';

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

const steps = [
  { id: 1, title: 'Basic Information', icon: User },
  { id: 2, title: 'Review & Complete', icon: CheckCircle },
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
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const prefersReducedMotion = useReducedMotion();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [currentStep, setCurrentStep] = useState(adminCurrentStep);
  const [basicInfoData, setBasicInfoData] = useState<Partial<Step1Dto & { branchId: UUID; jobGradeStepId: UUID }>>({});
  const [step2Data, setStep2Data] = useState<EmpAddPrintDto | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const formContainerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

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

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setAdminStep(step);
    scrollToTop();
  }, [setAdminStep]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (formContainerRef.current) formContainerRef.current.scrollTop = 0;
    if (stepContentRef.current) stepContentRef.current.scrollTop = 0;
  };

  useEffect(() => { scrollToTop(); }, [currentStep]);

  // ✅ FIXED: handleBasicInfoComplete with proper data handling
  const handleBasicInfoComplete = useCallback(async (data: Step1Dto & { branchId: UUID }) => {
    console.log('=== handleBasicInfoComplete STARTED ===');
    console.log('data:', data);

    setLoading(true);
    setError(null);

    try {
      // Store the basic info data
      setBasicInfoData(data);

      // Handle photo if present
      if (data.File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('Photo loaded');
          setPhotoData(reader.result as string);
        };
        reader.readAsDataURL(data.File);
      }

      // Call API to create employee
      const result = await empApi.addStep1(data);
      console.log('Step 1 result:', result);

      // Store the employee ID
      const empId = result.id;
      setEmployeeId(empId);
      setAdminEmployeeId(empId);

      // Try to fetch employee details for review
      try {
        const employeeData = await empApi.getEmployeeById(empId);
        console.log('Employee data fetched:', employeeData);

        // Create review data from API response or fallback to form data
        const reviewData: EmpAddPrintDto = {
          EmployeeId: empId,
          Photo: photoData || '',
          FullName: employeeData?.empFullName ||
              `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim(),
          FullNameAm: employeeData?.empFullNameAm ||
              `${data.firstNameAm || ''} ${data.middleNameAm || ''} ${data.lastNameAm || ''}`.trim(),
          Code: employeeData?.code || '',
          Gender: data.gender || '',
          Nationality: data.nationality || '',
          EmploymentDate: data.employmentDate ? new Date(data.employmentDate).toLocaleDateString() : '',
          EmploymentDateAm: data.employmentDate ? new Date(data.employmentDate).toLocaleDateString('am-ET') : '',
          JobGrade: employeeData?.jobGrade || '',
          Position: employeeData?.position || '',
          Department: employeeData?.department || '',
          Branch: employeeData?.branch || '',
          EmploymentType: data.employmentType || '',
          EmploymentNature: data.employmentNature || '',
          WorkArr: data.workArrangement || '',
          BirthDate: data.birthDate ? new Date(data.birthDate).toLocaleDateString() : '',
          BirthDateAm: data.birthDate ? new Date(data.birthDate).toLocaleDateString('am-ET') : '',
          MaritalStatus: data.maritalStatus || '',
          Address: `${data.country || ''} ${data.region || ''} ${data.subcity || ''}`.trim(),
          Telephone: data.telephone || '',
          GuaFullName: '',
          GuaNationality: '',
          GuaGender: '',
          GuaRelation: '',
          GuaAddress: '',
          GuaTelephone: '',
          GuaFileName: '',
          GuaFileSize: '',
          GuaFileType: ''
        };

        console.log('Review data created:', reviewData);
        setStep2Data(reviewData);

      } catch (err) {
        console.warn('Could not fetch employee details, using form data:', err);
        // Use form data as fallback
        const fallbackData: EmpAddPrintDto = {
          EmployeeId: empId,
          Photo: photoData || '',
          FullName: `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim(),
          FullNameAm: `${data.firstNameAm || ''} ${data.middleNameAm || ''} ${data.lastNameAm || ''}`.trim(),
          Code: '',
          Gender: data.gender || '',
          Nationality: data.nationality || '',
          EmploymentDate: data.employmentDate ? new Date(data.employmentDate).toLocaleDateString() : '',
          EmploymentDateAm: data.employmentDate ? new Date(data.employmentDate).toLocaleDateString('am-ET') : '',
          JobGrade: '',
          Position: '',
          Department: '',
          Branch: '',
          EmploymentType: data.employmentType || '',
          EmploymentNature: data.employmentNature || '',
          WorkArr: data.workArrangement || '',
          BirthDate: data.birthDate ? new Date(data.birthDate).toLocaleDateString() : '',
          BirthDateAm: data.birthDate ? new Date(data.birthDate).toLocaleDateString('am-ET') : '',
          MaritalStatus: data.maritalStatus || '',
          Address: `${data.country || ''} ${data.region || ''} ${data.subcity || ''}`.trim(),
          Telephone: data.telephone || '',
          GuaFullName: '',
          GuaNationality: '',
          GuaGender: '',
          GuaRelation: '',
          GuaAddress: '',
          GuaTelephone: '',
          GuaFileName: '',
          GuaFileSize: '',
          GuaFileType: ''
        };
        setStep2Data(fallbackData);
      }

      // Move to step 2
      goToStep(2);

    } catch (err: any) {
      console.error('Error in handleBasicInfoComplete:', err);
      setError(err.message || 'Failed to create employee. Please try again.');
      scrollToTop();
    } finally {
      setLoading(false);
    }
  }, [setAdminEmployeeId, goToStep, photoData]);

  // ✅ FIXED: handleConfirmAndSave
  const handleConfirmAndSave = useCallback(async () => {
    console.log('=== handleConfirmAndSave STARTED ===');
    console.log('employeeId:', employeeId);
    console.log('basicInfoData:', basicInfoData);

    setLoading(true);
    setError(null);

    try {
      // Validate that we have the employee ID
      if (!employeeId && !basicInfoData.id) {
        console.error('No employee ID found');
        throw new Error('Employee not found. Please try again.');
      }

      const id = employeeId || basicInfoData.id;
      console.log('Employee created successfully with ID:', id);

      // Reset store
      resetAdmin();
      console.log('Store reset, calling onUserAdded...');

      toast.success('Employee added successfully!');
      onUserAdded();

    } catch (err: any) {
      console.error('Error in handleConfirmAndSave:', err);
      const errorMessage = err.message || 'Failed to complete employee creation. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      scrollToTop();
    } finally {
      setLoading(false);
    }
  }, [resetAdmin, onUserAdded, basicInfoData, employeeId]);

  // In AddUserStepForm.tsx - Enhanced print function

  const handlePrint = useCallback(() => {
    console.log('=== PRINT BUTTON CLICKED ===');

    const el = document.getElementById('basic-info-section');
    if (!el) {
      console.error('Print section not found!');
      toast.error('Print section not found. Please try again.');
      return;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      try {
        // Clone the element to avoid modifying the original
        const clone = el.cloneNode(true) as HTMLElement;

        // Add print-specific styles
        const printStyles = `
        <style>
          /* Print styles */
          @media print {
            body { 
              font-family: Arial, sans-serif;
              margin: 20px;
              background: white;
            }
            .printable-area {
              max-width: 100%;
            }
            .bg-slate-50 { background: #f8fafc !important; }
            .bg-white { background: white !important; }
            .dark\\:bg-slate-800\\/30 { background: #f1f5f9 !important; }
            .dark\\:bg-slate-800\\/80 { background: white !important; }
            .text-slate-800 { color: #1e293b !important; }
            .text-slate-500 { color: #64748b !important; }
            .border { border: 1px solid #e2e8f0 !important; }
            .rounded-xl { border-radius: 12px !important; }
            .p-6 { padding: 24px !important; }
            .grid { display: grid !important; }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
            .gap-4 { gap: 16px !important; }
            .shadow-sm { box-shadow: none !important; }
            .shadow-xl { box-shadow: none !important; }
            .mb-8 { margin-bottom: 32px !important; }
            .mb-4 { margin-bottom: 16px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mt-1 { margin-top: 4px !important; }
            .mt-2 { margin-top: 8px !important; }
            .mt-4 { margin-top: 16px !important; }
            .mt-6 { margin-top: 24px !important; }
            .text-center { text-align: center !important; }
            .text-2xl { font-size: 24px !important; }
            .text-xl { font-size: 20px !important; }
            .text-sm { font-size: 14px !important; }
            .text-xs { font-size: 12px !important; }
            .font-bold { font-weight: 700 !important; }
            .font-medium { font-weight: 500 !important; }
            .font-semibold { font-weight: 600 !important; }
            .w-full { width: 100% !important; }
            .w-32 { width: 128px !important; }
            .h-32 { height: 128px !important; }
            .rounded-full { border-radius: 9999px !important; }
            .overflow-hidden { overflow: hidden !important; }
            .object-cover { object-fit: cover !important; }
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .justify-center { justify-content: center !important; }
            .gap-2 { gap: 8px !important; }
            .gap-3 { gap: 12px !important; }
            .gap-4 { gap: 16px !important; }
            .inline-flex { display: inline-flex !important; }
            .inline-block { display: inline-block !important; }
            .flex-col { flex-direction: column !important; }
            .flex-row { flex-direction: row !important; }
            .border-t { border-top: 1px solid #e2e8f0 !important; }
            .pt-6 { padding-top: 24px !important; }
            .mt-8 { margin-top: 32px !important; }
            .space-y-8 > * + * { margin-top: 32px !important; }
            .space-y-6 > * + * { margin-top: 24px !important; }
            .space-y-4 > * + * { margin-top: 16px !important; }
            .space-y-2 > * + * { margin-top: 8px !important; }
            /* Hide dark mode elements in print */
            .dark\\:bg-slate-800\\/80 { background: white !important; }
            .dark\\:text-slate-100 { color: #1e293b !important; }
            .dark\\:text-slate-300 { color: #334155 !important; }
            .dark\\:text-slate-400 { color: #64748b !important; }
            .dark\\:border-slate-700 { border-color: #e2e8f0 !important; }
            .dark\\:bg-slate-800\\/30 { background: #f1f5f9 !important; }
            /* Hide elements that shouldn't print */
            .no-print { display: none !important; }
          }
        </style>
      `;

        // Get existing styles
        const existingStyles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
            .map((n) => n.outerHTML)
            .join('\n');

        // Create print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
          toast.error('Please allow popups to print.');
          return;
        }

        // Write content to print window
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Employee Basic Information</title>
            ${existingStyles}
            ${printStyles}
          </head>
          <body>
            <div class="printable-area">
              ${clone.outerHTML}
            </div>
          </body>
        </html>
      `);

        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load then print
        setTimeout(() => {
          try {
            printWindow.print();
            printWindow.close();
          } catch (err) {
            console.error('Print failed:', err);
            toast.error('Failed to print. Please try again.');
          }
        }, 500);

      } catch (err) {
        console.error('Print error:', err);
        toast.error('Failed to print. Please try again.');
      }
    }, 300);
  }, []);

  const renderStep = () => {
    try {
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
          console.log('Rendering Review Step with data:', {
            step1Data: basicInfoData,
            step2Data: step2Data,
            photo: photoData ? 'has photo' : 'no photo'
          });
          return (
              <BasicInfoReviewStep
                  step1Data={basicInfoData as Step1Dto & { branchId: UUID }}
                  step2Data={step2Data}
                  photo={photoData}
                  onBack={() => {
                    console.log('Going back to step 1');
                    goToStep(1);
                    setError(null);
                  }}
                  onConfirm={handleConfirmAndSave}
                  onPrint={handlePrint}
                  loading={loading}
              />
          );
        default:
          console.warn('Unknown step:', currentStep);
          return null;
      }
    } catch (err: any) {
      console.error('Error in renderStep:', err);
      return (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">Something went wrong</div>
            <button onClick={() => goToStep(1)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
              Go Back to Step 1
            </button>
          </div>
      );
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.3 }
    }
  };

  const buttonVariants = {
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        <div className="relative container mx-auto px-4 py-6 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">User Management</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Add New Employee
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Complete the form below to add a new employee to the system
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Activity size={14} />
                <span className="font-mono">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
              </div>

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
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative"
          >
            <AddEmployeeStepHeader
                steps={steps}
                currentStep={currentStep}
                onStepClick={(step) => { if (step < currentStep) goToStep(step); }}
                title="Add New Employee"
            />

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                  <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                        </div>
                      </div>
                      <button
                          onClick={() => setError(null)}
                          className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Form Container */}
            <div
                ref={stepContentRef}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 px-6 py-6 transition-colors duration-200"
            >
              <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: prefersReducedMotion ? 0.2 : 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

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
                  <span>Secure Form</span>
                </div>
                <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="w-3 h-3" />
                  <span>Data Encrypted</span>
                </div>
                <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-save Enabled</span>
                </div>
              </div>
            </motion.div>
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