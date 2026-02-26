import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '../../../../ui/input';

interface ExpenseApprovalSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function ExpenseApprovalSearchFilter({
  searchTerm,
  setSearchTerm,
}: ExpenseApprovalSearchFilterProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by account, category, justification, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
