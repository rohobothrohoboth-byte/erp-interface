// src/components/hr/Leave/ManagerApprovals.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Loader2, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { yearEndApi } from '../../../services/hr/leave/yearEndApi';
import { empApi } from '../../../services/hr/employee/emp.api';
import { useLeaveNotificationIntegration } from '../../../hooks/hr/leave/useLeaveNotificationIntegration';
import { toast } from 'react-hot-toast';

interface EncashmentRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    leaveTypeName: string;
    requestedDays: number;
    ratePerDay: number;
    totalAmount: number;
    reason: string;
    preferredMonth: string;
    requestDate: string;
    status: string;
    currentApprovalLevel: number;
    maxSteps: number;
}

export const ManagerApprovals: React.FC = () => {
    const { role, employeeId, employeeName: currentUserName } = useAuthStore();
    const [requests, setRequests] = useState<EncashmentRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<EncashmentRequest | null>(null);
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [employeeNames, setEmployeeNames] = useState<Map<string, string>>(new Map());

    const { notifyEncashmentApproved, notifyEncashmentRejected } = useLeaveNotificationIntegration();

    useEffect(() => {
        loadRequests();
    }, [role, employeeId]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const approvalLevel = role?.toUpperCase() === 'MGR' ? 'MANAGER' :
                role?.toUpperCase() === 'HR' ? 'HR' :
                    role?.toUpperCase() === 'CEO' ? 'CEO' : 'ADMIN';

            const response = await yearEndApi.getEncashmentRequestsForReview(employeeId, approvalLevel);
            let data = response.data?.data || [];

            const uniqueEmployeeIds = [...new Set(data.map((req: any) => req.employeeId))];
            const nameMap = new Map<string, string>();

            await Promise.all(
                uniqueEmployeeIds.map(async (empId: string) => {
                    try {
                        const employee = await empApi.getEmployeeById(empId);
                        if (employee) {
                            nameMap.set(empId, employee.empFullName || employee.code || empId);
                        } else {
                            nameMap.set(empId, empId);
                        }
                    } catch (error) {
                        console.error(`Failed to fetch employee ${empId}:`, error);
                        nameMap.set(empId, empId);
                    }
                })
            );

            setEmployeeNames(nameMap);

            const transformedRequests = data.map((req: any) => ({
                id: req.id,
                employeeId: req.employeeId,
                employeeName: nameMap.get(req.employeeId) || req.employeeName || req.employeeId,
                department: req.department || '',
                leaveTypeName: req.leaveTypeName,
                requestedDays: req.encashmentDays || 0,
                ratePerDay: req.ratePerDay || 0,
                totalAmount: req.totalAmount || 0,
                reason: req.reason || '',
                preferredMonth: req.preferredMonth || new Date(req.requestDate).toLocaleString('default', { month: 'long' }),
                requestDate: req.requestDate || new Date().toISOString(),
                status: req.status || 'Pending',
                currentApprovalLevel: req.currentStep || 1,
                maxSteps: req.maxSteps || 2
            }));

            console.log('📋 Transformed encashment requests:', transformedRequests);
            setRequests(transformedRequests);
        } catch (error) {
            console.error('Failed to load requests:', error);
            toast.error('Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (action: 'APPROVE' | 'REJECT') => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            await yearEndApi.processApproval(selectedRequest.id, action, comments);

            if (action === 'APPROVE') {
                // Send notification to employee
                await notifyEncashmentApproved(
                    selectedRequest.employeeId,
                    selectedRequest.employeeName,
                    selectedRequest.requestedDays,
                    selectedRequest.totalAmount,
                    currentUserName || 'System',
                    role || 'Manager'
                );
                toast.success('Request approved successfully');
            } else {
                // Send notification to employee
                await notifyEncashmentRejected(
                    selectedRequest.employeeId,
                    selectedRequest.employeeName,
                    selectedRequest.requestedDays,
                    comments || 'No reason provided',
                    currentUserName || 'System'
                );
                toast.success('Request rejected successfully');
            }

            setSelectedRequest(null);
            setComments('');
            loadRequests();
        } catch (error: any) {
            console.error('Approval error:', error);
            toast.error(error?.response?.data?.message || 'Failed to process');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string, currentStep: number, maxSteps: number) => {
        if (status === 'Approved') {
            return <Badge className="bg-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>;
        }
        if (status === 'Rejected') {
            return <Badge className="bg-red-500 flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
        }
        if (currentStep === 1) {
            return <Badge className="bg-yellow-500 flex items-center gap-1"><Clock className="w-3 h-3" />Pending Manager</Badge>;
        }
        if (currentStep === 2) {
            return <Badge className="bg-blue-500 flex items-center gap-1"><Clock className="w-3 h-3" />Pending HR</Badge>;
        }
        if (currentStep === 3) {
            return <Badge className="bg-purple-500 flex items-center gap-1"><Clock className="w-3 h-3" />Pending CEO</Badge>;
        }
        return <Badge className="bg-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
    };

    const getRoleTitle = () => {
        switch (role?.toUpperCase()) {
            case 'CEO':
                return '🏢 Executive Approval Required';
            case 'MGR':
                return '👥 Team Encashment Requests';
            case 'HR':
                return '🏢 HR Encashment Approvals';
            case 'ADMIN':
                return '⚙️ All Encashment Requests';
            default:
                return '📋 Pending Approvals';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{getRoleTitle()}</CardTitle>
                    <Button variant="outline" size="sm" onClick={loadRequests} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                            <p className="text-gray-500">No pending approvals</p>
                            <p className="text-sm text-gray-400">All caught up!</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Preferred Month</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">{request.employeeName}</TableCell>
                                        <TableCell>{request.department || '-'}</TableCell>
                                        <TableCell>{request.leaveTypeName}</TableCell>
                                        <TableCell>{request.requestedDays} days</TableCell>
                                        <TableCell>${request.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell>{request.preferredMonth}</TableCell>
                                        <TableCell>{getStatusBadge(request.status, request.currentApprovalLevel, request.maxSteps)}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedRequest(request)}
                                                disabled={actionLoading}
                                            >
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Approval Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Review Encashment Request</DialogTitle>
                        <DialogDescription>
                            Review and approve or reject the encashment request
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Employee</p>
                                    <p className="font-medium">{selectedRequest.employeeName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium">{selectedRequest.department || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Days Requested</p>
                                    <p className="font-medium">{selectedRequest.requestedDays} days</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="font-medium text-green-600">
                                        ${selectedRequest.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Preferred Month</p>
                                    <p className="font-medium">{selectedRequest.preferredMonth}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Request Date</p>
                                    <p className="font-medium">
                                        {new Date(selectedRequest.requestDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Reason</p>
                                    <p className="text-sm">{selectedRequest.reason || 'No reason provided'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Approval Progress</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={selectedRequest.currentApprovalLevel >= 1 ? "bg-green-500" : "bg-gray-300"}>
                                            Manager
                                        </Badge>
                                        <span>→</span>
                                        <Badge className={selectedRequest.currentApprovalLevel >= 2 ? "bg-green-500" : "bg-gray-300"}>
                                            HR
                                        </Badge>
                                        {selectedRequest.maxSteps >= 3 && (
                                            <>
                                                <span>→</span>
                                                <Badge className={selectedRequest.currentApprovalLevel >= 3 ? "bg-green-500" : "bg-gray-300"}>
                                                    CEO
                                                </Badge>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Comments</label>
                                <Textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Add your approval/rejection comments..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleApproval('REJECT')}
                                    className="text-red-600 hover:text-red-700"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => handleApproval('APPROVE')}
                                    disabled={actionLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Approve
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};