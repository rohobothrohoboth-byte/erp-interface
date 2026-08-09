// src/components/crm/leadManagement/leadGeneration/LeadGenerationTable.tsx

import React from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Building2, Mail, Phone } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import LeadStatusBadge from '../shared/LeadStatusBadge';
import LeadPriorityBadge from '../shared/LeadPriorityBadge';
import LeadScoreBadge from '../shared/LeadScoreBadge';
import type { LeadDto } from '../../../../types/crm/crm.types';

interface LeadGenerationTableProps {
    leads: LeadDto[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onViewLead: (id: string) => void;
    onEditLead: (id: string) => void;
    onDeleteLead: (lead: LeadDto) => void;
    loading?: boolean;
}

// ✅ Correct status mapping based on backend enum
const STATUS_MAP: Record<number, string> = {
    1: 'New',
    2: 'Contacted',
    3: 'Qualified',
    4: 'Proposal',
    5: 'Negotiation',
    6: 'Converted',
    7: 'Lost',
    8: 'Archived',
};

const PRIORITY_MAP: Record<number, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
};

// ✅ Helper: Get status as string
const getStatusString = (status: any): string => {
    if (!status) return 'New';
    if (typeof status === 'string') {
        const num = parseInt(status);
        if (!isNaN(num) && num in STATUS_MAP) return STATUS_MAP[num];
        return status;
    }
    if (typeof status === 'number') {
        return STATUS_MAP[status] || 'New';
    }
    return String(status);
};

// ✅ Helper: Get priority as string
const getPriorityString = (priority: any): string => {
    if (!priority) return 'Medium';
    if (typeof priority === 'string') {
        const num = parseInt(priority);
        if (!isNaN(num) && num in PRIORITY_MAP) return PRIORITY_MAP[num];
        return priority;
    }
    if (typeof priority === 'number') {
        return PRIORITY_MAP[priority] || 'Medium';
    }
    return String(priority);
};

// ✅ Helper: Get full name
const getFullName = (lead: LeadDto) => {
    if (lead.fullName) return lead.fullName;
    return `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown';
};

const LeadGenerationTable: React.FC<LeadGenerationTableProps> = ({
                                                                     leads,
                                                                     currentPage,
                                                                     totalPages,
                                                                     onPageChange,
                                                                     onViewLead,
                                                                     onEditLead,
                                                                     onDeleteLead,
                                                                     loading = false,
                                                                 }) => {
    const formatCurrency = (amount?: number) => {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    const startIndex = (currentPage - 1) * 10;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {leads.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                No leads found
                            </td>
                        </tr>
                    ) : (
                        leads.map((lead) => {
                            // ✅ Convert status and priority to display strings
                            const displayStatus = getStatusString(lead.status);
                            const displayPriority = getPriorityString(lead.priority);
                            const fullName = getFullName(lead);

                            return (
                                <tr
                                    key={lead.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => onViewLead(lead.id)}
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {fullName}
                                            </p>
                                            {lead.companyName && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Building2 size={12} />
                                                    {lead.companyName}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-600">
                                            <p className="flex items-center gap-1">
                                                <Mail size={14} className="text-gray-400" />
                                                {lead.email || 'No email'}
                                            </p>
                                            {lead.phone && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {lead.phone}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <LeadStatusBadge status={displayStatus} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <LeadPriorityBadge priority={displayPriority} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-indigo-600">
                                        {formatCurrency(lead.estimatedValue || lead.budget || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <LeadScoreBadge score={lead.score || 0} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDate(lead.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => onViewLead(lead.id)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => onEditLead(lead.id)}
                                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                                title="Edit Lead"
                                            >
                                                <Edit size={16} className="text-yellow-600" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteLead(lead)}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete Lead"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + 10, leads.length)} of {leads.length} leads
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadGenerationTable;