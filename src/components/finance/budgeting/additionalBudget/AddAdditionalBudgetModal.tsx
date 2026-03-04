import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

interface AdditionalBudgetRequest {
  id: string;
  budgetId?: string;
  budgetName?: string;
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
}

interface AddAdditionalBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AdditionalBudgetRequest, 'id' | 'status' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
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

export default function AddAdditionalBudgetModal({
  isOpen,
  onClose,
  onSubmit
}: AddAdditionalBudgetModalProps) {
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
    if (isOpen) {
      loadBudgetPlans();
    }
  }, [isOpen]);

  const loadBudgetPlans = () => {
    const storedPlans = localStorage.getItem('budgetPlans');
    if (storedPlans) {
      const plans = JSON.parse(storedPlans);
      // Filter plans that have at least one approved expense
      const plansWithApprovedExpenses = plans.filter((p: any) => {
        const storageKey = `budgetExpenses_${p.id}`;
        const storedExpenses = localStorage.getItem(storageKey);
        if (storedExpenses) {
          const expenses = JSON.parse(storedExpenses);
          return expenses.some((e: any) => e.status === 'Approved');
        }
        return false;
      });
      setBudgetPlans(plansWithApprovedExpenses);
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
    
    // Automatically find the matching budget based on budget plan's fiscal year only
    const plan = budgetPlans.find(p => p.id === formData.budgetPlanId);
    if (plan) {
      const budgetsStored = localStorage.getItem('budgets');
      let budgetId = null;
      let budgetName = '';
      
      if (budgetsStored) {
        const budgets = JSON.parse(budgetsStored);
        
        // Helper function to normalize fiscal year strings for comparison
        const normalizeFiscalYear = (fy: string) => {
          if (!fy) return '';
          return fy.toLowerCase().replace(/\s+/g, '');
        };
        
        // Helper function to extract year number
        const extractYear = (fy: string) => {
          if (!fy) return null;
          const match = fy.match(/\d{4}/);
          return match ? match[0] : null;
        };
        
        const planFYNormalized = normalizeFiscalYear(plan.fiscalYear);
        const planYear = extractYear(plan.fiscalYear);
        
        const matchingBudget = budgets.find((b: any) => {
          if (b.status !== 'Active') return false;
          
          const budgetFYNormalized = normalizeFiscalYear(b.fiscalYear);
          const budgetYear = extractYear(b.fiscalYear);
          
          // Try exact match
          if (b.fiscalYear === plan.fiscalYear) return true;
          
          // Try normalized match
          if (budgetFYNormalized === planFYNormalized) return true;
          
          // Try year match
          if (budgetYear && planYear && budgetYear === planYear) return true;
          
          return false;
        });
        
        if (matchingBudget) {
          budgetId = matchingBudget.id;
          budgetName = matchingBudget.name;
        }
      }
      
      // Submit with budgetId and budgetName
      onSubmit({
        ...formData,
        budgetId,
        budgetName
      });
    } else {
      onSubmit(formData);
    }
    
    setFormData({
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
    setExpenses([]);
  };

  if (!isOpen) return null;

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
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Request Additional Budget</h2>
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
            <div className="space-y-2">
              <Label htmlFor="budgetPlan" className="text-sm text-indigo-700">
                Budget Plan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.budgetPlanId}
                onValueChange={handleBudgetPlanChange}
                required
              >
                <SelectTrigger className='w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500'>
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
              <Label htmlFor="expense" className="text-sm text-indigo-700">
                Approved Expense <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.expenseId}
                onValueChange={handleExpenseChange}
                required
                disabled={!formData.budgetPlanId}
              >
                <SelectTrigger className='w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500'>
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
              <Label htmlFor="amount" className="text-sm text-indigo-700">
                Additional Amount <span className="text-red-500">*</span>
              </Label>
              <input
                type="number"
                id="amount"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                Submit Request
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
