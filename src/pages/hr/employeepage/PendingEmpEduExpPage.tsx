// PendingEmpEduExpPage.tsx - Complete fixed version

import { useState, useEffect, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from '../../../i18n/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import PendingEduExpHeader from "../../../components/hr/employee/PendingEduExp/PendingEduExpHeader";
import PendingEduExpSearchFilters from "../../../components/hr/employee/PendingEduExp/PendingEduExpSearchFilters";
import PendingEduExpTable from "../../../components/hr/employee/PendingEduExp/PendingEduExpTable";

import { useEducations } from "../../../services/profile/Education/education.queries";
import { useExperiences } from "../../../services/profile/Experiance/experiance.queries";
import { useEmployees } from "../../../services/hr/employee/emp.queries";
import { dashboardKeys } from "../../../services/hr/dashboard/dashboard.key";
import { educationKeys } from "../../../services/profile/Education/education.keys";
import { experienceKeys } from "../../../services/profile/Experiance/experiance.keys";

import { useUpdateEducationStatus } from "../../../services/profile/Education/education.queries";
import { useUpdateExperienceStatus } from "../../../services/profile/Experiance/experiance.queries";

interface PendingEduExpFilters {
  gender: string;
  department?: string;
  branch?: string;
}

interface PendingRecord {
  id: string;
  employeeId: string;
  empFullName: string;
  empFullNameAm: string;
  code: string;
  gender: string;
  department: string;
  branch: string;
  position: string;
  type: 'education' | 'experience';
  institution?: string;
  fieldOfStudy?: string;
  company?: string;
  positionTitle?: string;
  startDate: string;
  endDate: string;
  status: string;
  dateAdd: string;
  rowVersion?: string;
}

const PendingEmpEduExpPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<PendingEduExpFilters>({
    gender: "",
    department: "",
    branch: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // ============================================================
  // ✅ FETCH DATA
  // ============================================================

  const {
    data: educations = [],
    isLoading: educationsLoading,
    error: educationsError,
    refetch: refetchEducations,
  } = useEducations();

  const {
    data: experiences = [],
    isLoading: experiencesLoading,
    error: experiencesError,
    refetch: refetchExperiences,
  } = useExperiences();

  const {
    data: employees = [],
    isLoading: employeesLoading,
    error: employeesError,
  } = useEmployees();

  const updateEducationStatus = useUpdateEducationStatus();
  const updateExperienceStatus = useUpdateExperienceStatus();

  const loading = educationsLoading || experiencesLoading || employeesLoading;
  const error = educationsError || experiencesError || employeesError;

  // ============================================================
  // ✅ CREATE EMPLOYEE LOOKUP MAP
  // ============================================================

  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp: any) => {
      const empId = emp.id || emp.Id || emp.employeeId || emp.EmployeeId;
      if (empId) {
        map.set(empId, {
          id: empId,
          empFullName: emp.empFullName || emp.EmpFullName ||
              `${emp.firstName || emp.FirstName || ''} ${emp.lastName || emp.LastName || ''}`.trim() || 'Unknown',
          empFullNameAm: emp.empFullNameAm || emp.EmpFullNameAm || '',
          code: emp.code || emp.Code || '',
          gender: emp.gender || emp.Gender || 'N/A',
          department: emp.department || emp.Department || 'N/A',
          branch: emp.branch || emp.Branch || 'N/A',
          position: emp.position || emp.Position || 'N/A',
        });
        map.set(String(empId), map.get(empId));
      }
    });
    return map;
  }, [employees]);

  // ============================================================
  // ✅ COMBINE AND FILTER PENDING RECORDS
  // ============================================================

  const pendingRecords = useMemo(() => {
    const records: PendingRecord[] = [];

    const pendingEducations = educations.filter(
        (edu) => edu.status === '0' || edu.status === 'Pending' || edu.status === 'pending'
    );

    const pendingExperiences = experiences.filter(
        (exp) => exp.status === '0' || exp.status === 'Pending' || exp.status === 'pending'
    );

    pendingEducations.forEach((edu) => {
      const empId = edu.employeeId || edu.EmployeeId || edu.empId || edu.EmpId;
      const emp = empId ? employeeMap.get(empId) : null;

      records.push({
        id: edu.id || edu.Id,
        employeeId: empId || '',
        empFullName: emp?.empFullName || 'Unknown',
        empFullNameAm: emp?.empFullNameAm || '',
        code: emp?.code || '',
        gender: emp?.gender || 'N/A',
        department: emp?.department || 'N/A',
        branch: emp?.branch || 'N/A',
        position: emp?.position || 'N/A',
        type: 'education',
        institution: edu.institution || edu.Institution,
        fieldOfStudy: edu.fieldOfStudy || edu.FieldOfStudy,
        startDate: edu.dateStart || edu.DateStart || '',
        endDate: edu.dateEnd || edu.DateEnd || '',
        status: edu.status,
        dateAdd: edu.createdAt || edu.CreatedAt || '',
        rowVersion: edu.rowVersion || edu.RowVersion || '',
      });
    });

    pendingExperiences.forEach((exp) => {
      const empId = exp.employeeId || exp.EmployeeId || exp.empId || exp.EmpId;
      const emp = empId ? employeeMap.get(empId) : null;

      records.push({
        id: exp.id || exp.Id,
        employeeId: empId || '',
        empFullName: emp?.empFullName || 'Unknown',
        empFullNameAm: emp?.empFullNameAm || '',
        code: emp?.code || '',
        gender: emp?.gender || 'N/A',
        department: emp?.department || 'N/A',
        branch: emp?.branch || 'N/A',
        position: emp?.position || 'N/A',
        type: 'experience',
        company: exp.company || exp.Company,
        positionTitle: exp.posTitle || exp.PosTitle,
        startDate: exp.dateStart || exp.DateStart || '',
        endDate: exp.dateEnd || exp.DateEnd || '',
        status: exp.status,
        dateAdd: exp.createdAt || exp.CreatedAt || '',
        rowVersion: exp.rowVersion || exp.RowVersion || '',
      });
    });

    records.sort((a, b) => {
      const dateA = new Date(a.dateAdd || a.startDate || 0);
      const dateB = new Date(b.dateAdd || b.startDate || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return records;
  }, [educations, experiences, employeeMap, refreshKey]);

  // ============================================================
  // ✅ CALCULATE STATS FOR HEADER
  // ============================================================

  const stats = useMemo(() => {
    const total = pendingRecords.length;

    // Count by gender
    const male = pendingRecords.filter(
        (record) => record.gender?.toLowerCase() === 'male'
    ).length;
    const female = pendingRecords.filter(
        (record) => record.gender?.toLowerCase() === 'female'
    ).length;

    // Count by type
    const educationCount = pendingRecords.filter(
        (record) => record.type === 'education'
    ).length;
    const experienceCount = pendingRecords.filter(
        (record) => record.type === 'experience'
    ).length;

    // Count by department
    const deptMap = new Map<string, number>();
    pendingRecords.forEach((record) => {
      const dept = record.department || "Unassigned";
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    const topDepartment = deptMap.size > 0
        ? Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1])[0]
        : null;

    return {
      total,
      male,
      female,
      educationCount,
      experienceCount,
      topDepartment: topDepartment ? {
        name: topDepartment[0],
        count: topDepartment[1],
        percentage: total > 0 ? (topDepartment[1] / total) * 100 : 0
      } : null,
      totalDepartments: deptMap.size,
    };
  }, [pendingRecords]);

  // ============================================================
  // ✅ HANDLE REVIEW
  // ============================================================

  const handleReview = async (id: string, decision: 'approve' | 'reject') => {
    try {
      const record = pendingRecords.find(r => r.id === id);
      if (!record) {
        throw new Error('Record not found');
      }

      const status = decision === 'approve' ? '1' : '2';

      const loadingToast = toast.loading(
          `${record.type === 'education' ? 'Education' : 'Experience'} record is being ${decision === 'approve' ? 'approved' : 'rejected'}...`
      );

      if (record.type === 'education') {
        await updateEducationStatus.mutateAsync({
          id,
          status,
          rowVersion: record.rowVersion || ''
        });
      } else {
        await updateExperienceStatus.mutateAsync({
          id,
          status,
          rowVersion: record.rowVersion || ''
        });
      }

      toast.dismiss(loadingToast);

      toast.success(
          decision === 'approve'
              ? `${record.type === 'education' ? 'Education' : 'Experience'} record approved successfully!`
              : `${record.type === 'education' ? 'Education' : 'Experience'} record rejected successfully!`
      );

      // ✅ Invalidate all relevant queries
      await queryClient.invalidateQueries({ queryKey: educationKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: experienceKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      await queryClient.invalidateQueries({ queryKey: ['empDbReport'] });

      // ✅ Refetch both education and experience data
      await Promise.all([
        refetchEducations(),
        refetchExperiences(),
      ]);

      // ✅ Force re-render
      setRefreshKey(prev => prev + 1);

    } catch (error: any) {
      console.error('Review error:', error);
      toast.error(error?.message || 'Failed to review record');
      throw error;
    }
  };

  // ============================================================
  // ✅ FILTER RECORDS
  // ============================================================

  const filteredRecords = pendingRecords.filter((record) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
        (record.empFullName?.toLowerCase() || "").includes(searchLower) ||
        (record.empFullNameAm?.toLowerCase() || "").includes(searchLower) ||
        (record.code?.toLowerCase() || "").includes(searchLower) ||
        (record.department?.toLowerCase() || "").includes(searchLower) ||
        (record.position?.toLowerCase() || "").includes(searchLower) ||
        (record.institution?.toLowerCase() || "").includes(searchLower) ||
        (record.company?.toLowerCase() || "").includes(searchLower) ||
        (record.fieldOfStudy?.toLowerCase() || "").includes(searchLower) ||
        (record.positionTitle?.toLowerCase() || "").includes(searchLower);

    const matchesGender = !filters.gender || record.gender === filters.gender;
    const matchesDepartment = !filters.department || record.department === filters.department;
    const matchesBranch = !filters.branch || record.branch === filters.branch;

    return matchesSearch && matchesGender && matchesDepartment && matchesBranch;
  });

  // ============================================================
  // ✅ PAGINATION
  // ============================================================

  const itemsPerPage = 10;
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // ============================================================
  // ✅ HANDLERS
  // ============================================================

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchEducations(),
        refetchExperiences(),
      ]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // ============================================================
  // ✅ RENDER
  // ============================================================

  return (
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30"
      >
        <div className="relative container mx-auto px-4 py-8 max-w-[1600px]">
          <div className="flex flex-col space-y-6">
            <PendingEduExpHeader
                totalRecords={stats.total}
                maleCount={stats.male}
                femaleCount={stats.female}
                educationCount={stats.educationCount}
                experienceCount={stats.experienceCount}
                topDepartment={stats.topDepartment?.name || ''}
                loading={loading}
            />

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                <span className="text-red-700 font-medium">
                  {t.failedToLoad || "Failed to load records."}
                </span>
                    <button
                        onClick={handleRefresh}
                        className="text-red-700 underline font-semibold hover:text-red-900"
                    >
                      {t.tryAgain || "Try Again"}
                    </button>
                  </div>
                </motion.div>
            )}

            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center items-center py-12"
                >
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {t.loadingRecords || "Loading education and experience records..."}
                    </p>
                  </div>
                </motion.div>
            )}

            {!loading && (
                <>
                  <PendingEduExpSearchFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      filters={filters}
                      setFilters={setFilters}
                      onRefresh={handleRefresh}
                      loading={loading}
                  />

                  {filteredRecords.length > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {t.showing || "Showing"} <span className="font-semibold text-gray-900">{paginatedRecords.length}</span> {t.of || "of"}
                          <span className="font-semibold text-gray-900">{totalItems}</span> {t.records || "records"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t.page || "Page"} {currentPage} {t.of || "of"} {totalPages || 1}
                        </div>
                      </div>
                  )}

                  <PendingEduExpTable
                      items={paginatedRecords}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      onPageChange={handlePageChange}
                      loading={loading}
                      onReview={handleReview}
                  />

                  {filteredRecords.length === 0 && !loading && (
                      <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center"
                      >
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          {t.noRecordsFound || "No Pending Records"}
                        </h3>
                        <p className="text-slate-500">
                          {t.noMatchingRecords || "All education and experience records have been reviewed."}
                        </p>
                      </motion.div>
                  )}
                </>
            )}
          </div>
        </div>
      </motion.div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

export default PendingEmpEduExpPage;