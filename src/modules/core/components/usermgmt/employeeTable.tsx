// components/core/usermgmt/employeeTable.tsx
import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PenBox,
  User,
  Building2,
  Briefcase,
  MapPin,
  UserPlus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Power
} from "lucide-react";
import type { AdminEmpListDto } from '@/modules/hr/types/employee';

interface EmployeeTableProps {
  employees: AdminEmpListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEmployeeUpdate: (updatedEmployee: AdminEmpListDto) => void;
  onEmployeeStatusChange: (employeeId: string, newStatus: "active" | "on-leave") => void;
  onEmployeeTerminate: (employeeId: string) => void;
  onAddAccount?: (employee: AdminEmpListDto) => void;
  onEditAccount?: (employee: AdminEmpListDto) => void;
  onReactivateAccount?: (employee: AdminEmpListDto) => void;
  showAddAccountButton?: boolean;
  loading?: boolean;
  itemsPerPage?: number;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
                                                       employees,
                                                       currentPage,
                                                       totalPages,
                                                       totalItems,
                                                       onPageChange,
                                                       onAddAccount,
                                                       onEditAccount,
                                                       onReactivateAccount,
                                                       loading = false,
                                                       itemsPerPage = 10,
                                                     }) => {
  // Memoized sorted employees
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) =>
        (a.empFullName || "").localeCompare(b.empFullName || "")
    );
  }, [employees]);

  // Memoized page range calculation
  const pageRange = useMemo(() => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    return { startItem, endItem };
  }, [currentPage, itemsPerPage, totalItems]);

  // Get initials from full name
  const getInitials = useCallback((fullName?: string): string => {
    if (!fullName) return "?";
    return fullName
        .trim()
        .split(" ")
        .slice(0, 2)
        .map(name => name.charAt(0).toUpperCase())
        .join("");
  }, []);

  // Get status color classes
  const getEmpStateColor = useCallback((state?: string): string => {
    const stateMap: Record<string, string> = {
      "active": "bg-green-100 text-green-800 border-green-200",
      "approved": "bg-green-100 text-green-800 border-green-200",
      "pending": "bg-blue-100 text-blue-800 border-blue-200",
      "under probation": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "prob": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "standby": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "terminated": "bg-red-100 text-red-800 border-red-200",
      "on leave": "bg-orange-100 text-orange-800 border-orange-200",
      "leave": "bg-orange-100 text-orange-800 border-orange-200",
      "retired": "bg-slate-100 text-slate-700 border-slate-200",
    };

    const normalizedState = (state || "").toLowerCase();
    return stateMap[normalizedState] || "bg-gray-100 text-gray-700 border-gray-200";
  }, []);

  // Get account status color and icon
  // In EmployeeTable.tsx - update the getAccountStatusDisplay function

  const getAccountStatusDisplay = useCallback((hasAccount?: boolean, isActive?: boolean) => {
    // ✅ Handle undefined/null
    if (!hasAccount) {
      return {
        text: "No Account",
        color: "bg-gray-100 text-gray-600",
        icon: null
      };
    }
    if (isActive) {
      return {
        text: "Active",
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle className="h-3.5 w-3.5 text-green-500" />
      };
    }
    return {
      text: "Inactive",
      color: "bg-red-100 text-red-700",
      icon: <XCircle className="h-3.5 w-3.5 text-red-500" />
    };
  }, []);

  // Handlers
  const handleAddAccountClick = useCallback((employee: AdminEmpListDto) => {
    onAddAccount?.(employee);
  }, [onAddAccount]);

  const handleEditAccountClick = useCallback((employee: AdminEmpListDto) => {
    onEditAccount?.(employee);
  }, [onEditAccount]);

  const handleReactivateClick = useCallback((employee: AdminEmpListDto) => {
    onReactivateAccount?.(employee);
  }, [onReactivateAccount]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePreviousPage = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  // Generate page numbers array with ellipsis
  const getPageNumbers = useCallback(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i as number;
    });

    return rangeWithDots;
  }, [currentPage, totalPages]);

  // Loading skeleton
  if (loading && employees.length === 0) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-gray-600">Loading employees...</p>
          </div>
        </div>
    );
  }

  // Table headers configuration
  const tableHeaders = [
    { key: 'employee', label: 'Employee', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' },
    { key: 'code', label: 'CODE', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' },
    { key: 'branch', label: 'Branch', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' },
    { key: 'department', label: 'Department', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' },
    { key: 'position', label: 'Position', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' },
    { key: 'status', label: 'Status', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' },
    { key: 'account', label: 'Account', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' },
    { key: 'actions', label: 'Actions', className: 'px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider' },
  ];

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              {tableHeaders.map((header) => (
                  <th key={header.key} scope="col" className={header.className}>
                    {header.label}
                  </th>
              ))}
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {sortedEmployees.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={tableHeaders.length} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-12 w-12 text-gray-300" />
                        <p>{loading ? "Loading employees..." : "No employees found"}</p>
                      </div>
                    </td>
                  </motion.tr>
              ) : (
                  sortedEmployees.map((employee, index) => {
                    const accountStatus = getAccountStatusDisplay(employee.hasAccount, employee.isAccountActive);

                    return (
                        <motion.tr
                            key={employee.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.2 }}
                            whileHover={{ backgroundColor: "rgb(249 250 251)" }}
                            className="transition-colors duration-150"
                        >
                          {/* Employee Info */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                            <span className="text-emerald-700 font-semibold text-sm">
                              {getInitials(employee.empFullName)}
                            </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.empFullName || "No Name"}
                                </div>
                                {employee.empFullNameAm && (
                                    <div className="text-xs text-gray-500">
                                      {employee.empFullNameAm}
                                    </div>
                                )}
                                <div className="text-xs text-gray-400">
                                  {employee.gender || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Code */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {employee.code || "—"}
                            </code>
                          </td>

                          {/* Branch */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-700">
                            {employee.branch || "—"}
                          </span>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-700">
                            {employee.department || "—"}
                          </span>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-700">
                            {employee.position || "—"}
                          </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEmpStateColor(employee.empState)}`}>
                          {employee.empState || "Not specified"}
                        </span>
                          </td>

                          {/* Account Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${accountStatus.color}`}>
                            {accountStatus.text}
                          </span>
                              {accountStatus.icon}
                              {employee.hasAccount && employee.isAccountActive === false && (
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" title="Account deactivated" />
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            {employee.hasAccount ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleEditAccountClick(employee)}
                                      className="p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all duration-200"
                                      title="Edit Account"
                                  >
                                    <PenBox className="h-4 w-4" />
                                  </motion.button>
                                  {employee.isAccountActive === false && (
                                      <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleReactivateClick(employee)}
                                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200"
                                          title="Reactivate Account"
                                      >
                                        <Power className="h-4 w-4" />
                                      </motion.button>
                                  )}
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAddAccountClick(employee)}
                                    className="p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all duration-200"
                                    title="Create Account"
                                >
                                  <UserPlus className="h-4 w-4" />
                                </motion.button>
                            )}
                          </td>
                        </motion.tr>
                    );
                  })
              )}
            </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{pageRange.startItem}</span> to{" "}
                    <span className="font-medium">{pageRange.endItem}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page as number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                    currentPage === page
                                        ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                              {page}
                            </button>
                        )
                    ))}

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
        )}
      </motion.div>
  );
};

export default React.memo(EmployeeTable);