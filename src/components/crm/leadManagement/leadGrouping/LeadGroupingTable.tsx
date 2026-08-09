// src/components/crm/leadManagement/leadGrouping/LeadGroupingTable.tsx
import { Filter, MoreVertical, Edit, Trash2, Settings, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';
import type { LeadGroup } from './LeadGroupingSection';

interface LeadGroupingTableProps {
  leadGroups: LeadGroup[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEdit: (group: LeadGroup) => void;
  onDelete: (groupId: string) => void;
  onConditionClick: (group: LeadGroup) => void;
}

export default function LeadGroupingTable({
                                            leadGroups,
                                            currentPage,
                                            totalPages,
                                            totalItems,
                                            onPageChange,
                                            onEdit,
                                            onDelete,
                                            onConditionClick,
                                          }: LeadGroupingTableProps) {
  if (leadGroups.length === 0 && totalItems === 0) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No lead groups yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Create your first lead group to organize leads by conditions.</p>
        </div>
    );
  }

  const pageSize = 10;

  return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center"># Leads</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-center">Conditions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadGroups.map((group) => (
                  <TableRow key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 font-bold">
                        {group.code.charAt(0).toUpperCase()}
                      </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{group.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 dark:text-white">{group.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={group.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                      }>
                        {group.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{group.leadCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(group.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                          onClick={() => onConditionClick(group)}
                          variant="outline"
                          size="sm"
                          className="gap-2 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600"
                      >
                        <Settings size={16} />
                        Configure
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(group)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                              onClick={() => onDelete(group.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalItems > 0 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> groups
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                                ? 'z-10 bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-600 dark:text-orange-400'
                                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
        )}
      </div>
  );
}