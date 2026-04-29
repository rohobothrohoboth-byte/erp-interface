import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, User, Loader2, PenBox, Lock,
} from "lucide-react";
import type { EmployeeListDto } from '../../../types/hr/employee';



interface EmployeeTableProps {
  employees: EmployeeListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEmployeeUpdate: (updatedEmployee: EmployeeListDto) => void;
  onEmployeeStatusChange: (
    employeeId: string,
    newStatus: "active" | "on-leave",
  ) => void;
  onEmployeeTerminate: (employeeId: string) => void;
  onEmployeeDelete: (employeeId: string) => void;
  onAddAccount?: (employee: EmployeeListDto) => void;
  onEditAccount?: (employee: EmployeeListDto) => void;
  showAddAccountButton?: boolean;
  loading?: boolean;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onEmployeeDelete,
  onAddAccount,
  onEditAccount,
  loading = false,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListDto | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const sortedEmployees = [...employees].sort((a, b) => {
    const dateA = a.createdAt || "";
    const dateB = b.createdAt || "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const handleDelete = (employee: EmployeeListDto) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletion = (employeeId: string) => {
    onEmployeeDelete(employeeId);
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
  };

  // Handle Add Account button click
  const handleAddAccountClick = (employee: EmployeeListDto) => {
    if (onAddAccount) {
      onAddAccount(employee);
    }
  };

  // Handle Edit Account button click
  const handleEditAccountClick = (employee: EmployeeListDto) => {
    if (onEditAccount) {
      onEditAccount(employee);
    }
  };

   const getEmpStateColor = (state?: string): string => {
  switch ((state || "").toLowerCase()) {
    case "active":
    case "approved":
      return "bg-green-100 text-green-800 border border-green-200";

    case "pending":
      return "bg-blue-100 text-blue-800 border border-blue-200";

    case "under probation":
    case "prob":
    case "standby":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";

    case "terminated":
      return "bg-red-100 text-red-800 border border-red-200";

    case "on leave":
    case "leave":
      return "bg-orange-100 text-orange-800 border border-orange-200";

    case "retired":
      return "bg-gray-100 text-gray-700 border border-gray-200";

    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

  if (loading && employees.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.5,
            },
          },
        }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <motion.tr
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider "
                >
                  CODE
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Branch
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider "
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider "
                >
                  Position
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </motion.tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {loading ? "Loading employees..." : "No employees found"}
                  </td>
                </tr>
              ) : (
                sortedEmployees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          className="shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
                        >
                          <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-medium">
                              {employee.empFullName
                                ?.trim()
                                .split(" ")
                                .slice(0, 2)
                                .map((name) => name.charAt(0).toUpperCase())
                                .join("")}
                            </span>
                          </div>
                        </motion.div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-30 md:max-w-none">
                            {employee.empFullName || "No Name"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-30 md:max-w-none">
                            {employee.empFullNameAm ||
                              employee.empFullName ||
                              "No Name"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-30 md:max-w-none">
                            {employee.gender || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-30">
                          {employee.code || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-30">
                          {employee.branch || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-30">
                          {employee.department || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-30">
                          {employee.position || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEmpStateColor(employee.empState)}`}
                        >
                          {employee.empState || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      {employee.hasAccount ? (
                        // Direct Edit button for users with accounts
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditAccountClick(employee)}
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          title="Manage Account"
                        >
                          <PenBox className="h-5 w-5" />
                        </motion.button>
                      ) : (
                        // Add Account button for users without accounts
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddAccountClick(employee)}
                          className="p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                          title="Add Account"
                        >
                          <Lock className="h-5 w-5" />
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * 10 + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-blue-50 border-green-500 text-green-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default EmployeeTable;
