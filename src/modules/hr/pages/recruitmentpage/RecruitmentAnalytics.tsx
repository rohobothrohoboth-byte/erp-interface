// src/pages/hr/recruitmentpage/RecruitmentAnalytics.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    Briefcase,
    Calendar,
    TrendingUp,
    TrendingDown,
    BarChart,
    PieChart,
    Download,
    Filter,
    RefreshCw,
    Loader2,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useWorkforcePlans } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import { useJobPostings } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.queries';
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { useVacancies } from '@/modules/hr/services/recruitment/vacancy/vacancy.queries';

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: number;
    change?: number;
    icon: React.ReactNode;
    color: string;
}> = ({ title, value, change, icon, color }) => (
    <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(change)}% vs last month
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

const RecruitmentAnalytics: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data
    const { data: workforcePlans = [], refetch: refetchPlans } = useWorkforcePlans();
    const { data: jobPostings = [], refetch: refetchPostings } = useJobPostings();
    const { data: applicants = [], refetch: refetchApplicants } = useAllApplicants();
    const { data: vacancies = [], refetch: refetchVacancies } = useVacancies();

    const handleRefresh = async () => {
        setIsLoading(true);
        await Promise.all([
            refetchPlans(),
            refetchPostings(),
            refetchApplicants(),
            refetchVacancies(),
        ]);
        setIsLoading(false);
    };

    // Calculate stats
    const totalPlans = workforcePlans.length;
    const activePlans = workforcePlans.filter(p => p.statusStr === 'Active' || p.statusStr === 'Approved').length;
    const pendingPlans = workforcePlans.filter(p => p.statusStr === 'Pending').length;

    const totalPostings = jobPostings.length;
    const publishedPostings = jobPostings.filter(p => p.statusStr === 'Published').length;
    const closedPostings = jobPostings.filter(p => p.statusStr === 'Closed').length;

    const totalApplicants = applicants.length;
    const totalVacancies = vacancies.length;

    // Mock trends (will be replaced with real data)
    const trends = {
        applicants: 15,
        postings: 8,
        plans: 5,
        vacancies: -3,
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/recruitment/dashboard')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Recruitment Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Detailed insights and metrics</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        <span className="ml-2">Refresh</span>
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="applicants">Applicants</TabsTrigger>
                    <TabsTrigger value="postings">Postings</TabsTrigger>
                    <TabsTrigger value="plans">Workforce Plans</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Applicants"
                            value={totalApplicants}
                            change={trends.applicants}
                            icon={<Users className="w-5 h-5 text-blue-600" />}
                            color="blue"
                        />
                        <StatCard
                            title="Open Vacancies"
                            value={totalVacancies}
                            change={trends.vacancies}
                            icon={<Briefcase className="w-5 h-5 text-green-600" />}
                            color="green"
                        />
                        <StatCard
                            title="Active Postings"
                            value={publishedPostings}
                            change={trends.postings}
                            icon={<Calendar className="w-5 h-5 text-purple-600" />}
                            color="purple"
                        />
                        <StatCard
                            title="Workforce Plans"
                            value={totalPlans}
                            change={trends.plans}
                            icon={<FileText className="w-5 h-5 text-orange-600" />}
                            color="orange"
                        />
                    </div>

                    {/* Chart Placeholders */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Applications Over Time</h3>
                                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Applications trend chart</p>
                                        <p className="text-xs text-gray-400">Using Recharts or Chart.js</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Posting Status Distribution</h3>
                                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <PieChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Posting distribution chart</p>
                                        <p className="text-xs text-gray-400">Using Recharts or Chart.js</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Table */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recruitment Summary</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium text-gray-600">Metric</th>
                                        <th className="text-right py-2 font-medium text-gray-600">Count</th>
                                        <th className="text-right py-2 font-medium text-gray-600">Trend</th>
                                        <th className="text-right py-2 font-medium text-gray-600">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-gray-800">Total Applicants</td>
                                        <td className="text-right font-medium">{totalApplicants}</td>
                                        <td className="text-right text-green-500">↑ 12%</td>
                                        <td className="text-right">
                                            <Badge className="bg-green-100 text-green-700">Good</Badge>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-gray-800">Published Postings</td>
                                        <td className="text-right font-medium">{publishedPostings}</td>
                                        <td className="text-right text-green-500">↑ 8%</td>
                                        <td className="text-right">
                                            <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-gray-800">Pending Plans</td>
                                        <td className="text-right font-medium">{pendingPlans}</td>
                                        <td className="text-right text-yellow-500">↑ 5%</td>
                                        <td className="text-right">
                                            <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-800">Closed Postings</td>
                                        <td className="text-right font-medium">{closedPostings}</td>
                                        <td className="text-right text-red-500">↓ 3%</td>
                                        <td className="text-right">
                                            <Badge className="bg-gray-100 text-gray-700">Closed</Badge>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Applicant Analytics */}
            {activeTab === 'applicants' && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700">Applicant Analytics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Applicants</p>
                                    <p className="text-2xl font-bold text-blue-600">{totalApplicants}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Shortlisted</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {Math.round(totalApplicants * 0.3)}
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {Math.round(totalApplicants * 0.4)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Posting Analytics */}
            {activeTab === 'postings' && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700">Posting Analytics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Postings</p>
                                    <p className="text-2xl font-bold text-purple-600">{totalPostings}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Published</p>
                                    <p className="text-2xl font-bold text-green-600">{publishedPostings}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Closed</p>
                                    <p className="text-2xl font-bold text-gray-600">{closedPostings}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Workforce Plan Analytics */}
            {activeTab === 'plans' && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700">Workforce Plan Analytics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Plans</p>
                                    <p className="text-2xl font-bold text-orange-600">{totalPlans}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{activePlans}</p>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{pendingPlans}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default RecruitmentAnalytics;