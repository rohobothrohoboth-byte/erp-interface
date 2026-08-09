// src/components/finance/payroll/ProcessPayroll.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  DollarSign,
  AlertCircle,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  FileText,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import useToast from '../../../hooks/useToast';

import { AttendanceIntegrationService } from '../../../services/finance/payroll/AttendanceIntegrationService';

interface ProcessPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessPayroll: (data: any) => Promise<any>;
  employees: any[];
  month?: number;
  year?: number;
}

const ProcessPayrollModal: React.FC<ProcessPayrollModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onProcessPayroll,
                                                                   employees = [],
                                                                   month = new Date().getMonth() + 1,
                                                                   year = new Date().getFullYear()
                                                                 }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [payrollSummary, setPayrollSummary] = useState<any>(null);

  const attendanceService = new AttendanceIntegrationService();

  // Load attendance data when modal opens
  useEffect(() => {
    if (isOpen && employees.length > 0) {
      loadAttendanceData();
    }
  }, [isOpen, employees, month, year]);

  const loadAttendanceData = async () => {
    setLoadingAttendance(true);
    try {
      const data: Record<string, any> = {};
      for (const emp of employees) {
        try {
          const summary = await attendanceService.getAttendanceForPayroll(emp.id, month, year);
          data[emp.id] = summary;
        } catch (error) {
          console.error(`Failed to load attendance for ${emp.name}:`, error);
          data[emp.id] = null;
        }
      }
      setAttendanceData(data);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const totalAmount = employees.reduce((sum, emp) => sum + emp.netPay, 0);
  const monthlyAmount = totalAmount / 12;

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id.toString()));
    }
  };

  const handleCalculatePayroll = () => {
    const selected = employees.filter(emp => selectedEmployees.includes(emp.id.toString()));
    let totalGross = 0;
    let totalDeductions = 0;
    let totalOvertime = 0;

    selected.forEach(emp => {
      const attendance = attendanceData[emp.id];
      if (attendance) {
        const adjustments = attendanceService.calculateSalaryAdjustments(attendance, emp.salary);
        totalGross += emp.salary + adjustments.additions;
        totalDeductions += adjustments.deductions;
        totalOvertime += attendance.totalOvertimeHours;
      } else {
        totalGross += emp.salary;
      }
    });

    setPayrollSummary({
      totalEmployees: selected.length,
      totalGross: totalGross,
      totalDeductions: totalDeductions,
      totalNet: totalGross - totalDeductions,
      totalOvertime: totalOvertime,
      averagePay: (totalGross - totalDeductions) / (selected.length || 1)
    });
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    setIsLoading(true);

    try {
      const selected = employees.filter(emp => selectedEmployees.includes(emp.id.toString()));
      const payrollData = {
        period: selectedPeriod,
        payDate,
        employeeIds: selectedEmployees,
        employees: selected.map(emp => ({
          ...emp,
          attendance: attendanceData[emp.id] || null
        })),
        totalAmount: selectedPeriod === 'monthly' ? monthlyAmount : totalAmount,
        summary: payrollSummary
      };

      await onProcessPayroll(payrollData);
      toast.success('Payroll processed successfully!');
      onClose();
    } catch (error) {
      console.error('Payroll processing error:', error);
      toast.error('Failed to process payroll');
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStatus = (attendance: any) => {
    if (!attendance) return { status: 'No Data', color: 'bg-gray-100 text-gray-600' };

    const rate = attendance.attendanceRate;
    if (rate >= 95) return { status: 'Excellent', color: 'bg-emerald-100 text-emerald-800' };
    if (rate >= 85) return { status: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (rate >= 75) return { status: 'Fair', color: 'bg-amber-100 text-amber-800' };
    return { status: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 h-dvh">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <DollarSign size={24} className="text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-800">Process Payroll</h2>
              <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
              {month}/{year}
            </span>
            </div>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Payroll Summary */}
              <Card className="border-emerald-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-sm text-emerald-600 mb-1">Total Employees</div>
                      <div className="text-2xl font-bold text-emerald-700">{employees.length}</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Monthly Payroll</div>
                      <div className="text-2xl font-bold text-blue-700">
                        ${monthlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-600 mb-1">Annual Payroll</div>
                      <div className="text-2xl font-bold text-purple-700">
                        ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="text-sm text-indigo-600 mb-1">Avg. Monthly Salary</div>
                      <div className="text-2xl font-bold text-indigo-700">
                        ${employees.length > 0 ? Math.round(monthlyAmount / employees.length).toLocaleString() : '0'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Payroll Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pay Period</label>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="semi-monthly">Semi-monthly</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pay Date</label>
                    <input
                        type="date"
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Employee Selection with Attendance */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Select Employees</h3>
                  <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={isLoading}
                    >
                      {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    {selectedEmployees.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCalculatePayroll}
                            disabled={isLoading}
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                        >
                          <TrendingUp size={14} className="mr-1" />
                          Calculate
                        </Button>
                    )}
                  </div>
                </div>

                {loadingAttendance ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      <span className="ml-2 text-gray-600">Loading attendance data...</span>
                    </div>
                ) : (
                    <div className="border rounded-lg max-h-80 overflow-y-auto">
                      {employees.map((employee) => {
                        const attendance = attendanceData[employee.id];
                        const attendanceStatus = getAttendanceStatus(attendance);
                        const isSelected = selectedEmployees.includes(employee.id.toString());

                        return (
                            <div
                                key={employee.id}
                                className={`flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors ${
                                    isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedEmployees([...selectedEmployees, employee.id.toString()]);
                                      } else {
                                        setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id.toString()));
                                      }
                                    }}
                                    disabled={isLoading}
                                    className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{employee.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {employee.employeeId} • {employee.department}
                                  </div>
                                </div>
                                {attendance && (
                                    <div className="flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock size={14} className="text-gray-400" />
                                {attendance.totalHours.toFixed(1)}h
                              </span>
                                      <span className="flex items-center gap-1">
                                <TrendingUp size={14} className="text-indigo-400" />
                                        {attendance.overtimeHours.toFixed(1)}h
                              </span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${attendanceStatus.color}`}>
                                {attendanceStatus.status}
                              </span>
                                    </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  ${employee.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {employee.status === 'Active' ? (
                                      <span className="text-emerald-600">Active</span>
                                  ) : (
                                      <span className="text-amber-600">{employee.status}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Selected: {selectedEmployees.length} of {employees.length} employees
                </span>
                  {payrollSummary && (
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-emerald-600">Gross: ${payrollSummary.totalGross.toLocaleString()}</span>
                        <span className="text-red-600">Deductions: ${payrollSummary.totalDeductions.toLocaleString()}</span>
                        <span className="font-semibold text-indigo-700">
                      Net: ${payrollSummary.totalNet.toLocaleString()}
                    </span>
                      </div>
                  )}
                </div>
              </div>

              {/* Warning Message */}
              {selectedEmployees.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">Payroll Processing Notice</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Processing payroll for {selectedEmployees.length} employee(s). This action will:
                        </p>
                        <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                          <li>Calculate pay based on attendance (present days, overtime, late penalties)</li>
                          <li>Generate payslips for selected employees</li>
                          <li>Update payment records</li>
                          <li>Create journal entries for accounting</li>
                          <li>Send payment notifications to employees</li>
                        </ul>
                        {payrollSummary && (
                            <div className="mt-2 p-2 bg-white/50 rounded border border-amber-200">
                              <p className="text-xs text-amber-700">
                                Total Overtime Hours: {payrollSummary.totalOvertime.toFixed(1)}h
                              </p>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="flex justify-end items-center gap-3">
              <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6"
              >
                Cancel
              </Button>
              <Button
                  onClick={handleSubmit}
                  disabled={isLoading || selectedEmployees.length === 0}
                  className="px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
              >
                {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                ) : (
                    <>
                      <DollarSign size={18} className="mr-2" />
                      Process Payroll
                    </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default ProcessPayrollModal;