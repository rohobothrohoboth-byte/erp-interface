// src/components/hr/Leave/Modals/EncashmentRequestModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { yearEndApi } from '../../../services/hr/leave/yearEndApi';
import { useLeaveNotificationIntegration } from '../../../hooks/hr/leave/useLeaveNotificationIntegration';
import { useAuthStore } from '../../../stores/auth.store';
import { toast } from 'react-hot-toast';

interface EncashmentRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    remainingBalance: number;
    maxEncashableDays: number;
    ratePerDay: number;
}

export const EncashmentRequestModal: React.FC<EncashmentRequestModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                                  onSuccess,
                                                                                  employeeId,
                                                                                  employeeName,
                                                                                  leaveTypeId,
                                                                                  leaveTypeName,
                                                                                  remainingBalance,
                                                                                  maxEncashableDays,
                                                                                  ratePerDay
                                                                              }) => {
    const { employeeId: currentUserId, employeeName: currentUserName } = useAuthStore();
    const [days, setDays] = useState(0);
    const [reason, setReason] = useState('');
    const [preferredMonth, setPreferredMonth] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [managers, setManagers] = useState<string[]>([]);
    const [loadingManagers, setLoadingManagers] = useState(false);

    const { notifyEncashmentRequestSubmitted, getManagersForEmployee } = useLeaveNotificationIntegration();

    // Load managers when modal opens
    useEffect(() => {
        if (isOpen && employeeId) {
            loadManagers();
        }
    }, [isOpen, employeeId]);

    const loadManagers = async () => {
        setLoadingManagers(true);
        try {
            const managerIds = await getManagersForEmployee(employeeId);
            setManagers(managerIds);
        } catch (error) {
            console.error('Error loading managers:', error);
        } finally {
            setLoadingManagers(false);
        }
    };

    const maxDays = Math.min(remainingBalance, maxEncashableDays);
    const totalAmount = days * ratePerDay;
    const taxAmount = totalAmount * 0.05;
    const netAmount = totalAmount - taxAmount;

    const handleSubmit = async () => {
        if (days <= 0) {
            setError('Please enter a valid number of days');
            return;
        }

        if (days > maxDays) {
            setError(`Maximum encashable days is ${maxDays}`);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await yearEndApi.requestEncashment({
                employeeId,
                leaveTypeId,
                requestedDays: days,
                reason,
                preferredMonth
            });

            if (response.data?.success) {
                // Send notifications to managers
                if (managers.length > 0) {
                    try {
                        await notifyEncashmentRequestSubmitted(
                            employeeId,
                            employeeName || currentUserName || 'Employee',
                            days,
                            totalAmount,
                            managers
                        );
                    } catch (notifError) {
                        console.error('Error sending encashment notifications:', notifError);
                        // Don't fail the request if notification fails
                    }
                } else {
                    console.warn('No managers found for employee, notifications not sent');
                }

                toast.success('Encashment request submitted successfully!');
                onSuccess();
                onClose();
                setDays(0);
                setReason('');
                setPreferredMonth('');
            } else {
                setError(response.data?.message || 'Failed to submit request');
            }
        } catch (error: any) {
            setError(error?.response?.data?.message || 'Failed to submit encashment request');
        } finally {
            setLoading(false);
        }
    };

    // Get available months (November and December only)
    const getAvailableMonths = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const months = [];

        // If before November, show November and December
        if (currentMonth < 11) {
            months.push({ value: `${currentYear}-11`, label: `November ${currentYear}` });
            months.push({ value: `${currentYear}-12`, label: `December ${currentYear}` });
        }
        // If in November or December, show current and next year's months
        else if (currentMonth === 11) {
            months.push({ value: `${currentYear}-11`, label: `November ${currentYear}` });
            months.push({ value: `${currentYear}-12`, label: `December ${currentYear}` });
        } else if (currentMonth === 12) {
            months.push({ value: `${currentYear}-12`, label: `December ${currentYear}` });
            months.push({ value: `${currentYear + 1}-11`, label: `November ${currentYear + 1}` });
        } else {
            months.push({ value: `${currentYear + 1}-11`, label: `November ${currentYear + 1}` });
            months.push({ value: `${currentYear + 1}-12`, label: `December ${currentYear + 1}` });
        }

        return months;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Leave Encashment</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Employee:</strong> {employeeName || currentUserName || 'Unknown'}
                        </p>
                        <p className="text-sm text-blue-800">
                            <strong>Leave Type:</strong> {leaveTypeName}
                        </p>
                        <p className="text-sm text-blue-800">
                            <strong>Remaining Balance:</strong> {remainingBalance} days
                        </p>
                        <p className="text-sm text-blue-800">
                            <strong>Max Encashable:</strong> {maxEncashableDays} days
                        </p>
                        <p className="text-sm text-blue-800">
                            <strong>Rate per Day:</strong> ${ratePerDay.toFixed(2)}
                        </p>
                        {loadingManagers ? (
                            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Checking approval workflow...
                            </p>
                        ) : managers.length > 0 ? (
                            <p className="text-xs text-green-600 mt-2">
                                ✅ Will notify {managers.length} manager(s) for approval
                            </p>
                        ) : (
                            <p className="text-xs text-yellow-600 mt-2">
                                ⚠️ No managers found. Request will be submitted directly.
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>Days to Encash *</Label>
                        <Input
                            type="number"
                            min={1}
                            max={maxDays}
                            value={days}
                            onChange={(e) => {
                                setDays(parseInt(e.target.value) || 0);
                                setError('');
                            }}
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum: {maxDays} days</p>
                    </div>

                    <div>
                        <Label>Preferred Payment Month *</Label>
                        <select
                            value={preferredMonth}
                            onChange={(e) => setPreferredMonth(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            required
                        >
                            <option value="">Select month</option>
                            {getAvailableMonths().map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Encashment processed in selected month</p>
                    </div>

                    <div>
                        <Label>Reason (Optional)</Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Financial need, special occasion, etc."
                            rows={3}
                            className="mt-1"
                        />
                    </div>

                    {/* Financial Summary */}
                    {days > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                            <p className="text-sm font-semibold">Financial Summary:</p>
                            <p className="text-sm">Total Amount: <strong>${totalAmount.toFixed(2)}</strong></p>
                            <p className="text-sm">Tax (5%): <strong>${taxAmount.toFixed(2)}</strong></p>
                            <p className="text-sm">Net Amount: <strong className="text-green-600">${netAmount.toFixed(2)}</strong></p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-xs text-yellow-800">
                            ℹ️ Encashment requests are processed in November/December only.
                            Requests require manager approval and may be subject to budget availability.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || days === 0 || loadingManagers}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};