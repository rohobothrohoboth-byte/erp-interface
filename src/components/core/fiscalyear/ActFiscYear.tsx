import { motion } from 'framer-motion';
import { CalendarIcon, CheckCircleIcon, Building2 } from 'lucide-react';
import type { FiscYearListDto } from '../../../types/core/fisc';

interface ActiveFiscProps {
  activeYear: FiscYearListDto | null;
  loading: boolean;
  error: string | null;
  onViewDetails: (year: FiscYearListDto) => void;
}

export default function ActiveFisc({ activeYear, loading }: ActiveFiscProps) {
  if (loading) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-1"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
    );
  }

  if (!activeYear) {
    return (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <CalendarIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">No Active Fiscal Year</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Please set a fiscal year as active to continue.
              </p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activeYear.name}</h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <CheckCircleIcon className="h-2.5 w-2.5" />
                Active
              </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Start date:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                {activeYear.dateStartStr} / {activeYear.dateStartStrAm}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">End date:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                {activeYear.dateEndStr} / {activeYear.dateEndStrAm}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}