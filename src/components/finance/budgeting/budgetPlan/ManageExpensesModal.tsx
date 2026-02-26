import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { showToast } from '../../../../layout/layout';
import DeleteExpenseModal from './DeleteExpenseModal';
import type { BudgetPlan } from './BudgetPlanSection';

export interface BudgetExpense {
  id: string;
  account: string;
  justification: string;
  requestedAmount: number;
  priority: 'High' | 'Medium' | 'Low';
}

interface ManageExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetPlan: BudgetPlan;
  onUpdateTotal: (planId: string, total: number, count: number) => void;
}

// Mock storage for expenses
const expensesStorage: Record<string, BudgetExpense[]> = {};

const priorityOptions = ['High', 'Medium', 'Low'];

export default function ManageExpensesModal({
  isOpen,
  onClose,
  budgetPlan,
  onUpdateTotal
}: ManageExpensesModalProps) {
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [editingExpense, setEditingExpense] = useState<BudgetExpense | null>(null);
  const [formData, setFormData] = useState({
    account: '',
    justification: '',
    requestedAmount: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deletingExpense, setDeletingExpense] = useState<BudgetExpense | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    if (isOpen && budgetPlan) {
      const planExpenses = expensesStorage[budgetPlan.id] || [];
      setExpenses(planExpenses);
      setCurrentPage(1);
      fetchAccounts();
    }
  }, [isOpen, budgetPlan]);

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
        '1000 - Cash',
        '1100 - Accounts Receivable',
        '1200 - Inventory',
        '2000 - Accounts Payable',
        '3000 - Capital',
        '4000 - Revenue',
        '5000 - Cost of Goods Sold',
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

  const totalItems = expenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return expenses.slice(startIndex, startIndex + itemsPerPage);
  }, [expenses, currentPage]);

  const totalRequested = expenses.reduce((sum, exp) => sum + exp.requestedAmount, 0);

  const handleClose = () => {
    setEditingExpense(null);
    setFormData({
      account: '',
      justification: '',
      requestedAmount: '',
      priority: 'Medium'
    });
    setCurrentPage(1);
    setExpandedRows(new Set());
    onClose();
  };

  const handleEditExpense = (expense: BudgetExpense) => {
    setEditingExpense(expense);
    setFormData({
      account: expense.account,
      justification: expense.justification,
      requestedAmount: expense.requestedAmount.toString(),
      priority: expense.priority
    });
  };

  const handleDeleteExpense = () => {
    if (deletingExpense) {
      const updatedExpenses = expenses.filter(e => e.id !== deletingExpense.id);
      setExpenses(updatedExpenses);
      expensesStorage[budgetPlan.id] = updatedExpenses;
      
      const newTotal = updatedExpenses.reduce((sum, exp) => sum + exp.requestedAmount, 0);
      onUpdateTotal(budgetPlan.id, newTotal, updatedExpenses.length);
      
      showToast.success('Expense deleted successfully');
      setDeletingExpense(null);
    }
  };

  const handleSaveExpense = () => {
    if (!formData.account || !formData.justification || !formData.requestedAmount) {
      showToast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.requestedAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }

    if (editingExpense) {
      const updatedExpenses = expenses.map(e =>
        e.id === editingExpense.id
          ? { ...e, ...formData, requestedAmount: amount }
          : e
      );
      setExpenses(updatedExpenses);
      expensesStorage[budgetPlan.id] = updatedExpenses;
      
      const newTotal = updatedExpenses.reduce((sum, exp) => sum + exp.requestedAmount, 0);
      onUpdateTotal(budgetPlan.id, newTotal, updatedExpenses.length);
      
      showToast.success('Expense updated successfully');
    } else {
      const newExpense: BudgetExpense = {
        id: Date.now().toString(),
        account: formData.account,
        justification: formData.justification,
        requestedAmount: amount,
        priority: formData.priority
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      expensesStorage[budgetPlan.id] = updatedExpenses;
      
      const newTotal = updatedExpenses.reduce((sum, exp) => sum + exp.requestedAmount, 0);
      onUpdateTotal(budgetPlan.id, newTotal, updatedExpenses.length);
      
      showToast.success('Expense added successfully');
    }

    setEditingExpense(null);
    setFormData({
      account: '',
      justification: '',
      requestedAmount: '',
      priority: 'Medium'
    });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setFormData({
      account: '',
      justification: '',
      requestedAmount: '',
      priority: 'Medium'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] sm:h-[75vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 sm:px-6 py-3 bg-white rounded-lg">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
               {budgetPlan.fiscalYear} expenses
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body - Split Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden rounded-lg">
          {/* Form Section - Left */}
          <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 p-3 sm:p-4 bg-white overflow-y-auto">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Plus size={14} className="sm:w-4 sm:h-4 text-indigo-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                  {editingExpense ? 'Edit' : 'Add'} Expense
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4 flex-1">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Account <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.account}
                    onValueChange={(value) => setFormData({ ...formData, account: value })}
                  >
                    <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
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

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Requested Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.requestedAmount}
                    onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
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

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Justification <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="Enter justification"
                    className="w-full text-xs sm:text-sm resize-none"
                    rows={4}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="space-y-2 mt-4 sm:mt-8">
                <Button
                  onClick={handleSaveExpense}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
                  disabled={!formData.account || !formData.justification || !formData.requestedAmount}
                >
                  {editingExpense ? 'Update' : 'Add'}
                </Button>
                {editingExpense && (
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Table Section - Right */}
          <div className="w-full lg:w-3/5 flex flex-col bg-white">
            <div className="flex-1 overflow-hidden">
              <div className="rounded-lg shadow-sm overflow-hidden bg-white h-full flex flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Justification</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 sm:py-12 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                <Plus size={16} className="sm:w-5 sm:h-5 text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-medium mb-1 text-sm">No expenses added</p>
                              <p className="text-gray-400 text-xs sm:text-sm">Add your first expense using the form</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedExpenses.map((expense, index) => (
                          <motion.tr
                            key={expense.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {expense.account}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {expandedRows.has(expense.id) ? (
                                  <>
                                    {expense.justification}
                                    {expense.justification.length > 50 && (
                                      <button
                                        onClick={() => toggleExpanded(expense.id)}
                                        className="text-indigo-600 hover:text-indigo-800 ml-1 font-medium"
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
                                        className="text-indigo-600 hover:text-indigo-800 ml-1 font-medium"
                                      >
                                        See more
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                              <div className="text-sm text-gray-900">
                                {expandedRows.has(expense.id) ? (
                                  <>
                                    {expense.justification}
                                    {expense.justification.length > 50 && (
                                      <button
                                        onClick={() => toggleExpanded(expense.id)}
                                        className="text-indigo-600 hover:text-indigo-800 ml-1 font-medium text-xs"
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
                                        className="text-indigo-600 hover:text-indigo-800 ml-1 font-medium text-xs"
                                      >
                                        See more
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-semibold text-gray-900">
                                {formatCurrency(expense.requestedAmount)}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden md:table-cell">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(expense.priority)}`}>
                                {expense.priority}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleEditExpense(expense)}
                                  className="p-1 sm:p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                  title="Edit expense"
                                >
                                  <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeletingExpense(expense)}
                                  className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete expense"
                                >
                                  <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="bg-white px-4 sm:px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                          <span className="font-medium">{totalItems}</span> expenses
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft size={16} />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
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
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <DeleteExpenseModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteExpense}
        expenseAccount={deletingExpense?.account || ''}
      />
    </div>
  );
}
