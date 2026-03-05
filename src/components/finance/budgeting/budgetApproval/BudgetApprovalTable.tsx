import { motion } from 'framer-motion';
import { FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { BudgetPlan } from '../budgetPlan/BudgetPlanSection';

interface BudgetApprovalTableProps {
  budgetPlans: BudgetPlan[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewExpenses: (plan: BudgetPlan) => void;
}

export default function BudgetApprovalTable({
  budgetPlans,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewExpenses
}: BudgetApprovalTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const paginatedPlans = budgetPlans.slice(startIndex, endIndex);

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
                Budget Plan
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Cost Center
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Total Requested
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Expenses
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </motion.tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPlans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No budget plans found.
                </td>
              </tr>
            ) : (
              paginatedPlans.map((plan, index) => (
                <motion.tr
                  key={plan.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-1 whitespace-nowrap">
                    <div className="flex items-center">
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"
                      >
                        <FileText className="text-indigo-600 h-5 w-5" />
                      </motion.div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                          {plan.fiscalYear}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    <span className='truncate max-w-[120px]'>
                      {plan.costCenter}
                    </span>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm font-semibold text-gray-900 hidden md:table-cell">
                    {formatCurrency(plan.totalRequested)}
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {plan.expenseCount} items
                    </span>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : plan.status === 'Submitted'
                        ? 'bg-gray-100 text-gray-800'
                        : plan.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : plan.status === 'Returned'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-4 py-1 whitespace-nowrap text-center">
                    <Button
                      onClick={() => onViewExpenses(plan)}
                      variant="outline"
                      size="sm"
                      className="text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 border-indigo-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Expenses
                    </Button>
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
              <span className="font-medium">{totalItems}</span> budget plans
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
