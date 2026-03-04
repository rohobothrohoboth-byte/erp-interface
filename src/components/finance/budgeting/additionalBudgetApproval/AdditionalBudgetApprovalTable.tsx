import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../../ui/button';

interface AdditionalBudgetRequest {
  id: string;
  budgetPlanId: string;
  budgetPlanName: string;
  expenseId: string;
  expenseName: string;
  budgetCode: string;
  budgetCategory: string;
  account: string;
  amount: number;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  createdBy: string;
}

interface AdditionalBudgetApprovalTableProps {
  requests: AdditionalBudgetRequest[];
  onApprove: (request: AdditionalBudgetRequest) => void;
  onReject: (request: AdditionalBudgetRequest) => void;
  onReturn: (request: AdditionalBudgetRequest) => void;
}

export default function AdditionalBudgetApprovalTable({
  requests,
  onApprove,
  onReject,
  onReturn
}: AdditionalBudgetApprovalTableProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Budget Plan
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Justification
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                No additional budget requests found.
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <motion.tr
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        {request.budgetPlanName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{request.expenseName}</div>
                  <div className="text-xs text-gray-500">{request.budgetCode} - {request.account}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatCurrency(request.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {request.justification}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : request.status === 'Returned'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {request.status === 'Pending' ? (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => onApprove(request)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => onReturn(request)}
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-300"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => onReject(request)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {request.status === 'Approved' && request.approvedBy
                        ? `Approved by ${request.approvedBy}`
                        : request.status}
                    </span>
                  )}
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
