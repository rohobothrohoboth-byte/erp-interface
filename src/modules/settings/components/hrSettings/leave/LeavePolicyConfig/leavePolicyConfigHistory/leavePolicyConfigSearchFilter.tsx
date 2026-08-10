import React from "react";
import { motion } from "framer-motion";
import { Search, BadgePlus, X, FileText } from "lucide-react";

interface LeavePolicyConfigSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const LeavePolicyConfigSearchFilters: React.FC<
  LeavePolicyConfigSearchFiltersProps
> = ({ searchTerm, setSearchTerm }) => {
  const clearSearch = () => {
    setSearchTerm("");
  };

  const hasSearchTerm = searchTerm !== "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="w-full lg:flex-1">
          <div className="relative w-full max-w-md">
            <label htmlFor="leave-policy-config" className="sr-only">
              Search Leave Policy Config
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="leave-policy-config"
              name="leave-policy-config"
              placeholder="Search Leave Policy Config"
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

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
      </div>
    </motion.div>
  );
};

export default LeavePolicyConfigSearchFilters;