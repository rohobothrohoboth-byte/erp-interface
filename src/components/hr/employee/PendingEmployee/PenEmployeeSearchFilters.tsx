import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Filter,
  Building2,
  Users,
  Briefcase,
  MapPin,
  UserCheck,
  Sparkles
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { EmpState, EmpNature, Gender } from '../../../../types/hr/enum';
import { useDepartmentNames, useBranchComp } from '../../../../services/List/hrmmNames/hrmmNames.queries';
import { useLanguage } from '../../../../i18n/LanguageContext';

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
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case 'department':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'branch':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'empState':
        return <UserCheck className="w-3.5 h-3.5" />;
      case 'empNature':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'gender':
        return <Users className="w-3.5 h-3.5" />;
      default:
        return <Filter className="w-3.5 h-3.5" />;
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

          <div className="p-5">
            <div className="flex flex-col gap-4">
              {/* Search + Actions Row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-2xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                    <div className={`relative flex items-center border rounded-xl transition-all duration-200 ${
                        isFocused
                            ? 'border-amber-400 shadow-md ring-2 ring-amber-200'
                            : 'border-slate-200 hover:border-amber-300'
                    }`}>
                      <Search className={`absolute left-4 w-4 h-4 transition-colors duration-200 ${
                          isFocused ? 'text-amber-500' : 'text-slate-400'
                      }`} />
                      <input
                          type="text"
                          placeholder={t.searchPendingPlaceholder || "Search pending employees by name, code, department, or position..."}
                          className="block w-full pl-11 pr-11 py-3 text-sm bg-white rounded-xl placeholder:text-slate-400 focus:outline-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                      />
                      {hasSearchTerm && (
                          <button
                              type="button"
                              onClick={clearSearch}
                              className="absolute right-4 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                      )}
                    </div>
                  </div>

                  {!hasSearchTerm && !isFocused && (
                      <div className="absolute -bottom-6 left-4 text-xs text-slate-400">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {t.searchTip || "Search by employee name, code, or department"}
                      </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                          showFilters || activeFilterCount > 0
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600'
                      }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{t.filters || "Filters"}</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {activeFilterCount}
                    </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {(activeFilterCount > 0 || hasSearchTerm) && (
                      <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          type="button"
                          onClick={clearAllFilters}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                        {t.clearAll || "Clear All"}
                      </motion.button>
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
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                          <FilterGroup
                              label={t.employmentStatus || "Employment Status"}
                              icon={getFilterIcon('empState')}
                              value={filters.empState || '__all__'}
                              onValueChange={(v) => handleFilterChange('empState', v)}
                              placeholder={t.allStatuses || "All Statuses"}
                          >
                            <SelectItem value="__all__">{t.allStatuses || "All Statuses"}</SelectItem>
                            {Object.entries(EmpState).map(([key, label]) => (
                                <SelectItem key={key} value={label}>{label}</SelectItem>
                            ))}
                          </FilterGroup>

                          <FilterGroup
                              label={t.department || "Department"}
                              icon={getFilterIcon('department')}
                              value={filters.department || '__all__'}
                              onValueChange={(v) => handleFilterChange('department', v)}
                              placeholder={t.allDepartments || "All Departments"}
                          >
                            <SelectItem value="__all__">{t.allDepartments || "All Departments"}</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                            ))}
                          </FilterGroup>

                          <FilterGroup
                              label={t.branch || "Branch"}
                              icon={getFilterIcon('branch')}
                              value={filters.branch || '__all__'}
                              onValueChange={(v) => handleFilterChange('branch', v)}
                              placeholder={t.allBranches || "All Branches"}
                          >
                            <SelectItem value="__all__">{t.allBranches || "All Branches"}</SelectItem>
                            {branches.map((b) => (
                                <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                            ))}
                          </FilterGroup>

                          <FilterGroup
                              label={t.employmentNature || "Employment Nature"}
                              icon={getFilterIcon('empNature')}
                              value={filters.empNature || '__all__'}
                              onValueChange={(v) => handleFilterChange('empNature', v)}
                              placeholder={t.allTypes || "All Types"}
                          >
                            <SelectItem value="__all__">{t.allTypes || "All Types"}</SelectItem>
                            {Object.entries(EmpNature).map(([key, label]) => (
                                <SelectItem key={key} value={label}>{label}</SelectItem>
                            ))}
                          </FilterGroup>

                          <FilterGroup
                              label={t.gender || "Gender"}
                              icon={getFilterIcon('gender')}
                              value={filters.gender || '__all__'}
                              onValueChange={(v) => handleFilterChange('gender', v)}
                              placeholder={t.allGenders || "All Genders"}
                          >
                            <SelectItem value="__all__">{t.allGenders || "All Genders"}</SelectItem>
                            {Object.entries(Gender).map(([key, label]) => (
                                <SelectItem key={key} value={label}>{label}</SelectItem>
                            ))}
                          </FilterGroup>
                        </div>

                        {activeFilterCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 pt-3 border-t border-slate-100"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-500">{t.activeFilters || "Active filters:"}</span>
                                {Object.entries(filters).map(([key, value]) =>
                                        value && (
                                            <span key={key} className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg">
                                {getFilterIcon(key)}
                                              {key === 'empState' ? 'Status' : key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                              <button
                                                  onClick={() => handleFilterChange(key as keyof HREmployeeFilters, '__all__')}
                                                  className="ml-1 hover:text-amber-900"
                                              >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                                        )
                                )}
                              </div>
                            </motion.div>
                        )}
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
  );
};

// Filter Group Component
interface FilterGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  children: React.ReactNode;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
                                                   label,
                                                   icon,
                                                   value,
                                                   onValueChange,
                                                   placeholder,
                                                   children
                                                 }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-10 px-3 bg-slate-50 border-slate-200 rounded-lg text-sm hover:border-amber-300 transition-colors">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </div>
);

export default PenEmployeeSearchFilters;