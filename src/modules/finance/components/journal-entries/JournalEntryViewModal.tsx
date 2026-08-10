// components/finance/journal-entries/JournalEntryViewModal.tsx

import React from 'react';
import {
    BookOpen, CheckCircle, Clock, XCircle, Calendar as CalendarIcon,
    Edit, Building, Users, User, Hash, FileText
} from 'lucide-react';
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { journalEntryHelpers } from '@/modules/finance/utils/journalEntryHelpers';
import type { JournalEntry } from '@/modules/finance/types/journalEntry.types';

interface Props {
    entry: JournalEntry | null;
    accounts: any[];
    costCenters: any[];
    departments?: any[];
    branches?: any[];
    employees?: any[];
    onClose: () => void;
    onEdit: () => void;
}

export const JournalEntryViewModal: React.FC<Props> = ({
                                                           entry,
                                                           accounts,
                                                           costCenters,
                                                           departments = [],
                                                           branches = [],
                                                           employees = [],
                                                           onClose,
                                                           onEdit,
                                                       }) => {
    if (!entry) return null;

    // ✅ Get account name with fallback
    const getAccountName = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        if (account) {
            return account.name || account.accountName || 'Unknown';
        }
        return 'Unknown';
    };

    // ✅ Get account code with fallback
    const getAccountCode = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        return account?.code || account?.accountCode || '-';
    };

    // ✅ Get department name - only return the name, no ID
    const getDepartmentName = (departmentId: string | null | undefined) => {
        if (!departmentId) return 'None';

        // Try departments array first
        if (departments && departments.length > 0) {
            const dept = departments.find(d => d.id === departmentId);
            if (dept) {
                return dept.name || dept.departmentName || dept.Name || 'Unknown';
            }
        }

        // Try costCenters array as fallback
        if (costCenters && costCenters.length > 0) {
            const dept = costCenters.find(d => d.id === departmentId);
            if (dept) {
                return dept.name || dept.departmentName || dept.Name || 'Unknown';
            }
        }

        return 'Unknown';
    };

    // ✅ Get branch name - only return the name, no ID
    const getBranchName = (branchId: string | null | undefined) => {
        if (!branchId) return 'None';
        const branch = branches.find(b => b.id === branchId);
        if (branch) {
            return branch.name || branch.branchName || 'Unknown';
        }
        return 'Unknown';
    };

    // ✅ Get employee name - only return the name, no ID
    const getEmployeeName = (employeeId: string | null | undefined) => {
        if (!employeeId) return 'None';
        const employee = employees.find(e => e.id === employeeId);
        if (employee) {
            return employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
        }
        return 'Unknown';
    };

    // ✅ Get status badge
    const getStatusBadge = () => {
        if (entry.isReversed) {
            return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Reversed</Badge>;
        }
        if (entry.isPosted) {
            return <Badge className="bg-green-100 text-green-700 border-green-200">Posted</Badge>;
        }
        if (entry.isApproved && !entry.isPosted) {
            return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Approved</Badge>;
        }
        if (entry.rejectionReason) {
            return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
        }
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Draft</Badge>;
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Journal Entry Details
                </DialogTitle>
                <DialogDescription>
                    View complete journal entry information including all lines.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Status Bar */}
                <div className="flex flex-wrap gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {getStatusBadge()}
                    <Badge variant="secondary">{entry.entryType}</Badge>
                    {entry.periodName && (
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {entry.periodName}
                        </Badge>
                    )}
                    {entry.isPosted && entry.postedDate && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                            Posted: {journalEntryHelpers.formatDate(entry.postedDate)}
                        </Badge>
                    )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Reference</p>
                        <p className="font-mono font-medium">{entry.reference}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{journalEntryHelpers.formatDate(entry.entryDate)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{entry.entryType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="flex items-center gap-2">
                            {entry.isPosted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            <span>{entry.isPosted ? 'Posted' : 'Unposted'}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium">{entry.description}</p>
                </div>

                {/* ✅ Organization Information - Only names, no IDs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-2">
                        <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500">Department</p>
                            <p className="text-sm font-medium text-gray-900">
                                {entry.departmentId ? getDepartmentName(entry.departmentId) : 'None'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500">Branch</p>
                            <p className="text-sm font-medium text-gray-900">
                                {entry.branchId ? getBranchName(entry.branchId) : 'None'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500">Employee</p>
                            <p className="text-sm font-medium text-gray-900">
                                {entry.employeeId ? getEmployeeName(entry.employeeId) : 'None'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rejection Reason */}
                {entry.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-red-800">Rejection Reason</p>
                                <p className="text-sm text-red-700 mt-1">{entry.rejectionReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approval Info */}
                {entry.isApproved && !entry.rejectionReason && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-green-800">Approved</p>
                                {entry.approvedBy && (
                                    <p className="text-sm text-green-700">By: {entry.approvedBy}</p>
                                )}
                                {entry.approvedDate && (
                                    <p className="text-xs text-green-500 mt-1">
                                        Approved on: {journalEntryHelpers.formatDate(entry.approvedDate)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reversal Info */}
                {entry.isReversed && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-500">Reversal Information</p>
                        <p className="text-sm font-medium">Reversed by: {entry.reversedBy || 'System'}</p>
                        {entry.reversedDate && (
                            <p className="text-xs text-gray-400">{journalEntryHelpers.formatDate(entry.reversedDate)}</p>
                        )}
                    </div>
                )}

                {/* Created/Updated Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
                    {entry.createdByUserName && (
                        <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>Created by: <span className="font-medium text-gray-700">{entry.createdByUserName}</span></span>
                            <span>•</span>
                            <span>{journalEntryHelpers.formatDate(entry.dateAdd)}</span>
                        </div>
                    )}
                    {entry.updatedByUserName && (
                        <div className="flex items-center gap-2">
                            <Edit className="h-3 w-3" />
                            <span>Updated by: <span className="font-medium text-gray-700">{entry.updatedByUserName}</span></span>
                            <span>•</span>
                            <span>{entry.dateMod ? journalEntryHelpers.formatDate(entry.dateMod) : 'Never'}</span>
                        </div>
                    )}
                </div>

                {/* Journal Lines */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">Journal Lines</p>
                        <span className="text-xs text-gray-400">{entry.lines.length} lines</span>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {entry.lines.map((line, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">{getAccountName(line.accountId)}</td>
                                    <td className="px-3 py-2 font-mono text-xs">{getAccountCode(line.accountId)}</td>
                                    <td className="px-3 py-2">
                                        <Badge
                                            variant="secondary"
                                            className={line.direction === 'Debit'
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : 'bg-rose-100 text-rose-700 border-rose-200'
                                            }
                                        >
                                            {line.direction}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono">
                                        {journalEntryHelpers.formatCurrency(line.amount)}
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">{line.description || '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-medium">
                            <tr>
                                <td colSpan={3} className="px-3 py-2 text-right">Total:</td>
                                <td className="px-3 py-2 text-right">
                                    <span className="text-emerald-600">{journalEntryHelpers.formatCurrency(entry.totalDebit)}</span>
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <span className="text-rose-600">{journalEntryHelpers.formatCurrency(entry.totalCredit)}</span>
                                </td>
                            </tr>
                            <tr className="border-t border-gray-300">
                                <td colSpan={3} className="px-3 py-2 text-right">Balance:</td>
                                <td colSpan={2} className="px-3 py-2 text-right">
                                    {entry.totalDebit === entry.totalCredit ? (
                                        <span className="text-green-600">✓ Balanced</span>
                                    ) : (
                                        <span className="text-red-600">✗ Unbalanced</span>
                                    )}
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Close</Button>
                {entry && !entry.isPosted && !entry.isReversed && (
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={onEdit}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                )}
            </DialogFooter>
        </>
    );
};