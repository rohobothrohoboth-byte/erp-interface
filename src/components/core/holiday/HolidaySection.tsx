import { useState, useEffect } from 'react';
import { Dialog } from '../../ui/dialog';
import { HolidayHeader } from './HolidayHeader';
import { AddHolidayModal } from './AddHolidayModal';
import { EditHolidayModal } from './EditHolidayModal';
import { DeleteHolidayModal } from './DeleteHolidayModal';
import { HolidayList } from './HolidayList';
import {
  useHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
} from '../../../services/core/holiday/holiday.queries';
import { useFiscalYears } from '../../../services/core/fiscalyear/fisc.queries';
import type { AddHolidayDto, HolidayListDto, EditHolidayDto, UUID } from '../../../types/core/holiday';
import type { FiscYearListDto } from '../../../types/core/fisc';
import { motion } from 'framer-motion';

const getDefaultHoliday = (fiscalYears: FiscYearListDto[]): AddHolidayDto => ({
  name: '',
  date: new Date().toISOString(),
  isPublic: true,
  fiscalYearId: fiscalYears.length > 0 ? fiscalYears[0].id : ('' as UUID),
});

export default function HolidaySection() {
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

  const isLoading = holidaysLoading || fiscalYearsLoading;
  const displayError = holidaysError?.message || fiscalYearsError?.message || formError;
  const clearErrors = () => { setFormError(null); if (holidaysError || fiscalYearsError) refetchHolidays(); };

  const currentFiscalYear =
    fiscalYears.find((fy) => fy.isActive === '0')?.name ||
    (fiscalYears.length > 0 ? fiscalYears[0].name : 'N/A');

  return (
    <div>
      <Dialog>
        <HolidayHeader setDialogOpen={setAddModalOpen} />

        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{displayError}</span>
              <button onClick={clearErrors} className="text-red-700 hover:text-red-900 font-bold text-lg ml-4">×</button>
            </div>
          </motion.div>
        )}

          <HolidayList
            holidays={holidays}
            loading={isLoading}
            onEdit={(h) => { setSelectedHoliday(h); setEditModalOpen(true); }}
            onDelete={(h) => { setSelectedHoliday(h); setDeleteModalOpen(true); }}
            currentFiscalYear={currentFiscalYear}
          />
        

        <AddHolidayModal
          open={addModalOpen}
          onOpenChange={(open) => { setAddModalOpen(open); if (!open) setNewHoliday(getDefaultHoliday(fiscalYears)); }}
          newHoliday={newHoliday}
          setNewHoliday={setNewHoliday}
          onAddHoliday={async () => { setFormError(null); await createMutation.mutateAsync(newHoliday); }}
          fiscalYears={fiscalYears}
        />
      </Dialog>

      <EditHolidayModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedHoliday(null); }}
        onSave={async (data: EditHolidayDto) => { setFormError(null); await updateMutation.mutateAsync(data); }}
        holiday={selectedHoliday}
        fiscalYears={fiscalYears}
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
