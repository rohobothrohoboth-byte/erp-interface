import { Search, X } from "lucide-react";
import AddDeptModal from "@/modules/core/components/department/AddDeptModal";
import type { AddDeptDto } from "@/modules/core/types/dept";

interface DepartmentSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddDepartment: (department: AddDeptDto) => void;
  selectedBranchId?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const DepartmentSearchFilters = ({
                                   searchTerm,
                                   setSearchTerm,
                                   onAddDepartment,
                                 }: DepartmentSearchFiltersProps) => {
  const clearSearch = () => setSearchTerm('');

  return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                  type="text"
                  placeholder="Search departments by name, status..."
                  className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                  <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <AddDeptModal onAddDepartment={onAddDepartment} />
        </div>
      </div>
  );
};

export default DepartmentSearchFilters;