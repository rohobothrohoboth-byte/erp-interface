// RST_ERP_UI/src/components/ui/data-table.tsx

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    cell?: (value: any, row: T) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (row: T) => string | number;
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        itemsPerPage?: number;
        totalItems?: number;
    };
}

export function DataTable<T>({
                                 data,
                                 columns,
                                 keyExtractor,
                                 loading = false,
                                 emptyMessage = "No data available",
                                 onRowClick,
                                 pagination
                             }: DataTableProps<T>) {

    const getValue = (row: T, column: Column<T>) => {
        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }
        return row[column.accessor];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                <tr>
                    {columns.map((column, idx) => (
                        <th
                            key={idx}
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                        >
                            {column.header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {data.map((row) => (
                    <tr
                        key={keyExtractor(row)}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
                    >
                        {columns.map((column, idx) => {
                            const value = getValue(row, column);
                            const displayValue = column.cell ? column.cell(value, row) : value;
                            return (
                                <td
                                    key={idx}
                                    className={`px-4 py-3 text-sm ${column.className || ''}`}
                                >
                                    {displayValue}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>

            {pagination && pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        {pagination.totalItems && (
                            <span className="text-sm text-gray-500">
                                ({pagination.totalItems} total items)
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(1)}
                            disabled={pagination.currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="px-2 py-1 text-sm">
                            {pagination.currentPage}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.totalPages)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}