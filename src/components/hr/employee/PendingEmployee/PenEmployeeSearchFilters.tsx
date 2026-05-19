import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { EmpState, EmpNature, Gender } from '../../../../types/hr/enum';
import { useDepartmentNames, useBranchComp } from '../../../../services/List/hrmmNames/hrmmNames.queries';

export interface HREmployeeFilters {
  department: string;
  branch: string;
  empState: string;
  empNature: string;
  gender: string;
}

interface EmployeeSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: HREmployeeFilters;
  setFilters: (filters: HREmployeeFilters) => void;
  employees?: any[];
  onRefresh?: () => void;
  loading?: boolean;
}

const PenEmployeeSearchFilters: React.FC<EmployeeSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const { data: departments = [] } = useDepartmentNames();
  const { data: branches = [] } = useBranchComp();

  const handleFilterChange = (key: keyof HREmployeeFilters, value: string) => {
    setFilters({ ...filters, [key]: value === '__all__' ? '' : value });
  };

  const clearAllFilters = () => {
    setFilters({ department: '', branch: '', empState: '', empNature: '', gender: '' });
    setSearchTerm('');
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasSearchTerm = searchTerm !== '';
    const clearSearch = () => setSearchTerm('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex flex-col gap-3">
        {/* Search + Actions Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="relative w-full max-w-md">
            <label htmlFor="hr-emp-search" className="sr-only">Search Employees</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="hr-emp-search"
              type="text"
              placeholder="Search by name, code, department, position..."
              className="block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {hasSearchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {(activeFilterCount > 0 || hasSearchTerm) && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-md transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}

          </div>
        </div>

        {/* Filter Dropdowns */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
                {/* Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <Select
                    value={filters.empState || '__all__'}
                    onValueChange={(v) => handleFilterChange('empState', v)}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Statuses</SelectItem>
                      {Object.entries(EmpState).map(([key, label]) => (
                        <SelectItem key={key} value={label}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Department</label>
                  <Select
                    value={filters.department || '__all__'}
                    onValueChange={(v) => handleFilterChange('department', v)}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Branch</label>
                  <Select
                    value={filters.branch || '__all__'}
                    onValueChange={(v) => handleFilterChange('branch', v)}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Branches</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Nature */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Emp. Nature</label>
                  <Select
                    value={filters.empNature || '__all__'}
                    onValueChange={(v) => handleFilterChange('empNature', v)}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Types</SelectItem>
                      {Object.entries(EmpNature).map(([key, label]) => (
                        <SelectItem key={key} value={label}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Gender</label>
                  <Select
                    value={filters.gender || '__all__'}
                    onValueChange={(v) => handleFilterChange('gender', v)}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="All Genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Genders</SelectItem>
                      {Object.entries(Gender).map(([key, label]) => (
                        <SelectItem key={key} value={label}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PenEmployeeSearchFilters;
