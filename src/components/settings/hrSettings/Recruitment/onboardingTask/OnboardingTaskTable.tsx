// src/components/hr/recruit/onboardingTask/OnboardingTaskTable.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../ui/popover';
import type { OnboardingTaskListDto } from '../../../../../types/hr/recruit/onboardingTask';

interface OnboardingTaskTableProps {
  items: OnboardingTaskListDto[];
  onEdit: (item: OnboardingTaskListDto) => void;
  onDelete: (item: OnboardingTaskListDto) => void;
  isLoading?: boolean;
}

const PAGE_SIZE = 10;

const OnboardingTaskTable: React.FC<OnboardingTaskTableProps> = ({
                                                                   items,
                                                                   onEdit,
                                                                   onDelete,
                                                                   isLoading = false
                                                                 }) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginated = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isLoading) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">Loading tasks...</span>
          </div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm font-medium text-gray-900 mb-1">No Tasks Found</p>
                    <p className="text-sm text-gray-500">
                      {items.length === 0
                          ? 'Get started by creating your first onboarding task.'
                          : 'No tasks match your search.'}
                    </p>
                  </td>
                </tr>
            )}
            {paginated.map((item, index) => (
                <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    {item.sequenceOrder}
                  </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{item.taskName}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm text-gray-600 truncate">{item.description}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.isDeleted
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                  }`}>
                    {item.isDeleted ? 'Deleted' : 'Active'}
                  </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                     {new Date(item.dateAdd).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Popover open={popoverOpen === item.id} onOpenChange={o => setPopoverOpen(o ? item.id : null)}>
                      <PopoverTrigger asChild>
                        <button className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-0" align="end">
                        <div className="py-1">
                          <button
                              onClick={() => { onEdit(item); setPopoverOpen(null); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                          >
                            <Edit size={15} /> Edit
                          </button>
                          <button
                              onClick={() => { onDelete(item); setPopoverOpen(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </motion.tr>
            ))}
            </tbody>
          </table>
        </div>

        {items.length > 0 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * PAGE_SIZE + 1, items.length)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * PAGE_SIZE, items.length)}</span> of{' '}
                <span className="font-medium">{items.length}</span> tasks
              </p>
              <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    page = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                  }
                  return (
                      <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                  ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                  );
                })}
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
        )}
      </motion.div>
  );
};

export default OnboardingTaskTable;