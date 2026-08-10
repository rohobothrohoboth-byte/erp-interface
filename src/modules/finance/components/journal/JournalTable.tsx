import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  Eye,
  PenBox,
  Trash2,
  FileText,
  Loader,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';

interface JournalEntry {
  id: number;
  date: string;
  number: string;
  debit: number;
  credit: number;
  account: string;
  status: string;
}

interface JournalsTableProps {
  data: JournalEntry[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewDetails: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  loading?: boolean;
}

const JournalsTable: React.FC<JournalsTableProps> = ({
  data,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
      },
    }),
    hover: { backgroundColor: "rgba(0, 0, 0, 0.05)" },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      'Posted': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'Pending': 'bg-amber-100 text-amber-800 border border-amber-200',
      'Approved': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'Draft': 'bg-gray-100 text-gray-800 border border-gray-200',
      'Rejected': 'bg-rose-100 text-rose-800 border border-rose-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading journals...</span>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="overflow-x-auto rounded-lg border border-indigo-200 shadow-sm">
        <table className="min-w-full divide-y divide-indigo-200">
          <thead className="bg-white">
            <motion.tr
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Journal #
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Debit
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Credit
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Account
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Actions
              </th>
            </motion.tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-indigo-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-indigo-300 mb-2" />
                    <p className="text-lg font-medium text-indigo-700">No journal entries found</p>
                    <p className="text-sm text-indigo-500">Create your first journal entry to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={item.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="transition-colors hover:bg-indigo-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <FileText className="text-indigo-600 h-5 w-5" />
                      </div>
                      {item.date}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-indigo-800">
                      {item.number}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {item.debit > 0 ? (
                      <span className="text-rose-600 font-bold">${item.debit.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {item.credit > 0 ? (
                      <span className="text-emerald-600 font-bold">${item.credit.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-indigo-700 hidden md:table-cell">
                    <div className="max-w-xs truncate">
                      {item.account}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm hidden md:table-cell">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Popover
                      open={popoverOpen === item.id.toString()}
                      onOpenChange={(open) =>
                        setPopoverOpen(open ? item.id.toString() : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </motion.button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0" align="end">
                        <div className="py-1">
                          <button
                            onClick={() => onViewDetails(item)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                          <button
                            onClick={() => onEdit(item)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                          >
                            <PenBox size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(item)}
                            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded flex items-center gap-2"
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

        {/* Pagination */}
        {data.length > 0 && (
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-indigo-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-indigo-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * 10 + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> entries
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-indigo-300 text-indigo-500 hover:bg-indigo-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon size={16} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default JournalsTable;