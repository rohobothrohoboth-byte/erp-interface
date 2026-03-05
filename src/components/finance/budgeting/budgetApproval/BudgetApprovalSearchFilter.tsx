import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '../../../ui/input';

interface BudgetApprovalSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function BudgetApprovalSearchFilter({
  searchTerm,
  setSearchTerm
}: BudgetApprovalSearchFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
          <Input
            placeholder="Search budget plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
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
      </div>
    </motion.div>
  );
}
