// src/components/crm/salesManagement/components/SalesTable.tsx

import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

export interface TableColumn<T = any> {
    key: string;
    header: string;
    accessor?: (item: T) => React.ReactNode;
    className?: string;
}

export interface TableAction<T = any> {
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    className?: string;
    separator?: boolean;
}

interface SalesTableProps<T = any> {
    data: T[];
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    onRowClick?: (item: T) => void;
    emptyState?: React.ReactNode;
    isLoading?: boolean;
}

export function SalesTable<T extends { id: string }>({
                                                         data,
                                                         columns,
                                                         actions = [],
                                                         onRowClick,
                                                         emptyState,
                                                         isLoading = false,
                                                     }: SalesTableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="animate-pulse p-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-48" />
                                <div className="h-3 bg-gray-200 rounded w-32 mt-1" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-6 w-16 bg-gray-200 rounded" />
                                <div className="h-6 w-16 bg-gray-200 rounded" />
                                <div className="h-8 w-8 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                        {actions.length > 0 && (
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr
                            key={item.id}
                            className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-3">
                                    {col.accessor ? col.accessor(item) : (item as any)[col.key]}
                                </td>
                            ))}
                            {actions.length > 0 && (
                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {actions.map((action, index) => (
                                                <React.Fragment key={index}>
                                                    {action.separator && <DropdownMenuSeparator />}
                                                    <DropdownMenuItem
                                                        onClick={() => action.onClick(item)}
                                                        className={action.className}
                                                    >
                                                        {action.icon}
                                                        {action.label}
                                                    </DropdownMenuItem>
                                                </React.Fragment>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}