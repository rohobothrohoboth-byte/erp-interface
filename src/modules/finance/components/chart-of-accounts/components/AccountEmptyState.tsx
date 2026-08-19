// components/finance/chart-of-accounts/components/AccountEmptyState.tsx

import React from 'react';
import { Search, Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface AccountEmptyStateProps {
    searchTerm?: string;
    onClearFilters?: () => void;
}

export const AccountEmptyState: React.FC<AccountEmptyStateProps> = ({
                                                                        searchTerm,
                                                                        onClearFilters,
                                                                    }) => {
    const hasSearch = searchTerm && searchTerm.trim().length > 0;

    return (
        <div className="text-center py-12">
            <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-100 rounded-full">
                    {hasSearch ? (
                        <Search className="h-12 w-12 text-gray-400" />
                    ) : (
                        <FolderOpen className="h-12 w-12 text-gray-400" />
                    )}
                </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasSearch ? 'No matching accounts found' : 'No accounts created yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
                {hasSearch
                    ? `No accounts match "${searchTerm}". Try adjusting your search.`
                    : 'Get started by creating your first account.'}
            </p>
            {hasSearch && onClearFilters && (
                <Button
                    onClick={onClearFilters}
                    variant="outline"
                    className="mr-2"
                >
                    Clear Filters
                </Button>
            )}
            {!hasSearch && (
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus size={16} className="mr-2" />
                    Add Account
                </Button>
            )}
        </div>
    );
};