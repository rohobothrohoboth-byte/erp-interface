// components/finance/journal-entries/JournalEntryList.tsx

import React, { useMemo, useEffect } from 'react'; // ✅ Added useEffect
import { MoreVertical, Eye, Edit, CheckCircle, X, RotateCcw, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover';
import { journalEntryHelpers } from '@/modules/finance/utils/journalEntryHelpers';
import type { JournalEntry } from '@/modules/finance/types/journalEntry.types';

interface Props {
    entries: JournalEntry[];
    accounts: any[];
    // ✅ Add filter props
    filterStatus?: string;
    filterType?: string;
    searchTerm?: string;
    selectedPeriod?: string;
    // ... other props
    onView: (entry: JournalEntry) => void;
    onEdit: (entry: JournalEntry) => void;
    onPost: (entry: JournalEntry) => void;
    onUnpost: (entry: JournalEntry) => void;
    onApprove: (entry: JournalEntry) => void;
    onReject: (entry: JournalEntry) => void;
    onReverse: (entry: JournalEntry) => void;
    onDelete: (entry: JournalEntry) => void;
}

export const JournalEntryList: React.FC<Props> = ({
                                                      entries,
                                                      accounts,
                                                      filterStatus = 'All',
                                                      filterType = 'All',
                                                      searchTerm = '',
                                                      selectedPeriod = 'all',
                                                      onView,
                                                      onEdit,
                                                      onPost,
                                                      onUnpost,
                                                      onApprove,
                                                      onReject,
                                                      onReverse,
                                                      onDelete,
                                                  }) => {
    // ✅ Helper function for status (matches the badge logic)
    // In JournalEntryList.tsx
    const getEntryStatus = (entry: JournalEntry): string => {
        if (entry.isApproved) return 'Approved';  // ← Check this FIRST
        if (entry.isReversed) return 'Reversed';
        if (entry.isPosted) return 'Posted';
        if (entry.rejectionReason) return 'Rejected';
        return 'Draft';
    };

    // ✅ DEBUG: Log all entries and their statuses
    useEffect(() => {
        console.log('═══════════════════════════════════════');
        console.log('📊 JournalEntryList Debug Information');
        console.log('═══════════════════════════════════════');
        console.log('📌 Total entries received:', entries.length);
        console.log('📌 Filter Status:', filterStatus);
        console.log('📌 Filter Type:', filterType);
        console.log('📌 Search Term:', searchTerm);
        console.log('📌 Selected Period:', selectedPeriod);
        console.log('───────────────────────────────────────');

        if (entries.length === 0) {
            console.log('⚠️ No entries received from API');
            console.log('═══════════════════════════════════════');
            return;
        }

        // Log each entry's details
        console.log('📝 Entry Details:');
        entries.forEach((entry, index) => {
            const status = getEntryStatus(entry);
            console.log(`  ${index + 1}. ${entry.reference}`, {
                id: entry.id,
                description: entry.description,
                entryType: entry.entryType,
                periodId: entry.periodId,
                periodName: entry.periodName,
                isApproved: entry.isApproved,
                isPosted: entry.isPosted,
                isReversed: entry.isReversed,
                rejectionReason: entry.rejectionReason,
                computedStatus: status,
                totalDebit: entry.totalDebit,
                totalCredit: entry.totalCredit,
            });
        });

        console.log('───────────────────────────────────────');

        // Log status breakdown
        const statusCounts = entries.reduce((acc, entry) => {
            const status = getEntryStatus(entry);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log('📊 Status Breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });

        console.log('───────────────────────────────────────');

        // Log entries that match the current filter
        const matchedEntries = entries.filter(entry => {
            const matchesSearch =
                entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.description.toLowerCase().includes(searchTerm.toLowerCase());

            const entryStatus = getEntryStatus(entry);
            const matchesStatus = filterStatus === 'All' || entryStatus === filterStatus;

            const matchesType = filterType === 'All' || entry.entryType === filterType;
            const matchesPeriod = selectedPeriod === 'all' || entry.periodId === selectedPeriod;

            return matchesSearch && matchesStatus && matchesType && matchesPeriod;
        });

        console.log('🎯 Filter Results:');
        console.log(`  Entries matching filter: ${matchedEntries.length} of ${entries.length}`);

        if (matchedEntries.length === 0 && entries.length > 0) {
            console.log('⚠️ No entries match the current filter!');
            console.log('💡 Try selecting "All" status to see all entries.');

            // Show which filter is causing the issue
            console.log('🔍 Filter Breakdown:');
            entries.forEach(entry => {
                const entryStatus = getEntryStatus(entry);
                const statusMatch = filterStatus === 'All' || entryStatus === filterStatus;
                const typeMatch = filterType === 'All' || entry.entryType === filterType;
                const periodMatch = selectedPeriod === 'all' || entry.periodId === selectedPeriod;
                const searchMatch =
                    entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.description.toLowerCase().includes(searchTerm.toLowerCase());

                console.log(`  ${entry.reference}:`, {
                    status: entryStatus,
                    statusMatch: statusMatch ? '✅' : '❌',
                    typeMatch: typeMatch ? '✅' : '❌',
                    periodMatch: periodMatch ? '✅' : '❌',
                    searchMatch: searchMatch ? '✅' : '❌',
                });
            });
        } else if (matchedEntries.length > 0) {
            console.log(`✅ Found ${matchedEntries.length} entries matching the filter:`);
            matchedEntries.forEach(entry => {
                console.log(`  ✅ ${entry.reference} (${getEntryStatus(entry)})`);
            });
        }

        console.log('═══════════════════════════════════════');
    }, [entries, filterStatus, filterType, searchTerm, selectedPeriod]);

    // ✅ Filter entries based on props
    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            // Search filter
            const matchesSearch =
                entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.description.toLowerCase().includes(searchTerm.toLowerCase());

            // Status filter - using the same logic as the badge
            const entryStatus = getEntryStatus(entry);
            const matchesStatus = filterStatus === 'All' || entryStatus === filterStatus;

            // Type filter
            const matchesType = filterType === 'All' || entry.entryType === filterType;

            // Period filter
            const matchesPeriod = selectedPeriod === 'all' || entry.periodId === selectedPeriod;

            return matchesSearch && matchesStatus && matchesType && matchesPeriod;
        });
    }, [entries, searchTerm, filterStatus, filterType, selectedPeriod]);

    // ✅ Original status badge function
    const getStatusBadge = (entry: JournalEntry) => {
        const type = journalEntryHelpers.getStatusBadgeType(entry);
        const label = journalEntryHelpers.getStatusLabel(entry);
        const colorMap = {
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            red: 'bg-red-100 text-red-700 border-red-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
        return <Badge className={colorMap[type as keyof typeof colorMap]}>{label}</Badge>;
    };

    // ✅ Use filteredEntries instead of entries
    if (filteredEntries.length === 0) {
        return (
            <div className="py-8 text-center text-gray-500">
                No journal entries found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEntries.map((entry) => (
                        <TableRow key={entry.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                                {journalEntryHelpers.formatDate(entry.entryDate)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                                {entry.description}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{entry.entryType}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-right text-emerald-600">
                                {journalEntryHelpers.formatCurrency(entry.totalDebit)}
                            </TableCell>
                            <TableCell className="text-sm text-right text-rose-600">
                                {journalEntryHelpers.formatCurrency(entry.totalCredit)}
                            </TableCell>
                            <TableCell>{getStatusBadge(entry)}</TableCell>
                            <TableCell className="text-xs text-gray-500">
                                {entry.periodName || 'N/A'}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                <MoreVertical size={16} />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-0" align="end">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => onView(entry)}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                >
                                                    <Eye size={16} />
                                                    View Details
                                                </button>
                                                {!entry.isPosted && !entry.isReversed && (
                                                    <>
                                                        <button
                                                            onClick={() => onEdit(entry)}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2"
                                                        >
                                                            <Edit size={16} />
                                                            Edit
                                                        </button>
                                                        {!entry.isApproved && !entry.rejectionReason && (
                                                            <>
                                                                <button
                                                                    onClick={() => onApprove(entry)}
                                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-blue-600 flex items-center gap-2"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => onReject(entry)}
                                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-red-600 flex items-center gap-2"
                                                                >
                                                                    <X size={16} />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => onPost(entry)}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-green-600 flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Post
                                                        </button>
                                                    </>
                                                )}
                                                {entry.isPosted && !entry.isReversed && (
                                                    <>
                                                        <button
                                                            onClick={() => onUnpost(entry)}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-yellow-600 flex items-center gap-2"
                                                        >
                                                            <RotateCcw size={16} />
                                                            Unpost
                                                        </button>
                                                        <button
                                                            onClick={() => onReverse(entry)}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-purple-600 flex items-center gap-2"
                                                        >
                                                            <RotateCcw size={16} />
                                                            Reverse
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => onDelete(entry)}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};