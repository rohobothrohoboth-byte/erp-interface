import { useParams } from 'react-router-dom';
import ExpenseApprovalSection from '@/modules/finance/components/budgeting/budgetApproval/expenses/ExpenseApprovalSection';

export default function PageExpenseApproval() {
  const { budgetPlanId } = useParams<{ budgetPlanId: string }>();

  if (!budgetPlanId) {
    return (
      <div className="p-6">
        <p className="text-red-600">Budget Plan ID is required</p>
      </div>
    );
  }

  return <ExpenseApprovalSection budgetPlanId={budgetPlanId} />;
}
