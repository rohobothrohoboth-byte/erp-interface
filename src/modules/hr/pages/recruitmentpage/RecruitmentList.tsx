// src/components/hr/recruitment/RecruitmentList.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/shared/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Briefcase,
  FileText,
  UserCheck,
  UserX,
  RefreshCw,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Send,
  XCircle
} from 'lucide-react';
import { Badge } from "@/shared/components/ui/badge";
import { useWorkforcePlans } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import { useJobPostings } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.queries';
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface RecruitmentPlan {
  id: string;
  planCode: string;
  title: string;
  department: string;
  totalPositions: number;
  appPositions: number;
  status: string;
  statusStr: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdDate: string;
}

interface Requisition {
  id: string;
  reqNumber: string;
  title: string;
  reqReason: string;
  department: string;
  position: string;
  reqQuantity: number;
  budgetCode: string;
  status: string;
  statusStr: string;
  startDate: string;
  submittedBy: string;
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  reason?: string;
}

const RecruitmentList = () => {
  const { role } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real data from APIs
  const { data: workforcePlans, isLoading: plansLoading, refetch: refetchPlans } = useWorkforcePlans();
  const { data: jobPostings, isLoading: postingsLoading, refetch: refetchPostings } = useJobPostings();
  const { data: applicants, isLoading: applicantsLoading, refetch: refetchApplicants } = useAllApplicants();

  // State for requisitions (would come from API in real app)
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

  // Transform workforce plans into recruitment plans
  const plans: RecruitmentPlan[] = workforcePlans?.map(plan => ({
    id: plan.id,
    planCode: plan.planCode,
    title: plan.title,
    department: plan.department,
    totalPositions: plan.totalPositions,
    appPositions: plan.appPositions,
    status: plan.status,
    statusStr: plan.statusStr,
    startDate: plan.startDate,
    endDate: plan.endDate,
    createdBy: plan.requistionBy || 'System',
    createdDate: plan.startDate
  })) || [];

  // In a real app, requisitions would come from useJobRequisitions hook
  // For now, we'll create some from the data we have
  useEffect(() => {
    if (jobPostings && jobPostings.length > 0) {
      const reqs: Requisition[] = jobPostings.map((posting, index) => ({
        id: posting.id,
        reqNumber: posting.reqNumber || `REQ-${String(index + 1).padStart(4, '0')}`,
        title: `Position for ${posting.postNumber}`,
        reqReason: 'New position opening',
        department: 'Various',
        position: 'Various',
        reqQuantity: 1,
        budgetCode: 'BUD-001',
        status: posting.status,
        statusStr: posting.statusStr || 'Pending',
        startDate: posting.publishedDateStr || new Date().toISOString(),
        submittedBy: 'System',
        submittedDate: posting.publishedDateStr || new Date().toISOString(),
        approvedBy: posting.statusStr === 'Published' ? 'HR Manager' : undefined,
        approvedDate: posting.statusStr === 'Published' ? new Date().toISOString() : undefined,
      }));
      setRequisitions(reqs);
    }
  }, [jobPostings]);

  useEffect(() => {
    if (!plansLoading && !postingsLoading && !applicantsLoading) {
      setLoading(false);
    }
  }, [plansLoading, postingsLoading, applicantsLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPlans(),
        refetchPostings(),
        refetchApplicants()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = (id: string) => {
    setIsProcessing(id);
    // In real app, this would call an API
    setTimeout(() => {
      setRequisitions(requisitions.map(req =>
          req.id === id ? {
            ...req,
            status: 'Approved',
            statusStr: 'Approved',
            approvedBy: 'Current User',
            approvedDate: new Date().toISOString()
          } : req
      ));
      toast.success('Requisition approved successfully');
      setIsProcessing(null);
    }, 1000);
  };

  const handleReject = (id: string) => {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
      setIsProcessing(id);
      // In real app, this would call an API
      setTimeout(() => {
        setRequisitions(requisitions.map(req =>
            req.id === id ? {
              ...req,
              status: 'Rejected',
              statusStr: 'Rejected',
              approvedBy: 'Current User',
              approvedDate: new Date().toISOString(),
              reason
            } : req
        ));
        toast.success('Requisition rejected');
        setIsProcessing(null);
      }, 1000);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('approve') || statusLower === 'approved') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (statusLower.includes('pending')) {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
    if (statusLower.includes('reject') || statusLower === 'rejected') {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (statusLower.includes('published') || statusLower.includes('active')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('approve') || statusLower === 'approved' || statusLower === 'published' || statusLower === 'active') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    }
    if (statusLower.includes('pending')) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
    if (statusLower.includes('reject') || statusLower === 'rejected') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    }
    if (statusLower.includes('draft')) {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
    }
    if (statusLower.includes('closed')) {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>;
    }
    if (statusLower.includes('expired')) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status || 'Unknown'}</Badge>;
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  // Calculate metrics from real data
  const metrics = {
    totalApplicants: applicants?.length || 0,
    hiredApplicants: applicants?.filter(a => a.statusStr === 'Hired').length || 0,
    pendingApplicants: applicants?.filter(a => a.statusStr === 'Pending').length || 0,
    rejectedApplicants: applicants?.filter(a => a.statusStr === 'Rejected').length || 0,
    totalPlans: workforcePlans?.length || 0,
    activePlans: workforcePlans?.filter(p => p.statusStr === 'Active').length || 0,
    totalPostings: jobPostings?.length || 0,
    publishedPostings: jobPostings?.filter(p => p.statusStr === 'Published').length || 0,
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-2xl md:text-3xl font-bold mt-6">
                Recruitment <span className='text-gray-900'>List</span>
              </CardTitle>
              <CardDescription>
                Manage hiring plans and approval workflows
              </CardDescription>
            </div>
            <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-2 sm:mt-0 flex items-center gap-2"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Analytics Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{metrics.totalApplicants}</div>
                        <div className="text-sm text-gray-600">Total Applicants</div>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{metrics.hiredApplicants}</div>
                        <div className="text-sm text-gray-600">Hired Candidates</div>
                      </div>
                      <UserCheck className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{metrics.pendingApplicants}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{metrics.rejectedApplicants}</div>
                        <div className="text-sm text-gray-600">Rejected Candidates</div>
                      </div>
                      <UserX className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Recruitment Plans Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Recruitment Plans</CardTitle>
              <CardDescription>
                {metrics.activePlans} active plans · {metrics.totalPlans} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No recruitment plans found</p>
                  </div>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Plan Code</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Title</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Department</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Positions</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Status</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Timeline</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.slice(0, 10).map((plan) => (
                          <TableRow key={plan.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs font-medium">{plan.planCode}</TableCell>
                            <TableCell className="font-medium">{plan.title}</TableCell>
                            <TableCell>{plan.department}</TableCell>
                            <TableCell>
                              <span className="font-medium">{plan.appPositions}</span>
                              <span className="text-gray-400"> / {plan.totalPositions}</span>
                            </TableCell>
                            <TableCell>{getStatusBadge(plan.statusStr)}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              )}
              {plans.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="ghost" size="sm" className="text-emerald-600">
                      View All {plans.length} Plans
                    </Button>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Workflow Table */}
          <Card>
            <CardHeader>
              <CardTitle>Requisition Approval Workflow</CardTitle>
              <CardDescription>
                {requisitions.filter(r => r.statusStr === 'Pending').length} pending · {requisitions.filter(r => r.statusStr === 'Approved').length} approved · {requisitions.filter(r => r.statusStr === 'Rejected').length} rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requisitions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No requisitions found</p>
                  </div>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Req Number</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Title</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Department</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Positions</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Status</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Submitted</TableHead>
                        <TableHead className="bg-blue-50 font-bold text-gray-800">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisitions.slice(0, 10).map((req) => (
                          <TableRow key={req.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs font-medium">{req.reqNumber}</TableCell>
                            <TableCell className="font-medium">{req.title}</TableCell>
                            <TableCell>{req.department || 'N/A'}</TableCell>
                            <TableCell>{req.reqQuantity}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(req.statusStr)}
                                {getStatusBadge(req.statusStr)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{req.submittedBy}</div>
                                <div className="text-gray-500 text-xs">{formatDate(req.submittedDate)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {req.statusStr === 'Pending' || req.status === '0' ? (
                                  isHR ? (
                                      <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(req.id)}
                                            disabled={isProcessing === req.id}
                                            className="bg-green-600 hover:bg-green-700 cursor-pointer"
                                        >
                                          {isProcessing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className='cursor-pointer'
                                            onClick={() => handleReject(req.id)}
                                            disabled={isProcessing === req.id}
                                        >
                                          {isProcessing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
                                        </Button>
                                      </div>
                                  ) : (
                                      <span className="text-sm text-gray-400">Awaiting approval</span>
                                  )
                              ) : (
                                  <div className="text-gray-500 text-sm">
                                    {req.approvedBy || 'System'}<br/>
                                    <span className="text-xs">{req.approvedDate ? formatDate(req.approvedDate) : 'N/A'}</span>
                                    {req.reason && (
                                        <span className="text-xs text-red-500 block mt-1">Reason: {req.reason}</span>
                                    )}
                                  </div>
                              )}
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              )}
              {requisitions.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="ghost" size="sm" className="text-emerald-600">
                      View All {requisitions.length} Requisitions
                    </Button>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.totalPostings}</p>
                  <p className="text-sm text-gray-500">Total Job Postings</p>
                  <p className="text-xs text-gray-400">{metrics.publishedPostings} published</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.totalApplicants}</p>
                  <p className="text-sm text-gray-500">Total Applicants</p>
                  <p className="text-xs text-gray-400">{metrics.pendingApplicants} pending review</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.hiredApplicants}</p>
                  <p className="text-sm text-gray-500">Hired Candidates</p>
                  <p className="text-xs text-gray-400">Successfully placed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </div>
  );
};

export default RecruitmentList;