import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { AddBranchDto } from "@/modules/core/types/branch";
import AddBranchModal from "@/modules/core/components/branch/AddBranchModal";

interface AddHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddBranch?: (branch: AddBranchDto) => void;
  selectedBranchId?: string;
  defaultCompanyId?: string;
}

const AddHeader = ({
                     searchTerm,
                     onSearchChange,
                     onAddBranch,
                     defaultCompanyId,
                   }: AddHeaderProps) => {
  const handleAddBranch = (branch: AddBranchDto) => {
    if (onAddBranch) {
      onAddBranch(branch);
    }
  };

  return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                  type="text"
                  placeholder="Search branches..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onAddBranch && defaultCompanyId && (
                <AddBranchModal
                    onAddBranch={handleAddBranch}
                    defaultCompanyId={defaultCompanyId}
                />
            )}
          </div>
        </div>
      </div>
  );
};

export default AddHeader;