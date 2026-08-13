// src/pages/hr/recruitment/applicant/ApplicantsPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    RefreshCw,
    Loader2,
    Eye,
    Mail,
    Phone,
    Calendar,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    Download,
    User,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { format } from 'date-fns';
import { useAuthStore } from '@/shared/stores/auth.store';

const ApplicantsPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const { data: applicants = [], isLoading, refetch } = useAllApplicants();

    const isHR = ['admin','super_admin','superadmin','hr','hr manager','hrmanager','hr admin','ceo','manager','mgr'].includes((role || '').toLowerCase());

    const filteredApplicants = applicants?.filter(applicant => {
        const matchesTab = activeTab === 'all' || applicant.statusStr?.toLowerCase() === activeTab;
        const matchesSearch = applicant.applicant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            applicant.position?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            'Applied': { label: 'Applied', className: 'bg-blue-100 text-blue-700' },
            'Reviewed': { label: 'Reviewed', className: 'bg-yellow-100 text-yellow-700' },
            'Shortlisted': { label: 'Shortlisted', className: 'bg-purple-100 text-purple-700' },
            'Interviewed': { label: 'Interviewed', className: 'bg-indigo-100 text-indigo-700' },
            'Offered': { label: 'Offered', className: 'bg-green-100 text-green-700' },
            'Hired': { label: 'Hired', className: 'bg-emerald-100 text-emerald-700' },
            'Rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        };
        const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
        return <Badge className={info.className}>{info.label}</Badge>;
    };

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    if (isLoading) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all job applicants</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {isHR && (
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Search & Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="applied">Applied</TabsTrigger>
                                <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
                                <TabsTrigger value="interviewed">Interviewed</TabsTrigger>
                                <TabsTrigger value="offered">Offered</TabsTrigger>
                                <TabsTrigger value="hired">Hired</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search applicants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="space-y-4">
                {filteredApplicants && filteredApplicants.length > 0 ? (
                    filteredApplicants.map((applicant, index) => (
                        <motion.div
                            key={applicant.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/hr/recruitment/applicant/${applicant.id}`)}>
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">{applicant.applicant}</h3>
                                                        {getStatusBadge(applicant.statusStr)}
                                                        <span className="text-xs text-gray-400 font-mono">#{applicant.id.slice(0, 8)}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                                {applicant.email}
                            </span>
                                                        {applicant.phone && (
                                                            <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                                                {applicant.phone}
                              </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                                                            {applicant.position || 'N/A'}
                            </span>
                                                        <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                                                            {applicant.appliedDate ? formatDate(applicant.appliedDate) : 'N/A'}
                            </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/hr/recruitment/applicant/${applicant.id}`);
                                                }}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/hr/recruitment/applicant/${applicant.id}/evaluate`);
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                Evaluate
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No applicants found</p>
                            <p className="text-sm text-gray-400">Applicants will appear here once they apply</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </motion.div>
    );
};

export default ApplicantsPage;