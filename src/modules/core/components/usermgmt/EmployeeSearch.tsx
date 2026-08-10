// components/core/usermgmt/EmployeeSearch.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgePlus, Search, X, SlidersHorizontal, ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { EmpState, Gender } from '@/modules/hr/types/enum';
import { useDepartmentNames, useBranchComp } from '@/modules/list/services/hrmmNames/hrmmNames.queries';
import { useRoles } from '@/modules/list/services/auth/authList.queries';

export interface AdminEmployeeFilters {
  department: string;
  branch: string;
  empState: string;
  role: string;
  gender: string;
}

interface EmployeeSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: AdminEmployeeFilters;
  setFilters: (filters: AdminEmployeeFilters) => void;
  onRefresh?: () => void;
  loading?: boolean;
  onAddEmployee?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
                                                         searchTerm,
                                                         setSearchTerm,
                                                         filters,
                                                         setFilters,
                                                         onRefresh,
                                                         loading = false,
                                                         onAddEmployee,
                                                         placeholder = "Search by name, code, department, position...",
                                                         disabled = false,
                                                       }) => {
  const [showFilters, setShowFilters] = useState(false);

  // Data fetching
  const { data: departments = [], isLoading: isLoadingDepts } = useDepartmentNames();
  const { data: branches = [], isLoading: isLoadingBranches } = useBranchComp();
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();

  // Handlers
  const handleAddEmployee = useCallback(() => {
    onAddEmployee?.();
  }, [onAddEmployee]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleFilterChange = useCallback((key: keyof AdminEmployeeFilters, value: string) => {
    setFilters({
      ...filters,
      [key]: value === '__all__' ? '' : value
    });
  }, [filters, setFilters]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      department: '',
      branch: '',
      empState: '',
      role: '',
      gender: ''
    });
    setSearchTerm('');
    setShowFilters(false);
  }, [setFilters, setSearchTerm]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  // Computed values
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const hasSearchTerm = searchTerm !== '';
  const hasActiveFilters = activeFilterCount > 0 || hasSearchTerm;
  const isFiltersButtonActive = showFilters || hasActiveFilters;

  // Filter configuration for rendering
  const filterConfigs = [
    {
      key: 'empState' as const,
      label: 'Status',
      placeholder: 'All Statuses',
      options: Object.entries(EmpState).map(([key, label]) => ({ value: label, label })),
    },
    {
      key: 'department' as const,
      label: 'Department',
      placeholder: 'All Departments',
      options: departments.map(dept => ({ value: dept.name, label: dept.name })),
      isLoading: isLoadingDepts,
    },
    {
      key: 'branch' as const,
      label: 'Branch',
      placeholder: 'All Branches',
      options: branches.map(b => ({ value: b.name, label: b.name })),
      isLoading: isLoadingBranches,
    },
    {
      key: 'role' as const,
      label: 'Role',
      placeholder: 'All Roles',
      options: roles.map(r => ({ value: r.role, label: r.role })),
      isLoading: isLoadingRoles,
    },
    {
      key: 'gender' as const,
      label: 'Gender',
      placeholder: 'All Genders',
      options: Object.entries(Gender).map(([key, label]) => ({ value: label, label })),
    },
  ];

  return (
      <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex flex-col gap-3">
          {/* Search + Actions Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                  type="text"
                  placeholder={placeholder}
                  disabled={disabled || loading}
                  className={`
                block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md text-sm 
                bg-white placeholder-gray-500 focus:outline-none focus:ring-2 
                focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
                ${disabled || loading ? 'bg-gray-50 cursor-not-allowed' : ''}
              `}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              {hasSearchTerm && !disabled && !loading && (
                  <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              {onRefresh && (
                  <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={loading}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                      title="Refresh"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
              )}

              {/* Filters Toggle Button */}
              <button
                  type="button"
                  onClick={toggleFilters}
                  disabled={disabled}
                  className={`
                flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border transition-all duration-200
                ${isFiltersButtonActive && !disabled
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                  aria-expanded={showFilters}
                  aria-label="Toggle filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                    <span className="ml-1 bg-emerald-500 text-white text-xs rounded-full min-w-[1rem] h-4 px-1 flex items-center justify-center">
                  {activeFilterCount}
                </span>
                )}
                <ChevronDown className={`
                h-3 w-3 transition-transform duration-200 
                ${showFilters ? 'rotate-180' : ''}
              `} />
              </button>

              {/* Clear All Button */}
              {hasActiveFilters && !disabled && (
                  <button
                      type="button"
                      onClick={clearAllFilters}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700
                  border border-red-200 hover:bg-red-50 rounded-md transition-all duration-200"
                      aria-label="Clear all filters"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Clear all</span>
                  </button>
              )}

              {/* Add Employee Button */}
              {onAddEmployee && (
                  <Button
                      onClick={handleAddEmployee}
                      size="sm"
                      disabled={disabled}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600
                  hover:from-emerald-600 hover:to-emerald-700 text-white cursor-pointer
                  transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <BadgePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Employee</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          <AnimatePresence initial={false}>
            {showFilters && !disabled && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
                    {filterConfigs.map((config) => (
                        <div key={config.key} className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-500">
                            {config.label}
                          </label>
                          <Select
                              value={filters[config.key] || '__all__'}
                              onValueChange={(v) => handleFilterChange(config.key, v)}
                              disabled={config.isLoading || disabled}
                          >
                            <SelectTrigger size="sm" className="w-full">
                              <SelectValue placeholder={config.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">{config.placeholder}</SelectItem>
                              {config.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                    ))}
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Display */}
          {hasActiveFilters && showFilters && (
              <div className="flex flex-wrap gap-2 pt-2">
                {Object.entries(filters).map(([key, value]) => (
                    value && (
                        <span
                            key={key}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-md"
                        >
                  {key}: {value}
                          <button
                              onClick={() => handleFilterChange(key as keyof AdminEmployeeFilters, '__all__')}
                              className="hover:text-emerald-900"
                          >
                    <X className="h-3 w-3" />
                  </button>
                </span>
                    )
                ))}
                {hasSearchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-md">
                Search: {searchTerm}
                      <button onClick={clearSearch} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
                )}
              </div>
          )}
        </div>
      </motion.div>
  );
};

export default React.memo(EmployeeSearch);