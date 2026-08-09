import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HolidayHeader } from './HolidayHeader';
import { AddHolidayModal } from './AddHolidayModal';
import { EditHolidayModal } from './EditHolidayModal';
import { DeleteHolidayModal } from './DeleteHolidayModal';
import { HolidayList } from './HolidayList';
import { HolidaySearch } from './HolidaySearch';
import {
  useHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
} from '../../../services/core/holiday/holiday.queries';
import { useFiscalYears } from '../../../services/core/fiscalyear/fisc.queries';
import type { AddHolidayDto, HolidayListDto, EditHolidayDto, UUID } from '../../../types/core/holiday';
import type { FiscYearListDto } from '../../../types/core/fisc';
import { Calendar } from 'lucide-react';

const getDefaultHoliday = (fiscalYears: FiscYearListDto[]): AddHolidayDto => ({
  name: '',
  date: new Date().toISOString(),
  isPublic: true,
  fiscalYearId: fiscalYears.length > 0 ? fiscalYears[0].id : ('' as UUID),
});

export default function HolidaySection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState<AddHolidayDto>({
    name: '',
    date: new Date().toISOString(),
    isPublic: true,
    fiscalYearId: '' as UUID,
  });
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayListDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: holidays = [], isLoading: holidaysLoading, error: holidaysError, refetch: refetchHolidays } = useHolidays();
  const { data: fiscalYears = [], isLoading: fiscalYearsLoading, error: fiscalYearsError } = useFiscalYears();

  const createMutation = useCreateHoliday({
    onSuccess: () => { setFormError(null); setAddModalOpen(false); setNewHoliday(getDefaultHoliday(fiscalYears)); },
    onError: (error) => setFormError(error.message || 'Failed to create holiday'),
  });

  const updateMutation = useUpdateHoliday({
    onSuccess: () => { setFormError(null); setEditModalOpen(false); setSelectedHoliday(null); },
    onError: (error) => setFormError(error.message || 'Failed to update holiday'),
  });

  const deleteMutation = useDeleteHoliday({
    onSuccess: () => { setFormError(null); setDeleteModalOpen(false); setSelectedHoliday(null); },
    onError: (error) => setFormError(error.message || 'Failed to delete holiday'),
  });

  useEffect(() => {
    if (fiscalYears.length > 0 && !newHoliday.fiscalYearId) {
      setNewHoliday((prev) => ({ ...prev, fiscalYearId: fiscalYears[0].id }));
    }
  }, [fiscalYears, newHoliday.fiscalYearId]);

  useEffect(() => {
    if (addModalOpen && fiscalYears.length > 0) setNewHoliday(getDefaultHoliday(fiscalYears));
  }, [addModalOpen, fiscalYears]);

  // Filter holidays by search term
  const filteredHolidays = useMemo(() => {
    if (!searchTerm.trim()) return holidays;
    const lower = searchTerm.toLowerCase();
    return holidays.filter(holiday =>
        holiday.name.toLowerCase().includes(lower) ||
        holiday.dateStrAm?.toLowerCase().includes(lower) ||
        (holiday.isPublic ? 'public' : 'private').includes(lower)
    );
  }, [holidays, searchTerm]);

  const isLoading = holidaysLoading || fiscalYearsLoading;
  const displayError = holidaysError?.message || fiscalYearsError?.message || formError;

  const clearErrors = () => { setFormError(null); if (holidaysError || fiscalYearsError) refetchHolidays(); };
  const handleRefresh = () => refetchHolidays();

  const currentFiscalYear = fiscalYears.find((fy) => fy.isActive === '0')?.name || (fiscalYears.length > 0 ? fiscalYears[0].name : 'N/A');

  return (
      <div className="space-y-5">
        {/* Header */}
        <HolidayHeader setDialogOpen={setAddModalOpen} totalItems={filteredHolidays.length} />

        {/* Error Message */}
        {displayError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
            <span className="text-sm text-red-700 dark:text-red-400">
              {displayError.includes("load") ? (
                  <>
                    Failed to load holidays.{' '}
                    <button
                        onClick={handleRefresh}
                        className="underline hover:text-red-800 font-medium"
                    >
                      Try again
                    </button>
                  </>
              ) : (
                  displayError
              )}
            </span>
                <button onClick={clearErrors} className="text-red-700 dark:text-red-400 hover:text-red-900 font-bold text-lg ml-4">×</button>
              </div>
            </div>
        )}

        {/* Search */}
        <HolidaySearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400" />
            </div>
        )}

        {/* Holiday List */}
        {!isLoading && filteredHolidays.length > 0 && (
            <HolidayList
                holidays={filteredHolidays}
                loading={false}
                onEdit={(h) => { setSelectedHoliday(h); setEditModalOpen(true); }}
                onDelete={(h) => { setSelectedHoliday(h); setDeleteModalOpen(true); }}
                currentFiscalYear={currentFiscalYear}
            />
        )}

        {/* Empty State */}
        {!isLoading && filteredHolidays.length === 0 && !displayError && (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No holidays found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchTerm ? "Try adjusting your search" : "Click 'Add Holiday' to create one"}
              </p>
            </div>
        )}

        {/* Modals */}
        <AddHolidayModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            newHoliday={newHoliday}
            setNewHoliday={setNewHoliday}
            onAddHoliday={async () => { setFormError(null); await createMutation.mutateAsync(newHoliday); }}
            fiscalYears={fiscalYears}
        />

        <EditHolidayModal
            isOpen={editModalOpen}
            onClose={() => { setEditModalOpen(false); setSelectedHoliday(null); }}
            onSave={async (data: EditHolidayDto) => { setFormError(null); await updateMutation.mutateAsync(data); }}
            holiday={selectedHoliday}
        />

        <DeleteHolidayModal
            isOpen={deleteModalOpen}
            onClose={() => { setDeleteModalOpen(false); setSelectedHoliday(null); }}
            onConfirm={async () => { if (selectedHoliday) { setFormError(null); await deleteMutation.mutateAsync(selectedHoliday.id); } }}
            holiday={selectedHoliday}
        />
      </div>
  );
}