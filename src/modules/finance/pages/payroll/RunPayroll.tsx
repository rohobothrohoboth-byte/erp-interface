// src/pages/finance/payroll/RunPayroll.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Users,
    Calendar,
    Clock,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    FileText,
    Download,
    RefreshCw,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Plus,
    Settings,
    Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import useToast from '@/shared/hooks/useToast';
import { payrollApi } from '@/modules/finance/services/payroll/payrollApi';
import { employeeApi } from '@/modules/hr/services/attandance/employeeApi';
import ProcessPayrollModal from '@/modules/finance/components/payroll/ProcessPayroll';
import { AttendanceIntegrationService } from '@/modules/finance/services/payroll/AttendanceIntegrationService';

interface PayrollRun {
    id: string;
    name: string;
    period: string;
    startDate: string;
    endDate: string;
    payDate: string;
    status: 'draft' | 'processing' | 'completed' | 'approved';
    totalEmployees: number;
    totalGross: number;
    totalNet: number;
    totalDeductions: number;
    processedBy: string;
    processedAt: string;
}

interface PayrollEmployee {
    id: string;
    employeeId: string;
    name: string;
    department: string;
    position: string;
    baseSalary: number;
    overtimePay: number;
    bonusPay: number;
    deductions: number;
    netPay: number;
    attendance: {
        presentDays: number;
        absentDays: number;
        lateDays: number;
        overtimeHours: number;
        attendanceRate: number;
    };
}

const RunPayroll: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
    const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
    const [period, setPeriod] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const attendanceService = new AttendanceIntegrationService();

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load payroll runs
            const runs = await payrollApi.getPayrollRuns();
            setPayrollRuns(runs || []);

            // Load employees for current period
            const empData = await employeeApi.fetchAllEmployees();
            const formattedEmployees = empData.map((emp: any) => ({
                id: emp.id,
                employeeId: emp.employeeCode || `EMP-${emp.id.slice(0, 8)}`,
                name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.fullName || 'Unknown',
                department: emp.departmentName || emp.department || 'Unassigned',
                position: emp.positionName || emp.position || 'N/A',
                baseSalary: emp.baseSalary || 0,
                overtimePay: 0,
                bonusPay: 0,
                deductions: 0,
                netPay: emp.baseSalary || 0,
                attendance: {
                    presentDays: 0,
                    absentDays: 0,
                    lateDays: 0,
                    overtimeHours: 0,
                    attendanceRate: 0
                }
            }));
            setEmployees(formattedEmployees);

            // Load attendance data
            const summaries = await attendanceService.getAttendanceForAllEmployees(period.month, period.year);
            const data: Record<string, any> = {};
            summaries.forEach(summary => {
                data[summary.employeeId] = summary;
            });
            setAttendanceData(data);

            // Update employees with attendance
            const updatedEmployees = formattedEmployees.map(emp => {
                const attendance = data[emp.id];
                if (attendance) {
                    return {
                        ...emp,
                        attendance: {
                            presentDays: attendance.presentDays || 0,
                            absentDays: attendance.absentDays || 0,
                            lateDays: attendance.lateDays || 0,
                            overtimeHours: attendance.totalOvertimeHours || 0,
                            attendanceRate: attendance.attendanceRate || 0
                        }
                    };
                }
                return emp;
            });
            setEmployees(updatedEmployees);

        } catch (error) {
            console.error('Error loading payroll data:', error);
            toast.error('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayroll = async (data: any) => {
        try {
            const response = await payrollApi.process(data);
            toast.success('Payroll processed successfully!');
            await loadData();
            return response;
        } catch (error) {
            console.error('Error processing payroll:', error);
            throw error;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="outline" className="bg-gray-100 text-gray-700">Draft</Badge>;
            case 'processing':
                return <Badge variant="outline" className="bg-blue-100 text-blue-700">Processing</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-green-100 text-green-700">Completed</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-purple-100 text-purple-700">Approved</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payroll data...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-indigo-600" />
                        Run <span className="text-indigo-600">Payroll</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Process and manage payroll runs</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setIsProcessModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Payroll Run
                    </Button>
                    <Button
                        variant="outline"
                        onClick={loadData}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Period Selector */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Month</label>
                            <select
                                value={period.month}
                                onChange={(e) => setPeriod({ ...period, month: parseInt(e.target.value) })}
                                className="ml-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Year</label>
                            <select
                                value={period.year}
                                onChange={(e) => setPeriod({ ...period, year: parseInt(e.target.value) })}
                                className="ml-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={loadData}>Load Data</Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="summary">Payroll Runs</TabsTrigger>
                    <TabsTrigger value="employees">Employee Payroll</TabsTrigger>
                    <TabsTrigger value="processing">Processing</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                    {/* Payroll Runs Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500">Total Runs</p>
                                <p className="text-2xl font-bold">{payrollRuns.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500">Total Employees</p>
                                <p className="text-2xl font-bold">{employees.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500">Total Payroll</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {formatCurrency(employees.reduce((sum, e) => sum + e.netPay, 0))}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500">Avg. Attendance Rate</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {employees.length > 0
                                        ? Math.round(employees.reduce((sum, e) => sum + e.attendance.attendanceRate, 0) / employees.length)
                                        : 0}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payroll Runs List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payroll Runs History</CardTitle>
                            <CardDescription>Previous payroll runs and their status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {payrollRuns.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No payroll runs found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {payrollRuns.map((run) => (
                                        <div key={run.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex flex-wrap justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{run.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {run.startDate} - {run.endDate}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        {getStatusBadge(run.status)}
                                                        <span className="text-xs text-gray-400">
                              Processed: {run.processedAt}
                            </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Total Net Pay</p>
                                                    <p className="font-bold text-indigo-600">{formatCurrency(run.totalNet)}</p>
                                                    <p className="text-xs text-gray-500">{run.totalEmployees} employees</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="employees">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Payroll</CardTitle>
                            <CardDescription>Detailed payroll breakdown by employee</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Employee</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Department</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Attendance</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Base Salary</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Overtime</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Net Pay</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{emp.name}</p>
                                                    <p className="text-xs text-gray-400">{emp.employeeId}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2 text-sm">
                                                    <span className="text-emerald-600">{emp.attendance.presentDays}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-red-600">{emp.attendance.absentDays}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-amber-600">{emp.attendance.lateDays}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-indigo-600">{emp.attendance.overtimeHours}h</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(emp.baseSalary)}</td>
                                            <td className="px-4 py-3 text-right text-indigo-600">{formatCurrency(emp.overtimePay)}</td>
                                            <td className="px-4 py-3 text-right font-bold">{formatCurrency(emp.netPay)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr className="bg-gray-50 font-semibold">
                                        <td colSpan={3} className="px-4 py-3 text-right">Totals</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(employees.reduce((sum, e) => sum + e.baseSalary, 0))}</td>
                                        <td className="px-4 py-3 text-right text-indigo-600">{formatCurrency(employees.reduce((sum, e) => sum + e.overtimePay, 0))}</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(employees.reduce((sum, e) => sum + e.netPay, 0))}</td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="processing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payroll Processing</CardTitle>
                            <CardDescription>Process payroll for the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-100 rounded-full">
                                            <DollarSign className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-indigo-900">Ready to Process Payroll</h3>
                                            <p className="text-sm text-indigo-700 mt-1">
                                                {employees.length} employees ready for payroll processing for {new Date(period.year, period.month - 1).toLocaleString('default', { month: 'long' })} {period.year}
                                            </p>
                                            <Button
                                                onClick={() => setIsProcessModalOpen(true)}
                                                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                                            >
                                                <DollarSign className="h-4 w-4 mr-2" />
                                                Process Payroll
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Process Payroll Modal */}
            <ProcessPayrollModal
                isOpen={isProcessModalOpen}
                onClose={() => setIsProcessModalOpen(false)}
                onProcessPayroll={handleProcessPayroll}
                employees={employees}
                month={period.month}
                year={period.year}
            />
        </motion.div>
    );
};

export default RunPayroll;