import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Users } from "lucide-react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import type { EmpDbPendList } from "../../../types/hr/dashboard.types";
import { useNavigate } from "react-router-dom";

interface PendingActivityProps {
  pendingEmployees: EmpDbPendList[];
}

const PAGE_SIZE = 5;

const PendingActivity: React.FC<PendingActivityProps> = ({
                                                           pendingEmployees,
                                                         }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const count = pendingEmployees.length;
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const paged = pendingEmployees.slice(
      page * PAGE_SIZE,
      page * PAGE_SIZE + PAGE_SIZE,
  );

  return (
      <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
      >
        <Card className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Pending Employees
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Employees awaiting review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Count badge */}
              {count > 0 && (
                  <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {count}
              </span>
              )}
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/hr/pend-employees")}
                  className="h-8 gap-1 px-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Empty state */}
          {count === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 mb-3">
                  <Users className="h-5 w-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  No pending approvals
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  New employee requests will appear here.
                </p>
              </div>
          ) : (
              <>
                {/* List */}
                <div className="flex flex-col gap-2 px-4 py-3">
                  <AnimatePresence mode="popLayout">
                    {paged.map((emp, i) => (
                        <motion.div
                            key={emp.code || emp.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15, delay: i * 0.03 }}
                            onClick={() => navigate(`/hr/employees/record/${emp.id}`)}
                            className="flex items-center gap-4 px-4 py-3.5 border border-gray-200 border-l-2 border-l-emerald-400 rounded-xl hover:bg-gray-50/70 hover:border-emerald-200 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                        >
                          {/* Avatar */}
                          <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-emerald-700">
                        {emp.empFullName
                            ?.trim()
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n.charAt(0).toUpperCase())
                            .join("")}
                      </span>
                          </div>

                          {/* Name Group - English on top, Amharic below */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {emp.empFullName || "Unknown"}
                              </p>
                              {emp.empFullNameAm && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {emp.empFullNameAm}
                                  </p>
                              )}
                            </div>
                          </div>

                          {/* Department and Position Group - Side by side */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                            {emp.department && (
                                <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs text-gray-400">
                            Department:
                          </span>
                                  <span className="text-xs font-medium text-gray-700 truncate">
                            {emp.department}
                          </span>
                                </div>
                            )}

                            {emp.position && (
                                <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs text-gray-400">
                            Position:
                          </span>
                                  <span className="text-xs font-medium text-gray-700 truncate">
                            {emp.position}
                          </span>
                                </div>
                            )}
                          </div>
                        </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{page * PAGE_SIZE + 1}</span> to{" "}
                    <span className="font-medium">
                  {Math.min((page + 1) * PAGE_SIZE, count)}
                </span>{" "}
                    of <span className="font-medium">{count}</span> results
                  </p>
                  <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                  >
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === p
                                    ? "z-10 bg-blue-50 border-green-500 text-green-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                          {p + 1}
                        </button>
                    ))}
                    <button
                        onClick={() =>
                            setPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                        disabled={page >= totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                </div>
              </div>
          )}
        </Card>
      </motion.div>
  );
};

export default PendingActivity;
