// src/components/hr/Leave/PendingApprovals.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { useAuthStore } from '../../../stores/auth.store';
import { encashmentWorkflowApi } from '../../../services/hr/leave/encashmentWorkflowService';
import { toast } from 'react-hot-toast';

interface PendingApproval {
    id: string;
    employeeName: string;
    department: string;
    requestedDays: number;
    totalAmount: number;
    reason: string;
    requestedDate: string;
    preferredMonth: string;
    currentLevel: number;
}

export const PendingApprovals: React.FC = () => {
    const { role, employeeId } = useAuthStore();
    const [pendingRequests, setPendingRequests] = useState<PendingApproval[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<PendingApproval | null>(null);
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPendingApprovals();
    }, [role, employeeId]);

    const loadPendingApprovals = async () => {
        setLoading(true);
        try {
            const response = await encashmentWorkflowApi.getPendingApprovals(employeeId, role);
            setPendingRequests(response.data?.data || []);
        } catch (error) {
            console.error('Failed to load pending approvals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
        try {
            await encashmentWorkflowApi.processApproval(requestId, action, comments);
            toast.success(`Request ${action.toLowerCase()}d successfully`);
            setSelectedRequest(null);
            setComments('');
            loadPendingApprovals();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to process approval');
        }
    };

    const getRoleSpecificInsights = () => {
        switch (role) {
            case 'MANAGER':
                return {
                    title: 'Team Encashment Requests',
                    considerations: [
                        'Team workload and project deadlines',
                        'Staffing levels during requested month',
                        'Critical project timelines',
                        'Knowledge transfer requirements'
                    ]
                };
            case 'HR':
                return {
                    title: 'HR Encashment Review',
                    considerations: [
                        'Policy compliance check',
                        'Leave balance verification',
                        'Previous encashment history',
                        'Employment contract terms'
                    ]
                };
            case 'FINANCE':
                return {
                    title: 'Financial Review',
                    considerations: [
                        'Department budget availability',
                        'Cash flow impact',
                        'Tax implications',
                        'Quarterly financial planning'
                    ]
                };
            case 'CEO':
                return {
                    title: 'Executive Approval',
                    considerations: [
                        'Strategic business impact',
                        'Organizational financial health',
                        'Company leave policy alignment',
                        'Long-term workforce planning'
                    ]
                };
            default:
                return { title: 'Pending Approvals', considerations: [] };
        }
    };

    const insights = getRoleSpecificInsights();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{insights.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {insights.considerations.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-semibold text-blue-800">Considerations:</p>
                            <ul className="list-disc list-inside text-sm text-blue-700">
                                {insights.considerations.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Preferred Month</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.employeeName}</TableCell>
                                    <TableCell>{request.department}</TableCell>
                                    <TableCell>{request.requestedDays} days</TableCell>
                                    <TableCell>${request.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>{request.preferredMonth}</TableCell>
                                    <TableCell>{new Date(request.requestedDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            onClick={() => setSelectedRequest(request)}
                                        >
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Approval Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Encashment Request</DialogTitle>
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
                                    <p className="font-medium">{selectedRequest.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Requested Days</p>
                                    <p className="font-medium">{selectedRequest.requestedDays} days</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Financial Impact</p>
                                    <p className="font-medium text-green-600">
                                        ${selectedRequest.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Reason</p>
                                    <p className="font-medium">{selectedRequest.reason || 'Not provided'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Comments</label>
                                <Textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Add your comments, recommendations, or conditions..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleApproval(selectedRequest.id, 'REJECT')}
                                >
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => handleApproval(selectedRequest.id, 'APPROVE')}
                                >
                                    Approve
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};