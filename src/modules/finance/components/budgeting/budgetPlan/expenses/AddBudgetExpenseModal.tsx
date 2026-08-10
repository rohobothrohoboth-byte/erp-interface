import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BadgePlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { BudgetExpense } from '@/modules/finance/components/budgeting/budgetPlan/expenses/BudgetExpensesSection';

interface AddBudgetExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BudgetExpense, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
}

const priorityOptions = ['High', 'Medium', 'Low'];

export default function AddBudgetExpenseModal({
  isOpen,
  onClose,
  onSubmit
}: AddBudgetExpenseModalProps) {
  const [formData, setFormData] = useState({
    budgetCode: '',
    account: '',
    budgetCategory: '',
    justification: '',
    requestedAmount: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    status: 'Pending' as 'Pending' | 'Approved' | 'Rejected' | 'Returned'
  });
  const [budgetCodes, setBudgetCodes] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBudgetCodes();
      fetchAccounts();
      fetchBudgetCategories();
    }
  }, [isOpen]);

  const fetchBudgetCodes = () => {
    const storedBudgetCodes = localStorage.getItem('budgetCodes');
    if (storedBudgetCodes) {
      const codes = JSON.parse(storedBudgetCodes).map((bc: any) => bc.budgetCode);
      setBudgetCodes(codes);
    } else {
      setBudgetCodes(['BC-2024-001', 'BC-2024-002', 'BC-2024-003']);
    }
  };

  const fetchAccounts = () => {
    const storedAccounts = localStorage.getItem('accounts');
    if (storedAccounts) {
      const accountList = JSON.parse(storedAccounts);
      const flattenAccounts = (accs: any[]): any[] => {
        let result: any[] = [];
        accs.forEach(acc => {
          result.push(acc);
          if (acc.children && acc.children.length > 0) {
            result = result.concat(flattenAccounts(acc.children));
          }
        });
        return result;
      };
      
      const allAccounts = flattenAccounts(accountList);
      const accountCodes = allAccounts.map((acc: any) => `${acc.code} - ${acc.name}`);
      setAccounts(accountCodes);
    } else {
      setAccounts([
        '6000 - Operating Expenses',
        '6100 - Salaries & Wages',
        '6200 - Rent Expense',
        '6300 - Utilities',
        '6400 - Marketing Expense',
        '6500 - Travel Expense',
        '6600 - Office Supplies'
      ]);
    }
  };

  const fetchBudgetCategories = () => {
    const storedCategories = localStorage.getItem('budgetCategories');
    if (storedCategories) {
      const categoryList = JSON.parse(storedCategories);
      const categoryNames = categoryList
        .filter((cat: any) => cat.is_active)
        .map((cat: any) => `${cat.categoryCode} - ${cat.categoryNameEn}`);
      setBudgetCategories(categoryNames);
    } else {
      setBudgetCategories([
        '2200 - Supplies & Materials',
        '2300 - Utilities',
        '2400 - Travel & Transportation'
      ]);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        budgetCode: '',
        account: '',
        budgetCategory: '',
        justification: '',
        requestedAmount: '',
        priority: 'Medium',
        status: 'Pending'
      });
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!formData.budgetCode || !formData.account || !formData.budgetCategory || !formData.justification || !formData.requestedAmount) {
      return;
    }

    const amount = parseFloat(formData.requestedAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        requestedAmount: amount
      });
      setFormData({
        budgetCode: '',
        account: '',
        budgetCategory: '',
        justification: '',
        requestedAmount: '',
        priority: 'Medium',
        status: 'Pending'
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.budgetCode && formData.account && formData.budgetCategory && formData.justification && formData.requestedAmount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <BadgePlus size={20} />
            <h2 className="text-lg font-bold text-gray-800">Add New Expense</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <div className="py-4 grid grid-cols-2 gap-4">
            {/* Budget Code */}
            <div className="space-y-2">
              <Label htmlFor="budgetCode" className="text-sm text-gray-500">
                Budget Code <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.budgetCode}
                onValueChange={(value) => setFormData({ ...formData, budgetCode: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select budget code" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account */}
            <div className="space-y-2">
              <Label htmlFor="account" className="text-sm text-gray-500">
                Account <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.account}
                onValueChange={(value) => setFormData({ ...formData, account: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Category */}
            <div className="space-y-2">
              <Label htmlFor="budgetCategory" className="text-sm text-gray-500">
                Budget Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.budgetCategory}
                onValueChange={(value) => setFormData({ ...formData, budgetCategory: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select budget category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Requested Amount */}
            <div className="space-y-2">
              <Label htmlFor="requestedAmount" className="text-sm text-gray-500">
                Requested Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="requestedAmount"
                type="number"
                step="0.01"
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                placeholder="0.00"
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm text-gray-500">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Justification - Full Width */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="justification" className="text-sm text-gray-500">
                Justification <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                placeholder="Enter justification for this expense"
                rows={3}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer px-6"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-6"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
