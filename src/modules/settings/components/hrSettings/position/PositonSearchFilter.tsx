import React from "react";
import { motion } from "framer-motion";
import { Search, BadgePlus, Grid, List, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { PositionListDto  } from "@/modules/hr/types/position";

interface PositionSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  positionData: PositionListDto [];
  onAddClick: () => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

const PositionSearchFilters: React.FC<PositionSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  onAddClick,
  viewMode,
  setViewMode,
}) => {
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
        {/* 🔍 Search Input - Takes full width on mobile, left on desktop */}
        <div className="w-full lg:flex-1">
          <div className="relative w-full max-w-md">
            <label htmlFor="position-search" className="sr-only">
              Search Positions
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="position-search"
              name="position-search"
              placeholder="Search Positions"
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
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

        {/* 🎚 Controls - Positioned at the end */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* View Mode */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800 whitespace-nowrap w-full sm:w-auto"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
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
          </div>

          {/* ➕ Add Position Button */}
          <Button
            onClick={onAddClick}
            size="sm"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto"
          >
            <BadgePlus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PositionSearchFilters;