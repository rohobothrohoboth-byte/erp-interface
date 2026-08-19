// components/VoucherFilters.tsx
import React from 'react';
import { Search, Calendar, Tag, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RefreshCw } from 'lucide-react';
interface VoucherFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterPeriodId: string;
    onPeriodChange: (value: string) => void;
    periods: any[];
    filterType: string;
    onTypeChange: (value: string) => void;
    filterStatus: string;
    onStatusChange: (value: string) => void;
    onClearFilters: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export const VoucherFilters: React.FC<VoucherFiltersProps> = ({
                                                                  searchTerm,
                                                                  onSearchChange,
                                                                  filterPeriodId,
                                                                  onPeriodChange,
                                                                  periods,
                                                                  filterType,
                                                                  onTypeChange,
                                                                  filterStatus,
                                                                  onStatusChange,
                                                                  onClearFilters,
                                                                  onRefresh,
                                                                  isRefreshing,
                                                              }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Search vouchers by number, vendor, or description..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Select value={filterPeriodId} onValueChange={onPeriodChange}>
                <SelectTrigger className="md:w-48">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Period" />
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

            <Select value={filterType} onValueChange={onTypeChange}>
                <SelectTrigger className="md:w-40">
                    <Tag className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Payment">Payment</SelectItem>
                    <SelectItem value="Receipt">Receipt</SelectItem>
                    <SelectItem value="Journal">Journal</SelectItem>
                    <SelectItem value="Contra">Contra</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
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
                    <SelectItem value="Posted">Posted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Void">Void</SelectItem>
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center gap-2"
            >
                Clear Filters
            </Button>

            <Button
                onClick={onRefresh}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isRefreshing}
            >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
            </Button>
        </div>
    );
};


