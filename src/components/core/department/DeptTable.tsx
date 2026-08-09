import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Eye,
  PenBox,
  Building2,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import { Button } from '../../ui/button';
import DeleteDeptModal from './DeleteDeptModal';
import ViewDeptModal from './ViewDeptModal';
import type { EditDeptDto, DeptListDto, UUID } from '../../../types/core/dept';

interface DepartmentTableProps {
  departments: DeptListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEditDepartment: (department: EditDeptDto) => void;
  onDepartmentStatusChange: (id: UUID, status: "active" | "inactive") => void;
  onDepartmentDelete: (id: UUID) => void;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({
                                                           departments,
                                                           currentPage,
                                                           totalPages,
                                                           totalItems,
                                                           onPageChange,
                                                           onEditDepartment,
                                                           onDepartmentDelete,
                                                         }) => {
  const [selectedDepartment, setSelectedDepartment] = useState<DeptListDto | null>(null);
  const [activeModal, setActiveModal] = useState<'view' | 'delete' | null>(null);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const handleViewDetails = (department: DeptListDto) => {
    setSelectedDepartment(department);
    setActiveModal('view');
    setPopoverOpen(null);
  };

  const handleEdit = (department: DeptListDto) => {
    onEditDepartment({
      id: department.id,
      name: department.name,
      nameAm: department.nameAm,
      deptStat: department.deptStat,
      branchId: department.branchId,
      rowVersion: department.rowVersion
    });
    setPopoverOpen(null);
  };

  const handleDelete = (department: DeptListDto) => {
    setSelectedDepartment(department);
    setActiveModal('delete');
    setPopoverOpen(null);
  };

  const handleConfirmDelete = (departmentId: UUID) => {
    onDepartmentDelete(departmentId);
    setActiveModal(null);
    setSelectedDepartment(null);
  };

  const getStatusColor = (status: string): string => {
    return status === "0"
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-700 border-red-200";
  };

  const startItem = (currentPage - 1) * 8 + 1;
  const endItem = Math.min(currentPage * 8, totalItems);
  const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
      <>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {departments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      No departments found
                    </td>
                  </tr>
              ) : (
                  departments.map((department) => (
                      <tr key={department.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {department.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {department.nameAm}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {department.branch}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(department.deptStat)}`}>
                        {department.deptStatStr}
                      </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Popover open={popoverOpen === department.id} onOpenChange={(open) => setPopoverOpen(open ? department.id : null)}>
                            <PopoverTrigger asChild>
                              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-36 p-1 rounded-lg shadow-lg" align="end">
                              <button
                                  onClick={() => handleViewDetails(department)}
                                  className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
                              >
                                <Eye size={14} />
                                View
                              </button>
                              <button
                                  onClick={() => handleEdit(department)}
                                  className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
                              >
                                <PenBox size={14} />
                                Edit
                              </button>
                              <button
                                  onClick={() => handleDelete(department)}
                                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {startItem} to {endItem} of {totalItems} departments
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
                    {totalPagesArray.map((page) => (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-slate-800 dark:bg-slate-700 text-white' : ''}`}
                        >
                          {page}
                        </Button>
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
        {activeModal === 'view' && selectedDepartment && (
            <ViewDeptModal
                selectedDepartment={selectedDepartment}
                onClose={() => setActiveModal(null)}
                getStatusColor={getStatusColor}
            />
        )}

        {activeModal === 'delete' && selectedDepartment && (
            <DeleteDeptModal
                department={selectedDepartment}
                isOpen={true}
                onClose={() => setActiveModal(null)}
                onConfirm={handleConfirmDelete}
            />
        )}
      </>
  );
};

export default DepartmentTable;