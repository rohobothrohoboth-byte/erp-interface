// components/finance/chart-of-accounts/components/AccountPagination.tsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AccountPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export const AccountPagination: React.FC<AccountPaginationProps> = ({
                                                                        currentPage,
                                                                        totalPages,
                                                                        totalItems,
                                                                        pageSize,
                                                                        onPageChange,
                                                                    }) => {
    if (totalPages <= 1) return null;

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
                Showing {startIndex} to {endIndex} of {totalItems} accounts
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};