// src/components/hr/Leave/EncashmentApprovals.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { yearEndApi } from '../../../services/hr/leave/yearEndApi';
import { useLeaveNotificationIntegration } from '../../../hooks/hr/leave/useLeaveNotificationIntegration';
import { useAuthStore } from '../../../stores/auth.store';
import { toast } from 'react-hot-toast';

interface EncashmentRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveTypeName: string;
    encashmentDays: number;
    ratePerDay: number;
    totalAmount: number;
    status: string;
    currentStep: number;
    requestDate: string;
}

export const EncashmentApprovals: React.FC = () => {
    const { employeeName: currentUserName, role } = useAuthStore();
    const { notifyEncashmentApproved, notifyEncashmentRejected } = useLeaveNotificationIntegration();

    const [pendingRequests, setPendingRequests] = useState<EncashmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        try {
            setLoading(true);
            const response = await yearEndApi.getPendingEncashmentApprovals();
            const data = response.data?.data || [];
            setPendingRequests(data);
        } catch (error) {
            console.error('Error fetching pending encashment approvals:', error);
            toast.error('Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id: string, status: 'Approved' | 'Rejected') => {
        setProcessingId(id);
        try {
            const request = pendingRequests.find(r => r.id === id);

            const response = await yearEndApi.approveEncashment(id, status);

            if (response.data?.success) {
                // Send notification
                if (request) {
                    if (status === 'Approved') {
                        await notifyEncashmentApproved(
                            request.employeeId,
                            request.employeeName,
                            request.encashmentDays,
                            request.totalAmount,
                            currentUserName || 'System',
                            role || 'Manager'
                        );
                    } else {
                        await notifyEncashmentRejected(
                            request.employeeId,
                            request.employeeName,
                            request.encashmentDays,
                            'Request rejected by approver',
                            currentUserName || 'System'
                        );
                    }
                }

                toast.success(`Encashment request ${status.toLowerCase()}`);
                await fetchPendingApprovals();
            } else {
                toast.error(response.data?.message || 'Failed to process approval');
            }
        } catch (error: any) {
            console.error('Approval error:', error);
            toast.error(error?.response?.data?.message || 'Failed to process approval');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved':
                return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
            case 'Rejected':
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
            case 'Pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                    <p className="mt-2 text-gray-500">Loading pending approvals...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Encashment Approvals
                    {pendingRequests.length > 0 && (
                        <Badge className="ml-2 bg-purple-100 text-purple-800">
                            {pendingRequests.length}
                        </Badge>
                    )}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchPendingApprovals} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-500">No pending encashment approvals</p>
                        <p className="text-sm text-gray-400">All requests have been processed</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map((request) => (
                            <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{request.employeeName}</h3>
                                        <p className="text-sm text-gray-500">
                                            {request.leaveTypeName} • {request.encashmentDays} days
                                        </p>
                                        <div className="mt-1 space-y-1">
                                            <p className="text-sm">
                                                Rate: {request.ratePerDay} ETB/day
                                            </p>
                                            <p className="text-sm font-medium">
                                                Total: {request.totalAmount} ETB
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Requested: {new Date(request.requestDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(request.status)}
                                        {request.status === 'Pending' && (
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                                    onClick={() => handleApproval(request.id, 'Approved')}
                                                    disabled={processingId === request.id}
                                                >
                                                    {processingId === request.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleApproval(request.id, 'Rejected')}
                                                    disabled={processingId === request.id}
                                                >
                                                    {processingId === request.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};