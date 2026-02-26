import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BudgetApprovalHeader from './BudgetApprovalHeader';
import BudgetApprovalSearchFilter from './BudgetApprovalSearchFilter';
import BudgetApprovalTable from './BudgetApprovalTable';
import type { BudgetPlan } from '../budgetPlan/BudgetPlanSection';

export default function BudgetApprovalSection() {
  const navigate = useNavigate();
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load budget plans from localStorage
    const stored = localStorage.getItem('budgetPlans');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBudgetPlans(parsed);
        }
      } catch (e) {
        console.error('Error parsing budgetPlans:', e);
      }
    }
  }, []);

  const handleViewExpenses = (plan: BudgetPlan) => {
    navigate(`/finance/budget-approval/${plan.id}/expenses`);
  };

  const filteredPlans = budgetPlans.filter(plan =>
    plan.fiscalYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.costCenter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <BudgetApprovalHeader />

      <BudgetApprovalSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <BudgetApprovalTable
        budgetPlans={filteredPlans}
        onViewExpenses={handleViewExpenses}
      />
    </motion.div>
  );
}
