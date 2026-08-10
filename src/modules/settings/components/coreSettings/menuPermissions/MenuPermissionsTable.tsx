import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  PenBox,
  Menu,
} from 'lucide-react';
import type {
  PerMenuListDto,
} from '@/modules/core/types/Settings/menu-permissions';

const safeDisplayValue = (value: any, defaultValue: string = '-'): string => {
  if (value === null || value === undefined || value === 'null' || value === '') {
    return defaultValue;
  }
  return String(value);
};

interface MenuPermissionTableProps {
  permissions: PerMenuListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEditPermission: (permission: PerMenuListDto) => void;
  onDeletePermission: (permission: PerMenuListDto) => void;
}

const MenuPermissionTable: React.FC<MenuPermissionTableProps> = ({
                                                                   permissions,
                                                                   currentPage,
                                                                   totalPages,
                                                                   totalItems,
                                                                   onPageChange,
                                                                   onEditPermission,
                                                                   onDeletePermission,
                                                                 }) => {
  const itemsPerPage = 10;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3
      }
    })
  };

  const handleEditClick = (permission: PerMenuListDto, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditPermission(permission);
  };

  const handleDeleteClick = (permission: PerMenuListDto, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePermission(permission);
  };

  return (
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
                Menu Key
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Label
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Order
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Module
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Is Child
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Parent
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {permissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No menu permissions found
                  </td>
                </tr>
            ) : (
                permissions.map((permission, index) => {
                  const uniqueKey = `${permission.id}-${permission.key}-${permission.order || 0}-${index}`;
                  return (
                      <motion.tr
                          key={uniqueKey}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          variants={rowVariants}
                          className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center"
                            >
                              <Menu className="h-5 w-5 text-emerald-600" />
                            </motion.div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {safeDisplayValue(permission.key)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {safeDisplayValue(permission.label)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {safeDisplayValue(permission.order)}
                      </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                      <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {safeDisplayValue(permission.module)}
                      </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${permission.isChild ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                        {permission.isChildStr || (permission.isChild ? 'Yes' : 'No')}
                      </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                          {safeDisplayValue(permission.parent)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => handleEditClick(permission, e)}
                                className="text-emerald-600 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Edit"
                            >
                              <PenBox size={16} />
                            </button>
                            <button
                                onClick={(e) => handleDeleteClick(permission, e)}
                                className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                  );
                })
            )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
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
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> menu permissions
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
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 10) {
                        pageNum = i + 1;
                      } else if (currentPage <= 6) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 5) {
                        pageNum = totalPages - 9 + i;
                      } else {
                        pageNum = currentPage - 5 + i;
                      }
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                    ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                              {pageNum}
                            </button>
                        );
                      }
                      return null;
                    })}
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
        )}
      </motion.div>
  );
};

export default MenuPermissionTable;