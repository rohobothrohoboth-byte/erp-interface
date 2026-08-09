// components/finance/journal-entries/JournalEntrySummaryCards.tsx

import React, { useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { journalEntryHelpers } from '../../../utils/finance/journalEntryHelpers';
import type { JournalEntrySummary } from '../../../types/finance/journalEntry.types';

interface Props {
    summary: JournalEntrySummary | null;
}

export const JournalEntrySummaryCards: React.FC<Props> = ({ summary }) => {
    // ✅ Debug logging for summary data
    useEffect(() => {
        console.log('═══════════════════════════════════════');
        console.log('📊 JournalEntrySummaryCards Debug');
        console.log('═══════════════════════════════════════');

        if (!summary) {
            console.log('⚠️ No summary data available');
            console.log('═══════════════════════════════════════');
            return;
        }

        console.log('📌 Summary Data Received:');
        console.log('  Total Entries:', summary.totalEntries);
        console.log('  Posted Entries:', summary.postedEntries);
        console.log('  Unposted Entries:', summary.unpostedEntries);
        console.log('  ✅ Approved Entries:', summary.approvedEntries);
        console.log('  ❌ Rejected Entries:', summary.rejectedEntries || 0);
        console.log('  💰 Total Debit:', journalEntryHelpers.formatCurrency(summary.totalDebit));
        console.log('  💰 Total Credit:', journalEntryHelpers.formatCurrency(summary.totalCredit));
        console.log('  📊 Net Balance:', journalEntryHelpers.formatCurrency(summary.netBalance || 0));
        console.log('  📅 Period:', summary.periodName || 'All Periods');

        // Log entries by type if available
        if (summary.entriesByType && Object.keys(summary.entriesByType).length > 0) {
            console.log('───────────────────────────────────────');
            console.log('📋 Entries by Type:');
            Object.entries(summary.entriesByType).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
        }

        // Log amounts by type if available
        if (summary.amountByType && Object.keys(summary.amountByType).length > 0) {
            console.log('───────────────────────────────────────');
            console.log('💰 Amounts by Type:');
            Object.entries(summary.amountByType).forEach(([type, amount]) => {
                console.log(`  ${type}: ${journalEntryHelpers.formatCurrency(amount)}`);
            });
        }

        // ✅ Check for data consistency
        console.log('───────────────────────────────────────');
        console.log('🔍 Data Consistency Check:');

        const postedPlusUnposted = summary.postedEntries + summary.unpostedEntries;
        console.log(`  Posted + Unposted: ${postedPlusUnposted} (should equal Total: ${summary.totalEntries})`);
        if (postedPlusUnposted !== summary.totalEntries) {
            console.log(`  ⚠️ Mismatch: Posted + Unposted (${postedPlusUnposted}) ≠ Total (${summary.totalEntries})`);
        }

        const approvedPlusRejected = (summary.approvedEntries || 0) + (summary.rejectedEntries || 0);
        console.log(`  Approved + Rejected: ${approvedPlusRejected}`);

        // Check if approved entries are included in posted/unposted counts
        if (summary.approvedEntries > 0) {
            console.log(`  ✅ ${summary.approvedEntries} entries are approved`);
            console.log(`  💡 Tip: Select "Approved" from the status filter to see these entries`);
        } else {
            console.log(`  ℹ️ No approved entries found`);
        }

        console.log('═══════════════════════════════════════');
    }, [summary]);

    if (!summary) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-gray-500">No summary data</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3">
                    <p className="text-xs text-blue-700 font-medium">Total</p>
                    <p className="text-xl font-bold text-blue-900">{summary.totalEntries}</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3">
                    <p className="text-xs text-green-700 font-medium">Posted</p>
                    <p className="text-xl font-bold text-green-900">{summary.postedEntries}</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-3">
                    <p className="text-xs text-yellow-700 font-medium">Unposted</p>
                    <p className="text-xl font-bold text-yellow-900">{summary.unpostedEntries}</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-3">
                    <p className="text-xs text-purple-700 font-medium">Approved</p>
                    <p className="text-xl font-bold text-purple-900">
                        {summary.approvedEntries}
                        {summary.approvedEntries > 0 && (
                            <span className="text-xs font-normal text-purple-600 ml-1">

                            </span>
                        )}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="p-3">
                    <p className="text-xs text-emerald-700 font-medium">Debit</p>
                    <p className="text-lg font-bold text-emerald-900">
                        {journalEntryHelpers.formatCurrency(summary.totalDebit)}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
                <CardContent className="p-3">
                    <p className="text-xs text-rose-700 font-medium">Credit</p>
                    <p className="text-lg font-bold text-rose-900">
                        {journalEntryHelpers.formatCurrency(summary.totalCredit)}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};