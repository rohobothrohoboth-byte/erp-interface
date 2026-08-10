import { Plus, History, Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HolidayHeaderProps {
  setDialogOpen: (open: boolean) => void;
  totalItems?: number;
}

export const HolidayHeader = ({
                                setDialogOpen,
                                totalItems,
                              }: HolidayHeaderProps) => {
  const navigate = useNavigate();

  const handleViewHistory = () => {
    navigate('/core/fiscal-year/holiday-history');
  };

  return (
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Public Holidays
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage holiday calendar and observances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
              onClick={handleViewHistory}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm"
          >
            <History size={14} className="mr-1.5" />
            History
          </Button>
          <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="h-8 px-3 text-sm"
          >
            <Plus size={14} className="mr-1.5" />
            Add Holiday
          </Button>
        </div>
      </div>
  );
};