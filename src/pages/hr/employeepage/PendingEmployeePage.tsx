// pages/PendingEmployeePage.tsx - Fixed with real stats

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  UserCheck,
  Hourglass,
  Calendar,
  Building2,
  Loader2
} from "lucide-react";
import { useLanguage } from '../../../i18n/LanguageContext';
import type { HREmployeeFilters } from "../../../components/hr/employee/EmployeeSearchFilters";
import PenEmpHeader from "../../../components/hr/employee/PendingEmployee/PendEmpHeader";
import PenEmployeeSearchFilters from "../../../components/hr/employee/PendingEmployee/PenEmployeeSearchFilters";
import PenEmployeeTable from "../../../components/hr/employee/PendingEmployee/PenEmployeeTable";
import { usePendEmpList } from "../../../services/hr/dashboard/dashboard.queries";
import { useDebounce } from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

const PendingEmployeePage = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState<HREmployeeFilters>({
    department: "",
    branch: "",
    empState: "Pending",
    empNature: "",
    gender: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use the original query
  const {
    data: pendingEmployeesRaw = [],
    isLoading: loading,
    error,
    refetch,
  } = usePendEmpList();

  // ============================================================
  // ✅ MAP DATA WITH PROPER ID
  // ============================================================

  const allPendingEmployees = useMemo(() => {
    let employees = Array.isArray(pendingEmployeesRaw) ? pendingEmployeesRaw : [];

    // Log the raw data to see what fields are available
    if (employees.length > 0) {
      console.log('Raw pending employee data:', employees[0]);
      console.log('All keys in employee object:', Object.keys(employees[0]));
    }

    // Map to ensure we have a proper id field
    return employees.map((emp, index) => ({
      ...emp,
      // Try all possible ID field names
      id: emp.id || emp.employeeId || emp.empId || emp.Id || emp.EmployeeId || emp.code || `emp-${index}`,
    }));
  }, [pendingEmployeesRaw]);

  // Log the first employee to see available fields
  useEffect(() => {
    if (allPendingEmployees.length > 0) {
      console.log('Sample employee data:', allPendingEmployees[0]);
      console.log('Available fields:', Object.keys(allPendingEmployees[0]));
    }
  }, [allPendingEmployees]);

  // ============================================================
  // ✅ CALCULATE STATS FOR HEADER
  // ============================================================

  const stats = useMemo(() => {
    const total = allPendingEmployees.length;

    // Employees pending for more than 3 days
    const waitingForReview = allPendingEmployees.filter(
        emp => emp.employmentDate && new Date(emp.employmentDate) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    ).length;

    // Employees submitted today
    const submittedToday = allPendingEmployees.filter(
        emp => emp.employmentDate && new Date(emp.employmentDate).toDateString() === new Date().toDateString()
    ).length;

    // Department stats
    const deptMap = new Map<string, number>();
    allPendingEmployees.forEach(emp => {
      const dept = emp.department || "Unassigned";
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    const topDepartment = deptMap.size > 0
        ? Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1])[0]
        : null;

    return {
      total,
      waitingForReview,
      submittedToday,
      topDepartment: topDepartment ? {
        name: topDepartment[0],
        count: topDepartment[1],
        percentage: total > 0 ? (topDepartment[1] / total) * 100 : 0
      } : null,
      totalDepartments: deptMap.size,
    };
  }, [allPendingEmployees]);

  // ============================================================
  // ✅ FILTER EMPLOYEES
  // ============================================================

  const filteredEmployees = useMemo(() => {
    let filtered = allPendingEmployees;

    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
          (emp.empFullName?.toLowerCase() || '').includes(searchLower) ||
          (emp.code?.toLowerCase() || '').includes(searchLower) ||
          (emp.department?.toLowerCase() || '').includes(searchLower) ||
          (emp.position?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(emp => emp.department === filters.department);
    }

    // Branch filter
    if (filters.branch) {
      filtered = filtered.filter(emp => emp.branch === filters.branch);
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(emp => emp.gender === filters.gender);
    }

    return filtered;
  }, [allPendingEmployees, debouncedSearchTerm, filters]);

  // ============================================================
  // ✅ PAGINATION
  // ============================================================

  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // ============================================================
  // ✅ HANDLERS
  // ============================================================

  const handleRefresh = async () => {
    await refetch();
    toast.success(t.pendingRefreshSuccess || "Pending employees list refreshed!");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters]);

  // ============================================================
  // ✅ RENDER
  // ============================================================

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30">
        <div className="relative container mx-auto px-4 py-8 max-w-[1600px]">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
          >
            {/* ============================================================
          ✅ HEADER WITH REAL STATS
          ============================================================ */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                <div className="p-6">
                  <PenEmpHeader
                      totalPending={stats.total}
                      waitingForReview={stats.waitingForReview}
                      submittedToday={stats.submittedToday}
                      loading={loading}
                  />
                </div>
              </div>
            </div>

            {/* ============================================================
          STATS CARDS
          ============================================================ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                  icon={<Hourglass className="w-6 h-6 text-amber-600" />}
                  iconBg="from-amber-100 to-orange-100"
                  title={t.totalPendingApprovals || "Total Pending Approvals"}
                  value={stats.total}
                  gradient="from-amber-500 to-orange-500"
                  footer={
                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{t.awaitingReview || "Awaiting Review"}</span>
                        <span>{t.critical || "Critical"}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                            style={{ width: stats.total > 0 ? `${(stats.waitingForReview / stats.total) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  }
              />

              <StatCard
                  icon={<UserCheck className="w-6 h-6 text-blue-600" />}
                  iconBg="from-blue-100 to-indigo-100"
                  title={t.awaitingReview || "Awaiting Review"}
                  value={stats.waitingForReview}
                  gradient="from-blue-500 to-indigo-500"
                  footer={
                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Clock className="w-3 h-3" />
                        <span>{t.pendingForMoreThan3Days || "Pending for >3 days"}</span>
                      </div>
                    </div>
                  }
              />

              <StatCard
                  icon={<Calendar className="w-6 h-6 text-emerald-600" />}
                  iconBg="from-emerald-100 to-teal-100"
                  title={t.submittedToday || "Submitted Today"}
                  value={stats.submittedToday}
                  gradient="from-emerald-500 to-teal-500"
                  footer={
                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <Clock className="w-3 h-3" />
                        <span>{t.requiresImmediateAttention || "Requires immediate attention"}</span>
                      </div>
                    </div>
                  }
              />

              <StatCard
                  icon={<Building2 className="w-6 h-6 text-purple-600" />}
                  iconBg="from-purple-100 to-pink-100"
                  title={t.topDepartment || "Top Department"}
                  value={stats.topDepartment?.name || 'N/A'}
                  valueIsText={true}
                  gradient="from-purple-500 to-pink-500"
                  subtitle={stats.topDepartment ? `${stats.topDepartment.count} ${t.pending || 'pending'} (${stats.topDepartment.percentage.toFixed(1)}%)` : 'No departments'}
                  footer={
                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{t.totalDepartments || "Total Departments"}</span>
                        <span>{stats.totalDepartments}</span>
                      </div>
                    </div>
                  }
              />
            </motion.div>

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
                        <span className="text-red-800 font-medium">
                      {t.failedToLoad || "Failed to load pending employees."}
                    </span>
                      </div>
                      <button
                          onClick={handleRefresh}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {t.tryAgain || "Try Again"}
                      </button>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Search and Filters */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <PenEmployeeSearchFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      filters={filters}
                      setFilters={setFilters}
                      onRefresh={handleRefresh}
                      loading={loading}
                  />
                </div>
              </div>
            </div>

            {/* Results Summary */}
            {!loading && filteredEmployees.length > 0 && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {t.showing || "Showing"} <span className="font-semibold text-gray-900">{paginatedEmployees.length}</span> {t.of || "of"}
                    <span className="font-semibold text-gray-900">{totalItems}</span> {t.pendingEmployees || "pending employees"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t.page || "Page"} {currentPage} {t.of || "of"} {totalPages || 1}
                  </div>
                </div>
            )}

            {/* Employee Table */}
            {!loading && filteredEmployees.length > 0 && (
                <div className="relative">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="overflow-x-auto">
                      <PenEmployeeTable
                          pendingEmployees={paginatedEmployees}
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={totalItems}
                          onPageChange={handlePageChange}
                          loading={loading}
                      />
                    </div>
                  </div>
                </div>
            )}

            {/* Loading State */}
            {loading && allPendingEmployees.length === 0 && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  <span className="ml-3 text-gray-600">{t.loading || "Loading pending employees..."}</span>
                </div>
            )}

            {/* No Data State */}
            {!loading && allPendingEmployees.length === 0 && !error && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{t.noPendingEmployees || "No Pending Employees"}</h3>
                  <p className="text-slate-500">{t.allProcessed || "All employee requests have been processed."}</p>
                  <button
                      onClick={handleRefresh}
                      className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    {t.refresh || "Refresh"}
                  </button>
                </div>
            )}
          </motion.div>
        </div>
      </div>
  );
};

// ============================================================
// STAT CARD COMPONENT
// ============================================================

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: number | string;
  valueIsText?: boolean;
  gradient: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
                                             icon,
                                             iconBg,
                                             title,
                                             value,
                                             valueIsText,
                                             gradient,
                                             subtitle,
                                             footer
                                           }) => (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${iconBg} rounded-xl`}>
            {icon}
          </div>
        </div>
        {valueIsText ? (
            <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">{value}</h3>
        ) : (
            <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
        )}
        <p className="text-slate-500 text-sm">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {footer}
      </div>
    </div>
);

export default PendingEmployeePage;