import React from 'react';
import { motion } from 'framer-motion';
import { Search, BadgePlus } from 'lucide-react';

interface JournalsSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddNew: () => void;
}

export const JournalsSearchFilters: React.FC<JournalsSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  onAddNew,
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
      className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search journals
          </label>
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search journals by number, description, account..."
              className="block w-full pl-10 pr-10 py-2 border border-indigo-300 rounded-md leading-5 bg-white placeholder-indigo-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {hasSearchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-indigo-400 hover:text-indigo-600 transition-colors duration-200"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="sr-only">Clear search</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onAddNew}
            className="bg-gradient-to-r cursor-pointer from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-200"
          >
            <BadgePlus size={20} />
            New Journal Entry
          </button>
        </div>
      </div>
    </motion.div>
  );
};