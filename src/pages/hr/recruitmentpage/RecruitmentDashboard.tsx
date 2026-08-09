// src/pages/hr/recruitmentpage/RecruitmentDashboard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    UserPlus,
    ClipboardCheck,
    Megaphone,
    Award,
    Star,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
    useWorkforcePlans,
} from '../../../services/hr/recruitment/workforcePlan/workforcePlan.queries';
import { useJobPostings } from '../../../services/hr/recruitment/jobPosting/jobPosting.queries';
import { useAllApplicants } from '../../../services/hr/recruitment/applicant/applicant.queries';
import { useVacancies } from '../../../services/hr/recruitment/vacancy/vacancy.queries';

// KPI Card Component
const KPICard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: number;
    color: string;
    onClick?: () => void;
}> = ({ title, value, icon, trend, color, onClick }) => (
    <Card
        className={`hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${color}`}
        onClick={onClick}
    >
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                            {trend > 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend}%
              </span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

// Activity Item Component
const ActivityItem: React.FC<{
    title: string;
    time: string;
    status: 'completed' | 'pending' | 'new';
    user?: string;
}> = ({ title, time, status, user }) => {
    const statusConfig = {
        completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
        pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
        new: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
    };
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className={`p-2 rounded-full ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    {user && <span className="text-xs text-gray-500">by {user}</span>}
                    <span className="text-xs text-gray-400">{time}</span>
                    <Badge className={`text-[10px] ${status === 'completed' ? 'bg-green-100 text-green-700' : status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                        {status}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

const RecruitmentDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Fetch data
    const { data: workforcePlans = [] } = useWorkforcePlans();
    const { data: jobPostings = [] } = useJobPostings();
    const { data: applicants = [] } = useAllApplicants();
    const { data: vacancies = [] } = useVacancies();

    // Calculate statistics
    const activePlans = workforcePlans.filter(p => p.statusStr === 'Active' || p.statusStr === 'Approved').length;
    const pendingPlans = workforcePlans.filter(p => p.statusStr === 'Pending').length;

    const publishedPostings = jobPostings.filter(p => p.statusStr === 'Published').length;
    const draftPostings = jobPostings.filter(p => p.statusStr === 'Draft').length;

    const totalApplicants = applicants.length;
    const totalVacancies = vacancies.length;

    // Mock activities (replace with real data later)
    const recentActivities = [
        { title: 'New applicant applied for Software Engineer position', time: '2 hours ago', status: 'new' as const, user: 'John Doe' },
        { title: 'Interview completed for Senior Developer role', time: '4 hours ago', status: 'completed' as const, user: 'Jane Smith' },
        { title: 'Job posting "DevOps Engineer" published', time: '1 day ago', status: 'completed' as const, user: 'HR Team' },
        { title: 'Workforce plan Q2 2024 pending approval', time: '2 days ago', status: 'pending' as const, user: 'Mike Johnson' },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recruitment Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Overview of all recruitment activities</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/recruitment/analytics')}
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Analytics
                    </Button>
                    <Button
                        onClick={() => navigate('/hr/recruitment/workforce-plan/new')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        New Plan
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Applicants"
                    value={totalApplicants}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    trend={12}
                    color="border-blue-500"
                    onClick={() => navigate('/hr/recruitment/applicants')}
                />
                <KPICard
                    title="Open Vacancies"
                    value={totalVacancies}
                    icon={<Briefcase className="w-5 h-5 text-green-600" />}
                    trend={8}
                    color="border-green-500"
                    onClick={() => navigate('/hr/recruitment/postings')}
                />
                <KPICard
                    title="Active Plans"
                    value={activePlans}
                    icon={<LayoutDashboard className="w-5 h-5 text-purple-600" />}
                    color="border-purple-500"
                    onClick={() => navigate('/hr/recruitment/workforce-plans')}
                />
                <KPICard
                    title="Pending Approvals"
                    value={pendingPlans + draftPostings}
                    icon={<Clock className="w-5 h-5 text-yellow-600" />}
                    color="border-yellow-500"
                    onClick={() => navigate('/hr/recruitment/workforce-plans')}
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Button
                        onClick={() => navigate('/hr/recruitment/workforce-plan/new')}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 border-2 border-emerald-500 hover:bg-emerald-50"
                    >
                        <FileText className="w-5 h-5 text-emerald-600 mb-1" />
                        <span className="text-xs font-medium">New Plan</span>
                    </Button>
                    <Button
                        onClick={() => navigate('/hr/recruitment/requisition/new')}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 border-2 border-blue-500 hover:bg-blue-50"
                    >
                        <Briefcase className="w-5 h-5 text-blue-600 mb-1" />
                        <span className="text-xs font-medium">New Requisition</span>
                    </Button>
                    <Button
                        onClick={() => navigate('/hr/recruitment/posting/new')}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 border-2 border-purple-500 hover:bg-purple-50"
                    >
                        <Megaphone className="w-5 h-5 text-purple-600 mb-1" />
                        <span className="text-xs font-medium">New Posting</span>
                    </Button>
                    <Button
                        onClick={() => navigate('/hr/recruitment/interview/schedule')}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 border-2 border-orange-500 hover:bg-orange-50"
                    >
                        <Calendar className="w-5 h-5 text-orange-600 mb-1" />
                        <span className="text-xs font-medium">Schedule Interview</span>
                    </Button>
                    <Button
                        onClick={() => navigate('/hr/recruitment/offer/new')}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 border-2 border-red-500 hover:bg-red-50"
                    >
                        <Award className="w-5 h-5 text-red-600 mb-1" />
                        <span className="text-xs font-medium">Create Offer</span>
                    </Button>
                    <Button
                        onClick={() => navigate('/hr/recruitment/applicants')}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 border-2 border-cyan-500 hover:bg-cyan-50"
                    >
                        <Users className="w-5 h-5 text-cyan-600 mb-1" />
                        <span className="text-xs font-medium">View Applicants</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
                                <Button variant="ghost" size="sm" className="text-xs">
                                    View All <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                            <div className="space-y-1">
                                {recentActivities.map((activity, index) => (
                                    <ActivityItem
                                        key={index}
                                        title={activity.title}
                                        time={activity.time}
                                        status={activity.status}
                                        user={activity.user}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats */}
                <div>
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recruitment Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Published Postings</span>
                                    <span className="text-sm font-bold text-gray-900">{publishedPostings}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Draft Postings</span>
                                    <span className="text-sm font-bold text-gray-900">{draftPostings}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Total Applicants</span>
                                    <span className="text-sm font-bold text-gray-900">{totalApplicants}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Workforce Plans</span>
                                    <span className="text-sm font-bold text-gray-900">{workforcePlans.length}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Active Vacancies</span>
                                    <span className="text-sm font-bold text-gray-900">{totalVacancies}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => navigate('/hr/recruitment/analytics')}
                                >
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Full Analytics
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default RecruitmentDashboard;