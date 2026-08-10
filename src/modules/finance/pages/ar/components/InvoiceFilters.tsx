// src/pages/finance/ar/components/InvoiceFilters.tsx
import React from 'react';
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface InvoiceFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    periodFilter: string;
    onPeriodChange: (value: string) => void;
    periods: any[];
    statusFilter: string;
    onStatusChange: (value: string) => void;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
                                                                  searchTerm,
                                                                  onSearchChange,
                                                                  periodFilter,
                                                                  onPeriodChange,
                                                                  periods,
                                                                  statusFilter,
                                                                  onStatusChange,
                                                              }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Search by invoice number, customer, or notes..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="md:w-56">
                <Select value={periodFilter} onValueChange={onPeriodChange}>
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

            <div className="md:w-52">
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Posted">Posted</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                        <SelectItem value="Partially_Paid">Partially Paid</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};