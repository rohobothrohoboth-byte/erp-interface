import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, PenBox, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';

interface AdditionalBudgetRequest {
  id: string;
  budgetPlanId: string;
  budgetPlanName: string;
  expenseId: string;
  expenseName: string;
  budgetCode: string;
  budgetCategory: string;
  account: string;
  amount: number;
  justification: string;
  status: 'Pending Review' | 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface AdditionalBudgetTableProps {
  requests: AdditionalBudgetRequest[];
  onEdit: (request: AdditionalBudgetRequest) => void;
  onDelete: (request: AdditionalBudgetRequest) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function AdditionalBudgetTable({
  requests,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}: AdditionalBudgetTableProps) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Pending':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Returned':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

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

  if (requests.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl shadow-sm overflow-hidden bg-white"
      >
        <div className="px-6 py-8 text-center text-sm text-gray-500">
          No additional budget requests found
        </div>
      </motion.div>
    );
  }

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
                Budget Plan
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expense
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRequests.map((request, index) => (
              <motion.tr
                key={request.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={rowVariants}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-1 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                        {request.budgetPlanName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-1 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.expenseName}</div>
                </td>
                <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">
                    {formatCurrency(request.amount)}
                  </div>
                </td>
                <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    {request.status === 'Returned' && request.rejectionReason && (
                      <div className="text-xs text-orange-600 mt-1">
                        Reason: {request.rejectionReason}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-4 py-1 whitespace-nowrap text-right text-sm font-medium">
                  <Popover
                    open={popoverOpen === request.id}
                    onOpenChange={(open) =>
                      setPopoverOpen(open ? request.id : null)
                    }
                  >
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
                          onClick={() => {
                            onEdit(request);
                            setPopoverOpen(null);
                          }}
                          disabled={request.status !== 'Pending Review' && request.status !== 'Returned'}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-500 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PenBox size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(request);
                            setPopoverOpen(null);
                          }}
                          disabled={request.status !== 'Pending Review' && request.status !== 'Returned'}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                          Delete
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
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> requests
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
    </motion.div>
  );
}
