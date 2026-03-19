import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Lock, Shield, Key } from 'lucide-react';
import { AccountBasicInfoStep } from './steps/AccountBasicInfoStep';
import { MainPermissionsStep } from './steps/MainPermissionsStep';
import { ApiPermissionsStep } from './steps/ApiPermissionsStep';
import { AddAccountStepHeader } from './AddAccountStepHeader';
import type { EmpSearchRes } from '../../../types/core/EmpSearchRes';
import type { RegStep1, RegStep2, RegStep3, UUID } from '../../../types/auth/registration';
import type { ModPerMenuListDto, NameList } from '../../../types/auth/ModPerMenu';
import type { MenuPerApiListDto } from '../../../types/auth/MenuPerApi';
import { registrationService } from '../../../services/auth/registerservice';
import { perMenuService } from '../../../services/auth/perMenuService';
import * as MenuPerApiService from '../../../services/auth/menuPerApiService';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Basic Info', icon: Lock },
  { id: 2, title: 'Menu Permissions', icon: Shield },
  { id: 3, title: 'Access Permissions', icon: Key },
];

interface AddAccountStepFormProps {
  onBackToAccounts: () => void;
  onAccountAdded: (result: any) => void;
  employee?: EmpSearchRes;
}

export const AddAccountStepForm: React.FC<AddAccountStepFormProps> = ({
  onBackToAccounts,
  onAccountAdded,
  employee,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: {
      password: '',
      confirmPassword: '',
      role: '',
      modules: [] as string[],
    },
    step2: {
      permissions: [] as string[],
    },
    step3: {
      apiPermissions: [] as string[],
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  // Real data state for permissions (Step 2)
  const [permissionsData, setPermissionsData] = useState<ModPerMenuListDto[]>([]);
  const [flattenedPermissions, setFlattenedPermissions] = useState<Array<NameList & { moduleId: UUID; moduleName: string }>>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  // Real data state for API permissions (Step 3)
  const [apiPermissionsData, setApiPermissionsData] = useState<MenuPerApiListDto[]>([]);
  const [flattenedApiPermissions, setFlattenedApiPermissions] = useState<Array<NameList & { menuId: UUID; menuName: string }>>([]);
  const [isLoadingApiPermissions, setIsLoadingApiPermissions] = useState(false);
  const [apiPermissionsError, setApiPermissionsError] = useState<string | null>(null);

  const getEmployeeEmail = () => {
    if (!employee) return '';

    if (employee.code) {
      if (employee.code.includes('@')) {
        return employee.code;
      }
      return `${employee.code.toLowerCase()}@company.com`;
    }

    return '';
  };

  const getEmployeeDisplayName = () => {
    if (!employee) return '';
    return employee.empFullName || '';
  };

  const getEmployeeCode = () => {
    if (!employee) return '';
    return employee.code || '';
  };

  // Fetch real permissions data when modules are selected AND user ID is available
  useEffect(() => {
    const fetchPermissionsData = async () => {
      if (currentStep === 2 && formData.step1.modules.length > 0 && userId) {
        setIsLoadingPermissions(true);
        setPermissionsError(null);

        try {
          console.log('Fetching permission menus for user:', userId);
          console.log('Selected modules:', formData.step1.modules);

          // Convert selected modules to UUID array
          const selectedModuleIds = formData.step1.modules.map(id => id as UUID);

          // Fetch filtered permissions for the user based on selected modules
          const filteredPermissions = await perMenuService.getFilteredPermissionsForUser(
            userId as UUID,
            selectedModuleIds
          );

          console.log('Filtered permissions (grouped):', filteredPermissions);
          setPermissionsData(filteredPermissions);

          // Flatten the permissions for easier display
          const flattened = await perMenuService.getFlattenedPermissionsForUser(
            userId as UUID,
            selectedModuleIds
          );

          console.log('Flattened permissions:', flattened);
          setFlattenedPermissions(flattened);

          if (filteredPermissions.length === 0) {
            toast('No permissions found for the selected modules', {
              icon: '⚠️',
              style: {
                background: '#fef3c7',
                color: '#92400e',
              }
            });
          }

        } catch (error: any) {
          console.error('Error fetching permissions data:', error);
          const errorMessage = error.message || 'Failed to load permissions data from API';
          setPermissionsError(errorMessage);
          toast.error('Could not load permissions. Please try again.');

          // Clear data on error
          setPermissionsData([]);
          setFlattenedPermissions([]);
        } finally {
          setIsLoadingPermissions(false);
        }
      }
    };

    fetchPermissionsData();
  }, [currentStep, formData.step1.modules, userId]);

  // Fetch API permissions data for Step 3 when we have user ID and selected menus
  useEffect(() => {
    const fetchApiPermissionsData = async () => {
      if (currentStep === 3 && userId && formData.step2.permissions.length > 0) {
        setIsLoadingApiPermissions(true);
        setApiPermissionsError(null);

        try {
          console.log('Fetching API permissions for user:', userId);
          console.log('Selected menus:', formData.step2.permissions);

          // Convert selected menus to UUID array
          const selectedMenuIds = formData.step2.permissions.map(id => id as UUID);

          // Fetch filtered API permissions for the user based on selected menus
          const filteredApiPermissions = await MenuPerApiService.menuPerApiService.getFilteredPerApisForUser(
            userId as UUID,
            selectedMenuIds
          );

          console.log('Filtered API permissions (grouped):', filteredApiPermissions);
          setApiPermissionsData(filteredApiPermissions);

          // Flatten the API permissions for easier display
          const flattened = await MenuPerApiService.menuPerApiService.getFlattenedPerApisForUser(
            userId as UUID,
            selectedMenuIds
          );

          console.log('Flattened API permissions:', flattened);
          setFlattenedApiPermissions(flattened);

          if (filteredApiPermissions.length === 0) {
            toast('No API permissions found for the selected menus', {
              icon: '⚠️',
              style: {
                background: '#fef3c7',
                color: '#92400e',
              }
            });
          }

        } catch (error: any) {
          console.error('Error fetching API permissions data:', error);
          const errorMessage = error.message || 'Failed to load API permissions data from API';
          setApiPermissionsError(errorMessage);
          toast.error('Could not load API permissions. Please try again.');

          setApiPermissionsData([]);
          setFlattenedApiPermissions([]);
        } finally {
          setIsLoadingApiPermissions(false);
        }
      }
    };

    fetchApiPermissionsData();
  }, [currentStep, userId, formData.step2.permissions]);

  // Transform API data to match MainPermissionsStep props format (Step 2)
  const getPermissionsForStep2 = () => {
    // If we have flattened permissions from API, use them
    if (flattenedPermissions.length > 0) {
      return flattenedPermissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        module: permission.moduleName,
        description: `Permission for ${permission.moduleName} module`
      }));
    }

    // Otherwise, check if we have grouped data but not flattened yet
    if (permissionsData.length > 0) {
      const permissions: any[] = [];
      for (const moduleGroup of permissionsData) {
        for (const permission of moduleGroup.perMenuList) {
          permissions.push({
            id: permission.id,
            name: permission.name,
            module: moduleGroup.perModule,
            description: `Permission for ${moduleGroup.perModule} module`
          });
        }
      }
      return permissions;
    }

    // No data available
    return [];
  };

  // Transform API data to match ApiPermissionsStep props format (Step 3)
  const getFilteredDetailedPermissions = () => {
    if (formData.step2.permissions.length === 0 || flattenedApiPermissions.length === 0) {
      return [];
    }

    // Transform to match ApiPermissionsStep format
    return flattenedApiPermissions.map(apiPermission => ({
      id: apiPermission.id,
      name: apiPermission.name,
      mainPermissionId: apiPermission.menuId, // Use menuId as mainPermissionId
      action: 'access', // You might want to extract this from the API response
      resource: apiPermission.name.toLowerCase().replace(/\s+/g, '_'),
      description: `API access for ${apiPermission.menuName}`
    }));
  };

  // Get main permissions list for Step 3
  const getMainPermissionsList = () => {
    if (apiPermissionsData.length > 0) {
      return apiPermissionsData.map(menuGroup => ({
        id: menuGroup.perMenuId,
        name: menuGroup.perMenu,
        description: `Menu: ${menuGroup.perMenu}`
      }));
    }

    return [];
  };

  // Scroll to top when step changes
  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all temporary data
  const clearTemporaryData = () => {
    localStorage.removeItem('accountFormData');
    setFormData({
      step1: {
        password: '',
        confirmPassword: '',
        role: '',
        modules: [],
      },
      step2: {
        permissions: [],
      },
      step3: {
        apiPermissions: [],
      },
    });
    setCurrentStep(1);
    setUserId('');
    setIsRegistrationComplete(false);
    setPermissionsData([]);
    setFlattenedPermissions([]);
    setPermissionsError(null);
    setApiPermissionsData([]);
    setFlattenedApiPermissions([]);
    setApiPermissionsError(null);
  };

  // Handle Step 1 submission with API integration
  const handleStep1Submit = async (step1Data: any) => {
    setLoading(true);
    setError(null);

    try {
      if (!employee?.id) {
        throw new Error('Employee ID not found');
      }

      // Prepare registration step 1 data
      const regStep1Data: RegStep1 = {
        employeeId: employee.id as UUID,
        password: step1Data.password,
        roleId: step1Data.role,
        perModules: step1Data.modules.map((id: string) => id as UUID)
      };

      console.log('Calling registration step 1:', regStep1Data);

      // Call registration service step 1
      const result = await registrationService.step1(regStep1Data);

      console.log('Registration step 1 completed:', result);

      // Store user ID for next steps
      setUserId(result.userId);

      // Update form data
      const updatedFormData = {
        ...formData,
        step1: step1Data,
      };

      setFormData(updatedFormData);
      localStorage.setItem('accountFormData', JSON.stringify(updatedFormData));

      // Show success message
      toast.success('Account created successfully! Loading permissions...');

      scrollToTop();
      setCurrentStep(prev => prev + 1);

    } catch (error: any) {
      console.error('Failed to save basic info:', error);
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2 submission with API integration
  const handleStep2Submit = async (step2Data: any) => {
    if (formData.step1.modules.length === 0) {
      const errorMsg = 'Please select at least one module in Step 1 first.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!userId) {
      const errorMsg = 'Account not created. Please complete Step 1 first.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (flattenedPermissions.length === 0 && !isLoadingPermissions) {
      const errorMsg = 'No permissions available for the selected modules.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare registration step 2 data
      const regStep2Data: Omit<RegStep2, 'userId'> = {
        perMenus: step2Data.permissions.map((id: string) => id as UUID)
      };

      console.log('Calling registration step 2:', { userId, ...regStep2Data });

      // Call registration service step 2
      const result = await registrationService.step2({
        userId,
        ...regStep2Data
      });

      console.log('Registration step 2 completed:', result);

      // Update form data
      const updatedFormData = {
        ...formData,
        step2: step2Data,
      };

      setFormData(updatedFormData);
      localStorage.setItem('accountFormData', JSON.stringify(updatedFormData));

      // Show success message
      toast.success('Menu permissions saved successfully! Moving to detailed permissions...');

      scrollToTop();
      setCurrentStep(prev => prev + 1);

    } catch (error: any) {
      console.error('Failed to save permissions:', error);
      const errorMessage = error.message || 'Failed to save menu permissions. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3 submission with API integration
  const handleStep3Submit = async (step3Data: any) => {
    if (formData.step2.permissions.length === 0) {
      const errorMsg = 'Please select at least one permission in Step 2 first.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!userId) {
      const errorMsg = 'Account not found. Please complete previous steps first.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (flattenedApiPermissions.length === 0 && !isLoadingApiPermissions) {
      const errorMsg = 'No API permissions available for the selected menus.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare registration step 3 data
      const regStep3Data: Omit<RegStep3, 'userId'> = {
        perAccess: step3Data.apiPermissions.map((id: string) => id as UUID)
      };

      console.log('Calling registration step 3:', { userId, ...regStep3Data });

      // Call registration service step 3
      const result = await registrationService.step3({
        userId,
        ...regStep3Data
      });

      console.log('Registration step 3 completed:', result);

      // Mark registration as complete
      setIsRegistrationComplete(true);
      setUserId(result.userId);

      // Prepare final data for callback
      const finalData = {
        userId: result.userId,
        employeeId: employee?.id || '',
        employeeCode: getEmployeeCode(),
        employeeName: getEmployeeDisplayName(),
        email: getEmployeeEmail(),
        role: formData.step1.role,
        modules: formData.step1.modules,
        permissions: formData.step2.permissions,
        detailedPermissions: step3Data.apiPermissions,
      };

      console.log('Account creation completed:', finalData);

      // Show success message
      toast.success('Account setup completed successfully!');

      clearTemporaryData();

      onAccountAdded({
        success: true,
        message: 'Account created successfully',
        accountId: result.userId,
        ...finalData
      });

    } catch (error: any) {
      console.error('Failed to create account:', error);
      const errorMessage = error.message || 'Failed to complete account setup. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    scrollToTop();
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      clearTemporaryData();
      onBackToAccounts();
    }
  };

  useEffect(() => {
    const savedFormData = localStorage.getItem('accountFormData');

    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }

    scrollToTop();
  }, []);

  // Show success message when registration is complete
  if (isRegistrationComplete && userId) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Created Successfully!</h2>
          <p className="text-gray-500 mb-6">The account has been created with all permissions configured.</p>
          <button
            onClick={onBackToAccounts}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header with steps */}
      <AddAccountStepHeader
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) {
            scrollToTop();
            setCurrentStep(step);
          }
        }}
      />

      {/* Module Selection Info */}
      {currentStep === 2 && formData.step1.modules.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Showing permissions for <span className="font-semibold">{formData.step1.modules.length}</span> selected module(s)
          </p>
        </div>
      )}

      {/* Menu Selection Info */}
      {currentStep === 3 && formData.step2.permissions.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Showing API permissions for <span className="font-semibold">{formData.step2.permissions.length}</span> selected menu(s)
          </p>
        </div>
      )}

      {/* Permissions API Error */}
      {permissionsError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-700 text-sm">
            {permissionsError}
          </p>
        </div>
      )}

      {/* API Permissions Error */}
      {apiPermissionsError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-700 text-sm">
            {apiPermissionsError}
          </p>
        </div>
      )}

      {/* Loading state for permissions (Step 2) */}
      {currentStep === 2 && isLoadingPermissions && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-blue-700">Loading permissions for selected modules...</span>
          </div>
        </div>
      )}

      {/* Loading state for API permissions (Step 3) */}
      {currentStep === 3 && isLoadingApiPermissions && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-blue-700">Loading API permissions for selected menus...</span>
          </div>
        </div>
      )}

      {/* No permissions warning (Step 2) */}
      {currentStep === 2 && !isLoadingPermissions && flattenedPermissions.length === 0 && formData.step1.modules.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            No permissions found for the selected modules.
          </p>
        </div>
      )}

      {/* No API permissions warning (Step 3) */}
      {currentStep === 3 && !isLoadingApiPermissions && flattenedApiPermissions.length === 0 && formData.step2.permissions.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            No API permissions found for the selected menus.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <AccountBasicInfoStep
              key="step1"
              initialData={formData.step1}
              onSubmit={handleStep1Submit}
              onBack={handleBack}
              isLoading={loading}
              employee={{
                id: employee?.id || '',
                name: getEmployeeDisplayName(),
                employeeCode: getEmployeeCode(),
                email: getEmployeeEmail(),
              }}
            />
          )}

          {currentStep === 2 && (
            <MainPermissionsStep
              key="step2"
              initialData={formData.step2}
              onSubmit={handleStep2Submit}
              onBack={handleBack}
              isLoading={loading || isLoadingPermissions}
              permissions={getPermissionsForStep2()}
              selectedModules={formData.step1.modules}
            />
          )}

          {currentStep === 3 && (
            <ApiPermissionsStep
              key="step3"
              initialData={formData.step3}
              onSubmit={handleStep3Submit}
              onBack={handleBack}
              isLoading={loading || isLoadingApiPermissions}
              apiPermissions={getFilteredDetailedPermissions()}
              selectedPermissions={formData.step2.permissions}
              mainPermissionsList={getMainPermissionsList()}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};