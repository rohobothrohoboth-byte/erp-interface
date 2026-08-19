import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

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
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  rejectionReason?: string;
}

interface EditAdditionalBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AdditionalBudgetRequest, 'id' | 'status' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
  request: AdditionalBudgetRequest | null;
}

interface BudgetExpense {
  id: string;
  budgetCode: string;
  account: string;
  budgetCategory: string;
  justification: string;
  requestedAmount: number;
  status: string;
}

export default function EditAdditionalBudgetModal({
  isOpen,
  onClose,
  onSubmit,
  request
}: EditAdditionalBudgetModalProps) {
  const [formData, setFormData] = useState({
    budgetPlanId: '',
    budgetPlanName: '',
    expenseId: '',
    expenseName: '',
    budgetCode: '',
    budgetCategory: '',
    account: '',
    amount: 0,
    justification: ''
  });

  const [budgetPlans, setBudgetPlans] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);

  useEffect(() => {
    if (isOpen && request) {
      setFormData({
        budgetPlanId: request.budgetPlanId,
        budgetPlanName: request.budgetPlanName,
        expenseId: request.expenseId,
        expenseName: request.expenseName,
        budgetCode: request.budgetCode,
        budgetCategory: request.budgetCategory,
        account: request.account,
        amount: request.amount,
        justification: request.justification
      });
      loadData(request.budgetPlanId);
    }
  }, [isOpen, request]);

  const loadData = (planId: string) => {
    const storedPlans = localStorage.getItem('budgetPlans');
    if (storedPlans) {
      const plans = JSON.parse(storedPlans);
      setBudgetPlans(plans.filter((p: any) => p.status === 'Approved'));
    }

    // Load approved expenses for the budget plan
    if (planId) {
      const storageKey = `budgetExpenses_${planId}`;
      const storedExpenses = localStorage.getItem(storageKey);
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses.filter((e: BudgetExpense) => e.status === 'Approved'));
      }
    }
  };

  const handleBudgetPlanChange = (planId: string) => {
    const plan = budgetPlans.find(p => p.id === planId);
    if (plan) {
      setFormData({
        ...formData,
        budgetPlanId: planId,
        budgetPlanName: `${plan.fiscalYear} - ${plan.costCenter}`,
        expenseId: '',
        expenseName: '',
        budgetCode: '',
        budgetCategory: '',
        account: '',
        amount: 0
      });
      
      // Load approved expenses for this budget plan
      const storageKey = `budgetExpenses_${planId}`;
      const storedExpenses = localStorage.getItem(storageKey);
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses.filter((e: BudgetExpense) => e.status === 'Approved'));
      } else {
        setExpenses([]);
      }
    }
  };

  const handleExpenseChange = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      const expenseName = `${expense.budgetCode} - ${expense.account}`;
      setFormData({
        ...formData,
        expenseId: expenseId,
        expenseName: expenseName,
        budgetCode: expense.budgetCode,
        budgetCategory: expense.budgetCategory,
        account: expense.account
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Edit Additional Budget Request</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {request?.status === 'Returned' && request?.rejectionReason && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Request Returned for Revision
                    </h4>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      {request.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="budgetPlan" className="text-sm text-gray-500 dark:text-gray-400">
                Budget Plan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.budgetPlanId}
                onValueChange={handleBudgetPlanChange}
                required
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Select budget plan" />
                </SelectTrigger>
                <SelectContent>
                  {budgetPlans.length === 0 ? (
                    <SelectItem value="empty" disabled>No approved budget plans available</SelectItem>
                  ) : (
                    budgetPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.fiscalYear} - {plan.costCenter}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense" className="text-sm text-gray-500 dark:text-gray-400">
                Approved Expense <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.expenseId}
                onValueChange={handleExpenseChange}
                required
                disabled={!formData.budgetPlanId}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Select approved expense" />
                </SelectTrigger>
                <SelectContent>
                  {expenses.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {formData.budgetPlanId ? 'No approved expenses available' : 'Select a budget plan first'}
                    </SelectItem>
                  ) : (
                    expenses.map((expense) => (
                      <SelectItem key={expense.id} value={expense.id}>
                        {expense.budgetCode} - {expense.account} ({expense.budgetCategory})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm text-gray-500 dark:text-gray-400">
                Additional Amount <span className="text-red-500">*</span>
              </Label>
              <input
                type="number"
                id="amount"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification" className="text-sm text-gray-500 dark:text-gray-400">
                Justification <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="Provide detailed justification for this additional budget request..."
                required
              />
            </div>
          </div>

          <div className="border-t dark:border-gray-700 px-6 py-4">
            <div className="flex justify-center items-center gap-2">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
              >
                Update Request
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
