import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { User, FileText, Shield, Stamp, PenTool } from 'lucide-react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BiographicalStep } from './steps/BiographicalStep';
import { GuarantorStep } from './steps/GuarantorStep';
import { StampStep } from './steps/StampStep';
import { SignatureStep } from './steps/SignatureStep';
import { EditEmployeeStepHeader } from './EditEmployeeStepHeader';
import { empApi } from '../../../../services/hr/employee/emp.api';
import type { Step1Dto, Step2Dto, UUID } from '../../../../types/hr/employee/empAddDto';

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
        // Fetch all three tab data in parallel
        const [basic, bio, guar] = await Promise.all([
          empApi.getModBasic(employeeId),
          empApi.getModBio(employeeId),
          empApi.getModGuar(employeeId),
        ]);

        const mappedData = {
          step1: {
            firstName:        basic.firstName        ?? '',
            firstNameAm:      basic.firstNameAm      ?? '',
            middleName:       basic.middleName        ?? '',
            middleNameAm:     basic.middleNameAm      ?? '',
            lastName:         basic.lastName          ?? '',
            lastNameAm:       basic.lastNameAm        ?? '',
            nationality:      basic.nationality       ?? '',
            gender:           basic.gender            ?? '',
            employmentDate:   basic.employmentDate ? basic.employmentDate.split('T')[0] : '',
            branchId:         basic.branchId          ?? '',
            jobGradeId:       basic.jobGradeId        ?? '',
            jgStepId:         basic.jgStepId          ?? '' as UUID,
            positionId:       basic.positionId        ?? '',
            departmentId:     basic.departmentId      ?? '',
            employmentType:   basic.employmentType    ?? '',
            employmentNature: basic.employmentNature  ?? '',
            workArrangement:  basic.workArrangement   ?? '',
            File: null,
            // bio address fields carried into step1 shape
            birthDate:     bio.birthDate     ?? '',
            maritalStatus: bio.maritalStatus ?? '' as any,
            addressType:   bio.addressType   ?? '' as any,
            country:       bio.country       ?? '',
            region:        bio.region        ?? '',
            subcity:       bio.subcity       ?? '',
            zone:          bio.zone          ?? '',
            woreda:        bio.woreda        ?? '',
            kebele:        bio.kebele        ?? '',
            houseNo:       bio.houseNo       ?? '',
            telephone:     bio.telephone     ?? '',
            poBox:         bio.poBox         ?? '',
            fax:           bio.fax           ?? '',
            email:         bio.email         ?? '',
            website:       bio.website       ?? '',
          },
          step2: {
            employeeId:     employeeId as UUID,
            birthDate:      bio.birthDate      ?? '',
            birthLocation:  bio.birthLocation  ?? '',
            motherFullName: bio.motherFullName ?? '',
            maritalStatus:  bio.maritalStatus  ?? '',
            tin:            bio.tin            ?? '',
            bankAccountNo:  bio.bankAccountNo  ?? '',
            pensionNumber:  bio.pensionNumber  ?? '',
            addressType:    bio.addressType    ?? '',
            country:        bio.country        ?? '',
            region:         bio.region         ?? '',
            subcity:        bio.subcity        ?? '',
            zone:           bio.zone           ?? '',
            woreda:         bio.woreda         ?? '',
            kebele:         bio.kebele         ?? '',
            houseNo:        bio.houseNo        ?? '',
            telephone:      bio.telephone      ?? '',
            poBox:          bio.poBox          ?? '',
            fax:            bio.fax            ?? '',
            email:          bio.email          ?? '',
            website:        bio.website        ?? '',
          },
          step4: {
            firstName:   guar.firstName   ?? '',
            middleName:  guar.middleName  ?? '',
            lastName:    guar.lastName    ?? '',
            nationality: guar.nationality ?? '',
            gender:      guar.gender      ?? '',
            relationId:  guar.relation    ?? '',
            employeeId:  employeeId as UUID,
            addressType: guar.addressType ?? '',
            country:     guar.country     ?? '',
            region:      guar.region      ?? '',
            subcity:     guar.subcity     ?? '',
            zone:        guar.zone        ?? '',
            woreda:      guar.woreda      ?? '',
            kebele:      guar.kebele      ?? '',
            houseNo:     guar.houseNo     ?? '',
            telephone:   guar.telephone   ?? '',
            poBox:       guar.poBox       ?? '',
            fax:         guar.fax         ?? '',
            email:       guar.email       ?? '',
            website:     guar.website     ?? '',
            File: null,
          },
          stamp: null as File | null,
          signature: null as File | null,
        };

        // Header data from sessionStorage (has photo/display names) merged with basic
        const stored = sessionStorage.getItem('selectedEmployee');
        const headerSource = stored ? JSON.parse(stored) : {};
        setEmployeeHeaderData({
          photo:      headerSource.photo      ?? basic.photo,
          fullName:   headerSource.empFullName ?? `${basic.firstName} ${basic.middleName} ${basic.lastName}`.trim(),
          fullNameAm: headerSource.empFullNameAm,
          position:   headerSource.position   ?? basic.position,
          department: headerSource.department ?? basic.department,
          code:       headerSource.code       ?? basic.code,
        });

        setEmployeeNames({
          department: headerSource.department ?? basic.department ?? '',
          position:   headerSource.position   ?? basic.position   ?? '',
          branch:     headerSource.branch     ?? basic.branch     ?? '',
          jobGrade:   headerSource.jobGrade   ?? basic.jobGrade   ?? '',
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
      const result = await empApi.addStep1({
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

      const result = await empApi.addStep2(step2DataWithEmployeeId);

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
  const handleStep4Submit = async (step4Data: Step2Dto) => {
    setLoading(true);
    setError(null);

    try {
      const result = await empApi.addStep4({ ...step4Data, employeeId: employeeId as UUID });

      console.log('Guarantor info updated successfully:', result);

      setFormData({ ...formData, step4: step4Data });
      scrollToTop();
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
