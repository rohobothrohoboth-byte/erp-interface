import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, PenBox, Trash2, DollarSign } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../ui/popover';
import type { BudgetExpense } from './BudgetExpensesSection';

interface BudgetExpensesTableProps {
  expenses: BudgetExpense[];
  onEdit: (expense: BudgetExpense) => void;
  onDelete: (expense: BudgetExpense) => void;
  onToggleStatus: (expense: BudgetExpense) => void;
}

export default function BudgetExpensesTable({
  expenses,
  onEdit,
  onDelete,
  onToggleStatus
}: BudgetExpensesTableProps) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const toggleExpanded = (expenseId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Budget Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Budget Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Justification
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requested Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                No expenses found.
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <motion.tr
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {expense.budgetCode}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 text-sm">
                        {expense.account}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {expense.budgetCategory}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div>
                    {expandedRows.has(expense.id) ? (
                      <>
                        {expense.justification}
                        {expense.justification.length > 30 && (
                          <button
                            onClick={() => toggleExpanded(expense.id)}
                            className="text-gray-700 hover:text-indigo-800 ml-1 font-medium text-xs"
                          >
                            See less
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {truncateText(expense.justification)}
                        {expense.justification.length > 50 && (
                          <button
                            onClick={() => toggleExpanded(expense.id)}
                            className="text-gray-700 hover:text-indigo-800 ml-1 font-medium text-xs"
                          >
                            See more
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatCurrency(expense.requestedAmount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(expense.priority)}`}>
                    {expense.priority}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    {expense.status === 'Returned' && expense.rejectionReason && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Reason: {expense.rejectionReason}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <Popover
                    open={popoverOpen === expense.id}
                    onOpenChange={(open) =>
                      setPopoverOpen(open ? expense.id : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <button className="text-gray-700 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="end">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onEdit(expense);
                            setPopoverOpen(null);
                          }}
                          disabled={expense.status === 'Approved' || expense.status === 'Rejected'}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded text-gray-500 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </motion.div>
  );
}
