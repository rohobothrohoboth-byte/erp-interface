import { motion } from 'framer-motion';
import { Calendar, MoreVertical, Eye, Trash2, PenBox } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { useState } from 'react';
import type { HolidayListDto } from '@/modules/core/types/holiday';

interface HolidayListProps {
  holidays: HolidayListDto[];
  loading?: boolean;
  onEdit: (holiday: HolidayListDto) => void;
  onDelete: (holiday: HolidayListDto) => void;
  currentFiscalYear?: string;
}

export const HolidayList = ({
                              holidays,
                              loading = false,
                              onEdit,
                              onDelete,
                              currentFiscalYear = '2024'
                            }: HolidayListProps) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isPublic: boolean): string => {
    return isPublic
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';
  };

  if (loading) {
    return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
                <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
          ))}
        </div>
    );
  }

  if (holidays.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
            <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No holidays found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click "Add Holiday" to create one
          </p>
        </div>
    );
  }

  return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Holiday Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Ethiopian Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Fiscal Year
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {holidays.map((holiday) => (
                <tr key={holiday.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {holiday.name}
                    </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(holiday.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                    {holiday.dateStrAm || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(holiday.isPublic)}`}>
                    {holiday.isPublic ? 'Public' : 'Private'}
                  </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                    {holiday.fiscalYearName || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Popover open={popoverOpen === holiday.id} onOpenChange={(open) => setPopoverOpen(open ? holiday.id : null)}>
                      <PopoverTrigger asChild>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1 rounded-lg shadow-lg" align="end">
                        <button
                            onClick={() => onEdit(holiday)}
                            className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
                        >
                          <PenBox size={14} />
                          Edit
                        </button>
                        <button
                            onClick={() => onDelete(holiday)}
                            className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};