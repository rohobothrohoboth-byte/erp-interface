// src/components/hr/employee/AddEmployee/steps/BasicInfoStep.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  User,
  Briefcase,
  MapPin,
  Camera,
  ChevronRight,
  AlertCircle,
  Building2,
  RefreshCw,
  Loader2,
  Shield,
  CheckCircle
} from 'lucide-react';
import { ProfilePictureUpload } from '@/modules/hr/components/employee/AddEmployee/steps/ProfileUpload';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import {
  Gender,
  EmpType,
  EmpNature,
  WorkArrangement,
  MaritalStat,
  AddressType
} from '@/modules/hr/types/enum';
import type { Step1Dto, UUID } from '@/modules/hr/types/employee/empAddDto';
import { amharicRegex } from '@/shared/utils/amharic-regex';
import List from '@/modules/list/components/list';
import { hrmmNamesApi } from '@/modules/list/services/hrmmNames/hrmmNames.api';
import { getAllEmployees } from '@/modules/hr/services/employee/emp.api';
import type { ListItem } from '@/modules/list/types/list';
import type { NameListDto } from '@/modules/hr/types/NameListDto';
import type { NameListItem } from '@/modules/list/types/NameList/nameList';
import { jgStepService } from '@/modules/core/services/settings/ModHrm/JgStepService';
import { zodValidate } from '@/modules/hr/schemas/employee/validateSchema';
import { basicInfoSchema } from '@/modules/hr/schemas/employee/basicInfoSchema';
import { useDataScope } from '@/shared/hooks/useDataScope';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface BasicInfoStepProps {
  data: Partial<Step1Dto & { branchId: UUID }>;
  onNext: (data: Step1Dto & { branchId: UUID }) => void;
  onBack: () => void;
  loading?: boolean;
}

// ============================================================
// FIELD COMPONENT
// ============================================================

const Field = ({
                 label,
                 labelAm,
                 error,
                 required,
                 children,
                 description,
                 isLoading
               }: {
  label: string;
  labelAm?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {labelAm && (
            <span className="text-slate-400 dark:text-slate-500 ml-1 text-xs font-normal">
          / {labelAm}
        </span>
        )}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {description && (
            <span className="text-slate-400 dark:text-slate-500 ml-1 text-xs font-normal">
          ({description})
        </span>
        )}
      </label>
      <div className={isLoading ? 'opacity-60 pointer-events-none' : ''}>
        {children}
      </div>
      {error && (
          <p className="text-red-500 text-xs flex items-center gap-1 mt-1 animate-fadeIn">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
      )}
    </div>
);

// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({
                         icon,
                         title,
                         subtitle,
                         gradient
                       }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
}) => (
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
                                                              data,
                                                              onNext,
                                                              loading = false
                                                            }) => {
  const { t } = useLanguage();
  const {
    branchId: userBranchId,
    branchName,
    branchNameAm,
    isLoading: scopeLoading
  } = useDataScope();

  // Refs
  const branchesFetchedRef = useRef(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const isSettingField = useRef(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // State
  const [allBranches, setAllBranches] = useState<NameListItem[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<NameListItem[]>([]);
  const [departments, setDepartments] = useState<NameListItem[]>([]);
  const [positions, setPositions] = useState<NameListDto[]>([]);
  const [jobGrades, setJobGrades] = useState<NameListItem[]>([]);
  const [jobGradeSteps, setJobGradeSteps] = useState<NameListItem[]>([]);
  // Direct-boss (reports-to) candidates: employees of the selected department.
  const [managers, setManagers] = useState<ListItem[]>([]);

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingJobGrades, setLoadingJobGrades] = useState(false);
  const [loadingJobGradeSteps, setLoadingJobGradeSteps] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // ============================================================
  // DEFAULT VALUES
  // ============================================================

  const getDefaultEmploymentDate = () =>
      data.employmentDate || new Date().toISOString().split('T')[0];

  const defaultBranchId = useMemo(() => {
    if (userBranchId) return userBranchId;
    if (data.branchId) return data.branchId;
    return '';
  }, [userBranchId, data.branchId]);

  // ============================================================
  // FORMIK
  // ============================================================

  const formik = useFormik<Step1Dto & { branchId: UUID }>({
    initialValues: {
      firstName: data.firstName || '',
      firstNameAm: data.firstNameAm || '',
      middleName: data.middleName || '',
      middleNameAm: data.middleNameAm || '',
      lastName: data.lastName || '',
      lastNameAm: data.lastNameAm || '',
      nationality: data.nationality || '',
      gender: data.gender || '0' as Gender,
      birthDate: data.birthDate || '',
      maritalStatus: data.maritalStatus || '0' as MaritalStat,
      employmentDate: getDefaultEmploymentDate(),
      branchId: defaultBranchId as UUID,
      jobGradeId: data.jobGradeId || '' as UUID,
      jgStepId: data.jgStepId || '' as UUID,
      positionId: data.positionId || '' as UUID,
      departmentId: data.departmentId || '' as UUID,
      reportsToId: data.reportsToId ?? null,
      employmentType: data.employmentType || '0' as EmpType,
      employmentNature: data.employmentNature || '0' as EmpNature,
      workArrangement: data.workArrangement || '0' as WorkArrangement,
      addressType: data.addressType || '0' as AddressType,
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
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setSubmitError(null);
      setSubmitAttempted(true);

      // ✅ Manually validate all fields
      const errors = basicInfoSchema.safeParse(values);
      if (!errors.success) {
        // Mark all fields as touched to show errors
        const allFields = Object.keys(formik.values);
        allFields.forEach(field => {
          formik.setFieldTouched(field, true);
        });
        // Show toast with error count
        const errorCount = errors.error.errors.length;
        toast.error(`Please fix ${errorCount} validation error(s)`);
        return;
      }

      try {
        onNext({
          ...values,
          employmentDate: new Date(values.employmentDate).toISOString()
        });
      } catch (error) {
        setSubmitError(
            error instanceof Error ? error.message : 'Failed to save. Please try again.'
        );
        toast.error('Failed to save basic information');
      }
    },
  });

  // ============================================================
  // GET ERROR MESSAGE - Shows errors on submit attempt
  // ============================================================

  const getErrorMessage = (field: string): string => {
    const err = formik.errors[field as keyof typeof formik.errors];
    const isTouched = formik.touched[field as keyof typeof formik.touched];
    if ((isTouched || submitAttempted) && typeof err === 'string') {
      return err;
    }
    return '';
  };

  // ============================================================
  // FETCH BRANCHES
  // ============================================================

  useEffect(() => {
    if (branchesFetchedRef.current || scopeLoading) return;

    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        setBranchError(null);
        setFetchAttempted(true);

        const branchesData = await hrmmNamesApi.getBranchComp();
        const branchesArray = Array.isArray(branchesData) ? branchesData : [];
        setAllBranches(branchesArray);

        let filtered: NameListItem[] = [];
        if (userBranchId) {
          filtered = branchesArray.filter(branch => branch.id === userBranchId);
          if (filtered.length === 0) filtered = branchesArray;
        } else {
          filtered = branchesArray;
        }

        setFilteredBranches(filtered);

        if (!isSettingField.current) {
          isSettingField.current = true;
          if (userBranchId) {
            formik.setFieldValue('branchId', userBranchId);
          } else if (filtered.length > 0 && !formik.values.branchId) {
            formik.setFieldValue('branchId', filtered[0].id);
          } else {
            setBranchError('You do not have access to any branches. Please contact administrator.');
          }
          isSettingField.current = false;
        }

        branchesFetchedRef.current = true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to load branches';
        setBranchError(msg);
        setAllBranches([]);
        setFilteredBranches([]);
        toast.error('Failed to load branches');
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userBranchId, scopeLoading]);

  // ============================================================
  // FETCH DEPARTMENTS
  // ============================================================

  useEffect(() => {
    if (!formik.values.branchId || loadingDepartments) return;

    const fetchDepts = async () => {
      try {
        setLoadingDepartments(true);
        if (!formik.values.departmentId) {
          formik.setFieldValue('departmentId', '');
        }
        const data = await hrmmNamesApi.getBranchDepartmentNames(formik.values.branchId);
        const mapped: NameListItem[] = data.map(d => ({
          id: d.id,
          name: d.dept || d.name || 'Unnamed Department'
        }));
        setDepartments(mapped);

        if (!isSettingField.current && mapped.length > 0 && !formik.values.departmentId) {
          isSettingField.current = true;
          formik.setFieldValue('departmentId', mapped[0].id);
          isSettingField.current = false;
        }
      } catch (error) {
        setDepartments([]);
        toast.error('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.branchId]);

  // ============================================================
  // FETCH POSITIONS
  // ============================================================

  useEffect(() => {
    if (!formik.values.departmentId || loadingPositions) return;

    const fetchPos = async () => {
      try {
        setLoadingPositions(true);
        if (!formik.values.positionId) {
          formik.setFieldValue('positionId', '');
        }
        const data = await hrmmNamesApi.getDepartmentPositions(formik.values.departmentId);
        setPositions(data);

        if (!isSettingField.current && data.length > 0 && !formik.values.positionId) {
          isSettingField.current = true;
          formik.setFieldValue('positionId', data[0].id);
          isSettingField.current = false;
        }
      } catch (error) {
        setPositions([]);
        toast.error('Failed to load positions');
      } finally {
        setLoadingPositions(false);
      }
    };
    fetchPos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.departmentId]);

  // ============================================================
  // FETCH REPORTS-TO CANDIDATES (department's employees: head / vice-head / peers)
  // ============================================================

  useEffect(() => {
    const deptId = formik.values.departmentId;
    if (!deptId) {
      setManagers([]);
      if (formik.values.reportsToId) formik.setFieldValue('reportsToId', null);
      return;
    }

    let cancelled = false;
    const fetchManagers = async () => {
      try {
        setLoadingManagers(true);
        const all = await getAllEmployees();
        const inDept = all
          .filter((e) => String(e.departmentId ?? '') === String(deptId))
          .map<ListItem>((e) => ({
            id: String(e.id),
            name: `${e.empFullName}${e.code ? ` (${e.code})` : ''}${e.position ? ` — ${e.position}` : ''}`,
          }));
        if (cancelled) return;
        setManagers(inDept);
        // Clear a stale selection that isn't part of the newly selected department.
        if (formik.values.reportsToId && !inDept.some((m) => m.id === String(formik.values.reportsToId))) {
          formik.setFieldValue('reportsToId', null);
        }
      } catch {
        if (!cancelled) setManagers([]);
      } finally {
        if (!cancelled) setLoadingManagers(false);
      }
    };
    fetchManagers();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.departmentId]);

  // ============================================================
  // FETCH JOB GRADES
  // ============================================================

  useEffect(() => {
    if (loadingJobGrades) return;

    const fetch = async () => {
      try {
        setLoadingJobGrades(true);
        const data = await hrmmNamesApi.getAllJobGradeNames();
        setJobGrades(data);

        if (!isSettingField.current && data.length > 0 && !formik.values.jobGradeId) {
          isSettingField.current = true;
          formik.setFieldValue('jobGradeId', data[0].id);
          isSettingField.current = false;
        }
      } catch (error) {
        setJobGrades([]);
        toast.error('Failed to load job grades');
      } finally {
        setLoadingJobGrades(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // FETCH JOB GRADE STEPS
  // ============================================================

  useEffect(() => {
    if (!formik.values.jobGradeId || loadingJobGradeSteps) return;

    const fetch = async () => {
      try {
        setLoadingJobGradeSteps(true);
        const data = await jgStepService.getJgStepsByJobGrade(formik.values.jobGradeId);
        setJobGradeSteps(data);

        if (!isSettingField.current && data.length > 0 && !formik.values.jgStepId) {
          isSettingField.current = true;
          formik.setFieldValue('jgStepId', data[0].id);
          isSettingField.current = false;
        }
      } catch (error) {
        setJobGradeSteps([]);
        toast.error('Failed to load job grade steps');
      } finally {
        setLoadingJobGradeSteps(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.jobGradeId]);

  // ============================================================
  // LIST ITEMS
  // ============================================================

  const branchListItems: ListItem[] = filteredBranches.map(b => ({
    id: b.id,
    name: b.name || b.nameAm || 'Unnamed Branch',
    nameAm: b.nameAm
  }));

  const deptListItems: ListItem[] = departments.map(d => ({
    id: d.id,
    name: d.name || d.nameAm || 'Unnamed Department',
    nameAm: d.nameAm
  }));

  const posListItems: ListItem[] = positions.map(p => ({
    id: p.id,
    name: p.name || p.nameAm || 'Unnamed Position',
    nameAm: p.nameAm
  }));

  const jgListItems: ListItem[] = jobGrades.map(j => ({
    id: j.id,
    name: j.name || j.nameAm || 'Unnamed Grade',
    nameAm: j.nameAm
  }));

  const jgsListItems: ListItem[] = jobGradeSteps.map(s => ({
    id: s.id,
    name: s.name || s.nameAm || 'Unnamed Step',
    nameAm: s.nameAm
  }));

  // ============================================================
  // HANDLERS
  // ============================================================

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('telephone', value);
  };

  const handleProfilePictureSelect = async (file: File) => {
    try {
      formik.setFieldValue('File', file);
      toast.success('Profile picture uploaded');
    } catch {
      setSubmitError(t.failedToProcessImage || 'Failed to process image.');
      toast.error('Failed to upload profile picture');
    }
  };

  const handleProfilePictureRemove = () => {
    formik.setFieldValue('File', null);
    toast.success('Profile picture removed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitAttempted(true);
    formik.handleSubmit();
  };

  const handleRetryBranches = async () => {
    try {
      setLoadingBranches(true);
      setBranchError(null);
      const data = await hrmmNamesApi.getBranchComp();
      const branchesArray = Array.isArray(data) ? data : [];
      setAllBranches(branchesArray);

      let filtered: NameListItem[] = [];
      if (userBranchId) {
        filtered = branchesArray.filter(branch => branch.id === userBranchId);
        if (filtered.length === 0) filtered = branchesArray;
      } else {
        filtered = branchesArray;
      }
      setFilteredBranches(filtered);

      if (!isSettingField.current) {
        isSettingField.current = true;
        if (userBranchId) {
          formik.setFieldValue('branchId', userBranchId);
        } else if (filtered.length > 0 && !formik.values.branchId) {
          formik.setFieldValue('branchId', filtered[0].id);
        }
        isSettingField.current = false;
      }
      toast.success('Branches reloaded successfully');
    } catch (error) {
      setBranchError('Failed to load branches');
      toast.error('Failed to reload branches');
    } finally {
      setLoadingBranches(false);
    }
  };

  // ============================================================
  // RENDER BRANCH SELECT
  // ============================================================

  const renderBranchSelect = () => {
    if (loadingBranches) {
      return (
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
            {t.loading || 'Loading branches...'}
          </span>
          </div>
      );
    }

    if (branchError) {
      return (
          <div className="flex flex-col gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">{branchError}</span>
            </div>
            <button
                type="button"
                onClick={handleRetryBranches}
                className="self-start px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
      );
    }

    if (filteredBranches.length === 0) {
      return (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-600 dark:text-amber-400">
              {fetchAttempted
                  ? 'No branches available for your account'
                  : 'Loading branches...'}
            </span>
            </div>
            {userBranchId && (
                <p className="text-xs text-amber-500 dark:text-amber-400 mt-1 ml-6">
                  Your assigned branch ID: {userBranchId}
                </p>
            )}
          </div>
      );
    }

    if (filteredBranches.length === 1) {
      const branch = filteredBranches[0];
      return (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {branch.nameAm || branch.name}
            </span>
            </div>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 ml-6">
              {t.yourAssignedBranch || 'Your assigned branch'}
            </p>
          </div>
      );
    }

    return (
        <List
            items={branchListItems}
            selectedValue={formik.values.branchId}
            onSelect={(item) => formik.setFieldValue('branchId', item.id)}
            placeholder={t.selectBranch || 'Select branch'}
            disabled={loadingBranches || loading}
        />
    );
  };

  // ============================================================
  // ANIMATION VARIANTS
  // ============================================================

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // ============================================================
  // GET VALIDATION SUMMARY
  // ============================================================

  const validationErrors = formik.errors;
  const hasValidationErrors = Object.keys(validationErrors).length > 0 && submitAttempted;

  // ============================================================
  // RENDER
  // ============================================================

  return (
      <motion.div
          ref={formContainerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
      >
        {/* Validation Error Summary */}
        <AnimatePresence>
          {hasValidationErrors && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                      {t.pleaseFixErrors || 'Please fix the following errors:'}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {Object.entries(validationErrors).map(([field, error]) => {
                        if (typeof error === 'string' && error.length > 0) {
                          const fieldName = field
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase());
                          return (
                              <li key={field} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>{fieldName}:</strong> {error}</span>
                              </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Error */}
        <AnimatePresence>
          {submitError && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ============================================
        PERSONAL INFORMATION
        ============================================ */}
          <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
          >
            <SectionHeader
                icon={<User className="w-5 h-5 text-white" />}
                title={t.personalInformation || 'Personal Information / የግል መረጃ'}
                subtitle={t.basicPersonalDetails || 'Basic personal details / መሰረታዊ የግል መረጃ'}
                gradient="from-blue-500 to-indigo-600"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Amharic Name Fields */}
              <Field
                  label="ስም"
                  labelAm="First Name (Amharic)"
                  required
                  error={getErrorMessage('firstNameAm')}
              >
                <Input
                    name="firstNameAm"
                    value={formik.values.firstNameAm}
                    onChange={(e) => {
                      if (e.target.value === '' || amharicRegex.test(e.target.value)) {
                        formik.setFieldValue('firstNameAm', e.target.value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="አየለ"
                    disabled={loading}
                />
              </Field>

              <Field
                  label="የአባት ስም"
                  labelAm="Middle Name (Amharic)"
                  required
                  error={getErrorMessage('middleNameAm')}
              >
                <Input
                    name="middleNameAm"
                    value={formik.values.middleNameAm}
                    onChange={(e) => {
                      if (e.target.value === '' || amharicRegex.test(e.target.value)) {
                        formik.setFieldValue('middleNameAm', e.target.value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="በቀለ"
                    disabled={loading}
                />
              </Field>

              <Field
                  label="የአያት ስም"
                  labelAm="Last Name (Amharic)"
                  required
                  error={getErrorMessage('lastNameAm')}
              >
                <Input
                    name="lastNameAm"
                    value={formik.values.lastNameAm}
                    onChange={(e) => {
                      if (e.target.value === '' || amharicRegex.test(e.target.value)) {
                        formik.setFieldValue('lastNameAm', e.target.value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="ዮሐንስ"
                    disabled={loading}
                />
              </Field>

              {/* English Name Fields */}
              <Field
                  label="First Name"
                  labelAm="ስም (እንግሊዝኛ)"
                  required
                  error={getErrorMessage('firstName')}
              >
                <Input
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="John"
                    disabled={loading}
                />
              </Field>

              <Field
                  label="Middle Name"
                  labelAm="የአባት ስም (እንግሊዝኛ)"
                  required
                  error={getErrorMessage('middleName')}
              >
                <Input
                    name="middleName"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="Michael"
                    disabled={loading}
                />
              </Field>

              <Field
                  label="Last Name"
                  labelAm="የአያት ስም (እንግሊዝኛ)"
                  required
                  error={getErrorMessage('lastName')}
              >
                <Input
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="Doe"
                    disabled={loading}
                />
              </Field>

              {/* Other Personal Fields */}
              <Field label="Gender" labelAm="ፆታ" required>
                <Select
                    value={formik.values.gender}
                    onValueChange={(v: Gender) => formik.setFieldValue('gender', v)}
                    disabled={loading}
                >
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder={t.selectGender || 'Select Gender'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(Gender).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Nationality" labelAm="ዜግነት" required>
                <Input
                    name="nationality"
                    value={formik.values.nationality}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="Ethiopian"
                    disabled={loading}
                />
              </Field>

              <Field label="Birth Date" labelAm="የትውልድ ቀን" required>
                <Input
                    name="birthDate"
                    type="date"
                    value={formik.values.birthDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    disabled={loading}
                />
              </Field>

              <Field label="Marital Status" labelAm="የጋብቻ ሁኔታ" required>
                <Select
                    value={formik.values.maritalStatus}
                    onValueChange={(v: MaritalStat) => formik.setFieldValue('maritalStatus', v)}
                    disabled={loading}
                >
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder={t.select || 'Select'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MaritalStat).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </motion.div>

          {/* ============================================
        EMPLOYMENT DETAILS
        ============================================ */}
          <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="space-y-6"
          >
            <SectionHeader
                icon={<Briefcase className="w-5 h-5 text-white" />}
                title={t.employmentDetails || 'Employment Details / የስራ መረጃ'}
                subtitle={t.jobAndEmploymentInfo || 'Job and employment information / የስራ እና የቅጥር መረጃ'}
                gradient="from-emerald-500 to-teal-600"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              <Field
                  label="Branch"
                  labelAm="ቅርንጫፍ"
                  required
                  error={getErrorMessage('branchId')}
                  description={
                    userBranchId
                        ? `Assigned: ${branchName || 'Your branch'}`
                        : undefined
                  }
              >
                {renderBranchSelect()}
              </Field>

              <Field label="Department" labelAm="ዲፓርትመንት" required>
                <List
                    items={deptListItems}
                    selectedValue={formik.values.departmentId}
                    onSelect={(item) => formik.setFieldValue('departmentId', item.id)}
                    placeholder={
                      loadingDepartments
                          ? t.loading || 'Loading...'
                          : deptListItems.length === 0
                              ? t.noDepartments || 'No departments'
                              : t.selectDepartment || 'Select department'
                    }
                    disabled={loadingDepartments || loading || deptListItems.length === 0}
                />
              </Field>

              <Field label="Position" labelAm="ሹመት" required>
                <List
                    items={posListItems}
                    selectedValue={formik.values.positionId}
                    onSelect={(item) => formik.setFieldValue('positionId', item.id)}
                    placeholder={
                      loadingPositions
                          ? t.loading || 'Loading...'
                          : !formik.values.departmentId
                              ? t.selectDepartmentFirst || 'Select department first'
                              : posListItems.length === 0
                                  ? t.noPositions || 'No positions'
                                  : t.selectPosition || 'Select position'
                    }
                    disabled={
                        loadingPositions ||
                        loading ||
                        !formik.values.departmentId ||
                        posListItems.length === 0
                    }
                />
              </Field>

              <Field
                  label="Reports To (Direct Boss)"
                  labelAm="ቀጥተኛ ኃላፊ"
                  description="Approvals (e.g. leave) are routed through this person."
              >
                <List
                    items={managers}
                    selectedValue={(formik.values.reportsToId as string) || ''}
                    onSelect={(item) => formik.setFieldValue('reportsToId', item.id || null)}
                    placeholder={
                      loadingManagers
                          ? 'Loading...'
                          : !formik.values.departmentId
                              ? 'Select department first'
                              : managers.length === 0
                                  ? 'No employees in this department yet'
                                  : 'Select or search direct boss'
                    }
                    disabled={loadingManagers || loading || !formik.values.departmentId || managers.length === 0}
                />
              </Field>

              <Field label="Employment Date" labelAm="የቅጥር ቀን" required>
                <Input
                    name="employmentDate"
                    type="date"
                    value={formik.values.employmentDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    disabled={loading}
                />
              </Field>

              <Field label="Job Grade" labelAm="የስራ ደረጃ" required>
                <List
                    items={jgListItems}
                    selectedValue={formik.values.jobGradeId}
                    onSelect={(item) => formik.setFieldValue('jobGradeId', item.id)}
                    placeholder={
                      loadingJobGrades
                          ? t.loading || 'Loading...'
                          : t.selectJobGrade || 'Select job grade'
                    }
                    disabled={loadingJobGrades || loading}
                />
              </Field>

              <Field label="Job Grade Step" labelAm="የስራ ደረጃ እርምጃ" required>
                <List
                    items={jgsListItems}
                    selectedValue={formik.values.jgStepId}
                    onSelect={(item) => formik.setFieldValue('jgStepId', item.id)}
                    placeholder={
                      loadingJobGradeSteps
                          ? t.loading || 'Loading...'
                          : t.selectStep || 'Select step'
                    }
                    disabled={loadingJobGradeSteps || loading}
                />
              </Field>

              <Field label="Employment Type" labelAm="የቅጥር አይነት" required>
                <Select
                    value={formik.values.employmentType}
                    onValueChange={(v: EmpType) => formik.setFieldValue('employmentType', v)}
                    disabled={loading}
                >
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder={t.select || 'Select'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EmpType).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Employment Nature" labelAm="የቅጥር ባህሪ" required>
                <Select
                    value={formik.values.employmentNature}
                    onValueChange={(v: EmpNature) => formik.setFieldValue('employmentNature', v)}
                    disabled={loading}
                >
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder={t.select || 'Select'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EmpNature).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Work Arrangement" labelAm="የስራ አደረጃጀት" required>
                <Select
                    value={formik.values.workArrangement}
                    onValueChange={(v: WorkArrangement) => formik.setFieldValue('workArrangement', v)}
                    disabled={loading}
                >
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder={t.select || 'Select'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WorkArrangement).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </motion.div>

          {/* ============================================
        ADDRESS INFORMATION
        ============================================ */}
          <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="space-y-6"
          >
            <SectionHeader
                icon={<MapPin className="w-5 h-5 text-white" />}
                title={t.addressInformation || 'Address Information / የአድራሻ መረጃ'}
                subtitle={
                    t.contactAndLocationDetails ||
                    'Contact and location details / የእውቂያ እና የአካባቢ መረጃ'
                }
                gradient="from-purple-500 to-pink-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Address Type" labelAm="የአድራሻ አይነት" required>
                <Select
                    value={formik.values.addressType}
                    onValueChange={(v: AddressType) => formik.setFieldValue('addressType', v)}
                    disabled={loading}
                >
                  <SelectTrigger className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder={t.selectType || 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AddressType).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Country" labelAm="ሀገር" required>
                <Input
                    name="country"
                    value={formik.values.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="Ethiopia"
                    disabled={loading}
                />
              </Field>

              <Field label="Region" labelAm="ክልል" required>
                <Input
                    name="region"
                    value={formik.values.region}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="Addis Ababa"
                    disabled={loading}
                />
              </Field>

              <Field label="Telephone" labelAm="ስልክ" required>
                <PhoneInput
                    country={'et'}
                    value={formik.values.telephone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    inputProps={{
                      name: 'telephone',
                      onBlur: formik.handleBlur
                    }}
                    containerClass="w-full"
                    inputClass="!w-full !px-4 !py-2.5 !rounded-xl !border-slate-200 dark:!border-slate-700 dark:!bg-slate-800 dark:!text-white"
                />
              </Field>

              <Field label="Subcity" labelAm="ክፍለ ከተማ" required>
                <Input
                    name="subcity"
                    value={formik.values.subcity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="Kirkos"
                    disabled={loading}
                />
              </Field>

              <Field label="Woreda" labelAm="ወረዳ" required>
                <Input
                    name="woreda"
                    value={formik.values.woreda}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="08"
                    disabled={loading}
                />
              </Field>

              <Field label="House Number" labelAm="የቤት ቁጥር" required>
                <Input
                    name="houseNo"
                    value={formik.values.houseNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="H-123"
                    disabled={loading}
                />
              </Field>

              <Field label="Email" labelAm="ኢሜይል" required>
                <Input
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="example@email.com"
                    disabled={loading}
                />
              </Field>

              <Field label="Zone" labelAm="ዞን">
                <Input
                    name="zone"
                    value={formik.values.zone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="Zone 3"
                    disabled={loading}
                />
              </Field>

              <Field label="Kebele" labelAm="ቀበሌ">
                <Input
                    name="kebele"
                    value={formik.values.kebele}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="09"
                    disabled={loading}
                />
              </Field>

              <Field label="P.O. Box" labelAm="ፖስታ ሳጥን">
                <Input
                    name="poBox"
                    value={formik.values.poBox}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="1234"
                    disabled={loading}
                />
              </Field>

              <Field label="Fax" labelAm="ፋክስ">
                <Input
                    name="fax"
                    value={formik.values.fax}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="+251111223344"
                    disabled={loading}
                />
              </Field>

              <Field label="Website" labelAm="ድረ ገጽ">
                <Input
                    name="website"
                    value={formik.values.website}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    placeholder="https://example.com"
                    disabled={loading}
                />
              </Field>
            </div>
          </motion.div>

          {/* ============================================
        PROFILE PICTURE
        ============================================ */}
          <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="space-y-6"
          >
            <SectionHeader
                icon={<Camera className="w-5 h-5 text-white" />}
                title={t.profilePicture || 'Profile Picture / የመገለጫ ምስል'}
                subtitle={
                    t.uploadPhotoForIdentification ||
                    'Upload a photo for employee identification / ለሰራተኛ መለያ ፎቶ ይስቀሉ'
                }
                gradient="from-amber-500 to-orange-600"
            />

            <div className="flex justify-center py-4">
              <div className="w-64 h-64">
                <ProfilePictureUpload
                    profilePicture={formik.values.File}
                    onProfilePictureSelect={handleProfilePictureSelect}
                    onProfilePictureRemove={handleProfilePictureRemove}
                    size="large"
                />
              </div>
            </div>
          </motion.div>

          {/* ============================================
        SUBMIT BUTTON
        ============================================ */}
          <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.saving || 'Saving...'} / በማስቀመጥ ላይ...
                  </>
              ) : (
                  <>
                    {t.saveAndContinue || 'Save & Continue'} / አስቀምጥ እና ቀጥል
                    <ChevronRight className="w-4 h-4" />
                  </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
  );
};

export default BasicInfoStep;