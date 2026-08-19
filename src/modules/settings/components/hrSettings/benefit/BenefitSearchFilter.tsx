import React from "react";
import { motion } from "framer-motion";
import { Search, BadgePlus, Grid, List, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { BenefitSetListDto } from "@/modules/hr/types/benefit";

interface BenefitSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  benefitSets: BenefitSetListDto[];
  onAddClick: () => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

const BenefitSearchFilters: React.FC<BenefitSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  onAddClick,
  viewMode,
  setViewMode,
}) => {
  const clearSearch = () => {
    setSearchTerm("");
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-wrap">
        {/* 🔍 Search Input */}
        <div className="w-full lg:flex-1">
          <label htmlFor="benefit-search" className="sr-only">
            Search Benefit settings
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="benefit-search"
              name="benefit-search"
              placeholder="Search Benefit settings"
              className="block w-1/2 pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer rounded-r-md transition-colors"
                style={{ right: '50%' }} // Adjust position for the 50% width input
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto items-center justify-end">
          {/* Filters + View Mode */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800 whitespace-nowrap"
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

          {/* ➕ Add Benefit Set Button */}
          <Button
            onClick={onAddClick}
            size="sm"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto cursor-pointer"
          >
            <BadgePlus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default BenefitSearchFilters;