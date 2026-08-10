// src/pages/hr/attendancepage/AttendanceReport.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Calendar,
    Download,
    Filter,
    RefreshCw,
    Search,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    FileText,
    Printer,
    ChevronDown,
    ChevronUp,
    Loader2,
    Users,
    Clock,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { attendanceApi } from '@/modules/hr/services/attandance/attendanceApi';
import { employeeApi } from '@/modules/hr/services/attandance/employeeApi';
import dayjs from 'dayjs';

// ============ Types ============
interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    department: string;
    departmentId: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Holiday' | 'Weekend';
    hoursWorked: number;
    overtimeHours: number;
    isLate: boolean;
    lateMinutes: number;
    isEarlyDeparture: boolean;
    earlyDepartureMinutes: number;
    shiftName: string | null;
    location: string;
    notes: string | null;
}

interface AttendanceSummary {
    totalEmployees: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    leaveCount: number;
    holidayCount: number;
    weekendCount: number;
    attendanceRate: number;
    totalHours: number;
    averageHours: number;
    overtimeTotal: number;
}

interface ReportFilters {
    dateRange: 'today' | 'week' | 'month' | 'custom';
    startDate: string;
    endDate: string;
    department: string;
    status: string;
    employeeId: string;
    searchTerm: string;
}

interface Department {
    id: string;
    name: string;
    employeeCount: number;
}

// ============ Print Styles ============
const printStyles = `
    @media print {
        body * {
            visibility: hidden;
        }
        #print-area, #print-area * {
            visibility: visible;
        }
        #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
        }
        .no-print {
            display: none !important;
        }
        .print-header {
            display: block !important;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .print-summary {
            display: grid !important;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }
        .print-summary-item {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
            border-radius: 4px;
        }
        .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        .print-table th {
            background: #f3f4f6;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: 600;
        }
        .print-table td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        .print-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .print-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .print-status-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
        }
        .print-status-present { background: #d1fae5; color: #065f46; }
        .print-status-absent { background: #fee2e2; color: #991b1b; }
        .print-status-late { background: #fef3c7; color: #92400e; }
        .print-status-leave { background: #dbeafe; color: #1e40af; }
        .print-status-holiday { background: #f3e8ff; color: #6b21a8; }
        .print-status-weekend { background: #f3f4f6; color: #4b5563; }
    }
`;

// ============ Main Component ============
const AttendanceReport: React.FC = () => {
    // State
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Filters
    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: 'today',
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        department: '',
        status: '',
        employeeId: '',
        searchTerm: ''
    });

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    // Load data when filters change
    useEffect(() => {
        if (!isLoading) {
            loadData();
        }
    }, [filters.department, filters.status, filters.employeeId]);

    // ============ Load Real Data ============
    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const empData = await employeeApi.fetchAllEmployees();
            setEmployees(empData || []);
            console.log('✅ Employees loaded:', empData?.length || 0);

            const deptMap = new Map<string, { id: string; name: string; count: number }>();
            (empData || []).forEach((emp: any) => {
                const deptName = emp.departmentName || emp.department || 'Unassigned';
                if (!deptMap.has(deptName)) {
                    deptMap.set(deptName, {
                        id: `dept-${deptName.replace(/\s/g, '-').toLowerCase()}`,
                        name: deptName,
                        count: 0
                    });
                }
                deptMap.get(deptName)!.count++;
            });
            setDepartments(Array.from(deptMap.values()));

            const startDate = filters.dateRange === 'custom'
                ? filters.startDate
                : dayjs().subtract(
                    filters.dateRange === 'today' ? 0 :
                        filters.dateRange === 'week' ? 7 : 30,
                    'days'
                ).format('YYYY-MM-DD');

            const endDate = filters.dateRange === 'custom'
                ? filters.endDate
                : dayjs().format('YYYY-MM-DD');

            console.log(`📡 Fetching attendance from ${startDate} to ${endDate}`);

            let attendanceData: any[] = [];

            try {
                const response = await attendanceApi.getAttendanceRecords({
                    from: new Date(startDate + 'T00:00:00Z').toISOString(),
                    to: new Date(endDate + 'T23:59:59Z').toISOString(),
                    page: 1,
                    pageSize: 1000
                });

                if (response) {
                    if (response.data?.items) {
                        attendanceData = response.data.items;
                    } else if (response.data?.data?.items) {
                        attendanceData = response.data.data.items;
                    } else if (Array.isArray(response.data)) {
                        attendanceData = response.data;
                    } else if (Array.isArray(response)) {
                        attendanceData = response;
                    }
                }
                console.log('📊 Attendance records loaded:', attendanceData.length);
            } catch (error) {
                console.warn('⚠️ Error fetching attendance records, using daily report fallback:', error);
                const dailyResponse = await attendanceApi.getDailyReport(endDate);
                if (dailyResponse?.data?.records) {
                    attendanceData = dailyResponse.data.records;
                } else if (dailyResponse?.data?.data?.records) {
                    attendanceData = dailyResponse.data.data.records;
                } else if (Array.isArray(dailyResponse?.data)) {
                    attendanceData = dailyResponse.data;
                }
            }

            const mappedRecords: AttendanceRecord[] = attendanceData.map((record: any) => {
                const employee = (empData || []).find((e: any) => e.id === record.employeeId);
                const fullName = employee
                    ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || 'Unknown'
                    : record.employeeName || 'Unknown';
                const deptName = employee?.departmentName || employee?.department || record.department || 'Unassigned';

                return {
                    id: record.id || `att-${Date.now()}-${Math.random()}`,
                    employeeId: record.employeeId,
                    employeeName: fullName,
                    employeeCode: employee?.employeeCode || record.employeeCode || 'N/A',
                    department: deptName,
                    departmentId: `dept-${deptName.replace(/\s/g, '-').toLowerCase()}`,
                    date: record.date || new Date().toISOString(),
                    checkIn: record.checkIn || null,
                    checkOut: record.checkOut || null,
                    status: record.status || 'Absent',
                    hoursWorked: record.hoursWorked || 0,
                    overtimeHours: record.overtimeHours || 0,
                    isLate: record.isLate || false,
                    lateMinutes: record.lateMinutes || 0,
                    isEarlyDeparture: record.isEarlyDeparture || false,
                    earlyDepartureMinutes: record.earlyDepartureMinutes || 0,
                    shiftName: record.shiftName || null,
                    location: record.location || 'Office',
                    notes: record.notes || null
                };
            });

            let filteredRecords = mappedRecords;

            if (filters.department) {
                filteredRecords = filteredRecords.filter(r => r.department === filters.department);
            }
            if (filters.status) {
                filteredRecords = filteredRecords.filter(r => r.status === filters.status);
            }
            if (filters.employeeId) {
                filteredRecords = filteredRecords.filter(r => r.employeeId === filters.employeeId);
            }
            if (filters.searchTerm) {
                const search = filters.searchTerm.toLowerCase();
                filteredRecords = filteredRecords.filter(r =>
                    r.employeeName.toLowerCase().includes(search) ||
                    r.employeeCode.toLowerCase().includes(search) ||
                    r.department.toLowerCase().includes(search)
                );
            }

            setRecords(filteredRecords);

            const summary: AttendanceSummary = {
                totalEmployees: filteredRecords.length,
                presentCount: filteredRecords.filter(r => r.status === 'Present').length,
                absentCount: filteredRecords.filter(r => r.status === 'Absent').length,
                lateCount: filteredRecords.filter(r => r.status === 'Late').length,
                leaveCount: filteredRecords.filter(r => r.status === 'Leave').length,
                holidayCount: filteredRecords.filter(r => r.status === 'Holiday').length,
                weekendCount: filteredRecords.filter(r => r.status === 'Weekend').length,
                attendanceRate: filteredRecords.length > 0
                    ? (filteredRecords.filter(r => r.status === 'Present' || r.status === 'Late').length / filteredRecords.length) * 100
                    : 0,
                totalHours: filteredRecords.reduce((sum, r) => sum + r.hoursWorked, 0),
                averageHours: filteredRecords.length > 0
                    ? filteredRecords.reduce((sum, r) => sum + r.hoursWorked, 0) / filteredRecords.length
                    : 0,
                overtimeTotal: filteredRecords.reduce((sum, r) => sum + r.overtimeHours, 0)
            };

            setSummary(summary);
            console.log('✅ Report loaded:', filteredRecords.length, 'records');

        } catch (error) {
            console.error('❌ Failed to load report:', error);
            setError('Failed to load attendance report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ============ Handlers ============
    const handleRefresh = () => {
        loadData();
    };

    // ============ Export Functions ============
    const exportToCSV = () => {
        if (records.length === 0) {
            alert('No records to export');
            return;
        }

        try {
            const headers = ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status', 'Location'];
            const rows = records.map(r => [
                r.employeeName,
                r.department,
                formatDate(r.date),
                formatTime(r.checkIn),
                formatTime(r.checkOut),
                r.hoursWorked.toFixed(1),
                r.status,
                r.location
            ]);

            let csv = '\uFEFF' + headers.join(',') + '\n'; // Add BOM for Excel
            rows.forEach(row => {
                csv += row.join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_report_${dayjs().format('YYYY-MM-DD')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            alert('✅ Report exported as CSV successfully!');
        } catch (error) {
            console.error('CSV export failed:', error);
            alert('Failed to export CSV. Please try again.');
        }
    };

    const exportToExcel = () => {
        if (records.length === 0) {
            alert('No records to export');
            return;
        }

        try {
            const headers = ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status', 'Location'];
            const rows = records.map(r => [
                r.employeeName,
                r.department,
                formatDate(r.date),
                formatTime(r.checkIn),
                formatTime(r.checkOut),
                r.hoursWorked.toFixed(1),
                r.status,
                r.location
            ]);

            // Create HTML table for Excel
            let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head><meta charset="UTF-8">
                <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Attendance</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                </head>
                <body>
                <table border="1" cellpadding="5">
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;

            rows.forEach(row => {
                html += `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
            });

            html += `</table></body></html>`;

            const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_report_${dayjs().format('YYYY-MM-DD')}.xls`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            alert('✅ Report exported as Excel successfully!');
        } catch (error) {
            console.error('Excel export failed:', error);
            alert('Failed to export Excel. Please try again.');
        }
    };

    // ============ Print Function ============
    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=1024,height=768');
        if (!printWindow) {
            alert('Please allow popups for printing');
            return;
        }

        // ✅ CORRECT CSS - properly wrapped in <style> tags
        const printCSS = `
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 40px;
            color: #333;
        }
        .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .print-header h1 {
            font-size: 24px;
            margin: 0;
            color: #1a1a2e;
        }
        .print-header p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .print-summary {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
            margin-bottom: 30px;
        }
        .print-summary-item {
            border: 1px solid #ddd;
            padding: 15px 10px;
            text-align: center;
            border-radius: 4px;
            background: #f8f9fa;
        }
        .print-summary-item .number {
            font-size: 24px;
            font-weight: bold;
        }
        .print-summary-item .label {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        .print-summary-item.present .number { color: #059669; }
        .print-summary-item.absent .number { color: #dc2626; }
        .print-summary-item.late .number { color: #d97706; }
        .print-summary-item.leave .number { color: #2563eb; }
        .print-summary-item.rate .number { color: #7c3aed; }
        .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 20px;
        }
        .print-table th {
            background: #f3f4f6;
            border: 1px solid #ddd;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .print-table td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        .print-table tr:nth-child(even) {
            background: #fafafa;
        }
        .print-status-badge {
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
            display: inline-block;
        }
        .print-status-badge.present { background: #d1fae5; color: #065f46; }
        .print-status-badge.absent { background: #fee2e2; color: #991b1b; }
        .print-status-badge.late { background: #fef3c7; color: #92400e; }
        .print-status-badge.leave { background: #dbeafe; color: #1e40af; }
        .print-status-badge.holiday { background: #f3e8ff; color: #6b21a8; }
        .print-status-badge.weekend { background: #f3f4f6; color: #4b5563; }
        .print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .print-meta {
            font-size: 12px;
            color: #666;
            text-align: right;
            margin-top: 10px;
        }
        .print-no-data {
            text-align: center;
            padding: 40px;
            color: #999;
        }
    `;

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Attendance Report - ${dayjs().format('YYYY-MM-DD')}</title>
            <style>${printCSS}</style> <!-- ✅ CSS properly wrapped in <style> tags -->
        </head>
        <body>
            <div id="print-area">
                <div class="print-header">
                    <h1>📊 Attendance Report</h1>
                    <p>Generated: ${dayjs().format('dddd, MMMM D, YYYY [at] h:mm A')}</p>
                    <p>Period: ${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}</p>
                    ${filters.department ? `<p>Department: ${filters.department}</p>` : ''}
                    ${filters.status ? `<p>Status: ${filters.status}</p>` : ''}
                </div>

                ${summary ? `
                <div class="print-summary">
                    <div class="print-summary-item">
                        <div class="number">${summary.totalEmployees}</div>
                        <div class="label">Total</div>
                    </div>
                    <div class="print-summary-item present">
                        <div class="number">${summary.presentCount}</div>
                        <div class="label">✅ Present</div>
                    </div>
                    <div class="print-summary-item absent">
                        <div class="number">${summary.absentCount}</div>
                        <div class="label">❌ Absent</div>
                    </div>
                    <div class="print-summary-item late">
                        <div class="number">${summary.lateCount}</div>
                        <div class="label">⏰ Late</div>
                    </div>
                    <div class="print-summary-item leave">
                        <div class="number">${summary.leaveCount}</div>
                        <div class="label">🏖️ Leave</div>
                    </div>
                    <div class="print-summary-item rate">
                        <div class="number">${summary.attendanceRate.toFixed(1)}%</div>
                        <div class="label">📊 Rate</div>
                    </div>
                </div>
                ` : ''}

                ${records.length > 0 ? `
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Date</th>
                            <th>Clock In</th>
                            <th>Clock Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(r => `
                        <tr>
                            <td><strong>${r.employeeName}</strong><br><span style="color:#999;font-size:10px;">${r.employeeCode}</span></td>
                            <td>${r.department}</td>
                            <td>${formatDate(r.date)}</td>
                            <td>${formatTime(r.checkIn)}</td>
                            <td>${formatTime(r.checkOut)}</td>
                            <td>${r.hoursWorked > 0 ? r.hoursWorked.toFixed(1) : '-'}</td>
                            <td><span class="print-status-badge ${r.status.toLowerCase()}">${r.status}${r.isLate ? ` (${r.lateMinutes}m late)` : ''}</span></td>
                            <td>${r.location}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : `
                <div class="print-no-data">
                    <p>No attendance records found for the selected period.</p>
                </div>
                `}

                <div class="print-meta">
                    <p>Total Records: ${records.length}</p>
                    <p>Generated by: ${localStorage.getItem('employeeName') || 'HR System'}</p>
                </div>
                 
<div class="print-footer">
    <p>© ${new Date().getFullYear()} HR Management System • Confidential Report</p>
    <p>Generated by: ${localStorage.getItem('employeeName') || localStorage.getItem('userName') || 'System User'}</p>
    <p>Generated on: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
</div>
            </div>
        </body>
        </html>
    `);

        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
        if (format === 'csv') {
            exportToCSV();
        } else if (format === 'excel') {
            exportToExcel();
        } else if (format === 'pdf') {
            handlePrint();
        }
    };

    const handleFilterChange = (key: keyof ReportFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDateRangeChange = (range: 'today' | 'week' | 'month' | 'custom') => {
        setFilters(prev => ({
            ...prev,
            dateRange: range,
            startDate: range === 'custom' ? prev.startDate : dayjs().subtract(
                range === 'today' ? 0 : range === 'week' ? 7 : 30, 'days'
            ).format('YYYY-MM-DD'),
            endDate: range === 'custom' ? prev.endDate : dayjs().format('YYYY-MM-DD')
        }));
    };

    const resetFilters = () => {
        setFilters({
            dateRange: 'today',
            startDate: dayjs().format('YYYY-MM-DD'),
            endDate: dayjs().format('YYYY-MM-DD'),
            department: '',
            status: '',
            employeeId: '',
            searchTerm: ''
        });
    };

    // ============ Helper Functions ============
    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            Present: 'bg-green-100 text-green-800 border-green-200',
            Absent: 'bg-red-100 text-red-800 border-red-200',
            Late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Leave: 'bg-blue-100 text-blue-800 border-blue-200',
            Holiday: 'bg-purple-100 text-purple-800 border-purple-200',
            Weekend: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status: string): React.ReactNode => {
        const icons: Record<string, React.ReactNode> = {
            Present: <CheckCircle className="h-4 w-4 text-green-600" />,
            Absent: <XCircle className="h-4 w-4 text-red-600" />,
            Late: <AlertCircle className="h-4 w-4 text-yellow-600" />,
            Leave: <Calendar className="h-4 w-4 text-blue-600" />,
            Holiday: <Calendar className="h-4 w-4 text-purple-600" />,
            Weekend: <Calendar className="h-4 w-4 text-gray-600" />
        };
        return icons[status] || <Calendar className="h-4 w-4 text-gray-600" />;
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr: string | null): string => {
        if (!dateStr) return '--:--';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============ Loading State ============
    if (isLoading && records.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Loading attendance report...</p>
                </div>
            </div>
        );
    }

    // ============ Error State ============
    if (error && records.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Report</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Print Styles */}
            <style>{printStyles}</style>

            {/* Print Area - Hidden on screen, shown in print */}
            <div id="print-area" style={{ display: 'none' }}>
                {/* Content will be rendered by JavaScript in handlePrint */}
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <BarChart3 className="h-8 w-8 text-green-600" />
                            Attendance <span className="text-green-600">Report</span>
                        </h1>
                        <p className="text-gray-500 mt-1">View and analyze attendance data</p>
                    </div>
                    <div className="flex flex-wrap gap-3 no-print">
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting}
                            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ${
                                isExporting ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            <FileText className="h-4 w-4" />
                            PDF
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={isExporting}
                            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${
                                isExporting ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            <Download className="h-4 w-4" />
                            Excel
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={isExporting}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                                isExporting ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            <FileText className="h-4 w-4" />
                            CSV
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                            <p className="text-2xl font-bold text-gray-800">{summary.totalEmployees}</p>
                            <p className="text-sm text-gray-500">Total</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                            <p className="text-2xl font-bold text-green-600">{summary.presentCount}</p>
                            <p className="text-sm text-gray-500">✅ Present</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
                            <p className="text-2xl font-bold text-red-600">{summary.absentCount}</p>
                            <p className="text-sm text-gray-500">❌ Absent</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
                            <p className="text-2xl font-bold text-yellow-600">{summary.lateCount}</p>
                            <p className="text-sm text-gray-500">⏰ Late</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
                            <p className="text-2xl font-bold text-purple-600">{summary.leaveCount}</p>
                            <p className="text-sm text-gray-500">🏖️ Leave</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
                            <p className="text-2xl font-bold text-emerald-600">{summary.attendanceRate.toFixed(1)}%</p>
                            <p className="text-sm text-gray-500">📊 Rate</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden no-print">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-500" />
                            <span className="font-medium text-gray-700">Filters</span>
                            <span className="text-sm text-gray-400">
                                {filters.department || filters.status || filters.employeeId || filters.searchTerm ? '(Active)' : ''}
                            </span>
                        </div>
                        {showFilters ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </button>

                    {showFilters && (
                        <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={e => handleDateRangeChange(e.target.value as any)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>

                                {filters.dateRange === 'custom' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={filters.startDate}
                                                onChange={e => handleFilterChange('startDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={filters.endDate}
                                                onChange={e => handleFilterChange('endDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        value={filters.department}
                                        onChange={e => handleFilterChange('department', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={e => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Late">Late</option>
                                        <option value="Leave">Leave</option>
                                        <option value="Holiday">Holiday</option>
                                        <option value="Weekend">Weekend</option>
                                    </select>
                                </div>

                                {/* Search */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                    <div className="relative">
                                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or code..."
                                            value={filters.searchTerm}
                                            onChange={e => handleFilterChange('searchTerm', e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Reset Filters
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Employee</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Department</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Clock In</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Clock Out</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Hours</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                            </tr>
                            </thead>
                            <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                                            <p className="font-medium">No attendance records found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{record.employeeName}</p>
                                                <p className="text-xs text-gray-400">{record.employeeCode}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{record.department}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatDate(record.date)}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatTime(record.checkIn)}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatTime(record.checkOut)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-700">
                                            {record.hoursWorked > 0 ? record.hoursWorked.toFixed(1) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    {record.status}
                                                    {record.isLate && ` (${record.lateMinutes}m late)`}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    {record.location}
                                                </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            Showing {records.length} records
                        </span>
                        <div className="flex gap-2 no-print">
                            <button
                                onClick={() => handleExport('csv')}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                            >
                                <Download className="h-3 w-3" />
                                CSV
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                            >
                                <Printer className="h-3 w-3" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>

                {/* Record Detail Modal */}
                {selectedRecord && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-white">Attendance Details</h3>
                                    <button
                                        onClick={() => setSelectedRecord(null)}
                                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <XCircle className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Employee</p>
                                        <p className="font-medium">{selectedRecord.employeeName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Employee Code</p>
                                        <p className="font-medium">{selectedRecord.employeeCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Department</p>
                                        <p className="font-medium">{selectedRecord.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium">{formatDate(selectedRecord.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Clock In</p>
                                        <p className="font-medium">{formatTime(selectedRecord.checkIn)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Clock Out</p>
                                        <p className="font-medium">{formatTime(selectedRecord.checkOut)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Hours Worked</p>
                                        <p className="font-medium">{selectedRecord.hoursWorked.toFixed(1)}h</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Overtime</p>
                                        <p className="font-medium">{selectedRecord.overtimeHours.toFixed(1)}h</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(selectedRecord.status)}`}>
                                            {getStatusIcon(selectedRecord.status)}
                                            {selectedRecord.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{selectedRecord.location}</p>
                                    </div>
                                </div>

                                {selectedRecord.isLate && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-700">
                                            ⏰ Late by {selectedRecord.lateMinutes} minutes
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AttendanceReport;