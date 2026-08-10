import { Building2 } from 'lucide-react';

interface BranchHeaderProps {
  companyName: string;
}

const BranchHeader = ({ companyName }: BranchHeaderProps) => {
  return (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {companyName} Branches
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage branch locations and details
          </p>
        </div>
      </div>
  );
};

export default BranchHeader;