import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Building,
  MoreVertical,
  Eye,
  Trash2,
  PenBox,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import type { BranchListDto, UUID } from '@/modules/core/types/branch';
import type { EditBranchDto } from '@/modules/core/types/branch';
import { EditBranchModal } from '@/modules/core/components/branch/EditBranchModal';
import DeleteBranchModal from '@/modules/core/components/branch/DeleteBranchModal';
import StatBranchModal from '@/modules/core/components/branch/StatBranchModal';
import ViewBranchModal from '@/modules/core/components/branch/ViewBranchModal';
import { Button } from '@/shared/components/ui/button';

interface BranchTableProps {
  branches: BranchListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onBranchUpdate: (branch: BranchListDto) => void;
  onBranchStatusChange: (id: UUID, status: string) => void;
  onBranchDelete: (id: string) => void;
}

const BranchTable: React.FC<BranchTableProps> = ({
                                                   branches,
                                                   currentPage,
                                                   totalPages,
                                                   totalItems,
                                                   onPageChange,
                                                   onBranchUpdate,
                                                   onBranchStatusChange,
                                                   onBranchDelete
                                                 }) => {
  const [selectedBranch, setSelectedBranch] = useState<BranchListDto | null>(null);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const sortedBranches = [...branches].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleViewDetails = (branch: BranchListDto) => {
    setSelectedBranch(branch);
    setIsViewModalOpen(true);
    setPopoverOpen(null);
  };

  const handleEdit = (branch: BranchListDto) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
    setPopoverOpen(null);
  };

  const handleStatusChange = (branch: BranchListDto) => {
    setSelectedBranch(branch);
    setIsStatModalOpen(true);
    setPopoverOpen(null);
  };

  const handleDelete = (branch: BranchListDto) => {
    setSelectedBranch(branch);
    setIsDeleteModalOpen(true);
    setPopoverOpen(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedBranch(null);
  };

  const confirmStatusChange = (branchId: UUID, newStatus: string) => {
    onBranchStatusChange(branchId, newStatus);
    setIsStatModalOpen(false);
  };

  const confirmDeletion = (branchId: UUID) => {
    onBranchDelete(branchId);
    setIsDeleteModalOpen(false);
  };

  const handleSaveChanges = (updatedData: EditBranchDto) => {
    const updatedBranch: BranchListDto = {
      ...selectedBranch!,
      ...updatedData,
      comp: selectedBranch!.comp,
      compAm: selectedBranch!.compAm,
      openDateStrAm: selectedBranch!.openDateStrAm,
      isDeleted: selectedBranch!.isDeleted,
      createdAt: selectedBranch!.createdAt,
    };

    onBranchUpdate(updatedBranch);
    setIsEditModalOpen(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case '0': return 'bg-green-50 text-green-700 border-green-200';
      case '1': return 'bg-red-50 text-red-700 border-red-200';
      case '2': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case '0': return 'Active';
      case '1': return 'Inactive';
      case '2': return 'Under Construction';
      default: return status;
    }
  };

  const getBranchTypeText = (branchType: string): string => {
    switch (branchType) {
      case '0': return 'Head Office';
      case '1': return 'Regional';
      case '2': return 'Local';
      case '3': return 'Virtual';
      default: return branchType;
    }
  };

  // Pagination helpers
  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);
  const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < totalPages - 2;

  let displayedPages = totalPagesArray;
  if (totalPages > 7) {
    if (currentPage <= 4) {
      displayedPages = [...totalPagesArray.slice(0, 5), -1, ...totalPagesArray.slice(-2)];
    } else if (currentPage >= totalPages - 3) {
      displayedPages = [...totalPagesArray.slice(0, 2), -1, ...totalPagesArray.slice(-5)];
    } else {
      displayedPages = [
        ...totalPagesArray.slice(0, 2),
        -1,
        ...totalPagesArray.slice(currentPage - 2, currentPage + 1),
        -1,
        ...totalPagesArray.slice(-2)
      ];
    }
  }

  return (
      <>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  Opened
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {branch.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {branch.nameAm}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {branch.code}
                      </code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                      {getBranchTypeText(branch.branchType)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(branch.branchStat)}`}>
                      {getStatusText(branch.branchStat)}
                    </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                      {branch.location}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                      {branch.openDateStr}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Popover open={popoverOpen === branch.id} onOpenChange={(open) => setPopoverOpen(open ? branch.id : null)}>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-1 rounded-lg shadow-lg" align="end">
                          <div className="py-1">
                            <button
                                onClick={() => handleViewDetails(branch)}
                                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
                            >
                              <Eye size={14} />
                              View Details
                            </button>
                            <button
                                onClick={() => handleEdit(branch)}
                                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
                            >
                              <PenBox size={14} />
                              Edit
                            </button>
                            <button
                                onClick={() => handleDelete(branch)}
                                className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {startItem} to {endItem} of {totalItems} branches
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    {displayedPages.map((page, index) => (
                        page === -1 ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                        ) : (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(page)}
                                className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-slate-800 dark:bg-slate-700 text-white' : ''}`}
                            >
                              {page}
                            </Button>
                        )
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Modals */}
        <EditBranchModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveChanges}
            branch={selectedBranch}
        />

        <StatBranchModal
            branch={selectedBranch}
            isOpen={isStatModalOpen}
            onClose={() => setIsStatModalOpen(false)}
            onConfirm={confirmStatusChange}
        />

        <DeleteBranchModal
            branch={selectedBranch}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDeletion}
        />

        {isViewModalOpen && (
            <ViewBranchModal
                selectedBranch={selectedBranch}
                onClose={handleCloseViewModal}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getBranchTypeText={getBranchTypeText}
            />
        )}
      </>
  );
};

export default BranchTable;