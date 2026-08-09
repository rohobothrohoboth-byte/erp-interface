// src/services/payroll/AttendanceIntegrationService.ts
import { attendanceApi } from '../../hr/attandance/attendanceApi';
import { employeeApi } from '../../hr/attandance/employeeApi';

export interface AttendanceSummary {
    employeeId: string;
    employeeName: string;
    periodStart: string;
    periodEnd: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    holidayDays: number;
    weekendDays: number;
    totalHoursWorked: number;
    totalOvertimeHours: number;
    attendanceRate: number;
    lateMinutes: number;
}

export class AttendanceIntegrationService {
    private attendanceCache: Map<string, AttendanceSummary> = new Map();

    async getAttendanceForPayroll(employeeId: string, month: number, year: number): Promise<AttendanceSummary> {
        const cacheKey = `${employeeId}-${month}-${year}`;

        // Check cache
        if (this.attendanceCache.has(cacheKey)) {
            return this.attendanceCache.get(cacheKey)!;
        }

        try {
            const summary = await attendanceApi.getAttendanceStats(employeeId, month, year);

            const result: AttendanceSummary = {
                employeeId: summary.employeeId,
                employeeName: summary.employeeName || 'Unknown',
                periodStart: summary.periodStart,
                periodEnd: summary.periodEnd,
                totalDays: summary.totalDays,
                presentDays: summary.presentDays,
                absentDays: summary.absentDays,
                lateDays: summary.lateDays,
                leaveDays: summary.leaveDays,
                holidayDays: summary.holidayDays,
                weekendDays: summary.weekendDays,
                totalHoursWorked: summary.totalHoursWorked,
                totalOvertimeHours: summary.totalOvertimeHours,
                attendanceRate: summary.attendanceRate,
                lateMinutes: summary.lateDays * 15 // Approximate
            };

            // Cache for 5 minutes
            this.attendanceCache.set(cacheKey, result);
            setTimeout(() => this.attendanceCache.delete(cacheKey), 5 * 60 * 1000);

            return result;
        } catch (error) {
            console.error(`Error fetching attendance for employee ${employeeId}:`, error);
            // Return default summary with zeros
            return {
                employeeId,
                employeeName: 'Unknown',
                periodStart: new Date(year, month - 1, 1).toISOString(),
                periodEnd: new Date(year, month, 0).toISOString(),
                totalDays: 0,
                presentDays: 0,
                absentDays: 0,
                lateDays: 0,
                leaveDays: 0,
                holidayDays: 0,
                weekendDays: 0,
                totalHoursWorked: 0,
                totalOvertimeHours: 0,
                attendanceRate: 0,
                lateMinutes: 0
            };
        }
    }

    async getAttendanceForAllEmployees(month: number, year: number): Promise<AttendanceSummary[]> {
        try {
            const employees = await employeeApi.fetchAllEmployees();
            const summaries = await Promise.all(
                employees.map(emp => this.getAttendanceForPayroll(emp.id, month, year))
            );
            return summaries;
        } catch (error) {
            console.error('Error fetching attendance for all employees:', error);
            throw error;
        }
    }

    calculateSalaryAdjustments(attendance: AttendanceSummary, baseSalary: number): {
        deductions: number;
        additions: number;
        details: {
            absentDeduction: number;
            latePenalty: number;
            leaveDeduction: number;
            overtimePay: number;
            holidayPay: number;
            weekendPay: number;
        };
    } {
        const dailyRate = baseSalary / attendance.totalDays;
        const hourlyRate = dailyRate / 8;

        // Deductions
        const absentDeduction = attendance.absentDays * dailyRate;
        const latePenalty = attendance.lateDays * hourlyRate;
        const leaveDeduction = attendance.leaveDays * dailyRate * 0.5; // 50% pay for leave

        // Additions
        const overtimePay = attendance.totalOvertimeHours * hourlyRate * 1.5;
        const holidayPay = attendance.holidayDays * dailyRate * 2; // Double pay for holidays
        const weekendPay = attendance.weekendDays * dailyRate * 1.5; // 1.5x for weekends

        return {
            deductions: absentDeduction + latePenalty + leaveDeduction,
            additions: overtimePay + holidayPay + weekendPay,
            details: {
                absentDeduction,
                latePenalty,
                leaveDeduction,
                overtimePay,
                holidayPay,
                weekendPay
            }
        };
    }

    clearCache(): void {
        this.attendanceCache.clear();
    }
}