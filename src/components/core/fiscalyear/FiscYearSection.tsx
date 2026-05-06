import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../../ui/dialog';
import { FiscalYearManagementHeader } from './FiscYearHeader';
import { AddFiscalYearModal } from './AddFiscYearModal';
import { ViewFiscModal } from './ViewFiscModal';
import { EditFiscModal } from './EditFiscModal';
import { DeleteFiscModal } from './DeleteFiscModal';
import {
  useFiscalYears,
  useCreateFiscalYear,
  useUpdateFiscalYear,
  useDeleteFiscalYear,
} from '../../../services/core/fiscalyear/fisc.queries';
import type { FiscYearListDto, AddFiscYearDto, EditFiscYearDto, UUID } from '../../../types/core/fisc';
import ActiveFisc from './ActFiscYear';
import { motion } from 'framer-motion';

const getDefaultFiscalYear = (): AddFiscYearDto => ({
  name: '',
  dateStart: new Date().toISOString(),
  dateEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
});

export default function FiscYearSection() {
  const navigate = useNavigate();
  const [newYear, setNewYear] = useState<AddFiscYearDto>(getDefaultFiscalYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<FiscYearListDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const itemsPerPage = 10;

  const { data: years = [], isLoading, error: queryError, refetch } = useFiscalYears();

  const createMutation = useCreateFiscalYear({
    onSuccess: () => {
      setFormError(null);
      setAddModalOpen(false);
      setCurrentPage(1);
      setNewYear(getDefaultFiscalYear());
    },
    onError: (error) => setFormError(error.message || 'Failed to create fiscal year'),
  });

  const updateMutation = useUpdateFiscalYear({
    onSuccess: () => { setFormError(null); setEditModalOpen(false); setSelectedYear(null); },
    onError: (error) => setFormError(error.message || 'Failed to update fiscal year'),
  });

  const deleteMutation = useDeleteFiscalYear({
    onSuccess: () => {
      setFormError(null);
      setDeleteModalOpen(false);
      setSelectedYear(null);
      if (paginatedYears.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    },
    onError: (error) => setFormError(error.message || 'Failed to delete fiscal year'),
  });

  const activeYear = useMemo(() => years.find((y) => y.isActive === '0') || null, [years]);

  const paginatedYears = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return years.slice(start, start + itemsPerPage);
  }, [years, currentPage]);

  const displayError = queryError?.message || formError;

  const clearErrors = () => {
    setFormError(null);
    if (queryError) refetch();
  };

  return (
    <div >
      <Dialog>
        <FiscalYearManagementHeader
          setDialogOpen={setAddModalOpen}
          onViewHistory={() => navigate('/core/fiscal-year/history')}
          totalItems={years.length}
        />

        <div className="w-full mx-auto px-2 py-4">
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

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
            </div>
          )}

          {!isLoading && !displayError && (
           <>
            <ActiveFisc
              activeYear={activeYear}
              loading={isLoading}
              error={displayError}
              onViewDetails={(year) => { setSelectedYear(year); setViewModalOpen(true); }}
            /></> 
          )}
        </div>

        <AddFiscalYearModal
          open={addModalOpen}
          onOpenChange={(open) => { setAddModalOpen(open); if (!open) setNewYear(getDefaultFiscalYear()); }}
          newYear={newYear}
          setNewYear={setNewYear}
          onAddFiscalYear={async () => { setFormError(null); await createMutation.mutateAsync(newYear); }}
        />
      </Dialog>

      <ViewFiscModal fiscalYear={selectedYear} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

      <EditFiscModal
        fiscalYear={selectedYear}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={async (data: EditFiscYearDto) => { setFormError(null); await updateMutation.mutateAsync(data); }}
      />

      <DeleteFiscModal
        fiscalYear={selectedYear}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => { if (selectedYear) { setFormError(null); await deleteMutation.mutateAsync(selectedYear.id as UUID); } }}
      />
    </div>
  );
}
