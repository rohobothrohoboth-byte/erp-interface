// EmployeeManagementPage.tsx - Complete fix with normalization

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import EmployeeManagementHeader from '@/modules/hr/components/employee/EmployeeManagementHeader';
import EmployeeSearchFilters, { type HREmployeeFilters } from '@/modules/hr/components/employee/EmployeeSearchFilters';
import EmployeeTable from '@/modules/hr/components/employee/EmployeeTable';
import type { EmployeeListDto } from '@/modules/hr/types/employee';
import { empApi, getEmployeeFilterOptions } from '@/modules/hr/services/employee/emp.api';
import { usePaginatedEmployees } from '@/modules/hr/hooks/usePaginatedEmployees';
import type { UUID } from 'crypto';
import { employeeReviewApi } from '@/modules/hr/services/employee/employeeReview.api';
import toast from 'react-hot-toast';

// ============================================================
// ✅ FIXED FILTER MAPPING - Match exact database values
// ============================================================

const FILTER_TO_EMP_STATE: Record<string, string> = {
  'active': 'Active',
  'pending': 'Pen',
  'on-leave': 'Leave',
  'suspended': 'Sus',
  'terminated': 'Term',
  'retired': 'Retire',
  'standby': 'StandBy',
  'rejected': 'Rej',
  'all': '',
};

// ============================================================
// ✅ Helper to normalize strings for comparison
// ============================================================

const normalize = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.toLowerCase().trim();
};

const EmployeeManagementPage = () => {

  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState<HREmployeeFilters>({
    department: '',
    branch: '',
    empState: '',
    empNature: '',
    gender: '',
  });
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [allEmployees, setAllEmployees] = useState<EmployeeListDto[]>([]);

  // Use the paginated hook
  const {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    updateFilters,
    clearFilters,
    refetch
  } = usePaginatedEmployees({
    initialPageSize: 10,
    cacheTime: 5
  });

  // Load filter options
  // EmployeeManagementPage.tsx - Add debug for branch options

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getEmployeeFilterOptions();

        setFilterOptions(options);
      } catch (err) {
        console.error('Failed to load filter options:', err);
        setFilterOptions({
          departments: [],
          branches: [],
          empStates: [],
          empNatures: [],
          genders: []
        });
      }
    };
    loadFilterOptions();
  }, []);
  // ============================================================
  // ✅ FETCH ALL EMPLOYEES FOR STATS
  // ============================================================

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const response = await empApi.getAllEmployees();
        setAllEmployees(response);
      } catch (err) {
        console.error('Failed to fetch all employees for stats:', err);
      }
    };
    fetchAllEmployees();
  }, []);

  // ============================================================
  // ✅ CALCULATE STATS
  // ============================================================

  const stats = useMemo(() => {
    const total = allEmployees.length;

    const active = allEmployees.filter(
        (emp) => {
          const state = emp.empState || emp.EmpState || '';
          return state === 'Active' || state === 'Approved';
        }
    ).length;

    const pending = allEmployees.filter(
        (emp) => {
          const state = emp.empState || emp.EmpState || '';
          return state === 'Pending';
        }
    ).length;

    const onLeave = allEmployees.filter(
        (emp) => {
          const state = emp.empState || emp.EmpState || '';
          return state === 'On Leave' || state === 'Leave';
        }
    ).length;

    return { total, active, pending, onLeave };
  }, [allEmployees]);

  // ============================================================
  // ✅ APPLY FILTERS TO API
  // ============================================================

  useEffect(() => {
    const apiFilters: any = {
      searchTerm: searchTerm || undefined,
    };

    if (localFilters.department && localFilters.department !== '__all__') {
      apiFilters.department = localFilters.department;
    }

    if (localFilters.branch && localFilters.branch !== '__all__') {
      apiFilters.branch = localFilters.branch;
    }

    if (localFilters.empState && localFilters.empState !== '__all__') {
      apiFilters.empState = localFilters.empState;
    }

    if (localFilters.empNature && localFilters.empNature !== '__all__') {
      apiFilters.empNature = localFilters.empNature;
    }

    if (localFilters.gender && localFilters.gender !== '__all__') {
      apiFilters.gender = localFilters.gender;
    }


    updateFilters(apiFilters);
  }, [searchTerm, localFilters, updateFilters]);

  // ============================================================
  // ✅ DEBUG - Log actual data values
  // ============================================================

  useEffect(() => {
    if (data?.items && data.items.length > 0) {


      // Get all unique values for each field
      const branches = [...new Set(data.items.map(emp => emp.branch || emp.Branch || 'N/A'))];
      const statuses = [...new Set(data.items.map(emp => emp.empState || emp.EmpState || 'N/A'))];
      const natures = [...new Set(data.items.map(emp => emp.empNature || emp.EmpNature || 'N/A'))];
      const departments = [...new Set(data.items.map(emp => emp.department || emp.Department || 'N/A'))];
      const genders = [...new Set(data.items.map(emp => emp.gender || emp.Gender || 'N/A'))];


    }
  }, [data?.items, localFilters]);

  // ============================================================
  // ✅ CLIENT-SIDE FILTERING - COMPLETE FIX
  // ============================================================

  // EmployeeManagementPage.tsx - Add better debugging

  // EmployeeManagementPage.tsx - Updated displayedEmployees with better handling

  const displayedEmployees = useMemo(() => {
    let employees = data?.items || [];



    // Log the first employee to see what fields are available
    if (employees.length > 0) {
      const first = employees[0];

    }

    // ✅ Department filter - check BOTH ID and Name
    if (localFilters.department && localFilters.department !== '__all__') {
      const filterDept = normalize(localFilters.department);
      employees = employees.filter(emp => {
        // Check if department name matches OR if the ID matches
        const deptName = normalize(emp.department || emp.Department || emp.departmentName || emp.DepartmentName);
        const deptId = emp.departmentId || emp.DepartmentId || '';

        // If the filter matches a department ID (like a GUID), check that too
        const isMatchingId = deptId === localFilters.department;

        return deptName === filterDept || isMatchingId;
      });

    }

    // ✅ Branch filter - check all possible branch fields
    if (localFilters.branch && localFilters.branch !== '__all__') {
      const filterBranch = normalize(localFilters.branch);
      employees = employees.filter(emp => {
        // Try all possible branch field names
        const branch = normalize(
            emp.branch ||
            emp.Branch ||
            emp.branchName ||
            emp.BranchName ||
            emp.branchNameEn ||
            emp.BranchNameEn
        );
        return branch === filterBranch;
      });

    }

    // ✅ Status filter - handle different status formats
    if (localFilters.empState && localFilters.empState !== '__all__') {
      const filterState = normalize(localFilters.empState);
      employees = employees.filter(emp => {
        let state = normalize(emp.empState || emp.EmpState || emp.status);

        // Handle numeric status codes
        if (state === '0') state = 'pending';
        if (state === '1') state = 'active';
        if (state === '2') state = 'rejected';
        if (state === '3') state = 'cancelled';

        // Check if the state matches the filter
        const match = state === filterState;
        if (match) {

        }
        return match;
      });

    }

    // ✅ Nature filter - handle different nature formats
    if (localFilters.empNature && localFilters.empNature !== '__all__') {
      const filterNature = normalize(localFilters.empNature);
      employees = employees.filter(emp => {
        let nature = normalize(emp.empNature || emp.EmpNature || emp.employmentNature || emp.EmploymentNature);

        // Handle numeric nature codes
        if (nature === '0') nature = 'permanent';
        if (nature === '1') nature = 'contract';

        return nature === filterNature;
      });

    }

    // ✅ Gender filter
    if (localFilters.gender && localFilters.gender !== '__all__') {
      const filterGender = normalize(localFilters.gender);
      employees = employees.filter(emp => {
        const gender = normalize(emp.gender || emp.Gender);
        return gender === filterGender;
      });

    }

    return employees;
  }, [data?.items, localFilters, searchTerm]);
  // ============================================================
  // ✅ APPLY FILTER FROM NAVIGATION STATE
  // ============================================================

  useEffect(() => {
    if (location.state?.filter) {
      const filterParam = location.state.filter;


      if (filterParam === 'all') {
        setLocalFilters(prev => ({ ...prev, empState: '' }));
        setActiveFilter('all');
      } else {
        const empStateValue = FILTER_TO_EMP_STATE[filterParam];
        if (empStateValue) {
          setLocalFilters(prev => ({ ...prev, empState: empStateValue }));
          setActiveFilter(filterParam);
        }
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ============================================================
  // ✅ HANDLE EMPLOYEE REVIEW
  // ============================================================

  const handleEmployeeReview = useCallback(async (employeeId: string, decision: 'Accept' | 'Reject') => {
    try {
      const result = await employeeReviewApi.reviewEmployee(employeeId, decision);

      if (decision === 'Accept') {
        toast.success(`Employee approved successfully! Status changed to Active.`);
      } else {
        toast.success(`Employee rejected successfully.`);
      }

      await refetch();
      return result;
    } catch (error: any) {
      let errorMessage = 'Failed to review employee';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      throw error;
    }
  }, [refetch]);

  // ============================================================
  // ✅ HANDLE EMPLOYEE ADD/UPDATE/DELETE
  // ============================================================

  const handleAddEmployee = (newEmployee: EmployeeListDto) => {
    setSuccessMessage(`Employee ${newEmployee.empFullName} added successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
    refetch();
  };

  const handleEmployeeUpdate = (updatedEmployee: EmployeeListDto) => {
    setSuccessMessage(`Employee ${updatedEmployee.empFullName} updated successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
    refetch();
  };

  const handleEmployeeStatusChange = async (employeeId: string, newStatus: string) => {
    try {
      setSuccessMessage(`Employee status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    } catch (error) {
      console.error('Error updating employee status:', error);
    }
  };

  const handleEmployeeDelete = async (employeeId: string) => {
    try {
      await empApi.deleteEmployee(employeeId as UUID);
      setSuccessMessage(`Employee deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleEmployeeTerminate = async (employeeId: string) => {
    try {
      setSuccessMessage(`Employee terminated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    } catch (error) {
      console.error('Error terminating employee:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
    setSuccessMessage('Data refreshed successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setLocalFilters({
      department: '',
      branch: '',
      empState: '',
      empNature: '',
      gender: '',
    });
    setActiveFilter('all');
    clearFilters();
  };

  const getActiveFilterDisplay = () => {
    if (activeFilter === 'all') return 'All Employees';
    switch(activeFilter) {
      case 'active': return 'Active Employees';
      case 'pending': return 'Pending Employees';
      case 'on-leave': return 'Employees on Leave';
      case 'suspended': return 'Suspended Employees';
      case 'terminated': return 'Terminated Employees';
      case 'retired': return 'Retired Employees';
      case 'standby': return 'Standby Employees';
      case 'rejected': return 'Rejected Applications';
      default: return 'Employees';
    }
  };

  // ============================================================
  // ✅ RENDER
  // ============================================================

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-8 max-w-[1600px]">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
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
              {error && (
                  <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm"
                  >
                    <div className="flex justify-between items-center p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-700" />
                        </div>
                        <span className="text-red-800 font-medium">{error}</span>
                      </div>
                      <button
                          onClick={refetch}
                          className="text-red-700 hover:text-red-900 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filter Banner */}
            {activeFilter !== 'all' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded-lg">
                        <Filter className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm text-blue-800">
                    Showing: <strong>{getActiveFilterDisplay()}</strong>
                    <span className="text-xs text-blue-600 ml-2">
                      ({displayedEmployees.length} employees found)
                    </span>
                  </span>
                    </div>
                    <button
                        onClick={handleClearAllFilters}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Clear filter
                    </button>
                  </div>
                </motion.div>
            )}

            {/* Header Section with REAL STATS */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                <div className="p-6">
                  <EmployeeManagementHeader
                      totalEmployees={stats.total}
                      activeEmployees={stats.active}
                      onLeaveEmployees={stats.onLeave}
                      loading={loading}
                  />
                </div>
              </div>
            </div>

            {/* Search and Filters Section */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <EmployeeSearchFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      filters={localFilters}
                      setFilters={setLocalFilters}
                      onRefresh={handleRefresh}
                      loading={loading}
                  />
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{displayedEmployees.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalItems}</span> employees
                {localFilters.department && localFilters.department !== '__all__' && (
                    <span className="text-xs text-emerald-600 ml-2">
                    (Filtered by department: {localFilters.department})
                  </span>
                )}
                {localFilters.branch && localFilters.branch !== '__all__' && (
                    <span className="text-xs text-blue-600 ml-2">
                    (Filtered by branch: {localFilters.branch})
                  </span>
                )}
                {localFilters.empState && localFilters.empState !== '__all__' && (
                    <span className="text-xs text-amber-600 ml-2">
                    (Filtered by status: {localFilters.empState})
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </div>
            </div>

            {/* Employee Table - Using displayedEmployees */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  {loading && !data?.items?.length ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading employees...</span>
                      </div>
                  ) : (
                      <EmployeeTable
                          employees={displayedEmployees}
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={displayedEmployees.length}
                          onPageChange={goToPage}
                          onEmployeeUpdate={handleEmployeeUpdate}
                          onEmployeeStatusChange={handleEmployeeStatusChange}
                          onEmployeeTerminate={handleEmployeeTerminate}
                          onEmployeeDelete={handleEmployeeDelete}
                          onEmployeeReview={handleEmployeeReview}
                          loading={loading && (data?.items?.length ?? 0) > 0}
                          onRefresh={handleRefresh}
                      />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

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

export default EmployeeManagementPage;