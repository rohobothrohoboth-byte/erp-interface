import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

interface ExpenseApprovalSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  totalRequested: number;
  approvedTotal: number;
}

export default function ExpenseApprovalSearchFilter({
  searchTerm,
  setSearchTerm,
  totalRequested,
  approvedTotal,
}: ExpenseApprovalSearchFilterProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-sm border border-indigo-200 p-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by account, category, justification, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Amount Display - Flex Row */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total Requested:</span>
              <span className="text-sm font-bold text-indigo-600">{formatCurrency(totalRequested)}</span>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Approved:</span>
              <span className="text-sm font-bold text-green-600">{formatCurrency(approvedTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
