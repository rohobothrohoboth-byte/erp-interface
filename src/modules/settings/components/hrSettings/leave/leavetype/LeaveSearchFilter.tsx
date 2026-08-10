import React from "react";
import { motion } from "framer-motion";
import { Search, BadgePlus, X, FileText, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LeaveSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddClick: () => void;
  onAssignClick?: () => void;
}

const LeaveSearchFilters: React.FC<LeaveSearchFiltersProps> = ({
                                                                 searchTerm,
                                                                 setSearchTerm,
                                                                 onAddClick,
                                                                 onAssignClick,
                                                               }) => {
  const clearSearch = () => {
    setSearchTerm("");
  };

  const hasSearchTerm = searchTerm !== "";

  const navigate = useNavigate();

  const onClick = () => {
    navigate(`/settings/hr/leave/leavePolicy`);
  };

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
              <label htmlFor="leave-search" className="sr-only">
                Search Leave Types
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                  id="leave-search"
                  name="leave-search"
                  placeholder="Search Leave Types"
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

          <Button
              onClick={onClick}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer border-emerald-200 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Leave Policy
          </Button>


          <Button
              onClick={onAddClick}
              size="sm"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto cursor-pointer"
          >
            <BadgePlus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </motion.div>
  );
};

export default LeaveSearchFilters;