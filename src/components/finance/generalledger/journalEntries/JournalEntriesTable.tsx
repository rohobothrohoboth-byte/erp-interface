// src/components/finance/generalledger/journalEntries/JournalEntriesTable.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';

interface JournalEntry {
  id: string;
  reference: string;
  entryDate: string;
  description: string;
  entryType: string;
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  postedDate?: string;
  financialPeriodId?: string;
  branchId?: string;
  departmentId?: string;
  employeeId?: string;
  lines: Array<{
    id: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    direction: string;
    amount: number;
    description?: string;
  }>;
  dateAdd: string;
  dateMod?: string;
}

interface JournalEntriesTableProps {
  entries: JournalEntry[];
  onView: (entry: JournalEntry) => void;
  onPost: (entryId: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const JournalEntriesTable: React.FC<JournalEntriesTableProps> = ({
                                                                   entries,
                                                                   onView,
                                                                   onPost,
                                                                   currentPage,
                                                                   totalPages,
                                                                   totalItems,
                                                                   onPageChange,
                                                                 }) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const getStatusColor = (isPosted: boolean) => {
    return isPosted
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl shadow-sm overflow-hidden bg-white border border-indigo-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Debit
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Credit
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No journal entries found
                  </td>
                </tr>
            ) : (
                entries.map((entry, index) => (
                    <motion.tr
                        key={entry.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={rowVariants}
                        className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.reference}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.entryDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {entry.description || 'No description'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.lines?.length || 0} line{entry.lines?.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                      {entry.entryType || 'General'}
                    </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 hidden lg:table-cell">
                        {formatCurrency(entry.totalDebit || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 hidden lg:table-cell">
                        {formatCurrency(entry.totalCredit || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(entry.isPosted)}`}>
                      {entry.isPosted ? 'Posted' : 'Unposted'}
                    </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <Popover
                            open={popoverOpen === entry.id}
                            onOpenChange={(open) => setPopoverOpen(open ? entry.id : null)}
                        >
                          <PopoverTrigger asChild>
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-0" align="end">
                            <div className="py-1">
                              <button
                                  onClick={() => {
                                    onView(entry);
                                    setPopoverOpen(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                              {!entry.isPosted && (
                                  <button
                                      onClick={() => {
                                        onPost(entry.id);
                                        setPopoverOpen(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 rounded text-green-600 flex items-center gap-2"
                                  >
                                    <CheckCircle size={16} />
                                    Post
                                  </button>
                              )}
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
        {totalPages > 1 && (
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
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> entries
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
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
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
        )}
      </motion.div>
  );
};

export default JournalEntriesTable;