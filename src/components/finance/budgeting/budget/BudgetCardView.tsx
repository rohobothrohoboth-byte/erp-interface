import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { MoreVertical, PenBox, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../../ui/dropdown-menu';
import { motion } from 'framer-motion';
import type { Budget } from './types';

interface BudgetCardViewProps {
  budgets: Budget[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewVersions: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

const BudgetCardView: React.FC<BudgetCardViewProps> = ({
  budgets,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewVersions,
  onEdit,
  onDelete,
}) => {
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBudgets = budgets.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-indigo-100 text-indigo-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
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
        {paginatedBudgets.map((budget) => (
          <motion.div
            key={budget.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card className="group relative rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-lg hover:border-indigo-200">
              {/* Top */}
              <div className="flex items-start justify-between border-b pb-3">
                <div className="space-y-1">
                  <h4 className="text-[15px] font-semibold text-gray-900 truncate">
                    {budget.name}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2  rounded-md">
                      {budget.fiscalYear}
                    </span>

                    <span className="truncate">{budget.costCenter}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full opacity-60 hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => onViewVersions(budget)}
                      className="gap-2"
                    >
                      <Eye size={16} />
                      View Versions
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onEdit(budget)}
                      className="gap-2"
                    >
                      <PenBox size={16} />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onDelete(budget)}
                      className="gap-2 text-red-600"
                    >
                      <Trash2 size={16} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Amount + Status */}
              <div className="flex items-end justify-between ">
                <div>
                  <p className="text-xs text-gray-500">Total Budget</p>

                  <p className="text-xl font-semibold tracking-tight text-gray-900">
                    {formatCurrency(budget.totalAmount)}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    budget.status,
                  )}`}
                >
                  {budget.status}
                </span>
              </div>

              {/* Action */}
              <div className="flex justify-between items-center">
                <Button
                  className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
                  size="sm"
                  onClick={() => onViewVersions(budget)}
                >
                  View Versions
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} results
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={
                      currentPage === page
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    }
                  >
                    {page}
                  </Button>
                ),
              )}
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

export default BudgetCardView;
