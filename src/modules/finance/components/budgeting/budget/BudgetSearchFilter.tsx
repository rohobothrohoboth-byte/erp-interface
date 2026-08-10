import { motion } from 'framer-motion';
import { Search, X, Grid, List, BadgePlus } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface BudgetSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdd: () => void;
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
}

export default function BudgetSearchFilter({
  searchTerm,
  setSearchTerm,
  onAdd,
  viewMode,
  onViewModeChange
}: BudgetSearchFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200"
    >
      <div className="flex md:items-center md:justify-between md:flex-row flex-col gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
          <Input
            placeholder="Search budgets by name, fiscal year, or cost center..."
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
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto items-center justify-end">
          {/* Filters + View Mode */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer border-indigo-300 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 whitespace-nowrap"
              onClick={() => onViewModeChange(viewMode === "card" ? "table" : "card")}
            >
              {viewMode === "card" ? (
                <>
                  <List className="h-4 w-4" />
                  List View
                </>
              ) : (
                <>
                  <Grid className="h-4 w-4" />
                  Grid View
                </>
              )}
            </Button>
          </div>

          {/* ➕ Add Budget Button */}
          <Button
            onClick={onAdd}
            size="sm"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap w-full sm:w-auto cursor-pointer"
          >
            <BadgePlus className="h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
