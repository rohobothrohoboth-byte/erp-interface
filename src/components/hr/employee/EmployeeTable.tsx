import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  Eye,
  PenBox,
  Trash2,
  Lock,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import DeleteEmployeeModal from './DeleteEmployeeModal';
import { ReviewDecision } from '../../../types/hr/enum';
import type { EmpState } from '../../../types/hr/enum';
import { useNavigate } from 'react-router';

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
  empState:EmpState;
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

// ── Review Modal ────────────────────────────────────────────────────────────
function ReviewModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [decision, setDecision] = React.useState<string>('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-green-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              Review Employee
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Employee detail link */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Employee Details
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                View full profile before deciding
              </p>
            </div>
            <a
              href={`/hr/employees/${employee.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 shrink-0"
            >
              View Detail
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Decision */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Decision
            </p>
            <div className="flex flex-col gap-2">
              {Object.values(ReviewDecision).map((value) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    decision === value
                      ? value === ReviewDecision.Accept
                        ? "border-green-400 bg-green-50"
                        : "border-red-400 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={value}
                    checked={decision === value}
                    onChange={() => setDecision(value)}
                    className={
                    decision === value
                      ? value === ReviewDecision.Accept
                        ? 'accent-green-600'
                        : 'accent-red-600'
                      : 'accent-gray-400'
                  }
                  />
                  <span
                    className={`text-sm font-medium ${
                      decision === value
                        ? value === ReviewDecision.Accept
                          ? "text-green-700"
                          : "text-red-700"
                        : "text-gray-700"
                    }`}
                  >
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!decision}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
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
  const [reviewEmployee, setReviewEmployee] = useState<Employee | null>(null);

  const sortedEmployees = [...employees].sort((a, b) => {
    const dateA = a.employmentDate || a.createdAt || '';
    const dateB = b.employmentDate || b.createdAt || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const navigate = useNavigate();

  const handleViewDetails = (employee: Employee) => {
    sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    sessionStorage.setItem('currentModule', 'HR');
    navigate(`/hr/employees/${employee.id}`);
  };

  const handleEdit = (employee: Employee) => {
    sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    navigate(`/hr/employees/edit/${employee.id}`);
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
                          className="shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
                        >
                          {employee.photo ? (
                            <img
                              src={`data:image/png;base64,${employee.photo}`}
                              alt={employee.empFullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
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
                          )}
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="truncate max-w-30">
                          {employee.position || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <span className="truncate max-w-30">
                          {employee.jobGrade || "Not specified"}
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
                              <button
                                onClick={() => {
                                  setReviewEmployee(employee);
                                  setPopoverOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2"
                              >
                                <ClipboardCheck size={16} />
                                Review
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

      {/* Review Modal */}
      {reviewEmployee && (
        <ReviewModal
          employee={reviewEmployee}
          onClose={() => setReviewEmployee(null)}
        />
      )}
    </>
  );
};

export default EmployeeTable;