// components/finance/chart-of-accounts/AccountList.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    MoreVertical, Eye, Edit, CheckCircle, X, Trash2,
    Link as LinkIcon, ChevronRight, ChevronDown, Folder, FileText,
    ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import type { Account } from '../../../types/finance/account.types';

interface Props {
    accounts: Account[];
    selectedIds: string[];
    onToggleSelection: (id: string) => void;
    onToggleAll: () => void;
    onView: (account: Account) => void;
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
    onToggleStatus: (id: string) => void;
    onViewUsage: (account: Account) => void;
    allSelected: boolean;

    // ✅ Add searchTerm to props
    searchTerm?: string;

    // Pagination props
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    itemsPerPageOptions?: number[];
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const AccountList: React.FC<Props> = ({
                                                 accounts,
                                                 selectedIds,
                                                 onToggleSelection,
                                                 onToggleAll,
                                                 onView,
                                                 onEdit,
                                                 onDelete,
                                                 onToggleStatus,
                                                 onViewUsage,
                                                 allSelected,
                                                 searchTerm = '',  // ✅ Add with default empty string
                                                 currentPage = 1,
                                                 totalPages = 1,
                                                 totalCount = 0,
                                                 pageSize = 10,
                                                 onPageChange,
                                                 onPageSizeChange,
                                                 itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS,
                                             }) => {
    // ============================================================
    // STATE
    // ============================================================

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // ✅ Fix: Auto-expand parents when searching
    useEffect(() => {
        if (searchTerm && searchTerm.length > 0) {
            const parentsToExpand = new Set<string>();
            accounts.forEach(account => {
                if (account.parentId &&
                    (account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        account.code?.toLowerCase().includes(searchTerm.toLowerCase()))) {
                    parentsToExpand.add(account.parentId);
                }
            });
            setExpandedIds(prev => {
                const newSet = new Set(prev);
                parentsToExpand.forEach(id => newSet.add(id));
                return newSet;
            });
        }
    }, [searchTerm, accounts]);

    // ============================================================
    // HELPERS
    // ============================================================

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Asset: 'bg-blue-100 text-blue-700 border-blue-200',
            Liability: 'bg-red-100 text-red-700 border-red-200',
            Equity: 'bg-purple-100 text-purple-700 border-purple-200',
            Revenue: 'bg-green-100 text-green-700 border-green-200',
            Expense: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, React.ReactNode> = {
            Asset: <Folder className="h-4 w-4 text-blue-600" />,
            Liability: <Folder className="h-4 w-4 text-red-600" />,
            Equity: <Folder className="h-4 w-4 text-purple-600" />,
            Revenue: <FileText className="h-4 w-4 text-green-600" />,
            Expense: <FileText className="h-4 w-4 text-orange-600" />,
        };
        return icons[type] || <FileText className="h-4 w-4 text-gray-600" />;
    };

    // ============================================================
    // EXPAND/COLLAPSE LOGIC
    // ============================================================

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const isExpanded = useCallback((id: string) => {
        return expandedIds.has(id);
    }, [expandedIds]);

    const expandAll = useCallback(() => {
        const allIds = accounts.map(a => a.id);
        setExpandedIds(new Set(allIds));
    }, [accounts]);

    const collapseAll = useCallback(() => {
        setExpandedIds(new Set());
    }, []);

    // ============================================================
    // BUILD HIERARCHY
    // ============================================================

    const childrenMap = useMemo(() => {
        const map = new Map<string, Account[]>();
        accounts.forEach(account => {
            if (account.parentId) {
                if (!map.has(account.parentId)) {
                    map.set(account.parentId, []);
                }
                map.get(account.parentId)!.push(account);
            }
        });
        map.forEach((children) => {
            children.sort((a, b) => a.code.localeCompare(b.code));
        });
        return map;
    }, [accounts]);

    const rootAccounts = useMemo(() => {
        return accounts
            .filter(account => !account.parentId)
            .sort((a, b) => a.code.localeCompare(b.code));
    }, [accounts]);

    // ============================================================
    // GET VISIBLE ACCOUNTS
    // ============================================================

    const getVisibleAccounts = useCallback((): Account[] => {
        const result: Account[] = [];
        const traverse = (account: Account) => {
            result.push(account);
            if (isExpanded(account.id)) {
                const children = childrenMap.get(account.id) || [];
                children.forEach(child => traverse(child));
            }
        };
        rootAccounts.forEach(account => traverse(account));
        return result;
    }, [rootAccounts, childrenMap, isExpanded]);

    const visibleAccounts = useMemo(() => {
        return getVisibleAccounts();
    }, [getVisibleAccounts]);



    const hasChildren = useCallback((id: string) => {
        return childrenMap.has(id) && childrenMap.get(id)!.length > 0;
    }, [childrenMap]);

    const getLevel = useCallback((account: Account): number => {
        return account.level || 0;
    }, []);

    // ============================================================
    // PAGINATION HANDLERS
    // ============================================================

    const handlePageChange = useCallback((page: number) => {
        if (onPageChange && page >= 1 && page <= totalPages) {
            onPageChange(page);
            collapseAll();
        }
    }, [onPageChange, totalPages, collapseAll]);

    const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onPageSizeChange) {
            onPageSizeChange(Number(e.target.value));
            collapseAll();
        }
    }, [onPageSizeChange, collapseAll]);

    // ============================================================
    // RENDER PAGINATION
    // ============================================================

    const renderPagination = () => {
        if (totalPages <= 1 && totalCount <= pageSize) return null;

        const startIndex = (currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(currentPage * pageSize, totalCount);

        return (
            <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex} to {endIndex} of {totalCount} accounts
                    </p>
                    <span className="text-xs text-gray-400">
                        ({visibleAccounts.length} visible on this page)
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {itemsPerPageOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                        currentPage === pageNum
                                            ? 'bg-indigo-600 text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                                <span className="text-gray-400">...</span>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    className="px-3 py-1 rounded-lg text-sm hover:bg-gray-100 text-gray-700"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRightIcon size={16} />
                    </button>
                </div>
            </div>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    if (accounts.length === 0) {
        return (
            <div className="py-8 text-center text-gray-500">
                No accounts found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <input
                                type="checkbox"
                                checked={allSelected && accounts.length > 0}
                                onChange={onToggleAll}
                                className="rounded border-gray-300"
                            />
                        </TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Sub Type</TableHead>
                        <TableHead className="text-center">Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visibleAccounts.map((account) => {
                        const level = getLevel(account);
                        const isChild = !!account.parentId;
                        const hasChildrenFlag = hasChildren(account.id);
                        const isExpandedFlag = isExpanded(account.id);

                        return (
                            <TableRow
                                key={account.id}
                                className={`hover:bg-gray-50 transition-colors ${isChild ? 'bg-gray-50/30' : ''}`}
                            >
                                <TableCell>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(account.id)}
                                        onChange={() => onToggleSelection(account.id)}
                                        className="rounded border-gray-300"
                                    />
                                </TableCell>
                                <TableCell className="font-mono text-sm">{account.code}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div
                                            style={{ paddingLeft: `${level * 24}px` }}
                                            className="flex items-center"
                                        >
                                            {hasChildrenFlag && (
                                                <button
                                                    onClick={() => toggleExpand(account.id)}
                                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors mr-1 text-gray-400 hover:text-gray-600"
                                                    aria-label={isExpandedFlag ? 'Collapse' : 'Expand'}
                                                >
                                                    {isExpandedFlag ? (
                                                        <ChevronDown size={16} className="text-blue-500" />
                                                    ) : (
                                                        <ChevronRight size={16} className="text-blue-500" />
                                                    )}
                                                </button>
                                            )}
                                            {!hasChildrenFlag && level > 0 && (
                                                <div className="flex items-center mr-1">
                                                    <div className="w-4 h-[1px] border-t border-gray-300" />
                                                    <div className="w-2 h-[1px] border-t border-gray-300" />
                                                </div>
                                            )}
                                            <span className={`text-sm font-medium ${isChild ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {account.name}
                                            </span>
                                        </div>
                                        {account.nameAm && (
                                            <span className="text-xs text-gray-400">({account.nameAm})</span>
                                        )}
                                        {hasChildrenFlag && (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] bg-blue-50 text-blue-600 border-blue-200"
                                            >
                                                {childrenMap.get(account.id)?.length || 0}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getTypeColor(account.accountType)}`}>
                                        {getTypeIcon(account.accountType)}
                                        {account.accountType}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                    {account.accountSubType || '-'}
                                </TableCell>
                                <TableCell className="text-center text-sm text-gray-500">
                                    {account.level}
                                </TableCell>
                                <TableCell>
                                    <Badge className={account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                        {account.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-0" align="end">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => onView(account)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(account)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => onViewUsage(account)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-blue-600 flex items-center gap-2"
                                                    >
                                                        <LinkIcon size={16} />
                                                        View Usage
                                                    </button>
                                                    <button
                                                        onClick={() => onToggleStatus(account.id)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-yellow-600 flex items-center gap-2"
                                                    >
                                                        {account.isActive ? (
                                                            <>
                                                                <X size={16} />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle size={16} />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(account)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {visibleAccounts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                                No accounts to display on this page
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Expand/Collapse Controls */}
            {rootAccounts.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{visibleAccounts.length} of {accounts.length} accounts visible</span>
                            {totalCount > accounts.length && (
                                <span className="text-gray-400">
                                    (Page {currentPage} of {totalPages})
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={expandAll}
                            >
                                Expand All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={collapseAll}
                            >
                                Collapse All
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {renderPagination()}
        </div>
    );
};