// src/pages/hr/leave/MyLeavePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, X, RefreshCw, Loader2, Shield, Calendar, Bell,
  TrendingUp, AlertCircle, DollarSign, Clock, CheckCircle,
  FileText, Users, Building2, Crown, UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { leaveApi } from '../../../services/hr/leave/leave.api';
import { hrmLeaveListApi } from '../../../services/List/hrmLeave/hrmLeaveList.api';
import type { LeaveRequestListDto, LeaveRequestAddDto } from '../../../types/hr/leaverequest';
import type { ListItem } from '../../../types/List/list';
import type { UUID } from 'crypto';
import { useAuthStore } from '../../../stores/auth.store';
import { useNotifications } from '../../../hooks/useNotifications';

import LeaveRequestTable from '../../../components/hr/annualLeave/AllLeave/LeaveRequestTable';
import AddLeaveRequestModal from '../../../components/hr/annualLeave/AddLeaveRequestModal';
import EditLeaveReqModal from '../../../components/hr/annualLeave/EditLeaveReqModal';
import DeleteLeaveReqModal from '../../../components/hr/annualLeave/DeleteLeaveReqModal';
import LeaveRequestDetailModal from '../../../components/hr/annualLeave/AllLeave/LeaveRequestDetailModal';
import { useLeaveNotificationIntegration } from '../../../hooks/hr/leave/useLeaveNotificationIntegration';

// Year-End Processing Interface
interface YearEndBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  remainingDays: number;
  carriedOverDays: number;
  lostDays: number;
  encashableDays: number;
  encashmentAmount?: number;
  newBalance: number;
}

interface YearEndProcessingResult {
  employeeId: string;
  employeeName: string;
  processedAt: string;
  balances: YearEndBalance[];
  totalCarriedOver: number;
  totalLost: number;
  totalEncashment: number;
}

const MyLeavePage: React.FC = () => {
  const { user, permissions, role, employeeId, userName, isAuthenticated } = useAuthStore();
  const { sendNotification, refreshUnreadCount, playSound } = useNotifications();


  const [leaves, setLeaves] = useState<LeaveRequestListDto[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestListDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Year-End Processing States
  const [showYearEndModal, setShowYearEndModal] = useState(false);
  const [yearEndProcessing, setYearEndProcessing] = useState(false);
  const [yearEndResult, setYearEndResult] = useState<YearEndProcessingResult | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<YearEndBalance[]>([]);
  const leaveNotification = useLeaveNotificationIntegration();
  const getManagersForEmployee = leaveNotification?.getManagersForEmployee || (async () => []);
  const itemsPerPage = 10;

  // Check if user is HR Manager or Admin (can view all leaves)
  const isManagerOrAdmin = role === 'admin' || role === 'super_admin' ||
      permissions?.some(p => p.M?.some(m => m.K === 'hr.leave.view.all'));

  // Debug: Log auth state on mount
  useEffect(() => {
    console.log('🔍 Auth State in MyLeavePage:', {
      employeeId,
      userName,
      role,
      isAuthenticated,
      user
    });
  }, [employeeId, userName, role, isAuthenticated, user]);

  const fetchLeaveTypes = useCallback(async () => {
    try {
      const types = await hrmLeaveListApi.getAllLeaveTypes();
      setLeaveTypes(types);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      toast.error('Failed to load leave types');
    }
  }, []);

  // Fetch only the logged-in user's leave requests
  const fetchMyLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leaveApi.getMyLeaveRequests();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching my leave requests:', error);
      toast.error('Failed to load your leave requests');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current leave balances
  const fetchLeaveBalances = useCallback(async () => {
    try {
      const balances = await leaveApi.getMyLeaveBalances();
      setLeaveBalances(balances);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeaveTypes();
    fetchMyLeaves();
    fetchLeaveBalances();
  }, [fetchLeaveTypes, fetchMyLeaves, fetchLeaveBalances]);

  // Filter leaves based on tab and search
  const filteredLeaves = leaves.filter(leave => {
    const matchesTab = activeTab === 'all' || leave.statusStr?.toLowerCase() === activeTab;
    const matchesSearch = !searchTerm ||
        leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.comments?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.statusStr === 'Pending').length,
    approved: leaves.filter(l => l.statusStr === 'Approved').length,
    rejected: leaves.filter(l => l.statusStr === 'Rejected').length,
  };

  // Year-End Processing Handler
  const handleYearEndProcessing = async () => {
    setYearEndProcessing(true);
    try {
      const currentYear = new Date().getFullYear();
      const result = await leaveApi.processYearEndLeave(currentYear);
      setYearEndResult(result);

      toast.success(
          `Year-end processing completed! Carried over: ${result.totalCarriedOver} days, Lost: ${result.totalLost} days${result.totalEncashment > 0 ? `, Encashment: ${result.totalEncashment.toLocaleString()}` : ''}`
      );

      await fetchLeaveBalances();
      await fetchMyLeaves();

      // Send notification to employee
      if (employeeId && employeeId !== '00000000-0000-0000-0000-000000000000') {
        await sendNotification({
          userId: employeeId,
          title: 'Year-End Leave Processed',
          message: `Year-end leave processing for ${currentYear} has been completed. ${result.totalCarriedOver} days carried over, ${result.totalLost} days expired.`,
          type: 'info',
          priority: 'high',
          moduleName: 'Year-End Processing',
          metadata: { year: currentYear, result }
        });
      }
    } catch (error: any) {
      console.error('Error processing year-end leave:', error);
      toast.error(error?.message || 'Failed to process year-end leave');
    } finally {
      setYearEndProcessing(false);
    }
  };

  // Individual Encashment Request
  const handleEncashLeave = async (leaveTypeId: string, days: number) => {
    setActionLoading(true);
    try {
      const result = await leaveApi.encashLeave({
        leaveTypeId,
        days,
        employeeId: employeeId as string
      });

      toast.success(`Successfully encashed ${days} days. Amount: ${result.amount.toLocaleString()}`);
      await fetchLeaveBalances();

      if (employeeId && employeeId !== '00000000-0000-0000-0000-000000000000') {
        await sendNotification({
          userId: employeeId,
          title: 'Leave Encashment Processed',
          message: `${days} days of leave have been encashed. Amount: ${result.amount.toLocaleString()}`,
          type: 'success',
          priority: 'high',
          moduleName: 'Leave Encashment',
          metadata: { days, amount: result.amount }
        });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to encash leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddLeave = async (data: LeaveRequestAddDto) => {
    // Debug: Log the data received
    console.log('📤 handleAddLeave called with data:', data);
    console.log('📤 employeeId from auth store:', employeeId);
    console.log('📤 isAuthenticated:', isAuthenticated);

    // Validate employeeId
    if (!employeeId || employeeId === '00000000-0000-0000-0000-000000000000') {
      console.error('❌ Invalid employeeId:', employeeId);
      toast.error('Cannot submit: User not properly authenticated');
      return;
    }

    setActionLoading(true);
    try {
      // Ensure employeeId is in the data
      const requestData = {
        ...data,
        employeeId: employeeId, // Ensure employeeId is included
      };

      console.log('📤 Submitting with data:', requestData);

      const result = await leaveApi.addLeaveRequest(requestData);

      // Send notification to employee
      await sendNotification({
        userId: employeeId,
        title: '📝 Leave Request Submitted',
        message: `Your leave request from ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()} has been submitted for approval`,
        type: 'info',
        priority: 'medium',
        moduleName: 'Leave Request',
        metadata: {
          module: 'leave',
          actionId: result.id,
          startDate: data.startDate,
          endDate: data.endDate,
          leaveType: data.leaveType
        },
        actionUrl: `/leave-requests/${result.id}`,
        referenceId: result.id
      });

      // Get and notify managers
      try {
        const managers = await getManagersForEmployee(employeeId);
        console.log('📋 Managers found:', managers);

        if (managers && managers.length > 0) {
          for (const managerId of managers) {
            await sendNotification({
              userId: managerId,
              title: '📋 Pending Leave Approval',
              message: `${userName || 'An employee'} has requested leave from ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`,
              type: 'warning',
              priority: 'urgent',
              moduleName: 'Leave Approval',
              metadata: {
                module: 'leave',
                actionId: result.id,
                employeeId: employeeId,
                employeeName: userName,
                startDate: data.startDate,
                endDate: data.endDate
              },
              actionUrl: `/approvals/leave/${result.id}`,
              referenceId: result.id
            });
          }
        }
      } catch (managerError) {
        console.error('Error notifying managers:', managerError);
      }

      toast.success('Leave request submitted successfully');
      await fetchMyLeaves();
      await fetchLeaveBalances();
      refreshUnreadCount();
      playSound();
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error adding leave:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit leave request';
      toast.error(errorMessage);

      // Send failure notification
      if (employeeId && employeeId !== '00000000-0000-0000-0000-000000000000') {
        await sendNotification({
          userId: employeeId,
          title: 'Leave Request Failed',
          message: errorMessage,
          type: 'error',
          priority: 'high',
          moduleName: 'Leave Request',
          metadata: {
            module: 'leave',
            error: errorMessage
          }
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditLeave = async (id: UUID, data: Partial<LeaveRequestAddDto>) => {
    setActionLoading(true);
    try {
      await leaveApi.updateLeaveRequest({ id, ...data });

      if (employeeId && employeeId !== '00000000-0000-0000-0000-000000000000') {
        await sendNotification({
          userId: employeeId,
          title: 'Leave Request Updated',
          message: `Your leave request has been updated successfully`,
          type: 'info',
          priority: 'low',
          moduleName: 'Leave Request',
          metadata: {
            module: 'leave',
            actionId: id,
            changes: data
          },
          actionUrl: `/leave-requests/${id}`,
          referenceId: id as string
        });
      }

      toast.success('Leave request updated successfully');
      await fetchMyLeaves();
      setShowEditModal(false);
      setSelectedLeave(null);
    } catch (error: any) {
      console.error('Error editing leave:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update leave request';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    setActionLoading(true);
    try {
      await leaveApi.deleteLeaveRequest(id as UUID);

      if (employeeId && employeeId !== '00000000-0000-0000-0000-000000000000') {
        await sendNotification({
          userId: employeeId,
          title: 'Leave Request Cancelled',
          message: `Your leave request has been cancelled/deleted`,
          type: 'info',
          priority: 'low',
          moduleName: 'Leave Request',
          metadata: {
            module: 'leave',
            actionId: id,
            deletedAt: new Date().toISOString()
          },
          referenceId: id
        });
      }

      toast.success('Leave request deleted successfully');
      await fetchMyLeaves();
      await fetchLeaveBalances();
      refreshUnreadCount();
      setShowDeleteModal(false);
      setSelectedLeave(null);
    } catch (error: any) {
      console.error('Error deleting leave:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete leave request';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Poll for status changes
  useEffect(() => {
    const checkStatusChanges = async () => {
      try {
        const currentLeaves = await leaveApi.getMyLeaveRequests();
        currentLeaves.forEach(currentLeave => {
          const oldLeave = leaves.find(l => l.id === currentLeave.id);
          if (oldLeave && oldLeave.statusStr !== currentLeave.statusStr) {
            let notificationMessage = '';
            let notificationType: 'success' | 'warning' | 'error' | 'info' = 'info';

            switch (currentLeave.statusStr) {
              case 'Approved':
                notificationMessage = `Your leave request from ${new Date(currentLeave.startDate).toLocaleDateString()} has been APPROVED!`;
                notificationType = 'success';
                playSound();
                break;
              case 'Rejected':
                notificationMessage = `Your leave request from ${new Date(currentLeave.startDate).toLocaleDateString()} has been REJECTED.`;
                notificationType = 'error';
                playSound();
                break;
              case 'Pending':
                notificationMessage = `Your leave request status has been updated to Pending.`;
                notificationType = 'warning';
                break;
            }

            if (employeeId && employeeId !== '00000000-0000-0000-0000-000000000000') {
              sendNotification({
                userId: employeeId,
                title: `Leave Request ${currentLeave.statusStr}`,
                message: notificationMessage,
                type: notificationType,
                priority: currentLeave.statusStr === 'Approved' ? 'high' : 'medium',
                moduleName: 'Leave Request',
                metadata: {
                  module: 'leave',
                  actionId: currentLeave.id,
                  oldStatus: oldLeave.statusStr,
                  newStatus: currentLeave.statusStr
                },
                actionUrl: `/leave-requests/${currentLeave.id}`,
                referenceId: currentLeave.id
              });
            }
          }
        });
        setLeaves(currentLeaves);
        await fetchLeaveBalances();
      } catch (error) {
        console.error('Error checking status changes:', error);
      }
    };

    const interval = setInterval(checkStatusChanges, 30000);
    return () => clearInterval(interval);
  }, [leaves, employeeId, sendNotification, playSound, fetchLeaveBalances]);

  const StatCard = ({ title, value, color, statKey }: { title: string; value: number; color: string; statKey: string }) => (
      <Card key={statKey} className="border-l-4" style={{ borderLeftColor: color }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        </CardContent>
      </Card>
  );

  // Ensure employeeId is available before rendering modals
  const isValidEmployeeId = employeeId && employeeId !== '00000000-0000-0000-0000-000000000000';

  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
        {/* Header with Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your leave requests
              {userName && ` - ${userName}`}
              {!isValidEmployeeId && (
                  <span className="ml-2 text-red-500 text-xs">(⚠️ No valid employee ID)</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={() => fetchMyLeaves()}
                disabled={loading}
                className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
            <Button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!isValidEmployeeId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        {/* Current Leave Balances Section */}
        {leaveBalances.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Current Leave Balances
                </CardTitle>
                <CardDescription>Your available leave days by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {leaveBalances.map((balance) => (
                      <div
                          key={balance.leaveTypeId}
                          className="bg-white rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-700">{balance.leaveTypeName}</span>
                          {balance.encashableDays > 0 && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Encashable: {balance.encashableDays}
                              </Badge>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{balance.remainingDays} days</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Available for use
                        </div>
                        {balance.encashableDays > 0 && isManagerOrAdmin && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-green-600"
                                onClick={() => handleEncashLeave(balance.leaveTypeId, balance.encashableDays)}
                                disabled={actionLoading}
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Request Encashment
                            </Button>
                        )}
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        )}

        {/* Info Alert - Only show for regular employees */}
        {!isManagerOrAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-blue-700">
                You are viewing only your own leave requests.
                {role !== 'admin' && ' HR managers can view all employee requests.'}
              </p>
            </div>
        )}

        {/* Year-End Processing Card (Visible to Admin/HR Only) */}
        {isManagerOrAdmin && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Year-End Leave Processing
                </CardTitle>
                <CardDescription>
                  Process remaining leave balances for the current year ({new Date().getFullYear()})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Important Year-End Actions</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Processing year-end leave will:
                        </p>
                        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                          <li>• Calculate carryover days based on policy limits</li>
                          <li>• Apply "use or lose" rules for non-carriable leave</li>
                          <li>• Process encashment requests if applicable</li>
                          <li>• Reset annual entitlement for the new year</li>
                          <li>• Send notifications to all employees</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                      onClick={() => setShowYearEndModal(true)}
                      disabled={yearEndProcessing}
                      className="bg-purple-600 hover:bg-purple-700"
                  >
                    {yearEndProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Process Year-End Leave
                  </Button>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard statKey="total" title="Total Requests" value={stats.total} color="#6B7280" />
          <StatCard statKey="pending" title="Pending" value={stats.pending} color="#EAB308" />
          <StatCard statKey="approved" title="Approved" value={stats.approved} color="#22C55E" />
          <StatCard statKey="rejected" title="Rejected" value={stats.rejected} color="#EF4444" />
        </div>

        {/* Tabs and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                  <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search your leaves..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Table */}
        <LeaveRequestTable
            leaves={paginatedLeaves}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onView={(leave) => { setSelectedLeave(leave); setShowDetailModal(true); }}
            onEdit={(leave) => { setSelectedLeave(leave); setShowEditModal(true); }}
            onDelete={(leave) => { setSelectedLeave(leave); setShowDeleteModal(true); }}
        />

        {/* Empty State */}
        {!loading && leaves.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No leave requests found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You haven't submitted any leave requests yet.
                  </p>
                  <Button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Request Your First Leave
                  </Button>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Year-End Processing Confirmation Modal */}
        <Dialog open={showYearEndModal} onOpenChange={setShowYearEndModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Year-End Leave Processing
              </DialogTitle>
              <DialogDescription>
                This action will process all remaining leave balances for the year {new Date().getFullYear()}.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">What will happen:</h4>
                <ul className="space-y-2 text-sm text-yellow-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    Unused leave days will be processed according to policy rules
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 mt-0.5 text-blue-600" />
                    Eligible days will be carried over to next year
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 mt-0.5 text-red-600" />
                    Non-carriable days will expire
                  </li>
                  <li className="flex items-start gap-2">
                    <Bell className="w-4 h-4 mt-0.5 text-purple-600" />
                    All employees will receive notifications
                  </li>
                </ul>
              </div>

              {leaveBalances.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Current Year-End Summary</h4>
                    <div className="space-y-2">
                      {leaveBalances.map(balance => (
                          <div key={balance.leaveTypeId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{balance.leaveTypeName}</span>
                            <div className="flex gap-4">
                              <span className="text-sm text-gray-600">{balance.remainingDays} days remaining</span>
                              {balance.encashableDays > 0 && (
                                  <Badge variant="outline" className="text-green-600">
                                    {balance.encashableDays} encashable
                                  </Badge>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowYearEndModal(false)}>
                Cancel
              </Button>
              <Button
                  onClick={() => {
                    setShowYearEndModal(false);
                    handleYearEndProcessing();
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={yearEndProcessing}
              >
                {yearEndProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Confirm Year-End Processing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modals */}
        <AddLeaveRequestModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddLeave}
            leaveTypes={leaveTypes}
            employeeId={employeeId as UUID}
            loading={actionLoading}
        />

        {selectedLeave && (
            <>
              <EditLeaveReqModal
                  isOpen={showEditModal}
                  onClose={() => { setShowEditModal(false); setSelectedLeave(null); }}
                  onSave={handleEditLeave}
                  leave={selectedLeave}
                  leaveTypes={leaveTypes}
                  loading={actionLoading}
              />
              <DeleteLeaveReqModal
                  isOpen={showDeleteModal}
                  onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedLeave(null);
                  }}
                  onConfirm={handleDeleteLeave}
                  leave={selectedLeave}
              />
              <LeaveRequestDetailModal
                  isOpen={showDetailModal}
                  onClose={() => {
                    setShowDetailModal(false);
                    setSelectedLeave(null);
                  }}
                  leave={selectedLeave}
              />
            </>
        )}
      </motion.div>
  );
};

export default MyLeavePage;