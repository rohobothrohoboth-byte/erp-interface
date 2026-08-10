// components/finance/chart-of-accounts/AccountFilters.tsx

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
// ✅ Type-only import
import type { AccountFilters } from '@/modules/finance/types/account.types';

interface Props {
    filters?: AccountFilters;
    onFiltersChange: (filters: AccountFilters) => void;
    onClearFilters: () => void;
}

const DEFAULT_FILTERS: AccountFilters = {
    searchTerm: '',
    filterType: 'All',
    filterStatus: 'All',
};

// ✅ RENAME: Use a different name for the component
export const AccountFilterBar: React.FC<Props> = ({
                                                      filters = DEFAULT_FILTERS,
                                                      onFiltersChange,
                                                      onClearFilters,
                                                  }) => {
    const searchTerm = filters?.searchTerm ?? '';
    const filterType = filters?.filterType ?? 'All';
    const filterStatus = filters?.filterStatus ?? 'All';

    const handleFilterChange = <K extends keyof AccountFilters>(
        key: K,
        value: AccountFilters[K]
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const hasActiveFilters = searchTerm.trim() !== '' ||
        filterType !== 'All' ||
        filterStatus !== 'All';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Search accounts by name or code..."
                    value={searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="pl-10"
                />
                {searchTerm && (
                    <button
                        onClick={() => handleFilterChange('searchTerm', '')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <Select
                value={filterType}
                onValueChange={(value) => handleFilterChange('filterType', value)}
            >
                <SelectTrigger className="md:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Asset">Asset</SelectItem>
                    <SelectItem value="Liability">Liability</SelectItem>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filterStatus}
                onValueChange={(value) => handleFilterChange('filterStatus', value)}
            >
                <SelectTrigger className="md:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
            >
                Clear Filters
            </Button>

            {hasActiveFilters && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {[
                        searchTerm && 'Search',
                        filterType !== 'All' && filterType,
                        filterStatus !== 'All' && filterStatus,
                    ].filter(Boolean).join(' • ')}
                </span>
            )}
        </div>
    );
};

// ✅ Also export the component as default for flexibility
export default AccountFilterBar;