import { motion } from 'framer-motion';
import { FileText, Eye } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { BudgetPlan } from '../budgetPlan/BudgetPlanSection';

interface BudgetApprovalTableProps {
  budgetPlans: BudgetPlan[];
  onViewExpenses: (plan: BudgetPlan) => void;
}

export default function BudgetApprovalTable({
  budgetPlans,
  onViewExpenses
}: BudgetApprovalTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto rounded-lg border border-indigo-200 shadow-sm"
    >
      <table className="min-w-full divide-y divide-indigo-200">
        <thead className="bg-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
              Fiscal Year
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
              Cost Center
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
              Total Requested
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
              Expenses
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-indigo-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-indigo-200">
          {budgetPlans.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-indigo-500">
                No budget plans found.
              </td>
            </tr>
          ) : (
            budgetPlans.map((plan) => (
              <motion.tr
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="transition-colors hover:bg-indigo-50"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FileText className="text-indigo-600 h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-indigo-900">
                        {plan.fiscalYear}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-900">
                  {plan.costCenter}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-900 font-semibold">
                  {formatCurrency(plan.totalRequested)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-900">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {plan.expenseCount} items
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : plan.status === 'Submitted'
                      ? 'bg-blue-100 text-blue-800'
                      : plan.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : plan.status === 'Returned'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <Button
                    onClick={() => onViewExpenses(plan)}
                    variant="outline"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Expenses
                  </Button>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
