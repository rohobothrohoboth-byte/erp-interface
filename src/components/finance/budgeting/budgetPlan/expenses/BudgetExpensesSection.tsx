import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import BudgetExpensesHeader from './BudgetExpensesHeader';
import BudgetExpensesSearchFilter from './BudgetExpensesSearchFilter';
import BudgetExpensesTable from './BudgetExpensesTable';
import AddBudgetExpenseModal from './AddBudgetExpenseModal';
import EditBudgetExpenseModal from './EditBudgetExpenseModal';
import DeleteBudgetExpenseModal from './DeleteBudgetExpenseModal';

export interface BudgetExpense {
  id: string;
  budgetCode: string;
  account: string;
  budgetCategory: string;
  justification: string;
  requestedAmount: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface BudgetExpensesSectionProps {
  budgetPlanId: string;
}

export default function BudgetExpensesSection({ budgetPlanId }: BudgetExpensesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BudgetExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<BudgetExpense | null>(null);

  const loadExpenses = (): BudgetExpense[] => {
    // Try to load from localStorage first
    const storageKey = `budgetExpenses_${budgetPlanId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If not in localStorage and this is the mock budget plan, use mock data
    if (budgetPlanId === 'bp-001') {
      const mockExpenses: BudgetExpense[] = [
        {
          id: 'exp-001',
          budgetCode: 'BC-2024-001',
          account: '6100 - Salaries & Wages',
          budgetCategory: '2200 - Supplies & Materials',
          justification: 'Additional staff required for new project implementation. This includes hiring 2 senior developers and 1 project manager to handle the increased workload and ensure timely delivery of critical features.',
          requestedAmount: 45000,
          priority: 'High',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        },
        {
          id: 'exp-002',
          budgetCode: 'BC-2024-002',
          account: '6500 - Travel Expense',
          budgetCategory: '2400 - Travel & Transportation',
          justification: 'Team training and conference attendance for skill development and industry networking.',
          requestedAmount: 15000,
          priority: 'Medium',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        },
        {
          id: 'exp-003',
          budgetCode: 'BC-2024-001',
          account: '6300 - Office Supplies',
          budgetCategory: '2200 - Supplies & Materials',
          justification: 'Purchase of new computers and office equipment for the expanded team.',
          requestedAmount: 15000,
          priority: 'High',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        },
      ];
      
      // Save mock data to localStorage
      localStorage.setItem(storageKey, JSON.stringify(mockExpenses));
      return mockExpenses;
    }
    
    return [];
  };

  const [expenses, setExpenses] = useState<BudgetExpense[]>(loadExpenses());

  useEffect(() => {
    const loaded = loadExpenses();
    setExpenses(loaded);
  }, [budgetPlanId]);

  const saveExpenses = (updatedExpenses: BudgetExpense[]) => {
    const storageKey = `budgetExpenses_${budgetPlanId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
    
    // Update parent budget plan total
    const total = updatedExpenses.reduce((sum, exp) => sum + exp.requestedAmount, 0);
    const budgetPlans = JSON.parse(localStorage.getItem('budgetPlans') || '[]');
    const updatedPlans = budgetPlans.map((plan: any) =>
      plan.id === budgetPlanId
        ? { ...plan, totalRequested: total, expenseCount: updatedExpenses.length }
        : plan
    );
    localStorage.setItem('budgetPlans', JSON.stringify(updatedPlans));
  };

  const handleAddSubmit = (expenseData: Omit<BudgetExpense, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    const newExpense: BudgetExpense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    saveExpenses([...expenses, newExpense]);
    showToast.success('Expense added successfully');
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (expenseData: Omit<BudgetExpense, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
    if (editingExpense) {
      const updatedExpenses = expenses.map(e =>
        e.id === editingExpense.id
          ? { 
              ...e, 
              ...expenseData, 
              status: 'Pending' as const, // Reset to Pending when edited
              rejectionReason: undefined, // Clear rejection reason
              updatedAt: new Date().toISOString(), 
              updatedBy: 'Current User' 
            }
          : e
      );
      saveExpenses(updatedExpenses);
      showToast.success('Expense updated and resubmitted for approval');
      setEditingExpense(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingExpense) {
      const updatedExpenses = expenses.filter(e => e.id !== deletingExpense.id);
      saveExpenses(updatedExpenses);
      showToast.success('Expense deleted successfully');
      setDeletingExpense(null);
    }
  };

  const handleToggleStatus = (expense: BudgetExpense) => {
    // Cycle through statuses: Pending -> Approved -> Rejected -> Returned -> Pending
    const statusCycle: Array<'Pending' | 'Approved' | 'Rejected' | 'Returned'> = ['Pending', 'Approved', 'Rejected', 'Returned'];
    const currentIndex = statusCycle.indexOf(expense.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    
    const updatedExpenses = expenses.map(e =>
      e.id === expense.id ? { ...e, status: nextStatus } : e
    );
    saveExpenses(updatedExpenses);
    showToast.success(`Expense status changed to ${nextStatus}`);
  };

  const filteredExpenses = expenses.filter(e =>
    (e.budgetCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    e.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.budgetCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.justification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRequested = expenses.reduce((sum, exp) => sum + exp.requestedAmount, 0);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <BudgetExpensesHeader budgetPlanId={budgetPlanId} totalRequested={totalRequested} expenseCount={expenses.length} />

      <BudgetExpensesSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <BudgetExpensesTable
        expenses={filteredExpenses}
        onEdit={setEditingExpense}
        onDelete={setDeletingExpense}
        onToggleStatus={() => {}} // Not used - status changed only through approval
      />

      <AddBudgetExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <EditBudgetExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleEditSubmit}
        expense={editingExpense}
      />

      <DeleteBudgetExpenseModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteConfirm}
        expenseAccount={deletingExpense?.account || ''}
      />
    </motion.section>
  );
}
