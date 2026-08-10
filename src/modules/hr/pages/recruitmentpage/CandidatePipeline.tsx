// src/pages/hr/recruitment/CandidatePipelinePage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, RefreshCw, Loader2, Eye,
  Filter, ChevronDown, Download, Printer,
  User, Mail, Phone, MapPin, Briefcase,
  CheckCircle, XCircle, Clock, Star, Award,
  Activity, BarChart, TrendingUp
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { formatDistanceToNow } from 'date-fns';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CandidatePipelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: applicants, isLoading, refetch } = useAllApplicants();

  const stageColors = {
    'Pending': '#3B82F6',
    'Shortlisted': '#8B5CF6',
    'Interviewed': '#F59E0B',
    'Hired': '#10B981',
    'Rejected': '#EF4444'
  };

  const stageData = applicants ? [
    { name: 'Application', count: applicants.filter(a => a.statusStr === 'Pending').length || 0 },
    { name: 'Screening', count: applicants.filter(a => a.statusStr === 'Shortlisted').length || 0 },
    { name: 'Interview', count: applicants.filter(a => a.statusStr === 'Interviewed').length || 0 },
    { name: 'Offer', count: applicants.filter(a => a.statusStr === 'Offered').length || 0 },
    { name: 'Hired', count: applicants.filter(a => a.statusStr === 'Hired').length || 0 },
  ] : [];

  const departmentData = applicants ? [
    { name: 'Engineering', count: applicants.filter(a => a.department === 'Engineering').length || 0 },
    { name: 'Marketing', count: applicants.filter(a => a.department === 'Marketing').length || 0 },
    { name: 'Sales', count: applicants.filter(a => a.department === 'Sales').length || 0 },
    { name: 'HR', count: applicants.filter(a => a.department === 'HR').length || 0 },
    { name: 'Finance', count: applicants.filter(a => a.department === 'Finance').length || 0 },
  ] : [];

  const filteredCandidates = applicants?.filter(candidate => {
    const matchesTab = activeTab === 'all' || candidate.statusStr?.toLowerCase() === activeTab;
    const matchesSearch = candidate.applicant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: applicants?.length || 0,
    pending: applicants?.filter(a => a.statusStr === 'Pending').length || 0,
    shortlisted: applicants?.filter(a => a.statusStr === 'Shortlisted').length || 0,
    interviewed: applicants?.filter(a => a.statusStr === 'Interviewed').length || 0,
    hired: applicants?.filter(a => a.statusStr === 'Hired').length || 0,
    rejected: applicants?.filter(a => a.statusStr === 'Rejected').length || 0,
  };

  const getStageBadge = (status: string) => {
    const stageMap: Record<string, { label: string; className: string }> = {
      'Pending': { label: 'Application', className: 'bg-blue-100 text-blue-700' },
      'Shortlisted': { label: 'Screening', className: 'bg-purple-100 text-purple-700' },
      'Interviewed': { label: 'Interview', className: 'bg-yellow-100 text-yellow-700' },
      'Offered': { label: 'Offer', className: 'bg-green-100 text-green-700' },
      'Hired': { label: 'Hired', className: 'bg-emerald-100 text-emerald-700' },
      'Rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    };
    const stage = stageMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return <Badge className={stage.className}>{stage.label}</Badge>;
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    );
  }

  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h1>
            <p className="text-sm text-gray-500 mt-1">Track candidates through the hiring process</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-yellow-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Shortlisted</p>
              <p className="text-xl font-bold text-purple-600">{stats.shortlisted}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Interviewed</p>
              <p className="text-xl font-bold text-orange-600">{stats.interviewed}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Hired</p>
              <p className="text-xl font-bold text-green-600">{stats.hired}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-red-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Rejected</p>
              <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Pipeline Stage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar data={stageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Applications by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                    >
                      {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                  <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
                  <TabsTrigger value="interviewed">Interviewed ({stats.interviewed})</TabsTrigger>
                  <TabsTrigger value="hired">Hired ({stats.hired})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {filteredCandidates && filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="font-medium text-gray-900">{candidate.applicant}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{candidate.position}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{candidate.department}</td>
                          <td className="px-4 py-3">{getStageBadge(candidate.statusStr)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDistanceToNow(new Date(candidate.appliedDate), { addSuffix: true })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/recruitment/candidate/${candidate.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No candidates found
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
  );
};

export default CandidatePipelinePage;