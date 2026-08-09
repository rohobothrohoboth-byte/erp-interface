import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Building2,
  Briefcase,
  MapPin,
  Award,
  Users
} from 'lucide-react';
import ReviewModal from './ReviewModal';
import type { EmpDbPendList } from '../../../../types/hr/dashboard';
import { useLanguage } from '../../../../i18n/LanguageContext';

interface EmployeeTableProps {
  pendingEmployees: EmpDbPendList[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const PenEmployeeTable: React.FC<EmployeeTableProps> = ({
                                                          pendingEmployees,
                                                          currentPage,
                                                          totalPages,
                                                          totalItems,
                                                          onPageChange,
                                                          loading = false
                                                        }) => {
  const { t } = useLanguage();
  const [reviewEmployee, setReviewEmployee] = useState<EmpDbPendList | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Calculate displayed range
  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);

  if (loading && pendingEmployees.length === 0) {
    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-12 flex items-center justify-center border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-amber-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium">{t.loadingPending || "Loading pending employees..."}</p>
          </div>
        </div>
    );
  }

  return (
      <>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t.employee || "Employee"}
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t.code || "Code"}
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t.branch || "Branch"}
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t.department || "Department"}
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t.position || "Position"}
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t.jobGrade || "Job Grade"}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t.actions || "Actions"}
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
              {pendingEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                          <Users className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-700">{t.noPendingEmployees || "No Pending Employees"}</h3>
                        <p className="text-sm text-slate-400">{t.allProcessed || "All employee records have been reviewed."}</p>
                      </div>
                    </td>
                  </tr>
              ) : (
                  pendingEmployees.map((employee, index) => (
                      <motion.tr
                          key={employee.code}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ backgroundColor: "rgba(251, 191, 36, 0.04)" }}
                          onMouseEnter={() => setHoveredId(employee.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className="transition-colors duration-200"
                      >
                        {/* Employee Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-md transition-opacity duration-300 ${hoveredId === employee.id ? 'opacity-50' : 'opacity-0'}`} />
                              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <span className="text-amber-600 font-semibold text-sm">
                              {employee.empFullName
                                  ?.split(" ")
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                            </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800">
                                {employee.empFullName || t.noName || "No Name"}
                              </div>
                              <div className="text-xs text-slate-400">
                                {employee.empFullNameAm || employee.empFullName}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {employee.gender || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        {employee.code || "N/A"}
                      </span>
                        </td>

                        {/* Branch */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm text-slate-700">
                          {employee.branch || t.notSpecified || "Not specified"}
                        </span>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm text-slate-700">
                          {employee.department || t.notSpecified || "Not specified"}
                        </span>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm text-slate-700">
                          {employee.position || t.notSpecified || "Not specified"}
                        </span>
                          </div>
                        </td>

                        {/* Job Grade */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm text-slate-700">
                          {employee.jobGrade || t.notSpecified || "Not specified"}
                        </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setReviewEmployee(employee)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                          >
                            <ClipboardCheck className="w-4 h-4" />
                            {t.reviewApplication || "Review Application"}
                          </motion.button>
                        </td>
                      </motion.tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
              <div className="bg-white/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-t border-slate-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.previous || "Previous"}
                  </button>
                  <button
                      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.next || "Next"}
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-600">
                      {t.showing || "Showing"}{" "}
                      <span className="font-semibold text-slate-800">{startItem}</span>{" "}
                      {t.to || "to"}{" "}
                      <span className="font-semibold text-slate-800">{endItem}</span>{" "}
                      {t.of || "of"}{" "}
                      <span className="font-semibold text-slate-800">{totalItems}</span>{" "}
                      {t.pendingEmployees || "pending employees"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                          <button
                              key={pageNum}
                              onClick={() => onPageChange(pageNum)}
                              className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                  currentPage === pageNum
                                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                      );
                    })}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
          )}
        </motion.div>

        {/* Review Modal */}
        <AnimatePresence>
          {reviewEmployee && (
              <ReviewModal
                  employee={reviewEmployee}
                  onClose={() => setReviewEmployee(null)}
              />
          )}
        </AnimatePresence>
      </>
  );
};

export default PenEmployeeTable;