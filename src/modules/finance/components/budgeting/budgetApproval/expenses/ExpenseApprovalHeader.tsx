import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

interface ExpenseApprovalHeaderProps {
  budgetPlanId: string;
}

export default function ExpenseApprovalHeader({ 
  budgetPlanId
}: ExpenseApprovalHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="mb-4"
    >
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
    </motion.div>
  );
}
