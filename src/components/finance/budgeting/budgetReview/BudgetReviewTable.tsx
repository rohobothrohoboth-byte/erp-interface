import { motion } from 'framer-motion';
import { MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Button } from '../../../ui/button';

interface BudgetReviewRequest {
  id: string;
  budgetPlanName: string;
  expenseName: string;
  budgetCode: string;
  account: string;
  amount: number;
  justification: string;
  status: string;
  createdAt: string;
}

interface BudgetReviewTableProps {
  requests: BudgetReviewRequest[];
  onAccept: (request: BudgetReviewRequest) => void;
  onCancel: (request: BudgetReviewRequest) => void;
}

export default function BudgetReviewTable({
  requests,
  onAccept,
  onCancel
}: BudgetReviewTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No additional budget requests pending review</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Budget Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Expense Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Requested Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request, index) => (
              <motion.tr
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.budgetPlanName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{request.expenseName}</div>
                  <div className="text-xs text-gray-500">
                    {request.budgetCode} • {request.account}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(request.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="end">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => onAccept(request)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept for Approval
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onCancel(request)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Request
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
