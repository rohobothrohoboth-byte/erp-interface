import React from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface PolicyAssignmentRuleSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const PolicyAssignmentRuleSearchFilter: React.FC<
  PolicyAssignmentRuleSearchFilterProps
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
            <label htmlFor="policy-assignment-rule" className="sr-only">
              Search Policy Assignment Rules
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="policy-assignment-rule"
              name="policy-assignment-rule"
              placeholder="Search Policy Assignment Rules"
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

export default PolicyAssignmentRuleSearchFilter;