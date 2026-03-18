import { Filter, MoreVertical, Edit, Trash2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="bg-white rounded-lg border text-center py-12">
        <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No lead groups yet</h3>
        <p className="text-gray-500">Create your first lead group to organize leads by conditions.</p>
      </div>
    );
  }

  const pageSize = 10;

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead># Leads</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-center">Condition</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadGroups.map((group) => (
            <TableRow key={group.id}>
              <TableCell>
                <div className="flex items-center">
                  <div className="shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-medium">
                      {group.code.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{group.code}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{group.name}</span>
              </TableCell>
              <TableCell>
                <Badge className={group.status === 'Active' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>
                  {group.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-medium">{group.leadCount}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {new Date(group.updatedAt).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  onClick={() => onConditionClick(group)}
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  <Settings size={16} />
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100">
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
                      className="text-red-600"
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

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> groups
          </p>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                    ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
