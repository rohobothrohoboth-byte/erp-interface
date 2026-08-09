// src/pages/finance/PagePayroll.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Calculator,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PayrollStats } from '../../components/finance/payroll/PayrollStats';

import PayrollHeader from '../../components/finance/payroll/PayrollHeader';
import { PayrollSearchFilters } from '../../components/finance/payroll/PayrollSearchFilters';
import { PayrollQuickActions } from '../../components/finance/payroll/PayrollQuickActions';
import PayrollTable from '../../components/finance/payroll/PayrollTable';
import AddPayrollModal from '../../components/finance/payroll/AddPayrollModal';
import ProcessPayrollModal from '../../components/finance/payroll/ProcessPayroll';
import { AttendanceIntegrationService } from '../../services/finance/payroll/AttendanceIntegrationService';
import { payrollApi } from '../../services/finance/payroll/payrollApi';
import { employeeApi } from '../../services/hr/attandance/employeeApi';
import useToast from '../../hooks/useToast';
import type { JobGradeListDto } from '../../types/hr/jobgrade';

// Types
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
  attendance: {
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
  };
}

const PagePayroll: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
  const [filteredData, setFilteredData] = useState<PayrollItem[]>([]);
  const [jobGrades, setJobGrades] = useState<JobGradeListDto[]>([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState<Record<string, any>>({});

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessPayrollModalOpen, setIsProcessPayrollModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollItem | null>(null);

  // Stats
  const [attendanceStats, setAttendanceStats] = useState({
    attendanceRate: 0,
    averageOvertime: 0,
    totalLateDays: 0,
    totalAbsentDays: 0,
    totalPresentDays: 0
  });

  const attendanceService = new AttendanceIntegrationService();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load employees
      const employees = await employeeApi.fetchAllEmployees();

      // Load job grades
      // const grades = await jobGradeService.getAll();
      // setJobGrades(grades);

      // Load payroll data from API
      const payrollResponse = await payrollApi.getAll();

      // Combine data
      const payrollItems = employees.map((emp: any) => ({
        id: emp.id,
        employeeId: emp.employeeCode || `EMP-${emp.id.slice(0, 8)}`,
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.fullName || 'Unknown',
        department: emp.departmentName || emp.department || 'Unassigned',
        position: emp.positionName || emp.position || 'N/A',
        salary: emp.baseSalary || 0,
        benefits: 0,
        deductions: 0,
        netPay: emp.baseSalary || 0,
        status: emp.status || 'Active',
        lastPayDate: emp.lastPayDate || 'N/A',
        nextPayDate: '2026-07-15',
        jobGradeId: emp.jobGradeId,
        jobGradeName: emp.jobGradeName,
        attendance: {
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          leaveDays: 0,
          holidayDays: 0,
          weekendDays: 0,
          totalHours: 0,
          overtimeHours: 0,
          attendanceRate: 0,
          lateMinutes: 0
        }
      }));

      setPayrollData(payrollItems);

      // Load attendance data
      await loadAttendanceData(payrollItems);

    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async (employees: PayrollItem[]) => {
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const summaries = await attendanceService.getAttendanceForAllEmployees(month, year);

      const data: Record<string, any> = {};
      let totalRate = 0;
      let totalOvertime = 0;
      let totalLate = 0;
      let totalAbsent = 0;
      let totalPresent = 0;

      summaries.forEach(summary => {
        data[summary.employeeId] = summary;
        totalRate += summary.attendanceRate;
        totalOvertime += summary.totalOvertimeHours;
        totalLate += summary.lateDays;
        totalAbsent += summary.absentDays;
        totalPresent += summary.presentDays;
      });

      setAttendanceSummaries(data);
      setAttendanceStats({
        attendanceRate: summaries.length > 0 ? Math.round(totalRate / summaries.length) : 0,
        averageOvertime: summaries.length > 0 ? Math.round((totalOvertime / summaries.length) * 10) / 10 : 0,
        totalLateDays: totalLate,
        totalAbsentDays: totalAbsent,
        totalPresentDays: totalPresent
      });

      // Update payroll items with attendance data
      const updatedPayroll = employees.map(emp => {
        const attendance = data[emp.employeeId];
        if (attendance) {
          return {
            ...emp,
            attendance: {
              presentDays: attendance.presentDays || 0,
              absentDays: attendance.absentDays || 0,
              lateDays: attendance.lateDays || 0,
              leaveDays: attendance.leaveDays || 0,
              holidayDays: attendance.holidayDays || 0,
              weekendDays: attendance.weekendDays || 0,
              totalHours: attendance.totalHoursWorked || 0,
              overtimeHours: attendance.totalOvertimeHours || 0,
              attendanceRate: attendance.attendanceRate || 0,
              lateMinutes: attendance.lateMinutes || 0
            }
          };
        }
        return emp;
      });

      setPayrollData(updatedPayroll);
      applyFilters(updatedPayroll);

    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const applyFilters = (data: PayrollItem[]) => {
    const filtered = data.filter(employee => {
      const matchesSearch =
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (employee.jobGradeName && employee.jobGradeName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = filterDepartment === 'All' || employee.department === filterDepartment;
      const matchesStatus = filterStatus === 'All' || employee.status === filterStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });

    setFilteredData(filtered);
  };

  // Update filters when search/filters change
  useEffect(() => {
    applyFilters(payrollData);
  }, [searchTerm, filterDepartment, filterStatus, payrollData]);

  // Handlers
  const handleViewDetails = (item: PayrollItem) => {
    setSelectedEmployee(item);
  };

  const handleEdit = (item: PayrollItem) => {
    console.log('Edit employee:', item);
  };

  const handleProcessPayrollIndividual = (item: PayrollItem) => {
    console.log('Process payroll for:', item);
  };

  const handleGeneratePayslip = (item: PayrollItem) => {
    console.log('Generate payslip for:', item);
  };

  const handleExportAttendance = (item: PayrollItem) => {
    console.log('Export attendance for:', item);
  };

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleProcessPayrollBulk = () => {
    setIsProcessPayrollModalOpen(true);
  };

  const handleAddNewEmployee = async (employeeData: any) => {
    try {
      // Add employee to payroll
      const response = await payrollApi.create(employeeData);
      toast.success('Employee added to payroll successfully!');
      await loadData();
      return response;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  };

  const handleProcessPayrollSubmit = async (payrollData: any) => {
    try {
      const response = await payrollApi.process(payrollData);
      toast.success('Payroll processed successfully!');
      await loadData();
      return response;
    } catch (error) {
      console.error('Error processing payroll:', error);
      throw error;
    }
  };

  const handleCalculateTax = () => {
    console.log('Calculate tax clicked');
  };

  const handleGenerateReports = () => {
    console.log('Generate reports clicked');
  };

  const handleManageBenefits = () => {
    console.log('Manage benefits clicked');
  };

  const handleExportPayslips = () => {
    console.log('Export payslips clicked');
  };

  const handleExport = () => {
    console.log('Export data');
  };

  // Extract unique departments
  const departments = ['All', ...Array.from(new Set(payrollData.map(emp => emp.department))).filter(Boolean)];
  const statuses = ['All', 'Active', 'On Leave', 'Pending', 'Terminated'];

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
      >
        <PayrollHeader
            attendanceSummary={{
              todayPresent: attendanceStats.totalPresentDays,
              todayAbsent: attendanceStats.totalAbsentDays,
              todayLate: attendanceStats.totalLateDays,
              attendanceRate: attendanceStats.attendanceRate
            }}
        />

        <PayrollQuickActions
            onAddEmployee={handleAddEmployee}
            onProcessPayroll={handleProcessPayrollBulk}
            onCalculateTax={handleCalculateTax}
            onGenerateReports={handleGenerateReports}
            onManageBenefits={handleManageBenefits}
            onExportPayslips={handleExportPayslips}
        />

        <PayrollSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterDepartment={filterDepartment}
            setFilterDepartment={setFilterDepartment}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            departments={departments}
            statuses={statuses}
            onProcessPayroll={handleProcessPayrollBulk}
            onAddEmployee={handleAddEmployee}
            onExport={handleExport}
        />

        {/* Add Employee Modal */}
        <AddPayrollModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddEmployee={handleAddNewEmployee}
            jobGrades={jobGrades}
        />

        {/* Process Payroll Modal */}
        <ProcessPayrollModal
            isOpen={isProcessPayrollModalOpen}
            onClose={() => setIsProcessPayrollModalOpen(false)}
            onProcessPayroll={handleProcessPayrollSubmit}
            employees={payrollData}
        />

        <PayrollTable
            data={filteredData}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / 10)}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onProcessPayroll={handleProcessPayrollIndividual}
            onGeneratePayslip={handleGeneratePayslip}
            onExportAttendance={handleExportAttendance}
            loading={loading}
        />
      </motion.div>
  );
};

export default PagePayroll;