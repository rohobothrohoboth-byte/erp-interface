import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { MoreVertical, PenBox, Trash2, Settings, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import type { BudgetPlan } from '@/modules/finance/components/budgeting/budgetPlan/BudgetPlanSection';

interface BudgetPlanGridViewProps {
  budgetPlans: BudgetPlan[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEdit: (plan: BudgetPlan) => void;
  onDelete: (plan: BudgetPlan) => void;
  onManageExpenses: (plan: BudgetPlan) => void;
}

const BudgetPlanGridView: React.FC<BudgetPlanGridViewProps> = ({
  budgetPlans,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onEdit,
  onDelete,
  onManageExpenses,
}) => {
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlans = budgetPlans.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Submitted':
        return 'bg-gray-100 text-gray-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-yellow-100 text-yellow-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {paginatedPlans.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400">
            No budget plans found.
          </div>
        ) : (
          paginatedPlans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="relative rounded-xl border border-gray-200 shadow-sm p-3 transition hover:shadow-md">
                {/* Header with title and actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FileText className="text-indigo-600 h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-black truncate">{plan.fiscalYear}</h4>
                      <span className="text-xs text-gray-500 truncate block">{plan.costCenter}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(plan)}
                        className='flex items-center gap-2'>
                        <PenBox size={16} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(plan)}
                        className="flex items-center gap-2 text-red-600 data-[highlighted]:!bg-red-50 data-[highlighted]:text-red-700"
                      >
                        <Trash2 size={16} className="text-red-600" />
                        <p className="text-red-600">Delete</p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Amount, Expenses, and Status */}
                <div className="space-y-1.5 py-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Requested</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(plan.totalRequested)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Expenses</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {plan.expenseCount} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <Button
                    className="w-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 cursor-pointer h-8"
                    size="sm"
                    onClick={() => onManageExpenses(plan)}
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Manage Expenses
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={
                    currentPage === page
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlanGridView;
