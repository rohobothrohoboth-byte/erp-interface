// src/components/crm/salesManagement/components/SalesFilters.tsx

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

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
}

export interface SalesFiltersProps {
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters?: FilterConfig[];
    onClearFilters?: () => void;
    className?: string;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
                                                              searchPlaceholder = 'Search...',
                                                              searchValue,
                                                              onSearchChange,
                                                              filters = [],
                                                              onClearFilters,
                                                              className = '',
                                                          }) => {
    const hasActiveFilters = filters.some(f => f.value !== 'all');

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 ${className}`}>
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filters.map((filter) => (
                <Select
                    key={filter.key}
                    value={filter.value}
                    onValueChange={filter.onChange}
                >
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All {filter.label}</SelectItem>
                        {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}

            {(hasActiveFilters || searchValue) && onClearFilters && (
                <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="flex items-center gap-2"
                >
                    <X size={16} />
                    Clear Filters
                </Button>
            )}
        </div>
    );
};