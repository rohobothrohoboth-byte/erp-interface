import { motion } from 'framer-motion';
import { Search, X, BadgePlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface FilterState {
  searchTerm: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string;
  slaStatus?: string;
}

interface TicketsSearchFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onAddClick: () => void;
}

export default function TicketsSearchFilter({ filters, onFiltersChange, onAddClick }: TicketsSearchFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tickets by title, description, or customer..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          {filters.searchTerm && (
            <button
              onClick={() => onFiltersChange({ ...filters, searchTerm: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          onClick={onAddClick}
          size="sm"
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
        >
          <BadgePlus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>
    </motion.div>
  );
}
