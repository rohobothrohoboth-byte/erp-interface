// src/pages/finance/ap/invoice/components/InvoiceFilters.tsx

import React from 'react';
import { Search, Filter, Tag } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface InvoiceFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterType: 'All' | 'Purchase' | 'Sales';
    onTypeChange: (value: 'All' | 'Purchase' | 'Sales') => void;
    filterStatus: string;
    onStatusChange: (value: string) => void;
    dateRange: { from?: Date; to?: Date } | undefined;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onApplyDateRange: () => void;
    onClearFilters: () => void;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
                                                                  searchTerm,
                                                                  onSearchChange,
                                                                  filterType,
                                                                  onTypeChange,
                                                                  filterStatus,
                                                                  onStatusChange,
                                                                  dateRange,
                                                                  onDateFromChange,
                                                                  onDateToChange,
                                                                  onApplyDateRange,
                                                                  onClearFilters,
                                                              }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Search invoices by number, vendor, or customer..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={dateRange?.from ? dateRange.from.toISOString().split('T')[0] : ''}
                    onChange={(e) => onDateFromChange(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-400">→</span>
                <input
                    type="date"
                    value={dateRange?.to ? dateRange.to.toISOString().split('T')[0] : ''}
                    onChange={(e) => onDateToChange(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
                <Button size="sm" variant="outline" onClick={onApplyDateRange}>
                    Apply
                </Button>
            </div>

            <Select value={filterType} onValueChange={onTypeChange}>
                <SelectTrigger className="md:w-40">
                    <Tag className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Invoice Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Purchase">Purchase (AP)</SelectItem>
                    <SelectItem value="Sales">Sales (AR)</SelectItem>
                </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="md:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partially_Paid">Partially Paid</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>

            <Button variant="outline" onClick={onClearFilters} className="flex items-center gap-2">
                Clear Filters
            </Button>
        </div>
    );
};