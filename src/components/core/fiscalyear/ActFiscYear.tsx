import { motion } from 'framer-motion';
import { CalendarIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!activeYear) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-50 to-red-100 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center">
          <XCircleIcon className="h-3 w-3 text-yellow-400 mr-2" />
          <div>
            <h3 className="text-yellow-800 font-medium text-xs">No Active Fiscal Year</h3>
            <p className="text-yellow-700 text-xs mt-0.5">
              Please set a fiscal year as active to continue.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg shadow-sm p-3 md:w-2/3 w-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-100 p-1.5 rounded-full">
            <CalendarIcon className="h-3 w-3 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="text-sm font-semibold text-gray-900">{activeYear.name}</h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <CheckCircleIcon className="h-2 w-2 mr-0.5" />
                Active
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="inline-block px-2 py-1 text-xs font-bold text-emerald-600 bg-emerald-100 rounded-full">
            Current
          </div>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-emerald-100">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500">Start date:</span>
            <div className="font-medium text-gray-900 text-lg">
              {activeYear.dateStartStr} / {activeYear.dateStartStrAm}
            </div>
          </div>
          <div>
            <span className="text-gray-500">End date:</span>
            <div className="font-medium text-gray-900 text-lg">
              {activeYear.dateEndStr} / {activeYear.dateEndStrAm}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}