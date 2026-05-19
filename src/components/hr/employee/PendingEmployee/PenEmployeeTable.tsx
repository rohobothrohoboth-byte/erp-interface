import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';
import ReviewModal from './ReviewModal';
import type { EmpDbPendList } from '../../../../types/hr/dashboard';

interface EmployeeTableProps {
 pendingEmployees:  EmpDbPendList[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

// ── Review Modal ────────────────────────────────────────────────────────────



const PenEmployeeTable: React.FC<EmployeeTableProps> = ({
  pendingEmployees,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading = false
}) => {
  const [reviewEmployee, setReviewEmployee] = useState<EmpDbPendList | null>(null);



  if (loading && pendingEmployees.length === 0) {
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
            <thead className="bg-white text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <motion.tr
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
              <th className="px-4 py-3 ">
                Employee
              </th>

              <th className="px-4 py-3">
                Code
              </th>

              <th className="px-4 py-3 ">
                Branch
              </th>

              <th className="px-4 py-3">
                Department
              </th>

              <th className="px-4 py-3">
                Position
              </th>

              <th className="px-4 py-3">
                Job Grade
              </th>
                <th
                  scope="col"
                  className="px-4 py-3 "
                >
                  Actions
                </th>
              </motion.tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {pendingEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No pending employees found
                </td>
              </tr>
            ) : (
              pendingEmployees.map((employee) => (
            // <motion.tr
            //                         key={employee.id}
            //                         custom={index}
            //                         initial="hidden"
            //                         animate="visible"
            //                         whileHover="hover"
            //                         className="hover:bg-gray-50"
            //                       >
                <tr
                  key={employee.code}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-medium">
                          {employee.empFullName
                            ?.split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>

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

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.code || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.branch || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.department || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.position || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {employee.jobGrade || "N/A"}
                  </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      
                         <button
                                onClick={() => {
                                  setReviewEmployee(employee);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2"
                              >
                                <ClipboardCheck size={16} />
                                Review
                              </button>
                    
                    </td>   </tr>
                  // </motion.tr>
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

export default PenEmployeeTable;