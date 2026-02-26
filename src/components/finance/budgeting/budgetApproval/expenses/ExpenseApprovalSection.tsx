import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import ExpenseApprovalHeader from './ExpenseApprovalHeader';
import ExpenseApprovalSearchFilter from './ExpenseApprovalSearchFilter';
import ExpenseApprovalTable from './ExpenseApprovalTable';

export interface BudgetExpenseWithApproval {
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
}

interface ExpenseApprovalSectionProps {
  budgetPlanId: string;
}

export default function ExpenseApprovalSection({ budgetPlanId }: ExpenseApprovalSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expenses, setExpenses] = useState<BudgetExpenseWithApproval[]>([]);

  useEffect(() => {
    loadExpenses();
  }, [budgetPlanId]);

  const loadExpenses = () => {
    const storageKey = `budgetExpenses_${budgetPlanId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setExpenses(parsed);
      } catch (e) {
        console.error('Error parsing expenses:', e);
      }
    }
  };

  const saveExpenses = (updatedExpenses: BudgetExpenseWithApproval[]) => {
    const storageKey = `budgetExpenses_${budgetPlanId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
  };

  const handleApprove = (expense: BudgetExpenseWithApproval) => {
    const updatedExpenses = expenses.map(e =>
      e.id === expense.id
        ? {
            ...e,
            status: 'Approved' as const,
            approvedBy: 'Current User',
            approvedAt: new Date().toISOString()
          }
        : e
    );
    saveExpenses(updatedExpenses);
    showToast.success('Expense approved successfully');
  };

  const handleReject = (expense: BudgetExpenseWithApproval, reason: string) => {
    const updatedExpenses = expenses.map(e =>
      e.id === expense.id
        ? {
            ...e,
            status: 'Rejected' as const,
            approvedBy: 'Current User',
            approvedAt: new Date().toISOString(),
            rejectionReason: reason
          }
        : e
    );
    saveExpenses(updatedExpenses);
    showToast.success('Expense rejected');
  };

  const handleReturn = (expense: BudgetExpenseWithApproval, reason: string) => {
    const updatedExpenses = expenses.map(e =>
      e.id === expense.id
        ? {
            ...e,
            status: 'Returned' as const,
            approvedBy: 'Current User',
            approvedAt: new Date().toISOString(),
            rejectionReason: reason
          }
        : e
    );
    saveExpenses(updatedExpenses);
    showToast.success('Expense returned for review');
  };

  const filteredExpenses = expenses.filter(e =>
    (e.budgetCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    e.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.budgetCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.justification.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRequested = expenses.reduce((sum, exp) => sum + exp.requestedAmount, 0);
  const approvedTotal = expenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, exp) => sum + exp.requestedAmount, 0);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <ExpenseApprovalHeader 
        budgetPlanId={budgetPlanId} 
        totalRequested={totalRequested}
        approvedTotal={approvedTotal}
        expenseCount={expenses.length}
      />

      <ExpenseApprovalSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <ExpenseApprovalTable
        expenses={filteredExpenses}
        onApprove={handleApprove}
        onReject={handleReject}
        onReturn={handleReturn}
      />
    </motion.section>
  );
}
