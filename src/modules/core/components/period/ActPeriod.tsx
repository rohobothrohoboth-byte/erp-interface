import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MoreVertical, Eye, PenBox, Trash2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import type { PeriodListDto } from '@/modules/core/types/period';

interface PeriodTableProps {
  periods: PeriodListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewDetails: (period: PeriodListDto) => void;
  onEdit: (period: PeriodListDto) => void;
  onDelete: (period: PeriodListDto) => void;
  loading?: boolean;
}

export const PeriodTable: React.FC<PeriodTableProps> = ({
                                                          periods,
                                                          currentPage,
                                                          totalPages,
                                                          totalItems,
                                                          onPageChange,
                                                          onViewDetails,
                                                          onEdit,
                                                          onDelete,
                                                          loading = false
                                                        }) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const getStatusColor = (status: string): string => {
    return status === '0' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200';
  };

  const getPeriodColor = (name: string): string => {
    if (name.includes('Q1')) return 'text-blue-600 dark:text-blue-400';
    if (name.includes('Q2')) return 'text-purple-600 dark:text-purple-400';
    if (name.includes('Q3')) return 'text-amber-600 dark:text-amber-400';
    if (name.includes('Q4')) return 'text-red-600 dark:text-red-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);
  const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (loading) {
    return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400" />
        </div>
    );
  }

  if (periods.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
            <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No periods found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click "Add New Period" to create one</p>
        </div>
    );
  }

  return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Ethiopian Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Quarter
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                Fiscal Year
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {periods.map((period) => (
                <tr key={period.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${getPeriodColor(period.name)}`}>
                          {period.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {period.dateStartStr} - {period.dateEndStr}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                    {period.dateStartStrAm} - {period.dateEndStrAm}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                    {period.quarter}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                    {period.fiscYear}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(period.isActive)}`}>
                    {period.isActive === "0" ? "Active" : "Inactive"}
                  </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Popover open={popoverOpen === period.id} onOpenChange={(open) => setPopoverOpen(open ? period.id : null)}>
                      <PopoverTrigger asChild>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1 rounded-lg shadow-lg" align="end">
                        <button
                            onClick={() => onViewDetails(period)}
                            className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                            onClick={() => onEdit(period)}
                            className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
                        >
                          <PenBox size={14} />
                          Edit
                        </button>
                        <button
                            onClick={() => onDelete(period)}
                            className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
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
                  Showing {startItem} to {endItem} of {totalItems} periods
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
  );
};