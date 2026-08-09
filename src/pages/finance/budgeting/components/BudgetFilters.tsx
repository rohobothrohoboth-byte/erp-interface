// src/pages/finance/budget/components/BudgetFilters.tsx

import React from 'react';
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../components/ui/select';

interface BudgetFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onStatusChange: (value: string) => void;
    filterPeriodId: string;
    onPeriodChange: (value: string) => void;
    periods: any[];
    onClearFilters: () => void;
}

export const BudgetFilters: React.FC<BudgetFiltersProps> = ({
                                                                searchTerm,
                                                                onSearchChange,
                                                                filterStatus,
                                                                onStatusChange,
                                                                filterPeriodId,
                                                                onPeriodChange,
                                                                periods,
                                                                onClearFilters,
                                                            }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Search budgets..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="md:w-48">
                <Select value={filterPeriodId} onValueChange={onPeriodChange}>
                    <SelectTrigger>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Periods</SelectItem>
                        {periods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                                {period.name} {period.isClosed ? '🔒' : '🔓'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Select value={filterStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="md:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center gap-2"
            >
                Clear Filters
            </Button>
        </div>
    );
};