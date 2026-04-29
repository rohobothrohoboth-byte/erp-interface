import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { ProfilePictureUpload } from './ProfileUpload';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Gender, EmpType, EmpNature, WorkArrangement, MaritalStat, AddressType } from '../../../../../types/hr/enum';
import type { Step1Dto, UUID } from '../../../../../types/hr/employee/empAddDto';
import { amharicRegex } from '../../../../../utils/amharic-regex';
import List from '../../../../List/list';
import { nameListService } from '../../../../../services/List/HrmmNameListService';
import type { ListItem } from '../../../../../types/List/list';
import type { NameListDto } from '../../../../../types/hr/NameListDto';
import type { NameListItem } from '../../../../../types/NameList/nameList';
import { jgStepService } from '../../../../../services/core/settings/ModHrm/JgStepService';
import { zodValidate } from '../../../../../schemas/hr/employee/validateSchema';
import { basicInfoSchema } from '../../../../../schemas/hr/employee/basicInfoSchema';

interface BasicInfoStepProps {
  data: Partial<Step1Dto & { branchId: UUID }>;
  onNext: (data: Step1Dto & { branchId: UUID}) => void;
  onBack: () => void;
  loading?: boolean;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onNext,
  loading = false
}) => {
  const [branches, setBranches] = useState<NameListItem[]>([]);
  const [departments, setDepartments] = useState<NameListItem[]>([]);
  const [positions, setPositions] = useState<NameListDto[]>([]);
  const [jobGrades, setJobGrades] = useState<NameListItem[]>([]);
  const [jobGradeSteps, setJobGradeSteps] = useState<NameListItem[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingJobGrades, setLoadingJobGrades] = useState(false);
  const [loadingJobGradeSteps, setLoadingJobGradeSteps] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [jobGradeError, setJobGradeError] = useState<string | null>(null);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }

    if (document.body) {
      document.body.scrollTop = 0;
    }
  };

  // Set default employment date to today if not provided
  const getDefaultEmploymentDate = () => {
    return data.employmentDate || new Date().toISOString().split('T')[0];
  };

  const formik = useFormik<Step1Dto & { branchId: UUID }>({
    initialValues: {
      firstName: data.firstName || '',
      firstNameAm: data.firstNameAm || '',
      middleName: data.middleName || '',
      middleNameAm: data.middleNameAm || '',
      lastName: data.lastName || '',
      lastNameAm: data.lastNameAm || '',
      nationality: data.nationality || '',
      gender: data.gender || '' as Gender,
      birthDate: data.birthDate || '',
      maritalStatus: data.maritalStatus || '' as MaritalStat,
      employmentDate: getDefaultEmploymentDate(),
      branchId: data.branchId || '' as UUID,
      jobGradeId: data.jobGradeId || '' as UUID,
      jgStepId: data.jgStepId || '' as UUID,
      positionId: data.positionId || '' as UUID,
      departmentId: data.departmentId || '' as UUID,
      employmentType: data.employmentType || '' as EmpType,
      employmentNature: data.employmentNature || '' as EmpNature,
      workArrangement: data.workArrangement || '' as WorkArrangement,
      addressType: data.addressType || '' as AddressType,
            country: data.country || '',
            region: data.region || '',
            subcity: data.subcity || '',
            zone: data.zone || '',
            woreda: data.woreda || '',
            kebele: data.kebele || '',
            houseNo: data.houseNo || '',
            telephone: data.telephone || '',
            poBox: data.poBox || '',
            fax: data.fax || '',
            email: data.email || '',
            website: data.website || '',
      File: data.File || null,
    },
    validate: zodValidate(basicInfoSchema),
    enableReinitialize: true,
    validateOnMount: false, // Disable validation on mount
    onSubmit: async (values) => {
      setSubmitError(null);

      // Prepare the data to send to backend
      const submitData = {
        ...values,
        employmentDate: new Date(values.employmentDate).toISOString(),
      };

      // Scroll to top before calling onNext
      scrollToTop();
      onNext(submitData);
    },
  });

  // Fetch branches when component mounts
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const branchesData = await nameListService.getBranchComp();
        setBranches(branchesData);

        // Auto-select first branch if none is selected and we have branches
        if (!formik.values.branchId && branchesData.length > 0) {
          const firstBranchId = branchesData[0].id;
          formik.setFieldValue('branchId', firstBranchId);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranchError('Failed to load branches. Please refresh.');
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Fetch all departments when component mounts (using nameListService)
  useEffect(() => {
    const fetchAllDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const departmentsData = await nameListService.getAllDepartmentNames();
        setDepartments(departmentsData);

        // Auto-select first department if none is selected and we have departments
        if (!formik.values.departmentId && departmentsData.length > 0) {
          formik.setFieldValue('departmentId', departmentsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartmentError('Failed to load departments. Please refresh.');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchAllDepartments();
  }, []);

  // Fetch positions when department selection changes
  useEffect(() => {
    const fetchPositionsByDepartment = async () => {
      if (!formik.values.departmentId) {
        setPositions([]);
        return;
      }

      try {
        setLoadingPositions(true);
        // Clear current position selection when fetching new positions
        formik.setFieldValue('positionId', '');

        // Use nameListService to get department positions
        const positionsData = await nameListService.getDepartmentPositions(formik.values.departmentId);
        setPositions(positionsData);

        // Auto-select first position if we have positions
        if (positionsData.length > 0) {
          formik.setFieldValue('positionId', positionsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching positions by department:', error);
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositionsByDepartment();
  }, [formik.values.departmentId]);

  // Fetch job grades using nameListService when component mounts
  useEffect(() => {
    const fetchJobGrades = async () => {
      try {
        setLoadingJobGrades(true);
        const jobGradesData = await nameListService.getAllJobGradeNames();
        setJobGrades(jobGradesData);

        if (!formik.values.jobGradeId && jobGradesData.length > 0) {
          formik.setFieldValue('jobGradeId', jobGradesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching job grades:', error);
        setJobGradeError('Failed to load job grades. Please refresh.');
      } finally {
        setLoadingJobGrades(false);
      }
    };

    fetchJobGrades();
  }, []);
  // Fetch job grades using nameListService when component mounts
useEffect(() => {
  if (!formik.values.jobGradeId) return;

  const fetchJobGradeSteps = async () => {
    try {
      setLoadingJobGradeSteps(true);

      const jobGradeStepsData = await jgStepService.getJgStepsByJobGrade(
        formik.values.jobGradeId,
      );

      setJobGradeSteps(jobGradeStepsData);

      if (jobGradeStepsData.length > 0) {
        formik.setFieldValue("jobGradeStepId", jobGradeStepsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching job grade steps:", error);
      setJobGradeSteps([]);
    } finally {
      setLoadingJobGradeSteps(false);
    }
  };

  fetchJobGradeSteps();
}, [formik.values.jobGradeId]);


  // Convert branches to ListItem format
  const branchListItems: ListItem[] = branches.map(branch => ({
    id: branch.id,
    name: branch.name
  }));

  // Convert departments to ListItem format
  const departmentListItems: ListItem[] = departments.map(dept => ({
    id: dept.id,
    name: dept.name
  }));

  // Convert positions to ListItem format
  const positionListItems: ListItem[] = positions.map(position => ({
    id: position.id,
    name: position.name
  }));

  // Convert job grades to ListItem format
  const jobGradeListItems: ListItem[] = jobGrades.map(grade => ({
    id: grade.id,
    name: grade.name
  }));

   const jobGradeStepsListItems: ListItem[] = jobGradeSteps.map(steps => ({
    id: steps.id,
    name: steps.name
  }));

  // Handle branch selection
  const handleBranchSelect = (item: ListItem) => {
    formik.setFieldValue('branchId', item.id);
    if (submitError && formik.errors.branchId) {
      setSubmitError(null);
    }
  };

  // Handle department selection
  const handleDepartmentSelect = (item: ListItem) => {
    formik.setFieldValue('departmentId', item.id);
    if (submitError && formik.errors.departmentId) {
      setSubmitError(null);
    }
  };

  // Handle position selection
  const handlePositionSelect = (item: ListItem) => {
    formik.setFieldValue('positionId', item.id);
    if (submitError && formik.errors.positionId) {
      setSubmitError(null);
    }
  };

  // Handle job grade selection
  const handleJobGradeSelect = (item: ListItem) => {
    formik.setFieldValue('jobGradeId', item.id);
    if (submitError && formik.errors.jobGradeId) {
      setSubmitError(null);
    }
  };

   // Handle job grade step select
  const handleJobGradeStepSelect = (item: ListItem) => {
    formik.setFieldValue('jgStepId', item.id);
    if (submitError && formik.errors.jgStepId) {
      setSubmitError(null);
    }
  };

  // Amharic input handlers
  const handleAmharicInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const value = e.target.value;
    if (value === '' || amharicRegex.test(value)) {
      formik.setFieldValue(fieldName, value);
    }
  };

  // Handle profile picture selection
  const handleProfilePictureSelect = async (file: File) => {
    try {
      formik.setFieldValue('File', file);
    } catch (error) {
      console.error('Error processing image:', error);
      setSubmitError('Failed to process the image. Please try again.');
    }
  };

  const handleProfilePictureRemove = () => {
    formik.setFieldValue('File', null);
  };

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('telephone', value);
  };

  // Helper function to safely get error messages (kept for display purposes only)
  const getErrorMessage = (fieldName: string): string => {
    const error = formik.errors[fieldName as keyof typeof formik.errors];
    const touched = formik.touched[fieldName as keyof typeof formik.touched];

    if (touched && error) {
      return typeof error === 'string' ? error : 'Invalid value';
    }
    return '';
  };

  // Handle form submission without validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Scroll to top before form submission
    scrollToTop();
    formik.handleSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Error Display */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSubmitError(null)}
                className="text-red-800 hover:text-red-900"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-8 bg-linear-to-b from-green-400 to-green-600 rounded-full"></div>
              <h3 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h3>
            </div>
          </div>

          {/* First Name (English) */}
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name (English) *
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                getErrorMessage("firstName")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="John"
              disabled={loading}
            />
            {getErrorMessage("firstName") && (
              <div className="text-red-500 text-xs mt-1">
                {getErrorMessage("firstName")}
              </div>
            )}
          </div>

          {/* ስም */}
          <div className="space-y-2">
            <label
              htmlFor="firstNameAm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ስም *
            </label>
            <Input
              id="firstNameAm"
              name="firstNameAm"
              type="text"
              value={formik.values.firstNameAm}
              onChange={(e) => handleAmharicInputChange(e, "firstNameAm")}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                getErrorMessage("firstNameAm")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="አየለ"
              disabled={loading}
            />
            {getErrorMessage("firstNameAm") && (
              <div className="text-red-500 text-xs mt-1">
                {getErrorMessage("firstNameAm")}
              </div>
            )}
          </div>

          {/* Middle Name (English) */}
          <div className="space-y-2">
            <label
              htmlFor="middleName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Middle Name (English) *
            </label>
            <Input
              id="middleName"
              name="middleName"
              type="text"
              value={formik.values.middleName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                getErrorMessage("middleName")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Michael"
              disabled={loading}
            />
            {getErrorMessage("middleName") && (
              <div className="text-red-500 text-xs mt-1">
                {getErrorMessage("middleName")}
              </div>
            )}
          </div>

          {/* የአባት ስም */}
          <div className="space-y-2">
            <label
              htmlFor="middleNameAm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              የአባት ስም *
            </label>
            <Input
              id="middleNameAm"
              name="middleNameAm"
              type="text"
              value={formik.values.middleNameAm}
              onChange={(e) => handleAmharicInputChange(e, "middleNameAm")}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                getErrorMessage("middleNameAm")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="በቀለ"
              disabled={loading}
            />
            {getErrorMessage("middleNameAm") && (
              <div className="text-red-500 text-xs mt-1">
                {getErrorMessage("middleNameAm")}
              </div>
            )}
          </div>

          {/* Last Name (English) */}
          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name (English) *
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                getErrorMessage("lastName")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Doe"
              disabled={loading}
            />
            {getErrorMessage("lastName") && (
              <div className="text-red-500 text-xs mt-1">
                {getErrorMessage("lastName")}
              </div>
            )}
          </div>

          {/* የአያት ስም */}
          <div className="space-y-2">
            <label
              htmlFor="lastNameAm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              የአያት ስም *
            </label>
            <Input
              id="lastNameAm"
              name="lastNameAm"
              type="text"
              value={formik.values.lastNameAm}
              onChange={(e) => handleAmharicInputChange(e, "lastNameAm")}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                getErrorMessage("lastNameAm")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="ዮሐንስ"
              disabled={loading}
            />
            {getErrorMessage("lastNameAm") && (
              <div className="text-red-500 text-xs mt-1">
                {getErrorMessage("lastNameAm")}
              </div>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender *
            </label>
            <Select
              value={formik.values.gender}
              onValueChange={(value: Gender) =>
                formik.setFieldValue("gender", value)
              }
              disabled={loading}
            >
              <SelectTrigger
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage("gender")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(Gender).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getErrorMessage("gender") && (
              <div className="text-red-500 text-xs mt-1">
                {getErrorMessage("gender")}
              </div>
            )}
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <label
              htmlFor="nationality"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nationality *
            </label>
            <Input
              id="nationality"
              name="nationality"
              type="text"
              value={formik.values.nationality}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                getErrorMessage("nationality")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Ethiopian"
              disabled={loading}
            />
            {getErrorMessage("nationality") && (
              <div className="text-red-500 text-xs mt-1">
                {getErrorMessage("nationality")}
              </div>
            )}
          </div>
{/* Birth Date */}
        <div className="space-y-2">
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date *
          </label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formik.values.birthDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
              getErrorMessage('birthDate') ? "border-red-500" : "border-gray-300"
            }`}
            disabled={loading}
          />
          {getErrorMessage('birthDate') && (
            <div className="text-red-500 text-xs mt-1">{getErrorMessage('birthDate')}</div>
          )}
        </div>

 {/* Marital Status */}
            <div className="space-y-2">
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status *
              </label>
              <Select
                value={formik.values.maritalStatus}
                onValueChange={(value: MaritalStat) => formik.setFieldValue('maritalStatus', value)}
                disabled={loading}
              >
                <SelectTrigger className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage('maritalStatus') ? "border-red-500" : "border-gray-300"
                }`}>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MaritalStat).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage('maritalStatus') && (
                <div className="text-red-500 text-xs mt-1">{getErrorMessage('maritalStatus')}</div>
              )}
            </div>

        </div>

        {/* Employment Details Section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-linear-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">
              Employment Details
            </h3>
          </div>

          {/* Row 1: Branch, Department, Employement Date, Position */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Branch - Using List Component */}
            <div className="space-y-2">
              <List
                items={branchListItems}
                selectedValue={formik.values.branchId}
                onSelect={handleBranchSelect}
                label="Select Branch"
                placeholder="Select a branch"
                disabled={loadingBranches || loading}
              />
              {loadingBranches && (
                <p className="text-sm text-gray-500">Loading branches...</p>
              )}
              {branchError && (
                <p className="text-sm text-amber-600">{branchError}</p>
              )}
              {getErrorMessage("branchId") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("branchId")}
                </div>
              )}
            </div>

            {/* Department - Using List Component */}
            <div className="space-y-2">
              <List
                items={departmentListItems}
                selectedValue={formik.values.departmentId}
                onSelect={handleDepartmentSelect}
                label="Select Department"
                placeholder={
                  departments.length === 0
                    ? "No departments available"
                    : "Select a department"
                }
                disabled={
                  loadingDepartments || loading || departments.length === 0
                }
              />
              {loadingDepartments && (
                <p className="text-sm text-gray-500">Loading departments...</p>
              )}
              {departmentError && (
                <p className="text-sm text-amber-600">{departmentError}</p>
              )}
              {getErrorMessage("departmentId") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("departmentId")}
                </div>
              )}
            </div>

            {/* Position - Using List Component */}
            <div className="space-y-2">
              <List
                items={positionListItems}
                selectedValue={formik.values.positionId}
                onSelect={handlePositionSelect}
                label="Select Position"
                placeholder={
                  !formik.values.departmentId
                    ? "Select a department first"
                    : positions.length === 0
                      ? "No positions available"
                      : "Select a position"
                }
                disabled={
                  loadingPositions ||
                  loading ||
                  !formik.values.departmentId ||
                  positions.length === 0
                }
              />
              {loadingPositions && (
                <p className="text-sm text-gray-500">Loading positions...</p>
              )}
              {formik.values.departmentId &&
                positions.length === 0 &&
                !loadingPositions && (
                  <p className="text-sm text-gray-500">
                    No positions available for this department
                  </p>
                )}
              {getErrorMessage("positionId") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("positionId")}
                </div>
              )}
            </div>

            {/* Employment Date */}
            <div className="space-y-2">
              <label
                htmlFor="employmentDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Employment Date <span className="text-red-500">*</span>
              </label>
              <input
                id="employmentDate"
                name="employmentDate"
                type="date"
                value={formik.values.employmentDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                  getErrorMessage("employmentDate")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={loading}
              />
              {getErrorMessage("employmentDate") && (
                <p className="text-red-500 text-sm mt-1">
                  {getErrorMessage("employmentDate")}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Job Grade, Employment Type, Employment Nature */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Job Grade - Using List Component */}
            <div className="space-y-2">
              <List
                items={jobGradeListItems}
                selectedValue={formik.values.jobGradeId}
                onSelect={handleJobGradeSelect}
                label="Select Job Grade"
                placeholder="Select a job grade"
                disabled={loadingJobGrades || loading}
              />
              {loadingJobGrades && (
                <p className="text-sm text-gray-500">Loading job grades...</p>
              )}
              {jobGradeError && (
                <p className="text-sm text-amber-600">{jobGradeError}</p>
              )}
              {getErrorMessage("jobGradeId") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("jobGradeId")}
                </div>
              )}
            </div>

            {/* Job Grade step - Using List Component */}
            <div className="space-y-2">
              <List
                items={jobGradeStepsListItems}
                selectedValue={formik.values.jgStepId}
                onSelect={handleJobGradeStepSelect}
                label="Select Job Grade Step"
                placeholder="Select a job grade step"
                disabled={loadingJobGradeSteps || loading}
              />
              {loadingJobGradeSteps && (
                <p className="text-sm text-gray-500">
                  Loading job grade steps...
                </p>
              )}
              {getErrorMessage("jgStepId") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("jgStepId")}
                </div>
              )}
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <label
                htmlFor="employmentType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Employment Type *
              </label>
              <Select
                value={formik.values.employmentType}
                onValueChange={(value: EmpType) =>
                  formik.setFieldValue("employmentType", value)
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("employmentType")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <SelectValue placeholder="Select Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EmpType).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage("employmentType") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("employmentType")}
                </div>
              )}
            </div>

            {/* Employment Nature */}
            <div className="space-y-2">
              <label
                htmlFor="employmentNature"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Employment Nature *
              </label>
              <Select
                value={formik.values.employmentNature}
                onValueChange={(value: EmpNature) =>
                  formik.setFieldValue("employmentNature", value)
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("employmentNature")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <SelectValue placeholder="Select Employment Nature" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EmpNature).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage("employmentNature") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("employmentNature")}
                </div>
              )}
            </div>

            {/* Work Arrangement */}
            <div className="space-y-2">
              <label
                htmlFor="employmentNature"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Work Arrangement *
              </label>
              <Select
                value={formik.values.workArrangement}
                onValueChange={(value: WorkArrangement) =>
                  formik.setFieldValue("workArrangement", value)
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                    getErrorMessage("workArrangement")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <SelectValue placeholder="Select Work Arrangement" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WorkArrangement).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage("workArrangement") && (
                <div className="text-red-500 text-xs mt-1">
                  {getErrorMessage("workArrangement")}
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Address Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-8 bg-linear-to-b from-green-400 to-green-600 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Address Information</h3>
                  </div>
        
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Address Type */}
                    <div className="space-y-2">
                      <label htmlFor="addressType" className="block text-sm font-medium text-gray-700 mb-1">
                        Address Type *
                      </label>
                      <Select
          value={formik.values.addressType}
          onValueChange={(value: AddressType) => formik.setFieldValue('addressType', value)}
          disabled={loading}
        >
          <SelectTrigger className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
            getErrorMessage('addressType') ? "border-red-500" : "border-gray-300"
          }`}>
            <SelectValue placeholder="Select address type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AddressType).map(([key, value]) => {
              const isWorkPlace = key === "1" || value === 'Work Place';
              return (
                <SelectItem 
                  key={key} 
                  value={key}
                  disabled={isWorkPlace}
                  className={isWorkPlace ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <div className="flex items-center justify-between">
                    <span>{value}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
                      {getErrorMessage('addressType') && (
                        <div className="text-red-500 text-xs mt-1">{getErrorMessage('addressType')}</div>
                      )}
                    </div>
        
                    {/* Country */}
                    <div className="space-y-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <Input
                        id="country"
                        name="country"
                        value={formik.values.country}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                          getErrorMessage('country') ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Ethiopia"
                        disabled={loading}
                      />
                      {getErrorMessage('country') && (
                        <div className="text-red-500 text-xs mt-1">{getErrorMessage('country')}</div>
                      )}
                    </div>
        
                    {/* Region */}
                    <div className="space-y-2">
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                        Region *
                      </label>
                      <Input
                        id="region"
                        name="region"
                        value={formik.values.region}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-3 py-2 border focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200 ${
                          getErrorMessage('region') ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Addis Ababa"
                        disabled={loading}
                      />
                      {getErrorMessage('region') && (
                        <div className="text-red-500 text-xs mt-1">{getErrorMessage('region')}</div>
                      )}
                    </div>
        
                    {/* Telephone */}
                    <div className="space-y-2">
                      <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telephone *
                      </label>
                      <div className={`w-full border rounded-md transition-colors duration-200 ${
                        getErrorMessage('telephone') ? "border-red-500" : "border-gray-300"
                      }`}>
                        <PhoneInput
                          country={'et'} // Default to Ethiopia
                          value={formik.values.telephone}
                          onChange={handlePhoneChange}
                          disabled={loading}
                          inputProps={{
                            name: "telephone",
                            onBlur: formik.handleBlur,
                            disabled: loading
                          }}
                          inputStyle={{
                            width: '100%',
                            height: '42px',
                            paddingLeft: '48px',
                            outline: 'none',
                            fontSize: '14px',
                            borderRadius: '6px',
                            border: 'none',
                            ...(loading && { backgroundColor: '#f3f4f6', cursor: 'not-allowed' })
                          }}
                          buttonStyle={{
                            border: 'none',
                            borderRight: '1px solid #ccc',
                            borderRadius: '6px 0 0 6px',
                            backgroundColor: '#f8f9fa',
                            ...(loading && { cursor: 'not-allowed' })
                          }}
                          containerStyle={{
                            width: '100%'
                          }}
                          dropdownStyle={{
                            borderRadius: '6px'
                          }}
                        />
                      </div>
                      {getErrorMessage('telephone') && (
                        <div className="text-red-500 text-xs mt-1">{getErrorMessage('telephone')}</div>
                      )}
                    </div>
        
                    {/* Subcity - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="subcity" className="block text-sm font-medium text-gray-700 mb-1">
                        Subcity
                      </label>
                      <Input
                        id="subcity"
                        name="subcity"
                        value={formik.values.subcity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="Kirkos"
                        disabled={loading}
                      />
                    </div>
        
                    {/* Zone - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1">
                        Zone
                      </label>
                      <Input
                        id="zone"
                        name="zone"
                        value={formik.values.zone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="Zone 3"
                        disabled={loading}
                      />
                    </div>
        
                    {/* Woreda - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="woreda" className="block text-sm font-medium text-gray-700 mb-1">
                        Woreda
                      </label>
                      <Input
                        id="woreda"
                        name="woreda"
                        value={formik.values.woreda}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="08"
                        disabled={loading}
                      />
                    </div>
        
                    {/* Kebele - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="kebele" className="block text-sm font-medium text-gray-700 mb-1">
                        Kebele
                      </label>
                      <Input
                        id="kebele"
                        name="kebele"
                        value={formik.values.kebele}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="09"
                        disabled={loading}
                      />
                    </div>
        
                    {/* House Number - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="houseNo" className="block text-sm font-medium text-gray-700 mb-1">
                        House Number
                      </label>
                      <Input
                        id="houseNo"
                        name="houseNo"
                        value={formik.values.houseNo}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="H-123"
                        disabled={loading}
                      />
                    </div>
        
                    {/* P.O. Box - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="poBox" className="block text-sm font-medium text-gray-700 mb-1">
                        P.O. Box
                      </label>
                      <Input
                        id="poBox"
                        name="poBox"
                        value={formik.values.poBox}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="1234"
                        disabled={loading}
                      />
                    </div>
        
                    {/* Fax - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="fax" className="block text-sm font-medium text-gray-700 mb-1">
                        Fax
                      </label>
                      <Input
                        id="fax"
                        name="fax"
                        value={formik.values.fax}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="+251111223344"
                        disabled={loading}
                      />
                    </div>
        
                    {/* Email - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="example@email.com"
                        disabled={loading}
                      />
                    </div>
        
                    {/* Website - Optional */}
                    <div className="space-y-2">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <Input
                        id="website"
                        name="website"
                        value={formik.values.website}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-green-500 focus:outline-2 rounded-md transition-colors duration-200"
                        placeholder="https://example.com"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

        {/* Profile Picture Section - Moved to bottom with increased size */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-linear-to-b from-purple-400 to-purple-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">
              Profile Picture
            </h3>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-80 h-80">
              {" "}
              {/* Increased size */}
              <ProfilePictureUpload
                profilePicture={formik.values.File}
                onProfilePictureSelect={handleProfilePictureSelect}
                onProfilePictureRemove={handleProfilePictureRemove}
                size="large"
              />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading} // Only disable when loading, not based on form validation
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};