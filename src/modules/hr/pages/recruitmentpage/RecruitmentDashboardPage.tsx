// src/pages/hr/recruitment/RecruitmentDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, Users, FileText, Calendar, TrendingUp,
    Clock, CheckCircle, XCircle, AlertCircle, Plus,
    Building2, UserCheck, Activity, Settings,
    ChevronRight, RefreshCw, Loader2, User
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useWorkforcePlans } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import { useJobPostings } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.queries';
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { formatDistanceToNow } from 'date-fns';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: color }}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
            </div>
        </CardContent>
    </Card>
);

const RecruitmentDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [loading, setLoading] = useState(true);

    const { data: workforcePlans, isLoading: plansLoading } = useWorkforcePlans();
    const { data: jobPostings, isLoading: postingsLoading } = useJobPostings();
    const { data: applicants, isLoading: applicantsLoading } = useAllApplicants();

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

    useEffect(() => {
        if (!plansLoading && !postingsLoading && !applicantsLoading) {
            setLoading(false);
        }
    }, [plansLoading, postingsLoading, applicantsLoading]);

    const stats = {
        totalPlans: workforcePlans?.length || 0,
        activePlans: workforcePlans?.filter(p => p.statusStr === 'Active').length || 0,
        totalPostings: jobPostings?.length || 0,
        activePostings: jobPostings?.filter(p => p.statusStr === 'Published').length || 0,
        totalApplicants: applicants?.length || 0,
        pendingApplicants: applicants?.filter(a => a.statusStr === 'Pending').length || 0,
        hiredApplicants: applicants?.filter(a => a.statusStr === 'Hired').length || 0,
    };

    const recentActivities = [
        ...(applicants?.slice(0, 3).map(a => ({
            id: a.id,
            type: 'application',
            message: `New application from ${a.applicant}`,
            time: new Date(a.appliedDate),
            applicant: a.applicant
        })) || [])
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recruitment Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Overview of your recruitment activities</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                    {isHR && (
                        <Button onClick={() => navigate('/recruitment/workforce-plan/new')} className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Plan
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Workforce Plans"
                    value={stats.totalPlans}
                    icon={Building2}
                    color="#3B82F6"
                    subtitle={`${stats.activePlans} active`}
                />
                <StatCard
                    title="Active Postings"
                    value={stats.activePostings}
                    icon={Briefcase}
                    color="#10B981"
                    subtitle={`${stats.totalPostings} total`}
                />
                <StatCard
                    title="Total Applicants"
                    value={stats.totalApplicants}
                    icon={Users}
                    color="#8B5CF6"
                    subtitle={`${stats.pendingApplicants} pending`}
                />
                <StatCard
                    title="Hired"
                    value={stats.hiredApplicants}
                    icon={UserCheck}
                    color="#059669"
                    subtitle="Successfully placed"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                    onClick={() => navigate('/recruitment/workforce-plans')}
                >
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-medium">Workforce Plans</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 hover:border-blue-300 transition-all"
                    onClick={() => navigate('/recruitment/job-postings')}
                >
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium">Job Postings</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-purple-50 hover:border-purple-300 transition-all"
                    onClick={() => navigate('/recruitment/applicants')}
                >
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-medium">Applicants</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-orange-50 hover:border-orange-300 transition-all"
                    onClick={() => navigate('/recruitment/vacancies')}
                >
                    <Activity className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-medium">Vacancies</span>
                </Button>
            </div>

            {/* Recent Applications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Recent Applications</span>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/recruitment/applicants')} className="text-emerald-600">
                            View All <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentActivities.length > 0 ? (
                        <div className="space-y-3">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{activity.applicant}</p>
                                            <p className="text-sm text-gray-500">{activity.message}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">{formatDistanceToNow(activity.time, { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No applications yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default RecruitmentDashboardPage;