import React from 'react';
import { motion } from 'framer-motion';
import { Search, BadgePlus, Grid, List, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { JobGradeListDto } from '@/modules/hr/types/jobgrade';

interface JobGradeSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: {
    minSalary: number | '';
    maxSalary: number | '';
  };
  setFilters: (filters: any) => void;
  jobGrades: JobGradeListDto[];
  onAddClick: () => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const JobGradeSearchFilters: React.FC<JobGradeSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  onAddClick,
  viewMode,
  setViewMode,
}) => {
  const handleSalaryFilterChange = (field: 'minSalary' | 'maxSalary', value: string) => {
    setFilters({
      ...filters,
      [field]: value === '' ? '' : Number(value),
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearMinSalary = () => {
    setFilters({
      ...filters,
      minSalary: '',
    });
  };

  const clearMaxSalary = () => {
    setFilters({
      ...filters,
      maxSalary: '',
    });
  };

  // const clearAllFilters = () => {
  //   setSearchTerm('');
  //   setFilters({
  //     minSalary: '',
  //     maxSalary: '',
  //   });
  // };

  // const hasActiveFilters = searchTerm !== '' || filters.minSalary !== '' || filters.maxSalary !== '';

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
          <label htmlFor="jobgrade-search" className="sr-only">
            Search job grades
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="jobgrade-search"
              name="jobgrade-search"
              placeholder="Search job grades by name..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer rounded-r-md transition-colors"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* 🎚 Filters + Add Button */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto items-center justify-end">
          {/* Salary Filters + View Mode */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Salary Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Min Salary Input */}
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Min Salary"
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 pr-8"
                  value={filters.minSalary}
                  onChange={(e) => handleSalaryFilterChange('minSalary', e.target.value)}
                />
                {filters.minSalary !== '' && (
                  <button
                    onClick={clearMinSalary}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer rounded-r-md transition-colors"
                  >
                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <span className="hidden sm:block text-gray-400">–</span>

              {/* Max Salary Input */}
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Max Salary"
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 pr-8"
                  value={filters.maxSalary}
                  onChange={(e) => handleSalaryFilterChange('maxSalary', e.target.value)}
                />
                {filters.maxSalary !== '' && (
                  <button
                    onClick={clearMaxSalary}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer rounded-r-md transition-colors"
                  >
                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800 whitespace-nowrap"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
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

            {/* Clear All Filters Button (only shown when multiple filters are active) */}
            {/* {hasActiveFilters && (searchTerm && (filters.minSalary !== '' || filters.maxSalary !== '')) && (
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap gap-2"
                onClick={clearAllFilters}
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )} */}
          </div>

          {/* ➕ Add Job Grade Button */}
          <Button
            onClick={onAddClick}
            size="sm"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto cursor-pointer"
          >
            <BadgePlus className="h-4 w-4" />
            Add Job Grade
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default JobGradeSearchFilters;