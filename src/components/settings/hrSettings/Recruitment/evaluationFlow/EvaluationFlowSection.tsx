import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import EvaluationFlowHeader from './EvaluationFlowHeader';
import EvaluationFlowSearchFilter from './EvaluationFlowSearchFilter';
import EvaluationFlowTable from './EvaluationFlowTable';
import AddEvaluationFlowModal from './AddEvaluationFlowModal';
import EditEvaluationFlowModal from './EditEvaluationFlowModal';
import DeleteEvaluationFlowModal from './DeleteEvaluationFlowModal';
import {
  useEvaluationFlows,
  useCreateEvaluationFlow,
  useUpdateEvaluationFlow,
  useDeleteEvaluationFlow,
  useToggleEvaluationFlowStatus,
} from '../../../../../services/hr/recruitment/evaluationFlow/evaluationFlow.queries';
import type { EvaluationFlowListDto, EvaluationFlowAddDto } from '../../../../../types/hr/recruit/evaluationFlow';

const EvaluationFlowSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluationFlowListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<EvaluationFlowListDto | null>(null);

  const { data: items = [], isLoading, error } = useEvaluationFlows();

  const createMutation = useCreateEvaluationFlow({
    onSuccess: () => { showToast.success('Evaluation flow added successfully'); setIsAddOpen(false); },
    onError: (e) => showToast.error(e.message || 'Failed to add evaluation flow'),
  });

  const updateMutation = useUpdateEvaluationFlow({
    onSuccess: () => { showToast.success('Evaluation flow updated successfully'); setEditingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to update evaluation flow'),
  });

  const deleteMutation = useDeleteEvaluationFlow({
    onSuccess: () => { showToast.success('Evaluation flow deleted successfully'); setDeletingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to delete evaluation flow'),
  });

  const toggleMutation = useToggleEvaluationFlowStatus({
    onError: (e) => showToast.error(e.message || 'Failed to update status'),
  });

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: EvaluationFlowAddDto) => createMutation.mutate(data);

  const handleEdit = (data: EvaluationFlowAddDto) => {
    if (!editingItem) return;
    updateMutation.mutate({ ...data, id: editingItem.id, rowVersion: editingItem.rowVersion });
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id);
  };

  const handleToggleActive = (item: EvaluationFlowListDto) => {
    toggleMutation.mutate({ id: item.id, rowVersion: item.rowVersion, stat: !item.isActive });
  };

  if (error) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading evaluation flows: {error.message}</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      <EvaluationFlowHeader />
      <EvaluationFlowSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddOpen(true)}
      />
      <EvaluationFlowTable
        items={filtered}
        isLoading={isLoading}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
        onToggleActive={handleToggleActive}
      />

      <AddEvaluationFlowModal
        isOpen={isAddOpen}
        isLoading={createMutation.isPending}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
      <EditEvaluationFlowModal
        isOpen={!!editingItem}
        item={editingItem}
        isLoading={updateMutation.isPending}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
      />
      <DeleteEvaluationFlowModal
        isOpen={!!deletingItem}
        name={deletingItem?.name || ''}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </motion.section>
  );
};

export default EvaluationFlowSection;
