// src/pages/finance/payroll/PayrollReports.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Download,
    FileText,
    Printer,
    Calendar,
    DollarSign,
    Users,
    TrendingUp,
    TrendingDown,
    Filter,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import useToast from '@/shared/hooks/useToast';
import { payrollApi } from '@/modules/finance/services/payroll/payrollApi';

interface ReportSummary {
    totalEmployees: number;
    totalPayroll: number;
    averageSalary: number;
    totalOvertime: number;
    totalDeductions: number;
    totalBenefits: number;
    attendanceRate: number;
}

interface DepartmentReport {
    department: string;
    employees: number;
    totalPayroll: number;
    averageSalary: number;
}

const PayrollReports: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [departmentReports, setDepartmentReports] = useState<DepartmentReport[]>([]);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        loadReports();
    }, [selectedMonth, selectedYear]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [summaryData, deptData] = await Promise.all([
                payrollApi.getReportSummary(selectedMonth, selectedYear),
                payrollApi.getDepartmentReport(selectedMonth, selectedYear)
            ]);
            setSummary(summaryData);
            setDepartmentReports(deptData || []);
        } catch (error) {
            console.error('Error loading reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
        try {
            const blob = await payrollApi.exportReport(selectedMonth, selectedYear, format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payroll_report_${selectedMonth}_${selectedYear}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success(`Report exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Failed to export report');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading reports...</span>
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
                        <BarChart3 className="h-8 w-8 text-indigo-600" />
                        Payroll <span className="text-indigo-600">Reports</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Analyze payroll data and generate reports</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => loadReports()}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => handleExport('pdf')}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        PDF
                    </Button>
                    <Button
                        onClick={() => handleExport('excel')}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Month</label>
                            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Year</label>
                            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => loadReports()}>Apply</Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="department">By Department</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                    {summary && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Total Employees</p>
                                                <p className="text-2xl font-bold">{summary.totalEmployees}</p>
                                            </div>
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Total Payroll</p>
                                                <p className="text-2xl font-bold">{formatCurrency(summary.totalPayroll)}</p>
                                            </div>
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Average Salary</p>
                                                <p className="text-2xl font-bold">{formatCurrency(summary.averageSalary)}</p>
                                            </div>
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Total Overtime</p>
                                                <p className="text-2xl font-bold">{summary.totalOvertime.toFixed(1)}h</p>
                                            </div>
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <TrendingUp className="h-5 w-5 text-amber-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Summary</CardTitle>
                                    <CardDescription>Breakdown of payroll components</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500">Total Benefits</p>
                                            <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalBenefits)}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500">Total Deductions</p>
                                            <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalDeductions)}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500">Attendance Rate</p>
                                            <p className="text-xl font-bold text-blue-600">{summary.attendanceRate}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="department">
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Breakdown</CardTitle>
                            <CardDescription>Payroll distribution by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {departmentReports.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No department data available</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {departmentReports.map((dept, index) => (
                                        <div key={index} className="flex flex-wrap items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                                                    {index + 1}
                                                </Badge>
                                                <div>
                                                    <p className="font-semibold">{dept.department}</p>
                                                    <p className="text-sm text-gray-500">{dept.employees} employees</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Total Payroll</p>
                                                    <p className="font-bold">{formatCurrency(dept.totalPayroll)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Average Salary</p>
                                                    <p className="font-medium">{formatCurrency(dept.averageSalary)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Analysis</CardTitle>
                            <CardDescription>Attendance metrics and trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                                    <p className="text-sm text-gray-500">Attendance Rate</p>
                                    <p className="text-3xl font-bold text-green-600">{summary?.attendanceRate || 0}%</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
                                    <p className="text-sm text-gray-500">Total Overtime</p>
                                    <p className="text-3xl font-bold text-amber-600">{summary?.totalOvertime.toFixed(1) || 0}h</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                    <p className="text-sm text-gray-500">Total Benefits</p>
                                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(summary?.totalBenefits || 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Export Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Export Reports</CardTitle>
                    <CardDescription>Download reports in different formats</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            variant="outline"
                            onClick={() => handleExport('pdf')}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            PDF
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport('excel')}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Excel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport('csv')}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            CSV
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                            className="flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default PayrollReports;