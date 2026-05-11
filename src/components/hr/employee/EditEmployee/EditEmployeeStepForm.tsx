import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { User, FileText, Shield, Stamp, PenTool } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BiographicalStep } from './steps/BiographicalStep';
import { GuarantorStep } from './steps/GuarantorStep';
import { StampStep } from './steps/StampStep';
import { SignatureStep } from './steps/SignatureStep';
import { EditEmployeeStepHeader } from './EditEmployeeStepHeader';
import { empService } from '../../../../services/hr/employee/empService';
import { employeeService } from '../../../../services/hr/employee/employees';
import type { Step1Dto, Step2Dto, Step4Dto, UUID } from '../../../../types/hr/employee/empAddDto';
import { Gender, EmpType, EmpNature, WorkArrangement } from '../../../../types/hr/enum';

// Helper: reverse-lookup enum key by display value
function enumKey<T extends Record<string, string>>(enumObj: T, displayValue: string): string {
  return Object.entries(enumObj).find(([, v]) => v === displayValue)?.[0] ?? '';
}

const steps = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Biographical', icon: FileText },
  { id: 3, title: 'Guarantor', icon: Shield },
  { id: 4, title: 'Stamp', icon: Stamp },
  { id: 5, title: 'Signature', icon: PenTool },
];

interface EditEmployeeStepFormProps {
  employeeId: string;
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
    step1: {},
    step2: {},
    step4: {},
    stamp: null as File | null,
    signature: null as File | null,
  });
  const [employeeHeaderData, setEmployeeHeaderData] = useState<any>(null);
  const [employeeNames, setEmployeeNames] = useState({ department: '', position: '', branch: '', jobGrade: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

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

  // Load employee data on mount
  useEffect(() => {
    const loadEmployeeData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Always fetch full employee data from API for accurate prefill
        let employeeData: any = {};
        let tableEmployee: any = null;

        try {
          employeeData = await employeeService.getEmployeeById(employeeId);
          console.log('Loaded employee data from API:', employeeData);
        } catch (apiError) {
          console.warn('API call failed, falling back to sessionStorage:', apiError);
          const storedEmployee = sessionStorage.getItem('selectedEmployee');
          if (storedEmployee) {
            tableEmployee = JSON.parse(storedEmployee);
            employeeData = tableEmployee;
          }
        }

        // Resolve enum keys from display values (API may return display strings)
        const resolveGender = (v: string) =>
          Object.keys(Gender).includes(v) ? v : enumKey(Gender, v);
        const resolveEmpType = (v: string) =>
          Object.keys(EmpType).includes(v) ? v : enumKey(EmpType, v);
        const resolveEmpNature = (v: string) =>
          Object.keys(EmpNature).includes(v) ? v : enumKey(EmpNature, v);
        const resolveWorkArr = (v: string) =>
          Object.keys(WorkArrangement).includes(v) ? v : enumKey(WorkArrangement, v);

        // Parse full names by space into first / middle / last
        const enParts = (employeeData.empFullName || '').trim().split(/\s+/);
        const amParts = (employeeData.empFullNameAm || '').trim().split(/\s+/);

        const firstName   = employeeData.firstName   || enParts[0] || '';
        const middleName  = employeeData.middleName  || enParts[1] || '';
        const lastName    = employeeData.lastName    || enParts[2] || '';
        const firstNameAm  = employeeData.firstNameAm  || amParts[0] || '';
        const middleNameAm = employeeData.middleNameAm || amParts[1] || '';
        const lastNameAm   = employeeData.lastNameAm   || amParts[2] || '';

        // Map the employee data to form structure
        const mappedData = {
          step1: {
            firstName,
            firstNameAm,
            middleName,
            middleNameAm,
            lastName,
            lastNameAm,
            nationality: employeeData.nationality || 'Ethiopian',
            gender: resolveGender(employeeData.gender || ''),
            employmentDate: employeeData.employmentDate || '',
            branchId: employeeData.branchId || '',
            jobGradeId: employeeData.jobGradeId || '',
            jobGradeStepId: employeeData.jobGradeStepId || '',
            // API returns UUIDs when available, fall back to empty (List will auto-select)
            departmentId: employeeData.departmentId || '',
            positionId: employeeData.positionId || '',
            employmentType: resolveEmpType(employeeData.employmentType ?? employeeData.empType ?? ''),
            employmentNature: resolveEmpNature(employeeData.employmentNature ?? employeeData.empNature ?? ''),
            workArrangement: resolveWorkArr(employeeData.workArrangement ?? employeeData.workArr ?? ''),
            File: null,
            // Step1Dto extra fields (filled in biographical step)
            jgStepId: employeeData.jgStepId || '' as UUID,
            birthDate: employeeData.birthDate || '',
            maritalStatus: employeeData.maritalStatus || '' as any,
            addressType: employeeData.addressType || '' as any,
            country: employeeData.country || '',
            region: employeeData.region || '',
            subcity: employeeData.subcity || '',
            zone: employeeData.zone,
            woreda: employeeData.woreda || '',
            kebele: employeeData.kebele,
            houseNo: employeeData.houseNo || '',
            telephone: employeeData.telephone || '',
            poBox: employeeData.poBox,
            fax: employeeData.fax,
            email: employeeData.email || '',
            website: employeeData.website,
          },
          step2: {
            birthDate: employeeData.birthDate || '',
            birthLocation: employeeData.birthLocation || '',
            motherFullName: employeeData.motherFullName || '',
            hasBirthCert: employeeData.hasBirthCert || '',
            hasMarriageCert: employeeData.hasMarriageCert || '',
            maritalStatus: employeeData.maritalStatus || '',
            employeeId: employeeId as UUID,
            tin: employeeData.tin || '',
            bankAccountNo: employeeData.bankAccountNo || '',
            pensionNumber: employeeData.pensionNumber || '',
            addressType: employeeData.addressType || '',
            country: employeeData.country || '',
            region: employeeData.region || '',
            subcity: employeeData.subcity || '',
            zone: employeeData.zone || '',
            woreda: employeeData.woreda || '',
            kebele: employeeData.kebele || '',
            houseNo: employeeData.houseNo || '',
            telephone: employeeData.telephone || '',
            poBox: employeeData.poBox || '',
            fax: employeeData.fax || '',
            email: employeeData.email || '',
            website: employeeData.website || '',
          },
          step4: {
            firstName: employeeData.guarantorFirstName || '',
            firstNameAm: employeeData.guarantorFirstNameAm || '',
            middleName: employeeData.guarantorMiddleName || '',
            middleNameAm: employeeData.guarantorMiddleNameAm || '',
            lastName: employeeData.guarantorLastName || '',
            lastNameAm: employeeData.guarantorLastNameAm || '',
            nationality: employeeData.guarantorNationality || '',
            gender: resolveGender(employeeData.guarantorGender || ''),
            relationId: employeeData.guarantorRelationId || '',
            employeeId: employeeId as UUID,
            addressType: employeeData.guarantorAddressType || '',
            country: employeeData.guarantorCountry || '',
            region: employeeData.guarantorRegion || '',
            subcity: employeeData.guarantorSubcity || '',
            zone: employeeData.guarantorZone || '',
            woreda: employeeData.guarantorWoreda || '',
            kebele: employeeData.guarantorKebele || '',
            houseNo: employeeData.guarantorHouseNo || '',
            telephone: employeeData.guarantorTelephone || '',
            poBox: employeeData.guarantorPoBox || '',
            fax: employeeData.guarantorFax || '',
            email: employeeData.guarantorEmail || '',
            website: employeeData.guarantorWebsite || '',
            File: null,
          },
          stamp: null as File | null,
          signature: null as File | null,
        };

        // Set header data for profile display
        const storedEmployee = sessionStorage.getItem('selectedEmployee');
        const headerSource = storedEmployee ? JSON.parse(storedEmployee) : employeeData;
        setEmployeeHeaderData({
          photo: headerSource.photo ?? employeeData.photo,
          fullName: headerSource.empFullName ?? employeeData.empFullName,
          fullNameAm: headerSource.empFullNameAm ?? employeeData.empFullNameAm,
          position: headerSource.position ?? employeeData.position,
          department: headerSource.department ?? employeeData.department,
          code: headerSource.code ?? employeeData.code,
        });

        // Store display names for name-based matching in BasicInfoStep
        setEmployeeNames({
          department: employeeData.department || headerSource?.department || '',
          position: employeeData.position || headerSource?.position || '',
          branch: employeeData.branch || headerSource?.branch || '',
          jobGrade: employeeData.jobGrade || headerSource?.jobGrade || '',
        });

        setFormData(mappedData);
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Failed to load employee data:', error);
        setError('Failed to load employee data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      loadEmployeeData();
    }
  }, [employeeId]);

  // Handle Step 1 update
  const handleStep1Submit = async (step1Data: Step1Dto & { branchId: UUID, jobGradeStepId: UUID }) => {
    setLoading(true);
    setError(null);

    try {
      // Update employee basic info via API
      const result = await empService.empAddStep1({
        ...step1Data,
        // Add employeeId for update context if needed
      });

      console.log('Employee basic info updated successfully:', result);

      const updatedFormData = {
        ...formData,
        step1: step1Data,
      };

      setFormData(updatedFormData);
      scrollToTop();
      
      // Show success message
      alert('Basic information updated successfully!');
    } catch (error) {
      console.error('Failed to update employee basic info:', error);
      setError('Failed to update employee information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2 update
  const handleStep2Submit = async (step2Data: Step2Dto) => {
    setLoading(true);
    setError(null);

    try {
      const step2DataWithEmployeeId: Step2Dto = {
        ...step2Data,
        employeeId: employeeId as UUID
      };

      const result = await empService.empAddStep2(step2DataWithEmployeeId);

      console.log('Biographical info updated successfully:', result);

      const updatedFormData = {
        ...formData,
        step2: step2Data,
      };

      setFormData(updatedFormData);
      scrollToTop();
      
      // Show success message
      alert('Biographical information updated successfully!');
    } catch (error) {
      console.error('Failed to update biographical info:', error);
      setError('Failed to save biographical information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 4 update (Guarantor)
  const handleStep4Submit = async (step4Data: Step4Dto) => {
    setLoading(true);
    setError(null);

    try {
      // empAddStep4 expects Step2Dto shape — map Step4Dto fields accordingly
      const step2Payload: Step2Dto = {
        firstName: step4Data.firstName,
        middleName: step4Data.middleName,
        lastName: step4Data.lastName,
        nationality: step4Data.nationality,
        gender: step4Data.gender,
        relation: String(step4Data.relationId),
        employeeId: employeeId as UUID,
        addressType: step4Data.addressType,
        country: step4Data.country,
        region: step4Data.region,
        subcity: step4Data.subcity,
        zone: step4Data.zone,
        woreda: step4Data.woreda,
        kebele: step4Data.kebele,
        houseNo: step4Data.houseNo,
        telephone: step4Data.telephone,
        poBox: step4Data.poBox,
        fax: step4Data.fax,
        email: step4Data.email,
        website: step4Data.website,
        File: step4Data.File,
      };

      const result = await empService.empAddStep4(step2Payload);

      console.log('Guarantor info updated successfully:', result);

      const updatedFormData = {
        ...formData,
        step4: step4Data,
      };

      setFormData(updatedFormData);
      scrollToTop();
      
      // Show success message
      alert('Guarantor information updated successfully!');
    } catch (error) {
      console.error('Failed to update guarantor info:', error);
      setError('Failed to save guarantor information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Stamp upload
  const handleStampSubmit = async (stampFile: File | null) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Add API call to upload stamp
      console.log('Stamp uploaded:', stampFile);

      const updatedFormData = {
        ...formData,
        stamp: stampFile,
      };

      setFormData(updatedFormData);
      scrollToTop();
      
      // Show success message
      alert('Stamp uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload stamp:', error);
      setError('Failed to upload stamp. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signature upload
  const handleSignatureSubmit = async (signatureFile: File | null) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Add API call to upload signature
      console.log('Signature uploaded:', signatureFile);

      const updatedFormData = {
        ...formData,
        signature: signatureFile,
      };

      setFormData(updatedFormData);
      scrollToTop();
      
      // Show success message
      alert('Signature uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload signature:', error);
      setError('Failed to upload signature. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab click - allows jumping to any step
  const handleTabClick = (stepId: number) => {
    scrollToTop();
    setCurrentStep(stepId);
  };

  const renderStep = () => {
    if (!initialDataLoaded && loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employee data...</p>
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
            employeeId={employeeId as UUID}
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
            employeeId={employeeId as UUID}
            loading={loading}
            isEditMode={true}
          />
        );
      case 4:
        return (
          <StampStep
            stampFile={formData.stamp}
            onNext={handleStampSubmit}
            loading={loading}
          />
        );
      case 5:
        return (
          <SignatureStep
            signatureFile={formData.signature}
            onNext={handleSignatureSubmit}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8" ref={formContainerRef}>
      <div className="mx-auto">
        <EditEmployeeStepHeader
          steps={steps}
          currentStep={currentStep}
          onBack={onBackToEmployees}
          onTabClick={handleTabClick}
          title="Edit Employee"
          backButtonText="Back to Employees"
          employeeData={employeeHeaderData}
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
          className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6"
        >
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
