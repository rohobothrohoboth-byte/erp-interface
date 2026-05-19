import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";

import type { HREmployeeFilters } from "../../../components/hr/employee/EmployeeSearchFilters";

import PenEmpHeader from "../../../components/hr/employee/PendingEmployee/PendEmpHeader";
import PenEmployeeSearchFilters from "../../../components/hr/employee/PendingEmployee/PenEmployeeSearchFilters";
import PenEmployeeTable from "../../../components/hr/employee/PendingEmployee/PenEmployeeTable";

import { usePendEmpList } from "../../../services/hr/dashboard/dashboard.queries";

const PendingEmployeePage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState<HREmployeeFilters>({
    department: "",
    branch: "",
    empState: "",
    empNature: "",
    gender: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const [previousStats, setPreviousStats] = useState({
    total: 0,
  });

  /**
   * React Query Hook
   */
  const {
    data: pendingEmployees = [],
    isLoading: loading,
    error,
    refetch,
  } = usePendEmpList();

  /**
   * Previous stats
   */
  useEffect(() => {
    const currentTotal = pendingEmployees.length;


    if (currentTotal > 0 && previousStats.total === 0) {
      setPreviousStats({
        total: currentTotal,
      });
    }
  }, [pendingEmployees]);

  /**
   * Refresh
   */
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  /**
   * Filtering
   */
  const filteredEmployees = pendingEmployees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      (employee.empFullName?.toLowerCase() || "").includes(searchLower) ||
      (employee.empFullNameAm?.toLowerCase() || "").includes(searchLower) ||
      (employee.code?.toLowerCase() || "").includes(searchLower) ||
      (employee.department?.toLowerCase() || "").includes(searchLower) ||
      (employee.position?.toLowerCase() || "").includes(searchLower);

    const matchesDepartment =
      !filters.department ||
      employee.department === filters.department;

    const matchesBranch =
      !filters.branch || employee.branch === filters.branch;

    const matchesGender =
      !filters.gender || employee.gender === filters.gender;

  

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesBranch &&
      matchesGender 
    );
  });

  /**
   * Pagination
   */
  const itemsPerPage = 10;

  const totalPages = Math.ceil(
    filteredEmployees.length / itemsPerPage
  );

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="w-full mx-auto">
        <div className="flex flex-col space-y-6">
          <PenEmpHeader />

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  Failed to load employees.
                </span>

                <button
                  onClick={() => refetch()}
                  className="underline font-semibold"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-8"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>

                <p className="text-gray-600">
                  Loading employees...
                </p>
              </div>
            </motion.div>
          )}

          {/* Content */}
          {!loading && (
            <>
              <PenEmployeeSearchFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                setFilters={setFilters}
                onRefresh={handleRefresh}
                loading={loading}
              />

              <PenEmployeeTable
                pendingEmployees={paginatedEmployees}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEmployees.length}
                onPageChange={setCurrentPage}
                loading={loading}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Animation Variants
 */
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

export default PendingEmployeePage;