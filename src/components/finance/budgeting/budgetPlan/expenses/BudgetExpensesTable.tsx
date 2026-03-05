import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, PenBox, Trash2, Eye, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../ui/popover';
import type { BudgetExpense } from './BudgetExpensesSection';

interface BudgetExpensesTableProps {
  expenses: BudgetExpense[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEdit: (expense: BudgetExpense) => void;
  onDelete: (expense: BudgetExpense) => void;
  onViewDetails: (expense: BudgetExpense) => void;
}

export default function BudgetExpensesTable({
  expenses,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onEdit,
  onDelete,
  onViewDetails
}: BudgetExpensesTableProps) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const paginatedExpenses = expenses.slice(startIndex, endIndex);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
            duration: 0.5
          }
        }
      }}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <motion.tr
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Expense
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Account
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Category
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Priority
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </motion.tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No expenses found.
                </td>
              </tr>
            ) : (
              paginatedExpenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-1 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                          {expense.budgetCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    <span className='truncate max-w-[120px]'>
                      {expense.account}
                    </span>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    <span className='truncate max-w-[120px]'>
                      {expense.budgetCategory}
                    </span>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm font-semibold text-gray-900 hidden lg:table-cell">
                    {formatCurrency(expense.requestedAmount)}
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm hidden sm:table-cell">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(expense.priority)}`}>
                      {expense.priority}
                    </span>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm hidden sm:table-cell">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      expense.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : expense.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : expense.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : expense.status === 'Returned'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-right text-sm font-medium">
                    <Popover open={popoverOpen === expense.id} onOpenChange={(open) => setPopoverOpen(open ? expense.id : null)}>
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
                              onViewDetails(expense);
                              setPopoverOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                          >
                            <Eye size={16} />
                            View Details
                          </button>

                          <button
                            onClick={() => {
                              onEdit(expense);
                              setPopoverOpen(null);
                            }}
                            disabled={expense.status === 'Approved' || expense.status === 'Rejected'}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PenBox size={16} />
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              onDelete(expense);
                              setPopoverOpen(null);
                            }}
                            disabled={expense.status === 'Approved' || expense.status === 'Rejected'}
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
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> expenses
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
