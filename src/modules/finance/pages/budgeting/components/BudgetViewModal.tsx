// src/pages/finance/budget/components/BudgetViewModal.tsx

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { PieChart } from 'lucide-react';
import type { Budget } from '@/modules/finance/pages/budgeting/types';

interface BudgetViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    budget: Budget | null;
    formatCurrency: (amount: number) => string;
    formatDate: (date: string) => string;
    getStatusColor: (status: string) => string;
}

export const BudgetViewModal: React.FC<BudgetViewModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    budget,
                                                                    formatCurrency,
                                                                    formatDate,
                                                                    getStatusColor,
                                                                }) => {
    if (!budget) return null;

    const totalSpent = budget.lines.reduce((sum, l) => sum + (l.spentAmount || 0), 0);
    const totalRemaining = budget.totalAmount - totalSpent;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-indigo-600" />
                        Budget Details
                    </DialogTitle>
                    <DialogDescription>
                        View budget information.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{budget.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Code</p>
                            {/* ✅ FIX: Use budgetCode instead of code */}
                            <p className="font-mono font-medium text-sm">{budget.budgetCode || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <Badge className={getStatusColor(budget.status)}>
                                {budget.status}
                            </Badge>
                        </div>
                        {budget.periodName && (
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Financial Period</p>
                                <p className="font-medium text-indigo-600">{budget.periodName}</p>
                            </div>
                        )}
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Description</p>
                            <p>{budget.description || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Start Date</p>
                            <p>{formatDate(budget.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">End Date</p>
                            <p>{formatDate(budget.endDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Branch</p>
                            <p>{budget.branchName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p>{budget.departmentName || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(budget.totalAmount)}</p>
                        </div>
                    </div>

                    {/* Budget Lines */}
                    {budget.lines.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Budget Lines</p>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Account</th>
                                        <th className="px-3 py-2 text-right">Allocated</th>
                                        <th className="px-3 py-2 text-right">Spent</th>
                                        <th className="px-3 py-2 text-right">Remaining</th>
                                        <th className="px-3 py-2 text-left">Description</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                    {budget.lines.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <div>
                                                    <p className="font-medium">{line.accountName || 'Unknown'}</p>
                                                    {line.accountCode && (
                                                        <p className="text-xs text-gray-400">{line.accountCode}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-right">{formatCurrency(line.allocatedAmount)}</td>
                                            <td className="px-3 py-2 text-right text-orange-600">
                                                {formatCurrency(line.spentAmount || 0)}
                                            </td>
                                            <td className={`px-3 py-2 text-right ${(line.allocatedAmount - (line.spentAmount || 0)) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(line.allocatedAmount - (line.spentAmount || 0))}
                                            </td>
                                            <td className="px-3 py-2 text-gray-500">{line.description || '-'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                    <tr>
                                        <td className="px-3 py-2 font-bold">Total</td>
                                        <td className="px-3 py-2 text-right font-bold">{formatCurrency(budget.totalAmount)}</td>
                                        <td className="px-3 py-2 text-right font-bold text-orange-600">
                                            {formatCurrency(totalSpent)}
                                        </td>
                                        <td className={`px-3 py-2 text-right font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(totalRemaining)}
                                        </td>
                                        <td className="px-3 py-2"></td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BudgetViewModal;