import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import ExpenseApprovalHeader from './ExpenseApprovalHeader';
import ExpenseApprovalSearchFilter from './ExpenseApprovalSearchFilter';
import ExpenseApprovalTable from './ExpenseApprovalTable';
import ViewExpenseDetailModal from '../../budgetPlan/expenses/ViewExpenseDetailModal';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [expenses, setExpenses] = useState<BudgetExpenseWithApproval[]>([]);
  const [viewingExpense, setViewingExpense] = useState<BudgetExpenseWithApproval | null>(null);

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
    
    // Check if all expenses are approved and update budget plan status
    checkAndUpdateBudgetPlanStatus(updatedExpenses);
  };

  const checkAndUpdateBudgetPlanStatus = (expensesList: BudgetExpenseWithApproval[]) => {
    if (expensesList.length === 0) return;
    
    const allApproved = expensesList.every(e => e.status === 'Approved');
    const hasApproved = expensesList.some(e => e.status === 'Approved');
    const hasPending = expensesList.some(e => e.status === 'Pending' || e.status === 'Returned');
    
    // Update budget plan status
    const budgetPlansStored = localStorage.getItem('budgetPlans');
    if (budgetPlansStored) {
      try {
        const budgetPlans = JSON.parse(budgetPlansStored);
        
        const updatedPlans = budgetPlans.map((plan: any) => {
          if (plan.id === budgetPlanId) {
            if (allApproved) {
              // Create Master Budget Version (V1) when all expenses approved
              createMasterBudgetVersion(plan, expensesList);
              return { ...plan, status: 'Approved' };
            } else if (hasApproved && hasPending) {
              // Some approved, some pending/returned
              return { ...plan, status: 'In Review' };
            } else if (hasApproved) {
              // Some approved, rest rejected
              return { ...plan, status: 'Partially Approved' };
            } else {
              // Keep current status or set to In Review
              return { ...plan, status: plan.status === 'Submitted' ? 'In Review' : plan.status };
            }
          }
          return plan;
        });
        localStorage.setItem('budgetPlans', JSON.stringify(updatedPlans));
      } catch (e) {
        console.error('Error updating budget plan status:', e);
      }
    }
  };

  const createMasterBudgetVersion = (budgetPlan: any, approvedExpenses: BudgetExpenseWithApproval[]) => {
    // Check if master version already exists
    const versionsStored = localStorage.getItem('budgetVersions');
    const existingVersions = versionsStored ? JSON.parse(versionsStored) : [];
    
    const masterExists = existingVersions.some(
      (v: any) => v.budgetPlanId === budgetPlan.id && v.versionType === 'Master'
    );
    
    if (masterExists) return; // Don't create duplicate master version
    
    // Find matching budget (same fiscal year only)
    const budgetsStored = localStorage.getItem('budgets');
    let matchingBudgetId = null;
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
      
      const planFYNormalized = normalizeFiscalYear(budgetPlan.fiscalYear);
      const planYear = extractYear(budgetPlan.fiscalYear);
      
      const matchingBudget = budgets.find((b: any) => {
        if (b.status !== 'Active') return false;
        
        const budgetFYNormalized = normalizeFiscalYear(b.fiscalYear);
        const budgetYear = extractYear(b.fiscalYear);
        
        // Try exact match
        if (b.fiscalYear === budgetPlan.fiscalYear) return true;
        
        // Try normalized match
        if (budgetFYNormalized === planFYNormalized) return true;
        
        // Try year match
        if (budgetYear && planYear && budgetYear === planYear) return true;
        
        return false;
      });
      
      if (matchingBudget) {
        matchingBudgetId = matchingBudget.id;
      }
    }
    
    const totalAmount = approvedExpenses.reduce((sum, exp) => sum + exp.requestedAmount, 0);
    
    const masterVersion = {
      id: `version-${Date.now()}`,
      budgetId: matchingBudgetId, // Link to budget if found
      budgetPlanId: budgetPlan.id,
      budgetPlanName: `${budgetPlan.fiscalYear} - ${budgetPlan.costCenter}`,
      version: 'V1',
      versionType: 'Master',
      fiscalYear: budgetPlan.fiscalYear,
      costCenter: budgetPlan.costCenter,
      totalAmount: totalAmount,
      approvedAmount: totalAmount,
      expenses: approvedExpenses.map(exp => ({
        id: `vexp-${exp.id}`,
        expenseId: exp.id,
        budgetCode: exp.budgetCode,
        account: exp.account,
        budgetCategory: exp.budgetCategory,
        amount: exp.requestedAmount,
        justification: exp.justification,
        source: 'BudgetPlan',
        sourceId: budgetPlan.id
      })),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Current User',
      status: 'Active'
    };
    
    existingVersions.push(masterVersion);
    localStorage.setItem('budgetVersions', JSON.stringify(existingVersions));
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
  const totalPages = Math.ceil(filteredExpenses.length / 10);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <ExpenseApprovalHeader 
        budgetPlanId={budgetPlanId}
      />

      <ExpenseApprovalSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalRequested={totalRequested}
        approvedTotal={approvedTotal}
      />

      <ExpenseApprovalTable
        expenses={filteredExpenses}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredExpenses.length}
        onPageChange={setCurrentPage}
        onApprove={handleApprove}
        onReject={handleReject}
        onReturn={handleReturn}
        onViewDetails={setViewingExpense}
      />

      <ViewExpenseDetailModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        expense={viewingExpense}
      />
    </motion.section>
  );
}
