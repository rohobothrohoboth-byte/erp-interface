import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Award,
  Globe,
  Heart,
  Users,
  Shield
} from 'lucide-react';
import { ProfilePictureUpload } from '../../AddEmployee/steps/ProfileUpload';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Gender, EmpType, EmpNature, WorkArrangement } from '../../../../../types/hr/enum';
import type { UUID } from 'crypto';
import { amharicRegex } from '../../../../../utils/amharic-regex';
import List from '../../../../List/list';
import { hrmmNamesApi } from '../../../../../services/List/hrmmNames/hrmmNames.api';
import type { ListItem } from '../../../../../types/List/list';
import type { NameListDto } from '../../../../../types/hr/NameListDto';
import type { NameListItem } from '../../../../../types/NameList/nameList';
import { jgStepService } from '../../../../../services/core/settings/ModHrm/JgStepService';
import type { EmpModBasicDto } from '../../../../../types/hr/employee/empModDto';

interface BasicInfoStepProps {
  data: Partial<EmpModBasicDto>;
  onNext: (data: EmpModBasicDto) => void;
  onBack: () => void;
  loading?: boolean;
  isEditMode?: boolean;
  initialDepartmentName?: string;
  initialPositionName?: string;
  initialBranchName?: string;
  initialJobGradeName?: string;
}

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  firstNameAm: yup.string().required('First name (Amharic) is required'),
  middleName: yup.string().required('Middle name is required'),
  middleNameAm: yup.string().required('Middle name (Amharic) is required'),
  lastName: yup.string().required('Last name is required'),
  lastNameAm: yup.string().required('Last name (Amharic) is required'),
  nationality: yup.string().required('Nationality is required'),
  gender: yup.string().required('Gender is required'),
  employmentDate: yup.string().required('Employment date is required'),
  branchId: yup.string().required('Branch is required'),
  jobGradeId: yup.string().required('Job grade is required'),
  positionId: yup.string().required('Position is required'),
  departmentId: yup.string().required('Department is required'),
  employmentType: yup.string().required('Employment type is required'),
  employmentNature: yup.string().required('Employment nature is required'),
});

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
                                                              data,
                                                              onNext,
                                                              loading = false,
                                                              isEditMode = false,
                                                              initialDepartmentName = '',
                                                              initialPositionName = '',
                                                              initialBranchName = '',
                                                              initialJobGradeName = '',
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  const getDefaultEmploymentDate = () => {
    return data.employmentDate || new Date().toISOString().split('T')[0];
  };

  const EMPTY_UUID = '00000000-0000-0000-0000-000000000000' as UUID;

  const formik = useFormik<EmpModBasicDto>({
    initialValues: {
      firstName: data.firstName || '',
      firstNameAm: data.firstNameAm || '',
      middleName: data.middleName || '',
      middleNameAm: data.middleNameAm || '',
      lastName: data.lastName || '',
      lastNameAm: data.lastNameAm || '',
      nationality: data.nationality || '',
      gender: data.gender || '' as Gender,
      employmentDate: getDefaultEmploymentDate(),
      branchId: data.branchId ?? EMPTY_UUID,
      jobGradeId: data.jobGradeId ?? EMPTY_UUID,
      positionId: data.positionId ?? EMPTY_UUID,
      departmentId: data.departmentId ?? EMPTY_UUID,
      jgStepId: data.jgStepId ?? EMPTY_UUID,
      employmentType: data.employmentType || '' as EmpType,
      employmentNature: data.employmentNature || '' as EmpNature,
      workArrangement: data.workArrangement || '' as WorkArrangement,
      file: data.file || null,
      id: data.id ?? EMPTY_UUID,
      rowVersion: data.rowVersion ?? '',
      isDeleted: data.isDeleted ?? false,
    },
    validationSchema,
    enableReinitialize: true,
    validateOnMount: false,
    onSubmit: async (values) => {
      setSubmitError(null);
      scrollToTop();
      onNext(values);
    },
  });

  // Fetch branches when component mounts
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const branchesData = await hrmmNamesApi.getBranchComp();
        setBranches(branchesData);

        if (!formik.values.branchId && branchesData.length > 0) {
          const match = initialBranchName
              ? branchesData.find(b => b.name.toLowerCase() === initialBranchName.toLowerCase())
              : null;
          formik.setFieldValue('branchId', match ? match.id : branchesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setSubmitError('Failed to load branches');
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // Fetch departments when branch changes
  useEffect(() => {
    const fetchDepartmentsByBranch = async () => {
      if (!formik.values.branchId) {
        setDepartments([]);
        return;
      }
      try {
        setLoadingDepartments(true);
        const data = await hrmmNamesApi.getBranchDepartmentNames(formik.values.branchId);
        const mapped: NameListItem[] = data.map(d => ({ id: d.id, name: d.dept }));
        setDepartments(mapped);

        if (!formik.values.departmentId && mapped.length > 0) {
          const match = initialDepartmentName
              ? mapped.find(d => d.name.toLowerCase() === initialDepartmentName.toLowerCase())
              : null;
          formik.setFieldValue('departmentId', match ? match.id : mapped[0].id);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setSubmitError('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartmentsByBranch();
  }, [formik.values.branchId]);

  // Fetch positions when department changes
  useEffect(() => {
    const fetchPositionsByDepartment = async () => {
      if (!formik.values.departmentId) {
        setPositions([]);
        return;
      }
      try {
        setLoadingPositions(true);
        formik.setFieldValue('positionId', '');
        const positionsData = await hrmmNamesApi.getDepartmentPositions(formik.values.departmentId);
        setPositions(positionsData);

        if (positionsData.length > 0) {
          const match = initialPositionName
              ? positionsData.find(p => p.name.toLowerCase() === initialPositionName.toLowerCase())
              : null;
          formik.setFieldValue('positionId', match ? match.id : positionsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
        setSubmitError('Failed to load positions');
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    };
    fetchPositionsByDepartment();
  }, [formik.values.departmentId]);

  // Fetch job grades
  useEffect(() => {
    const fetchJobGrades = async () => {
      try {
        setLoadingJobGrades(true);
        const jobGradesData = await hrmmNamesApi.getAllJobGradeNames();
        setJobGrades(jobGradesData);

        if (!formik.values.jobGradeId && jobGradesData.length > 0) {
          const match = initialJobGradeName
              ? jobGradesData.find(j => j.name.toLowerCase() === initialJobGradeName.toLowerCase())
              : null;
          formik.setFieldValue('jobGradeId', match ? match.id : jobGradesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching job grades:', error);
        setSubmitError('Failed to load job grades');
      } finally {
        setLoadingJobGrades(false);
      }
    };
    fetchJobGrades();
  }, []);

  // Fetch job grade steps
  useEffect(() => {
    if (!formik.values.jobGradeId) return;
    const fetchJobGradeSteps = async () => {
      try {
        setLoadingJobGradeSteps(true);
        const jobGradeStepsData = await jgStepService.getJgStepsByJobGrade(formik.values.jobGradeId);
        setJobGradeSteps(jobGradeStepsData);
        if (jobGradeStepsData.length > 0 && !formik.values.jgStepId) {
          formik.setFieldValue('jgStepId', jobGradeStepsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching job grade steps:", error);
        setSubmitError("Failed to load job grade steps");
        setJobGradeSteps([]);
      } finally {
        setLoadingJobGradeSteps(false);
      }
    };
    fetchJobGradeSteps();
  }, [formik.values.jobGradeId]);

  const branchListItems: ListItem[] = branches.map(branch => ({ id: branch.id, name: branch.name }));
  const departmentListItems: ListItem[] = departments.map(dept => ({ id: dept.id, name: dept.name }));
  const positionListItems: ListItem[] = positions.map(position => ({ id: position.id, name: position.name }));
  const jobGradeListItems: ListItem[] = jobGrades.map(grade => ({ id: grade.id, name: grade.name }));
  const jobGradeStepsListItems: ListItem[] = jobGradeSteps.map(steps => ({ id: steps.id, name: steps.name }));

  const handleBranchSelect = (item: ListItem) => {
    formik.setFieldValue('branchId', item.id);
    if (submitError && formik.errors.branchId) setSubmitError(null);
  };

  const handleDepartmentSelect = (item: ListItem) => {
    formik.setFieldValue('departmentId', item.id);
    if (submitError && formik.errors.departmentId) setSubmitError(null);
  };

  const handlePositionSelect = (item: ListItem) => {
    formik.setFieldValue('positionId', item.id);
    if (submitError && formik.errors.positionId) setSubmitError(null);
  };

  const handleJobGradeSelect = (item: ListItem) => {
    formik.setFieldValue('jobGradeId', item.id);
    if (submitError && formik.errors.jobGradeId) setSubmitError(null);
  };

  const handleJobGradeStepSelect = (item: ListItem) => {
    formik.setFieldValue('jgStepId', item.id);
    if (submitError && formik.errors.jgStepId) setSubmitError(null);
  };

  const handleAmharicInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value;
    if (value === '' || amharicRegex.test(value)) {
      formik.setFieldValue(fieldName, value);
    }
  };

  const handleProfilePictureSelect = async (file: File) => {
    try {
      formik.setFieldValue('file', file);
    } catch (error) {
      console.error('Error processing image:', error);
      setSubmitError('Failed to process the image. Please try again.');
    }
  };

  const handleProfilePictureRemove = () => {
    formik.setFieldValue('file', null);
  };

  const getErrorMessage = (fieldName: string): string => {
    const error = formik.errors[fieldName as keyof typeof formik.errors];
    const touched = formik.touched[fieldName as keyof typeof formik.touched];
    if (touched && error) return typeof error === 'string' ? error : 'Invalid value';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    scrollToTop();
    formik.handleSubmit();
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
      >
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

        {/* Error Display */}
        <AnimatePresence>
          {submitError && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                  <button
                      onClick={() => setSubmitError(null)}
                      className="text-red-700 hover:text-red-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
                <p className="text-sm text-slate-500">Basic personal and identification details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Amharic Names */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  ስም <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="firstNameAm"
                      value={formik.values.firstNameAm}
                      onChange={(e) => handleAmharicInputChange(e, "firstNameAm")}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                          getErrorMessage("firstNameAm") ? "border-red-500" : "border-slate-200"
                      }`}
                      placeholder="አየለ"
                      disabled={loading}
                  />
                </div>
                {getErrorMessage("firstNameAm") && <p className="text-red-500 text-xs">{getErrorMessage("firstNameAm")}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  የአባት ስም <span className="text-red-500">*</span>
                </label>
                <Input
                    name="middleNameAm"
                    value={formik.values.middleNameAm}
                    onChange={(e) => handleAmharicInputChange(e, "middleNameAm")}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        getErrorMessage("middleNameAm") ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="በቀለ"
                    disabled={loading}
                />
                {getErrorMessage("middleNameAm") && <p className="text-red-500 text-xs">{getErrorMessage("middleNameAm")}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  የአያት ስም <span className="text-red-500">*</span>
                </label>
                <Input
                    name="lastNameAm"
                    value={formik.values.lastNameAm}
                    onChange={(e) => handleAmharicInputChange(e, "lastNameAm")}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        getErrorMessage("lastNameAm") ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="ዮሐንስ"
                    disabled={loading}
                />
                {getErrorMessage("lastNameAm") && <p className="text-red-500 text-xs">{getErrorMessage("lastNameAm")}</p>}
              </div>

              {/* English Names */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        getErrorMessage("firstName") ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="John"
                    disabled={loading}
                />
                {getErrorMessage("firstName") && <p className="text-red-500 text-xs">{getErrorMessage("firstName")}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Middle Name <span className="text-red-500">*</span>
                </label>
                <Input
                    name="middleName"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        getErrorMessage("middleName") ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="Michael"
                    disabled={loading}
                />
                {getErrorMessage("middleName") && <p className="text-red-500 text-xs">{getErrorMessage("middleName")}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        getErrorMessage("lastName") ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="Doe"
                    disabled={loading}
                />
                {getErrorMessage("lastName") && <p className="text-red-500 text-xs">{getErrorMessage("lastName")}</p>}
              </div>

              {/* Additional Personal Info */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Gender <span className="text-red-500">*</span></label>
                <Select value={formik.values.gender} onValueChange={(value: Gender) => formik.setFieldValue("gender", value)} disabled={loading}>
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(Gender).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Nationality <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="nationality"
                      value={formik.values.nationality}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Ethiopian"
                      disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Employment Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      name="employmentDate"
                      type="date"
                      value={formik.values.employmentDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      disabled={loading}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Employment Details Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Employment Details</h3>
                <p className="text-sm text-slate-500">Job and employment information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Branch <span className="text-red-500">*</span></label>
                <List
                    items={branchListItems}
                    selectedValue={formik.values.branchId}
                    onSelect={handleBranchSelect}
                    placeholder="Select a branch"
                    disabled={loadingBranches || loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Department <span className="text-red-500">*</span></label>
                <List
                    items={departmentListItems}
                    selectedValue={formik.values.departmentId}
                    onSelect={handleDepartmentSelect}
                    placeholder={departments.length === 0 ? "No departments" : "Select a department"}
                    disabled={loadingDepartments || loading || departments.length === 0}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Position <span className="text-red-500">*</span></label>
                <List
                    items={positionListItems}
                    selectedValue={formik.values.positionId}
                    onSelect={handlePositionSelect}
                    placeholder={!formik.values.departmentId ? "Select department first" : "Select a position"}
                    disabled={loadingPositions || loading || !formik.values.departmentId || positions.length === 0}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Job Grade <span className="text-red-500">*</span></label>
                <List
                    items={jobGradeListItems}
                    selectedValue={formik.values.jobGradeId}
                    onSelect={handleJobGradeSelect}
                    placeholder="Select a job grade"
                    disabled={loadingJobGrades || loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Job Grade Step <span className="text-red-500">*</span></label>
                <List
                    items={jobGradeStepsListItems}
                    selectedValue={formik.values.jgStepId}
                    onSelect={handleJobGradeStepSelect}
                    placeholder="Select a step"
                    disabled={loadingJobGradeSteps || loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Employment Type <span className="text-red-500">*</span></label>
                <Select value={formik.values.employmentType} onValueChange={(value: EmpType) => formik.setFieldValue("employmentType", value)} disabled={loading}>
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EmpType).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Employment Nature <span className="text-red-500">*</span></label>
                <Select value={formik.values.employmentNature} onValueChange={(value: EmpNature) => formik.setFieldValue("employmentNature", value)} disabled={loading}>
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl">
                    <SelectValue placeholder="Select Nature" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EmpNature).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Work Arrangement <span className="text-red-500">*</span></label>
                <Select value={formik.values.workArrangement} onValueChange={(value: WorkArrangement) => formik.setFieldValue("workArrangement", value)} disabled={loading}>
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl">
                    <SelectValue placeholder="Select Arrangement" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WorkArrangement).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Profile Picture Section */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Profile Picture</h3>
                <p className="text-sm text-slate-500">Upload a photo for employee identification</p>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <div className="w-64 h-64">
                <ProfilePictureUpload
                    profilePicture={formik.values.file ?? null}
                    onProfilePictureSelect={handleProfilePictureSelect}
                    onProfilePictureRemove={handleProfilePictureRemove}
                    size="large"
                />
              </div>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end pt-6 border-t border-slate-200"
          >
            <button
                type="submit"
                disabled={loading}
                className="group px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
              ) : (
                  <>
                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {isEditMode ? "Save Changes" : "Save & Continue"}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Footer Stats */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center items-center gap-6 pt-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Data encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Secure connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Auto-save enabled</span>
          </div>
        </motion.div>
      </motion.div>
  );
};