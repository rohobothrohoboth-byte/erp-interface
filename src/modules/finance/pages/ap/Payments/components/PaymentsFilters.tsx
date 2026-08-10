// src/pages/finance/ap/components/PaymentsFilters.tsx
import React from 'react';
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface PaymentsFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    periodFilter: string;
    onPeriodChange: (value: string) => void;
    periods: any[];
    statusFilter: string;
    onStatusChange: (value: string) => void;
}

export const PaymentsFilters: React.FC<PaymentsFiltersProps> = ({
                                                                    searchTerm,
                                                                    onSearchChange,
                                                                    periodFilter,
                                                                    onPeriodChange,
                                                                    periods,
                                                                    statusFilter,
                                                                    onStatusChange,
                                                                }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Search by PV number, vendor, invoice, or reference..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Select value={periodFilter} onValueChange={onPeriodChange}>
                <SelectTrigger className="md:w-44">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by Period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    {periods?.map((period: any) => (
                        <SelectItem key={period.id} value={period.id}>
                            {period.name} {period.isClosed ? '🔒' : '🔓'}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="md:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Posted">Posted</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partially_Paid">Partially Paid</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};