import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../ui/button';

interface ExpenseApprovalHeaderProps {
  budgetPlanId: string;
  totalRequested: number;
  approvedTotal: number;
  expenseCount: number;
}

export default function ExpenseApprovalHeader({ 
  budgetPlanId, 
  totalRequested, 
  approvedTotal,
  expenseCount 
}: ExpenseApprovalHeaderProps) {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/finance/budget-approval')}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Button>
                    <h1 className="text-2xl font-bold text-black">
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-600 bg-clip-text text-transparent">
              Expense Approval
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Requested</p>
            <p className="text-xl font-bold text-indigo-600">{formatCurrency(totalRequested)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Approved Amount</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(approvedTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-xl font-bold text-indigo-600">{expenseCount}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
