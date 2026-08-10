import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import BudgetExpensesSection from '@/modules/finance/components/budgeting/budgetPlan/expenses/BudgetExpensesSection';

export default function PageBudgetExpenses() {
  const { budgetPlanId } = useParams<{ budgetPlanId: string }>();
  const navigate = useNavigate();

  if (!budgetPlanId) {
    navigate('/finance/budget-plan');
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <BudgetExpensesSection budgetPlanId={budgetPlanId} />
    </motion.section>
  );
}
