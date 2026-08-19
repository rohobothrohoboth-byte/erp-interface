import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, BadgePlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface AnnualLeaveSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddLeave?: () => void;
}

const AnnualLeaveSearchFilters: React.FC<AnnualLeaveSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  onAddLeave
}) => {
  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasSearchTerm = searchTerm !== '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex flex-col gap-4">
        {/* 🔍 Search Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input */}
          <div className="w-full lg:flex-1">
            <div className="relative w-full max-w-md">
              <label htmlFor="leave-search" className="sr-only">
                Search Annual Leave
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="leave-search"
                name="leave-search"
                type="text"
                placeholder="Search by leave type, comments, or status..."
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Clear search "X" button */}
              {hasSearchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Leave Button */}
          <div className="flex justify-end w-full lg:w-auto">
            <Button
              onClick={onAddLeave}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white cursor-pointer"
            >
              <BadgePlus className="w-4 h-4" />
              Add Leave
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnnualLeaveSearchFilters;