import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import EvaluationTypeHeader from '@/modules/settings/components/hrSettings/Recruitment/evaluationType/EvaluationTypeHeader';
import EvaluationTypeSearchFilter from '@/modules/settings/components/hrSettings/Recruitment/evaluationType/EvaluationTypeSearchFilter';
import EvaluationTypeTable from '@/modules/settings/components/hrSettings/Recruitment/evaluationType/EvaluationTypeTable';
import AddEvaluationTypeModal from '@/modules/settings/components/hrSettings/Recruitment/evaluationType/AddEvaluationTypeModal';
import EditEvaluationTypeModal from '@/modules/settings/components/hrSettings/Recruitment/evaluationType/EditEvaluationTypeModal';
import DeleteEvaluationTypeModal from '@/modules/settings/components/hrSettings/Recruitment/evaluationType/DeleteEvaluationTypeModal';
import { 
  useEvaluationTypes, 
  useCreateEvaluationType, 
  useUpdateEvaluationType, 
  useDeleteEvaluationType,
  useToggleEvaluationTypeStatus
} from '@/modules/hr/services/recruitment/evaluationType/evaluationType.queries';
import type { 
  EvaluationTypeListDto, 
  EvaluationTypeAddDto 
} from '@/modules/hr/types/recruit/evaluationType';
import { evaluationTypeKeys } from '@/modules/hr/services/recruitment/evaluationType/evaluationType.key';
import { useQueryClient } from '@tanstack/react-query';

const EvaluationTypeSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluationTypeListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<EvaluationTypeListDto | null>(null);

  const queryClient = useQueryClient();     // ← Important

  const { data: items = [], isLoading, error } = useEvaluationTypes(
    { search: searchTerm || undefined }
  );

  const createMutation = useCreateEvaluationType({
    onSuccess: () => {
      showToast.success('Evaluation type added successfully');
      setIsAddOpen(false);
    },
    onError: (error: any) => showToast.error(error?.message || 'Failed to add'),
  });

  const updateMutation = useUpdateEvaluationType({
    onSuccess: () => {
      showToast.success('Evaluation type updated successfully');
      setEditingItem(null);
    },
    onError: (error: any) => showToast.error(error?.message || 'Failed to update'),
  });

  const deleteMutation = useDeleteEvaluationType({
    onSuccess: () => {
      showToast.success('Evaluation type deleted successfully');
      setDeletingItem(null);
    },
    onError: (error: any) => showToast.error(error?.message || 'Failed to delete'),
  });

  const toggleStatusMutation = useToggleEvaluationTypeStatus({
    onSuccess: (data) => showToast.success(`Evaluation type ${data.isActive ? 'activated' : 'deactivated'}`),
    onError: (error: any) => showToast.error(error?.message || 'Failed to change status'),
  });

  const handleAdd = (data: EvaluationTypeAddDto) => createMutation.mutate(data);

  const handleEdit = (data: EvaluationTypeAddDto) => {
    if (!editingItem) return;
    updateMutation.mutate({
      ...data,
      id: editingItem.id,
      rowVersion: editingItem.rowVersion,
    });
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id);
  };

  // This forces fresh rowVersion before opening edit modal
  const handleEditClick = (item: EvaluationTypeListDto) => {
    queryClient.invalidateQueries({ queryKey: evaluationTypeKeys.detail(item.id) });
    setEditingItem(item);
  };

  const handleToggleActive = (item: EvaluationTypeListDto) => {
    toggleStatusMutation.mutate({
      id: item.id,
      rowVersion: item.rowVersion,
      stat: !item.isActive,
    });
  };

  return (
    <motion.section className="bg-gray-50 space-y-6 min-h-screen">
      <EvaluationTypeHeader />
      <EvaluationTypeSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddOpen(true)}
      />
      <EvaluationTypeTable
        items={items}
        isLoading={isLoading}
        onEdit={handleEditClick}           // ← changed
        onDelete={setDeletingItem}
        onToggleActive={handleToggleActive}
      />

      <AddEvaluationTypeModal
        isOpen={isAddOpen}
        isLoading={createMutation.isPending}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
      <EditEvaluationTypeModal
        isOpen={!!editingItem}
        item={editingItem}
        isLoading={updateMutation.isPending}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
      />
      <DeleteEvaluationTypeModal
        isOpen={!!deletingItem}
        name={deletingItem?.name || ''}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </motion.section>
  );
};

export default EvaluationTypeSection;