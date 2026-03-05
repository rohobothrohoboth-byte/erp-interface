import { motion } from 'framer-motion';
import { Plus, Search, X, BadgePlus } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';

interface BudgetExpensesSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddClick: () => void;
  totalRequested: number;
  expenseCount: number;
}

export default function BudgetExpensesSearchFilter({
  searchTerm,
  setSearchTerm,
  onAddClick,
  totalRequested,
}: BudgetExpensesSearchFilterProps) {
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
      className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
          <Input
            placeholder="Search expenses..."
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
        
        <div className="flex items-center gap-4">
          {/* Total Requested Display */}
          <div className="text-right px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-200 flex">
            <p className="text-sm text-gray-700 font-medium">Total Requested: </p>
            <p className="text-sm font-bold text-gray-800"> {formatCurrency(totalRequested)}</p>
          </div>
          
          <Button 
            onClick={onAddClick} 
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            <BadgePlus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
