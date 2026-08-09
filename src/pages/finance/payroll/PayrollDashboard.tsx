// src/pages/finance/payroll/PayrollDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    DollarSign,
    Users,
    Calendar,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Download,
    RefreshCw,
    ArrowUp,
    ArrowDown,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import useToast from '../../../hooks/useToast';
import { payrollApi } from '../../../services/finance/payroll/payrollApi';
import { AttendanceIntegrationService } from '../../../services/finance/payroll/AttendanceIntegrationService';

interface DashboardStats {
    totalEmployees: number;
    activeEmployees: number;
    totalPayroll: number;
    averageSalary: number;
    attendanceRate: number;
    totalOvertime: number;
    nextPayDate: string;
    pendingApprovals: number;
}

interface RecentActivity {
    id: string;
    type: 'payroll' | 'employee' | 'attendance' | 'approval';
    message: string;
    timestamp: string;
    user: string;
}

const PayrollDashboard: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [attendanceSummary, setAttendanceSummary] = useState<any>(null);

    const attendanceService = new AttendanceIntegrationService();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            // Load stats
            const statsData = await payrollApi.getDashboardStats();
            setStats(statsData);

            // Load recent activities
            const activities = await payrollApi.getRecentActivities();
            setRecentActivities(activities || []);

            // Load attendance summary
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            const summaries = await attendanceService.getAttendanceForAllEmployees(month, year);

            const total = summaries.length;
            const present = summaries.reduce((sum, s) => sum + s.presentDays, 0);
            const absent = summaries.reduce((sum, s) => sum + s.absentDays, 0);
            const overtime = summaries.reduce((sum, s) => sum + s.totalOvertimeHours, 0);

            setAttendanceSummary({
                totalEmployees: total,
                totalPresent: present,
                totalAbsent: absent,
                totalOvertime: overtime,
                averageRate: total > 0 ? Math.round((present / (present + absent)) * 100) : 0
            });

        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'payroll':
                return <DollarSign className="h-4 w-4 text-indigo-600" />;
            case 'employee':
                return <Users className="h-4 w-4 text-emerald-600" />;
            case 'attendance':
                return <Clock className="h-4 w-4 text-amber-600" />;
            case 'approval':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading dashboard...</span>
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
                        <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                        Payroll <span className="text-indigo-600">Dashboard</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Overview of payroll and attendance metrics</p>
                </div>
                <Button
                    variant="outline"
                    onClick={loadDashboard}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">Total Employees</p>
                                <p className="text-2xl font-bold">{stats?.totalEmployees || 0}</p>
                                <p className="text-xs text-emerald-600">Active: {stats?.activeEmployees || 0}</p>
                            </div>
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">Monthly Payroll</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {formatCurrency(stats?.totalPayroll || 0)}
                                </p>
                                <p className="text-xs text-gray-500">Avg: {formatCurrency(stats?.averageSalary || 0)}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">Attendance Rate</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {attendanceSummary?.averageRate || 0}%
                                </p>
                                <p className="text-xs text-gray-500">
                                    {attendanceSummary?.totalPresent || 0} Present / {attendanceSummary?.totalAbsent || 0} Absent
                                </p>
                            </div>
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">Next Pay Date</p>
                                <p className="text-2xl font-bold text-blue-600">{stats?.nextPayDate || 'N/A'}</p>
                                <p className="text-xs text-gray-500">
                                    {stats?.pendingApprovals || 0} approvals pending
                                </p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest payroll and attendance updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No recent activity</p>
                            </div>
                        ) : (
                            recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                        <p className="text-xs text-gray-500">
                                            {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {activity.type}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default PayrollDashboard;