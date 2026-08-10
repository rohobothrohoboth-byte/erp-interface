import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface FilterState {
  searchTerm: string;
  stage: string;
  company: string;
  tags: string[];
  isActive: string;
  owner: string;
  dateRange: string;
}

interface AssignedContactsSearchFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export default function AssignedContactsSearchFilter({ filters, onFiltersChange, onClearFilters }: AssignedContactsSearchFilterProps) {
  const hasSearch = filters.searchTerm !== '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts by name, email, company..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          {hasSearch && (
            <button
              onClick={() => onFiltersChange({ ...filters, searchTerm: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
