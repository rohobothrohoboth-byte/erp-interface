// src/components/hr/Leave/Modals/EncashmentModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { SelectedEncashment } from '@/modules/hr/types/leave/leaveye';  // Type-only import

interface Props {
    isOpen: boolean;
    selectedEncashment: SelectedEncashment | null;
    encashmentDays: number;
    onDaysChange: (days: number) => void;
    onConfirm: () => void;
    onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
};

export const EncashmentModal: React.FC<Props> = ({
                                                     isOpen,
                                                     selectedEncashment,
                                                     encashmentDays,
                                                     onDaysChange,
                                                     onConfirm,
                                                     onClose
                                                 }) => {
    if (!isOpen || !selectedEncashment) return null;

    const maxDays = Math.min(selectedEncashment.remainingBalance, selectedEncashment.maxEncashableDays);
    const estimatedAmount = encashmentDays * 100 * 0.95;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <Coins className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Encash Leave Days</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            <p className="text-sm"><span className="font-medium">Employee:</span> {selectedEncashment.employeeName}</p>
                            <p className="text-sm"><span className="font-medium">Leave Type:</span> {selectedEncashment.leaveTypeName}</p>
                            <p className="text-sm"><span className="font-medium text-green-600">Available Balance:</span> {selectedEncashment.remainingBalance} days</p>
                            <p className="text-sm"><span className="font-medium text-amber-600">Already Encashed:</span> {selectedEncashment.totalEncashedThisYear} days</p>
                            <p className="text-sm"><span className="font-medium text-emerald-600">Remaining Encashable:</span> {selectedEncashment.maxEncashableDays} days</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Days to Encash</label>
                            <input
                                type="number"
                                value={encashmentDays}
                                onChange={(e) => onDaysChange(Math.min(Number(e.target.value), maxDays))}
                                min={0.5}
                                max={maxDays}
                                step={0.5}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">Min: 0.5 days, Max: {maxDays} days</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Estimated Amount:</p>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(estimatedAmount)}</p>
                            <p className="text-xs text-gray-500 mt-1">* 5% tax will be deducted at payment</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={onConfirm} disabled={encashmentDays <= 0} className="bg-emerald-600 hover:bg-emerald-700">
                            Confirm Encashment
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};