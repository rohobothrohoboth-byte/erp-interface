import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import {
  BadgePlus,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Filter,
  Users,
  Building2,
  Briefcase,
  UserCheck,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { EmpState, EmpNature, Gender } from '@/modules/hr/types/enum';
import { useDepartmentNames, useBranchComp } from '@/modules/list/services/hrmmNames/hrmmNames.queries';

// ============================================================
// TYPES
// ============================================================

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
  onAddEmployee?: () => void;
}

// ============================================================
// ✅ MAPPING: Display Name → API Value
// ============================================================

const EMP_STATE_MAPPING: Record<string, string> = {
  'Pending': 'Pen',           // Display → Enum Name
  'Approved': 'Approved',
  'Active': 'Active',
  'Under Probation': 'Sus',
  'Suspended/Under Probation': 'Sus',
  'Terminated': 'Term',
  'Stand By': 'StandBy',
  'Retired': 'Retire',
  'On Leave': 'Leave',
  'Rejected': 'Rej',
};

// ============================================================
// ✅ ENUM HELPERS - Get options for select dropdowns
// ============================================================

const getEnumOptions = (enumObj: any): Array<{ key: string; displayName: string }> => {
  if (!enumObj || typeof enumObj !== 'object') {
    console.warn('⚠️ getEnumOptions: enumObj is null or not an object', enumObj);
    return [];
  }

  const options: Array<{ key: string; displayName: string }> = [];
  const entries = Object.entries(enumObj);

  for (const [key, value] of entries) {
    const isNumericKey = !isNaN(Number(key));
    const isReverseMapping = isNumericKey && typeof value === 'string' && Object.values(enumObj).includes(key);

    if (isReverseMapping) {
      continue;
    }

    let displayName: string;
    let optionKey: string;

    if (typeof value === 'string') {
      displayName = value;
      optionKey = value;
    } else if (typeof key === 'string') {
      displayName = key;
      optionKey = key;
    } else {
      displayName = String(key);
      optionKey = String(key);
    }

    options.push({
      key: optionKey,
      displayName: displayName,
    });
  }

  options.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return options;
};

// ============================================================
// FILTER GROUP COMPONENT
// ============================================================

interface FilterGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
                                                   label,
                                                   icon,
                                                   value,
                                                   onValueChange,
                                                   placeholder,
                                                   children,
                                                   disabled = false,
                                                 }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
          {children}
        </SelectContent>
      </Select>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const EmployeeSearchFilters: React.FC<EmployeeSearchFiltersProps> = ({
                                                                       searchTerm,
                                                                       setSearchTerm,
                                                                       filters,
                                                                       setFilters,
                                                                       onAddEmployee,
                                                                       loading = false,
                                                                     }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { permissions, role } = useAuthStore();

  const {
    data: departments = [],
    isLoading: deptLoading,
    error: deptError,
  } = useDepartmentNames();

  const {
    data: branches = [],
    isLoading: branchLoading,
    error: branchError,
  } = useBranchComp();

  const isLoading = deptLoading || branchLoading;

  // ============================================================
  // PERMISSION CHECK
  // ============================================================

  const canAddEmployee = useMemo(() => {
    if (!permissions?.length) return false;
    if (role === 'admin' || role === 'super_admin') return true;
    return permissions.some((module: any) =>
        module.M?.some((menu: any) =>
            menu.A?.includes('hr.emp.add') ||
            menu.C?.some((child: any) => child.A?.includes('hr.emp.add'))
        )
    );
  }, [permissions, role]);

  // ============================================================
  // GET ENUM OPTIONS
  // ============================================================

  const empStateOptions = useMemo(() => {
    const options = getEnumOptions(EmpState);
    if (options.length === 0) {
      return [
        { key: 'Pending', displayName: 'Pending' },
        { key: 'Approved', displayName: 'Approved' },
        { key: 'Active', displayName: 'Active' },
        { key: 'Under Probation', displayName: 'Under Probation' },
        { key: 'Terminated', displayName: 'Terminated' },
        { key: 'StandBy', displayName: 'Stand By' },
        { key: 'Retired', displayName: 'Retired' },
        { key: 'On Leave', displayName: 'On Leave' },
      ];
    }
    return options;
  }, []);

  const empNatureOptions = useMemo(() => {
    const options = getEnumOptions(EmpNature);
    if (options.length === 0) {
      return [
        { key: 'Permanent / Full-time', displayName: 'Permanent / Full-time' },
        { key: 'Contract / Fixed-term', displayName: 'Contract / Fixed-term' },
        { key: 'Probation', displayName: 'Probation' },
        { key: 'Intern / Trainee', displayName: 'Intern / Trainee' },
        { key: 'Part-time / Casual', displayName: 'Part-time / Casual' },
      ];
    }
    return options;
  }, []);

  const genderOptions = useMemo(() => {
    const options = getEnumOptions(Gender);
    if (options.length === 0) {
      return [
        { key: 'Male', displayName: 'Male' },
        { key: 'Female', displayName: 'Female' },
      ];
    }
    return options;
  }, []);

  // ============================================================
  // ✅ HANDLERS - Map display name to API value
  // ============================================================

  const handleAddEmployee = onAddEmployee || (() => navigate('/hr/employees/record/Add'));

  const clearSearch = () => setSearchTerm('');

  // EmployeeSearchFilters.tsx - Fix handleFilterChange

  const handleFilterChange = (key: keyof HREmployeeFilters, value: string) => {
    console.log(`📊 Filter change: ${key} = ${value}`);

    if (value === '__all__') {
      setFilters({ ...filters, [key]: '' });
      return;
    }

    // For branch, extract just the branch name if it has "=>"
    if (key === 'branch') {
      // If value contains "=>", extract the branch name (first part)
      const parts = value.split('=>');
      const branchName = parts[0].trim();
      console.log(`📊 Extracted branch name: "${branchName}" from "${value}"`);
      setFilters({ ...filters, [key]: branchName });
      return;
    }

    // For empState, map display name to enum name for API
    if (key === 'empState') {
      const mappedValue = EMP_STATE_MAPPING[value] || value;
      console.log(`📊 Mapping empState: "${value}" → "${mappedValue}"`);
      setFilters({ ...filters, [key]: mappedValue });
      return;
    }

    setFilters({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    setFilters({
      department: '',
      branch: '',
      empState: '',
      empNature: '',
      gender: '',
    });
    setSearchTerm('');
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasSearchTerm = searchTerm !== '';

  // ============================================================
  // HELPERS
  // ============================================================

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case 'department': return <Building2 className="w-3.5 h-3.5" />;
      case 'branch': return <Building2 className="w-3.5 h-3.5" />;
      case 'empState': return <UserCheck className="w-3.5 h-3.5" />;
      case 'empNature': return <Briefcase className="w-3.5 h-3.5" />;
      case 'gender': return <Users className="w-3.5 h-3.5" />;
      default: return <Filter className="w-3.5 h-3.5" />;
    }
  };

  const getFilterLabel = (key: string): string => {
    const labels: Record<string, string> = {
      department: t.department || 'Department',
      branch: t.branch || 'Branch',
      empState: t.employmentStatus || 'Employment Status',
      empNature: t.employmentNature || 'Employment Nature',
      gender: t.gender || 'Gender',
    };
    return labels[key] || key;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="p-5">
            <div className="flex flex-col gap-4">
              {/* Search + Actions Row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-2xl">
                  <div
                      className={`relative flex items-center border rounded-xl transition-all ${
                          isFocused
                              ? 'border-emerald-400 shadow-md ring-2 ring-emerald-200 dark:ring-emerald-800'
                              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                  >
                    <Search
                        className={`absolute left-4 w-4 h-4 transition-colors ${
                            isFocused ? 'text-emerald-500' : 'text-slate-400'
                        }`}
                    />
                    <input
                        type="text"
                        placeholder={t.searchEmployeesPlaceholder || 'Search by name, employee code, department, or position...'}
                        className="block w-full pl-11 pr-11 py-3 text-sm bg-white dark:bg-slate-900 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-slate-800 dark:text-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    {hasSearchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-4 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                          showFilters || activeFilterCount > 0
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{t.filters || 'Filters'}</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {(activeFilterCount > 0 || hasSearchTerm) && (
                      <button
                          onClick={clearAllFilters}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                      >
                        <X className="w-4 h-4" /> {t.clearAll || 'Clear All'}
                      </button>
                  )}

                  {canAddEmployee && (
                      <button
                          onClick={handleAddEmployee}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <BadgePlus className="w-4 h-4" /> {t.addEmployee || 'Add Employee'}
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
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                              <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Loading filters...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                              {/* ✅ Employment Status - Shows display names, sends mapped values */}
                              <FilterGroup
                                  label={t.employmentStatus || 'Employment Status'}
                                  icon={getFilterIcon('empState')}
                                  value={filters.empState ? Object.keys(EMP_STATE_MAPPING).find(k => EMP_STATE_MAPPING[k] === filters.empState) || '__all__' : '__all__'}
                                  onValueChange={(v) => handleFilterChange('empState', v)}
                                  placeholder={t.allStatuses || 'All Statuses'}
                                  disabled={empStateOptions.length === 0}
                              >
                                <SelectItem value="__all__">{t.allStatuses || 'All Statuses'}</SelectItem>
                                {empStateOptions.map(({ key, displayName }) => (
                                    <SelectItem key={key} value={displayName}>
                                      {displayName}
                                    </SelectItem>
                                ))}
                              </FilterGroup>

                              {/* Department */}
                              <FilterGroup
                                  label={t.department || 'Department'}
                                  icon={getFilterIcon('department')}
                                  value={filters.department || '__all__'}
                                  onValueChange={(v) => handleFilterChange('department', v)}
                                  placeholder={t.allDepartments || 'All Departments'}
                                  disabled={departments.length === 0}
                              >
                                <SelectItem value="__all__">{t.allDepartments || 'All Departments'}</SelectItem>
                                {departments.map((dept: any) => (
                                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                                ))}
                              </FilterGroup>

                              {/* Branch */}


                              <FilterGroup
                                  label={t.branch || 'Branch'}
                                  icon={getFilterIcon('branch')}
                                  value={filters.branch || '__all__'}
                                  onValueChange={(v) => {
                                    // Extract just the branch name if it contains "=>"
                                    if (v && v.includes('=>')) {
                                      const parts = v.split('=>');
                                      const branchName = parts[0].trim();
                                      console.log(`📊 Extracted branch name: "${branchName}" from "${v}"`);
                                      handleFilterChange('branch', branchName);
                                    } else {
                                      handleFilterChange('branch', v);
                                    }
                                  }}
                                  placeholder={t.allBranches || 'All Branches'}
                                  disabled={branches.length === 0}
                              >
                                <SelectItem value="__all__">{t.allBranches || 'All Branches'}</SelectItem>
                                {branches.map((branch: any) => {
                                  // ✅ Get the branch name (without company)
                                  const displayName = branch.name || branch.branchName || branch.Name || branch.BranchName || 'Unknown';
                                  const value = displayName; // Only the branch name

                                  return (
                                      <SelectItem key={branch.id || branch.branchId || branch.Id} value={value}>
                                        {displayName}
                                      </SelectItem>
                                  );
                                })}
                              </FilterGroup>

                              {/* Employment Nature */}
                              <FilterGroup
                                  label={t.employmentNature || 'Employment Nature'}
                                  icon={getFilterIcon('empNature')}
                                  value={filters.empNature || '__all__'}
                                  onValueChange={(v) => handleFilterChange('empNature', v)}
                                  placeholder={t.allTypes || 'All Types'}
                                  disabled={empNatureOptions.length === 0}
                              >
                                <SelectItem value="__all__">{t.allTypes || 'All Types'}</SelectItem>
                                {empNatureOptions.map(({ key, displayName }) => (
                                    <SelectItem key={key} value={displayName}>{displayName}</SelectItem>
                                ))}
                              </FilterGroup>

                              {/* Gender */}
                              <FilterGroup
                                  label={t.gender || 'Gender'}
                                  icon={getFilterIcon('gender')}
                                  value={filters.gender || '__all__'}
                                  onValueChange={(v) => handleFilterChange('gender', v)}
                                  placeholder={t.allGenders || 'All Genders'}
                                  disabled={genderOptions.length === 0}
                              >
                                <SelectItem value="__all__">{t.allGenders || 'All Genders'}</SelectItem>
                                {genderOptions.map(({ key, displayName }) => (
                                    <SelectItem key={key} value={displayName}>{displayName}</SelectItem>
                                ))}
                              </FilterGroup>
                            </div>
                        )}

                        {/* Active Filters Display */}
                        {activeFilterCount > 0 && !isLoading && (
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-500 dark:text-slate-400">{t.activeFilters || 'Active filters:'}</span>
                                {Object.entries(filters).map(([key, value]) =>
                                        value ? (
                                            <span
                                                key={key}
                                                className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg border border-emerald-200 dark:border-emerald-800"
                                            >
                                {getFilterIcon(key)} {getFilterLabel(key)}: {key === 'empState' ? (Object.keys(EMP_STATE_MAPPING).find(k => EMP_STATE_MAPPING[k] === value) || value) : value}
                                              <button
                                                  onClick={() => handleFilterChange(key as keyof HREmployeeFilters, '__all__')}
                                                  className="ml-1 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors"
                                              >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                                        ) : null
                                )}
                              </div>
                            </div>
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

export default EmployeeSearchFilters;