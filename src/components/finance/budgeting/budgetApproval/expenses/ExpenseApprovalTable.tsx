import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../../../ui/button';
import type { BudgetExpenseWithApproval } from './ExpenseApprovalSection';
import RejectExpenseModal from './RejectExpenseModal';
import ReturnExpenseModal from './ReturnExpenseModal';

interface ExpenseApprovalTableProps {
  expenses: BudgetExpenseWithApproval[];
  onApprove: (expense: BudgetExpenseWithApproval) => void;
  onReject: (expense: BudgetExpenseWithApproval, reason: string) => void;
  onReturn: (expense: BudgetExpenseWithApproval, reason: string) => void;
}

export default function ExpenseApprovalTable({
  expenses,
  onApprove,
  onReject,
  onReturn,
}: ExpenseApprovalTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<BudgetExpenseWithApproval | null>(null);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Returned: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority}
      </span>
    );
  };

  const handleApproveClick = (expense: BudgetExpenseWithApproval) => {
    if (expense.status === 'Pending' || expense.status === 'Returned') {
      onApprove(expense);
    }
  };

  const handleRejectClick = (expense: BudgetExpenseWithApproval) => {
    if (expense.status === 'Pending' || expense.status === 'Returned') {
      setSelectedExpense(expense);
      setRejectModalOpen(true);
    }
  };

  const handleReturnClick = (expense: BudgetExpenseWithApproval) => {
    if (expense.status === 'Pending' || expense.status === 'Returned') {
      setSelectedExpense(expense);
      setReturnModalOpen(true);
    }
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedExpense) {
      onReject(selectedExpense, reason);
      setRejectModalOpen(false);
      setSelectedExpense(null);
    }
  };

  const handleReturnConfirm = (reason: string) => {
    if (selectedExpense) {
      onReturn(selectedExpense, reason);
      setReturnModalOpen(false);
      setSelectedExpense(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
      >
        <p className="text-gray-500">No expenses found</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Justification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => {
                const isExpanded = expandedRows.has(expense.id);
                const canTakeAction = expense.status === 'Pending' || expense.status === 'Returned';
                
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.budgetCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.account}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.budgetCategory}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {isExpanded ? (
                          <div>
                            <p className="whitespace-pre-wrap">{expense.justification}</p>
                            <button
                              onClick={() => toggleRow(expense.id)}
                              className="text-indigo-600 hover:text-indigo-800 text-xs mt-1 flex items-center gap-1"
                            >
                              See less <ChevronUp className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="truncate">
                              {expense.justification.length > 50
                                ? `${expense.justification.substring(0, 50)}...`
                                : expense.justification}
                            </p>
                            {expense.justification.length > 50 && (
                              <button
                                onClick={() => toggleRow(expense.id)}
                                className="text-indigo-600 hover:text-indigo-800 text-xs mt-1 flex items-center gap-1"
                              >
                                See more <ChevronDown className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.requestedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPriorityBadge(expense.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveClick(expense)}
                          disabled={!canTakeAction}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectClick(expense)}
                          disabled={!canTakeAction}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReturnClick(expense)}
                          disabled={!canTakeAction}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Return
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {selectedExpense && (
        <>
          <RejectExpenseModal
            isOpen={rejectModalOpen}
            onClose={() => {
              setRejectModalOpen(false);
              setSelectedExpense(null);
            }}
            onConfirm={handleRejectConfirm}
            expense={selectedExpense}
          />
          <ReturnExpenseModal
            isOpen={returnModalOpen}
            onClose={() => {
              setReturnModalOpen(false);
              setSelectedExpense(null);
            }}
            onConfirm={handleReturnConfirm}
            expense={selectedExpense}
          />
        </>
      )}
    </>
  );
}
