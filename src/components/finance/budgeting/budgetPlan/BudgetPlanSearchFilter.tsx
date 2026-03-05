import { motion } from 'framer-motion';
import { Search, X, Grid, List, BadgePlus } from 'lucide-react';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';

interface BudgetPlanSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddClick: () => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export default function BudgetPlanSearchFilter({
  searchTerm,
  setSearchTerm,
  onAddClick,
  viewMode,
  onViewModeChange
}: BudgetPlanSearchFilterProps) {
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
            placeholder="Search budget plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer border-indigo-300 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 whitespace-nowrap"
            onClick={() =>
              onViewModeChange(viewMode === "grid" ? "list" : "grid")
            }
          >
            {viewMode === "grid" ? (
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

          <Button
            onClick={onAddClick}
            size="sm"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            <BadgePlus className="w-4 h-4" />
            Add Budget Plan
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
