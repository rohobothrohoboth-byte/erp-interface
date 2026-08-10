// components/finance/chart-of-accounts/modals/AccountHierarchyModal.tsx

import React, { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FileText,
    Search,
    Layers,
    AlertCircle,
    Tag
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import type { HierarchyNode } from '@/modules/finance/types/account.types';

interface Props {
    open: boolean;
    hierarchy: HierarchyNode[];
    onClose: () => void;
}

export const AccountHierarchyModal: React.FC<Props> = ({
                                                           open,
                                                           hierarchy,
                                                           onClose
                                                       }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, React.ReactNode> = {
            Asset: <Folder className="h-4 w-4 text-blue-600" />,
            Liability: <Folder className="h-4 w-4 text-red-600" />,
            Equity: <Folder className="h-4 w-4 text-purple-600" />,
            Revenue: <FileText className="h-4 w-4 text-green-600" />,
            Expense: <FileText className="h-4 w-4 text-orange-600" />,
        };
        return icons[type] || <Folder className="h-4 w-4 text-gray-600" />;
    };

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

    const filterNodes = (nodes: HierarchyNode[], search: string): HierarchyNode[] => {
        if (!search.trim()) return nodes;
        if (!nodes || !Array.isArray(nodes)) return [];

        const searchLower = search.toLowerCase();
        return nodes
            .map(node => {
                if (!node) return null;

                const name = node.name || '';
                const code = node.code || '';
                const type = node.type || '';
                const categoryName = node.categoryName || '';

                const matches = name.toLowerCase().includes(searchLower) ||
                    code.toLowerCase().includes(searchLower) ||
                    type.toLowerCase().includes(searchLower) ||
                    categoryName.toLowerCase().includes(searchLower);

                const filteredChildren = node.children ? filterNodes(node.children, search) : [];

                if (matches || filteredChildren.length > 0) {
                    return {
                        ...node,
                        children: filteredChildren
                    };
                }
                return null;
            })
            .filter((node): node is HierarchyNode => node !== null);
    };

    const renderHierarchy = (nodes: HierarchyNode[], level: number = 0) => {
        if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return null;

        const filtered = searchTerm ? filterNodes(nodes, searchTerm) : nodes;

        if (!filtered || filtered.length === 0) {
            return (
                <div className="py-4 text-center text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p>No accounts match your search</p>
                </div>
            );
        }

        return filtered.map(node => {
            if (!node) return null;

            const isExpanded = expandedNodes.has(node.id);
            const hasChildren = node.children && node.children.length > 0;

            // ✅ Check if category exists
            const hasCategory = node.categoryName &&
                node.categoryName !== 'Unknown' &&
                node.categoryName !== '' &&
                node.categoryName !== 'null';

            // ✅ Check if type exists
            const hasType = node.type && node.type !== 'Unknown' && node.type !== '';

            return (
                <div key={node.id}>
                    <div
                        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                            level === 0 ? 'font-medium' : ''
                        }`}
                        style={{ paddingLeft: `${level * 20 + 8}px` }}
                        onClick={() => {
                            if (hasChildren) toggleNode(node.id);
                        }}
                    >
                        {/* Indentation lines */}
                        {level > 0 && (
                            <div className="flex items-center">
                                <div className="w-4 h-[1px] border-t border-gray-300" />
                                <div className="w-2 h-[1px] border-t border-gray-300" />
                            </div>
                        )}

                        {/* Expand/Collapse Icon */}
                        {hasChildren ? (
                            <button
                                className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(node.id);
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        ) : (
                            <div className="w-4" />
                        )}

                        {/* Type Icon */}
                        <div className="flex-shrink-0">
                            {getTypeIcon(node.type || '')}
                        </div>

                        {/* Code */}
                        <span className="font-mono text-sm text-gray-500">{node.code || ''}</span>

                        {/* Name */}
                        <span className="text-sm text-gray-800">{node.name || 'Unnamed'}</span>

                        {/* ✅ Category Badge - Show if available */}
                        {hasCategory && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] flex items-center gap-1">
                                <Tag className="h-2.5 w-2.5" />
                                {node.categoryName}
                            </Badge>
                        )}

                        {/* ✅ Type Badge - Only show if type exists */}
                        {hasType && (
                            <Badge
                                variant="outline"
                                className={`text-[10px] ${getTypeColor(node.type)}`}
                            >
                                {node.type}
                            </Badge>
                        )}

                        {/* Child Count */}
                        {hasChildren && (
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 ml-auto">
                                {node.children.length}
                            </Badge>
                        )}
                    </div>

                    {/* Children */}
                    {hasChildren && isExpanded && (
                        <div className="border-l-2 border-gray-200 ml-6">
                            {renderHierarchy(node.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const totalNodes = (nodes: HierarchyNode[]): number => {
        if (!nodes || !Array.isArray(nodes)) return 0;
        let count = nodes.length;
        for (const node of nodes) {
            if (node && node.children) {
                count += totalNodes(node.children);
            }
        }
        return count;
    };

    const rootCount = hierarchy ? hierarchy.length : 0;
    const totalCount = hierarchy ? totalNodes(hierarchy) : 0;

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-purple-600" />
                        Account Hierarchy
                    </DialogTitle>
                    <DialogDescription>
                        {totalCount} accounts in {rootCount} root node(s)
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Search by name, code, type, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Hierarchy Tree */}
                    <div className="overflow-y-auto max-h-[50vh]">
                        {!hierarchy || hierarchy.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Layers className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                <p>No hierarchy data available</p>
                                <p className="text-xs mt-1">Add accounts to build the hierarchy</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {renderHierarchy(hierarchy)}
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    {hierarchy && hierarchy.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Folder className="h-3 w-3 text-blue-600" />
                                    <span>Asset</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Folder className="h-3 w-3 text-red-600" />
                                    <span>Liability</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Folder className="h-3 w-3 text-purple-600" />
                                    <span>Equity</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-green-600" />
                                    <span>Revenue</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-orange-600" />
                                    <span>Expense</span>
                                </div>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full">
                                    <Tag className="h-3 w-3 text-purple-600" />
                                    <span className="text-purple-600">Category</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <div className="flex items-center gap-2 mr-auto">
                        <Badge variant="outline" className="bg-gray-50">
                            {totalCount} total
                        </Badge>
                        <Badge variant="outline" className="bg-gray-50">
                            {rootCount} root{rootCount !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};