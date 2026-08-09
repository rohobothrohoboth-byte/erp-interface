// src/components/finance/payroll/PayrollTable.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  PenBox,
  Users,
  DollarSign,
  Calendar,
  Shield,
  Clock,
  Loader,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import { Badge } from '../../ui/badge';

interface AttendanceData {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  totalHours: number;
  overtimeHours: number;
  attendanceRate: number;
  lateMinutes: number;
}

interface PayrollItem {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  benefits: number;
  deductions: number;
  netPay: number;
  status: 'Active' | 'On Leave' | 'Pending' | 'Terminated';
  lastPayDate: string;
  nextPayDate: string;
  jobGradeId?: string;
  jobGradeName?: string;
  attendance: AttendanceData;
}

interface PayrollTableProps {
  data: PayrollItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewDetails: (item: any) => void;
  onEdit: (item: any) => void;
  onProcessPayroll: (item: any) => void;
  onGeneratePayslip: (item: any) => void;
  onExportAttendance: (item: any) => void;
  loading?: boolean;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
                                                     data,
                                                     currentPage,
                                                     totalPages,
                                                     totalItems,
                                                     onPageChange,
                                                     onViewDetails,
                                                     onEdit,
                                                     onProcessPayroll,
                                                     onGeneratePayslip,
                                                     onExportAttendance,
                                                     loading = false,
                                                   }) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'Active': {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        icon: <CheckCircle className="h-3 w-3" />
      },
      'On Leave': {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: <AlertCircle className="h-3 w-3" />
      },
      'Pending': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Clock className="h-3 w-3" />
      },
      'Terminated': {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        icon: <XCircle className="h-3 w-3" />
      },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${config.bg} ${config.text}`}>
        {config.icon}
          {status}
      </span>
    );
  };

  const getDepartmentBadge = (department: string) => {
    const colors: Record<string, string> = {
      'IT': 'bg-blue-100 text-blue-800',
      'HR': 'bg-purple-100 text-purple-800',
      'Finance': 'bg-emerald-100 text-emerald-800',
      'Sales': 'bg-cyan-100 text-cyan-800',
      'Operations': 'bg-amber-100 text-amber-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Engineering': 'bg-indigo-100 text-indigo-800',
      'Customer Service': 'bg-teal-100 text-teal-800',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[department] || 'bg-gray-100 text-gray-800'}`}>
        {department}
      </span>
    );
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-emerald-600';
    if (rate >= 85) return 'text-blue-600';
    if (rate >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading payroll data...</span>
        </div>
    );
  }

  return (
      <motion.div initial="hidden" animate="visible" variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}>
        <div className="overflow-x-auto rounded-xl border border-indigo-200 shadow-sm">
          <table className="min-w-full divide-y divide-indigo-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-white">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Employee
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider hidden lg:table-cell">
                Position
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Attendance
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Compensation
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-indigo-200">
            {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-16 w-16 text-indigo-300 mb-4" />
                      <p className="text-xl font-semibold text-indigo-700 mb-2">No payroll data found</p>
                      <p className="text-sm text-indigo-500">Add employees or process payroll to get started</p>
                    </div>
                  </td>
                </tr>
            ) : (
                data.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <motion.tr
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0, transition: { delay: index * 0.05 } },
                          }}
                          className={`transition-colors hover:bg-indigo-50 cursor-pointer ${expandedRow === item.id ? 'bg-indigo-50' : ''}`}
                          onClick={() => toggleRow(item.id)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <Users className="text-indigo-600 h-5 w-5" />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">ID: {item.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">{item.position}</div>
                            {getDepartmentBadge(item.department)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Present:</span>
                              <span className="font-semibold text-emerald-600">{item.attendance.presentDays}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">Absent:</span>
                              <span className="font-semibold text-red-600">{item.attendance.absentDays}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-gray-500">Late: <span className="font-medium text-amber-600">{item.attendance.lateDays}</span></span>
                              <span className="text-gray-500">Overtime: <span className="font-medium text-indigo-600">{item.attendance.overtimeHours.toFixed(1)}h</span></span>
                              <span className={`font-semibold ${getAttendanceRateColor(item.attendance.attendanceRate)}`}>
                            {item.attendance.attendanceRate}%
                          </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="space-y-1 text-right">
                            <div className="flex justify-between gap-4">
                              <span className="text-xs text-gray-500">Net Pay:</span>
                              <span className="text-sm font-bold text-indigo-900">
                            ${item.netPay.toLocaleString()}
                          </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-xs text-gray-500">Base:</span>
                              <span className="text-xs text-gray-600">${item.salary.toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getStatusBadge(item.status)}
                            <div className="text-xs text-gray-400">
                              Next: {item.nextPayDate}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Popover
                              open={popoverOpen === item.id.toString()}
                              onOpenChange={(open) =>
                                  setPopoverOpen(open ? item.id.toString() : null)
                              }
                          >
                            <PopoverTrigger asChild>
                              <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                                  onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-5 w-5" />
                              </motion.button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-0" align="end">
                              <div className="py-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onViewDetails(item); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                                >
                                  <Eye size={16} />
                                  View Details
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                                >
                                  <PenBox size={16} />
                                  Edit Employee
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onProcessPayroll(item); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 rounded text-emerald-700 flex items-center gap-2"
                                >
                                  <DollarSign size={16} />
                                  Process Payroll
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onGeneratePayslip(item); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 rounded text-purple-700 flex items-center gap-2"
                                >
                                  <Shield size={16} />
                                  Generate Payslip
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onExportAttendance(item); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-50 rounded text-cyan-700 flex items-center gap-2"
                                >
                                  <Download size={16} />
                                  Export Attendance
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </motion.tr>

                      {/* Expanded Row - Detailed Attendance */}
                      {expandedRow === item.id && (
                          <tr className="bg-indigo-50/50">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-indigo-100">
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Attendance Summary</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-gray-500">Present:</span> <span className="font-medium text-emerald-600">{item.attendance.presentDays}</span></div>
                                    <div><span className="text-gray-500">Absent:</span> <span className="font-medium text-red-600">{item.attendance.absentDays}</span></div>
                                    <div><span className="text-gray-500">Late:</span> <span className="font-medium text-amber-600">{item.attendance.lateDays}</span></div>
                                    <div><span className="text-gray-500">Leave:</span> <span className="font-medium text-blue-600">{item.attendance.leaveDays}</span></div>
                                    <div><span className="text-gray-500">Holiday:</span> <span className="font-medium text-purple-600">{item.attendance.holidayDays}</span></div>
                                    <div><span className="text-gray-500">Weekend:</span> <span className="font-medium text-gray-600">{item.attendance.weekendDays}</span></div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Hours</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="text-gray-500">Total Hours:</span> <span className="font-medium">{item.attendance.totalHours.toFixed(1)}h</span></div>
                                    <div><span className="text-gray-500">Overtime:</span> <span className="font-medium text-indigo-600">{item.attendance.overtimeHours.toFixed(1)}h</span></div>
                                    <div><span className="text-gray-500">Late Minutes:</span> <span className="font-medium text-amber-600">{item.attendance.lateMinutes}m</span></div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Performance</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Attendance Rate:</span>
                                      <span className={`font-bold ${getAttendanceRateColor(item.attendance.attendanceRate)}`}>
                                  {item.attendance.attendanceRate}%
                                </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                          className={`h-2 rounded-full ${
                                              item.attendance.attendanceRate >= 95 ? 'bg-emerald-500' :
                                                  item.attendance.attendanceRate >= 85 ? 'bg-blue-500' :
                                                      item.attendance.attendanceRate >= 75 ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${Math.min(item.attendance.attendanceRate, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Quick Actions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => onGeneratePayslip(item)}
                                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                    >
                                      Payslip
                                    </button>
                                    <button
                                        onClick={() => onExportAttendance(item)}
                                        className="px-3 py-1 text-xs bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200"
                                    >
                                      Export
                                    </button>
                                    <button
                                        onClick={() => onViewDetails(item)}
                                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                      Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                      )}
                    </React.Fragment>
                ))
            )}
            </tbody>
          </table>

          {/* Pagination */}
          {data.length > 0 && (
              <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-indigo-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-indigo-700">
                      Showing{' '}
                      <span className="font-medium">
                    {(currentPage - 1) * 10 + 1}
                  </span>{' '}
                      to{' '}
                      <span className="font-medium">
                    {Math.min(currentPage * 10, totalItems)}
                  </span>{' '}
                      of <span className="font-medium">{totalItems}</span> employees
                    </p>
                  </div>
                  <div>
                    <nav
                        className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
                        aria-label="Pagination"
                    >
                      <button
                          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === pageNum
                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                        : 'bg-white border-indigo-300 text-indigo-500 hover:bg-indigo-50'
                                }`}
                            >
                              {pageNum}
                            </button>
                        );
                      })}
                      <button
                          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
          )}
        </div>
      </motion.div>
  );
};

export default PayrollTable;