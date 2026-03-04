import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, PenBox, Trash2, DollarSign } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';

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
  updatedAt?: string;
  updatedBy?: string;
}

interface AdditionalBudgetTableProps {
  requests: AdditionalBudgetRequest[];
  onEdit: (request: AdditionalBudgetRequest) => void;
  onDelete: (request: AdditionalBudgetRequest) => void;
}

export default function AdditionalBudgetTable({
  requests,
  onEdit,
  onDelete
}: AdditionalBudgetTableProps) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    {request.status === 'Returned' && request.rejectionReason && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Reason: {request.rejectionReason}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <Popover
                    open={popoverOpen === request.id}
                    onOpenChange={(open) =>
                      setPopoverOpen(open ? request.id : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <button className="text-gray-700 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="end">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onEdit(request);
                            setPopoverOpen(null);
                          }}
                          disabled={request.status !== 'Pending' && request.status !== 'Returned'}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded text-gray-500 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PenBox size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(request);
                            setPopoverOpen(null);
                          }}
                          disabled={request.status !== 'Pending' && request.status !== 'Returned'}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
