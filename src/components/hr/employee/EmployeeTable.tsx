import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  User,
  Loader2,
  Eye,
  PenBox,
  Trash2,
  Lock
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import DeleteEmployeeModal from './DeleteEmployeeModal';

interface Employee {
  id: string;
  code: string;
  empFullName: string;
  empFullNameAm: string;
  gender: string;
  department: string;
  position: string;
  branch?: string;
  jobGrade?: string;
  empType?: string;
  empNature?: string;
  photo?: string;
  status?: "active" | "on-leave";
  employmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEmployeeUpdate: (updatedEmployee: Employee) => void;
  onEmployeeStatusChange: (employeeId: string, newStatus: "active" | "on-leave") => void;
  onEmployeeTerminate: (employeeId: string) => void;
  onEmployeeDelete: (employeeId: string) => void;
  onAddAccount?: (employee: Employee) => void;
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
  showAddAccountButton = false,
  loading = false
}) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const sortedEmployees = [...employees].sort((a, b) => {
    const dateA = a.employmentDate || a.createdAt || '';
    const dateB = b.employmentDate || b.createdAt || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const handleViewDetails = (employee: Employee) => {
    sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    sessionStorage.setItem('currentModule', 'HR');
    window.location.href = `/hr/employees/${employee.id}`;
  };

  const handleEdit = (employee: Employee) => {
    sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    window.location.href = `/hr/employees/edit/${employee.id}`;
    setPopoverOpen(null);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
    setPopoverOpen(null);
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
  const handleAddAccountClick = (employee: Employee) => {
    if (onAddAccount) {
      onAddAccount(employee);
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
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider "
                >
                  Job Grade
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
                          className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
                        >
                          {employee.photo ? (
                            <img
                              src={`data:image/png;base64,${employee.photo}`}
                              alt={employee.empFullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="text-green-600 h-5 w-5" />
                          )}
                        </motion.div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                            {employee.empFullName || "No Name"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-none">
                            {employee.empFullNameAm ||
                              employee.empFullName ||
                              "No Name"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-none">
                            {employee.gender || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-[120px]">
                          {employee.code || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-[120px]">
                          {employee.branch || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-[120px]">
                          {employee.department || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="truncate max-w-[120px]">
                          {employee.position || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-[120px]">
                          {employee.jobGrade || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span
                          className={`truncate max-w-30 ${employee.status === "active" ? "text-green-600" : "text-red-600"}`}
                        >
                          {employee.status || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      {showAddAccountButton ? (
                        // Add Account button for User Management
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddAccountClick(employee)}
                          className="p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                          title="Add Account"
                        >
                          <Lock className="h-5 w-5" />
                        </motion.button>
                      ) : (
                        // Original dropdown for HR module
                        <Popover
                          open={popoverOpen === employee.id}
                          onOpenChange={(open) =>
                            setPopoverOpen(open ? employee.id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                            >
                              <MoreVertical className="h-5 w-5 cursor-pointer" />
                            </motion.button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-0" align="end">
                            <div className="py-1">
                              <button
                                onClick={() => handleViewDetails(employee)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                              <button 
                                onClick={() => handleEdit(employee)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                              >
                                <PenBox size={16} />
                                Update
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded flex items-center gap-2">
                                <Trash2 size={16} />
                                Change Status
                              </button>
                              <button
                                onClick={() => handleDelete(employee)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
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

      {/* Delete Employee Modal */}
      <DeleteEmployeeModal
        employee={selectedEmployee}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeletion}
      />
    </>
  );
};

export default EmployeeTable;