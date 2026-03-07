import { MoreVertical, PenBox, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../../ui/dropdown-menu';
import { motion } from 'framer-motion';
import type { Budget } from './types';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';

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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const statusClasses: Record<string, string> = {
   Active: 'bg-[#e8f5e9] text-[#2e7d32]',
  Draft: 'bg-[#fff8e1] text-[#f57f17]',
  Closed: 'bg-[#f5f5f5] text-[#757575]',
};

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

  return (
    <div className="space-y-6">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
        }}
      >
        {paginatedBudgets.map((budget) => (
          <motion.div
            key={budget.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <Card
              className="group relative rounded-xl border border-[#e5e7eb] bg-white p-0 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[#818cf8]/30"
            >
              {/* Top accent line */}
           <div className="h-[3px] bg-gradient-to-r from-[#6366f1]/60 to-[#6366f1]/20" />

              <div className="px-5 pb-3 pt-1 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0 flex-1 pr-2">
                    <h4 className="text-sm font-semibold text-[#111827] truncate leading-tight">
                      {budget.name}
                    </h4>
                    <div className="flex items-center gap-1.5">
                     <span className="text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] px-1.5 py-0.5 rounded">
                        {budget.fiscalYear}
                      </span>
                      <span className="text-[11px] text-[#6b7280] truncate">
                        {budget.costCenter}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => onViewVersions(budget)} className="gap-2 text-xs">
                        <Eye size={14} /> View Versions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(budget)} className="gap-2 text-xs">
                        <PenBox size={14} /> Edit
                      </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => onDelete(budget)} className="gap-2 text-xs text-[#ef4444]">
                        <Trash2 size={14} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Amount */}
                <div>
   <p className="text-[11px] text-[#6b7280] uppercase tracking-wider mb-0.5">
                    Total Budget
                  </p>
               <p className="text-2xl font-bold tracking-tight text-[#111827] tabular-nums">
                    {formatCurrency(budget.totalAmount)}
                  </p>
                </div>

                {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#e5e7eb]">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                      statusClasses[budget.status] || statusClasses.Closed
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
                    {budget.status}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
        className="h-7 text-xs text-[#6366f1] hover:text-[#6366f1] hover:bg-[#eef2ff]"
                    onClick={() => onViewVersions(budget)}
                  >
                    View Versions →
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-[#e5e7eb]">
          <p className="text-xs text-[#6b7280]">
            {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'ghost'}
                size="icon"
                className="h-7 w-7 text-xs"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCardView;
