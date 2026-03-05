import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../ui/dialog';
import { Button } from '../../../../ui/button';
import type { BudgetExpense } from './BudgetExpensesSection';

interface ViewExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: BudgetExpense | null;
}

export default function ViewExpenseDetailModal({
  isOpen,
  onClose,
  expense
}: ViewExpenseDetailModalProps) {
  if (!expense) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Returned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Expense Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Header Info - Budget Code, Amount, Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Budget Code</p>
                <p className="text-sm font-semibold text-gray-900">{expense.budgetCode}</p>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <p className="text-sm font-semibold text-indigo-600">${formatCurrency(expense.requestedAmount)}</p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(expense.status)}`}>
              {expense.status}
            </span>
          </div>

          {/* Justification */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Justification</p>
            <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[150px]">
              <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {expense.justification}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
