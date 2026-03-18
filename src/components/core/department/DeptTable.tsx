import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Eye,
  PenBox,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
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
    // Call the parent's edit handler directly
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

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedDepartment(null);
  };

  const getStatusColor = (status: string): string => {
    return status === "0" 
      ? "bg-green-100 text-green-800 border border-green-200"  // Active - Green
      : "bg-red-100 text-red-800 border border-red-200";       // Inactive - Red
  };

  // Animation variants for table rows
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl shadow-sm overflow-hidden bg-white"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Department
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                  Branch
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                  Amharic Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No departments found
                  </td>
                </tr>
              ) : (
                departments.map((department, index) => (
                  <motion.tr 
                    key={department.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-1 whitespace-nowrap">
                      <div className="flex items-center">
                        <motion.div 
                          whileHover={{ rotate: 10 }}
                          className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center"
                        >
                          <span className="text-emerald-600 font-medium">
                            {department.name.charAt(0).toUpperCase()}
                          </span>
                        </motion.div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-30 md:max-w-none">
                            {department.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-30 md:max-w-none">
                            {department.nameAm}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span>{department.branch}</span>
                      </div>
                    </td>
                    <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-sm text-gray-900">
                        {department.nameAm}
                      </div>
                    </td>
                    <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(department.deptStat)}`}>
                        {department.deptStatStr}
                      </span>
                    </td>
                    <td className="px-4 py-1 whitespace-nowrap text-right text-sm font-medium">
                      <Popover open={popoverOpen === department.id} onOpenChange={(open) => setPopoverOpen(open ? department.id : null)}>
                        <PopoverTrigger asChild>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </motion.button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-0" align="end">
                          <div className="py-1">
                            <button 
                              onClick={() => handleViewDetails(department)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                            <button 
                              onClick={() => handleEdit(department)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                            >
                              <PenBox size={16} />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(department)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * 8 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 8, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> departments
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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
                        ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
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
          </div>
        </div>
      </motion.div>

      {/* View Details Modal */}
      {activeModal === 'view' && (
        <ViewDeptModal
          selectedDepartment={selectedDepartment}
          onClose={handleCloseModal}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Delete Modal */}
      {activeModal === 'delete' && (
        <DeleteDeptModal
          department={selectedDepartment}
          isOpen={true}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default DepartmentTable;