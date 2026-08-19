// components/finance/journal-entries/JournalEntryFilters.tsx

import React from 'react';
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';

import { STATUS_OPTIONS, ENTRY_TYPES } from '@/modules/finance/constants/journalEntryConstants';
import type { JournalEntryFilterspro } from '@/modules/finance/types/journalEntry.types';

interface Props {
    filters: JournalEntryFilterspro;
    onFiltersChange: (filters: JournalEntryFilterspro) => void;
    financialPeriods: any[];
    onClearFilters: () => void;
}

export const JournalEntryFilters: React.FC<Props> = ({
                                                         filters,
                                                         onFiltersChange,
                                                         financialPeriods,
                                                         onClearFilters,
                                                     }) => {
    const handleFilterChange = <K extends keyof JournalEntryFilterspro>(
        key: K,
        value: JournalEntryFilterspro[K]
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Search by reference or description..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="pl-10"
                />
            </div>

            <Select
                value={filters.filterStatus}
                onValueChange={(value) => handleFilterChange('filterStatus', value)}
            >
                <SelectTrigger className="md:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.filterType}
                onValueChange={(value) => handleFilterChange('filterType', value)}
            >
                <SelectTrigger className="md:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    {ENTRY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                            {type.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.selectedPeriod}
                onValueChange={(value) => handleFilterChange('selectedPeriod', value)}
            >
                <SelectTrigger className="md:w-48">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    {financialPeriods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                            {period.name} {period.isClosed ? '🔒' : '🔓'}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button variant="outline" onClick={onClearFilters}>
                Clear Filters
            </Button>
        </div>
    );
};