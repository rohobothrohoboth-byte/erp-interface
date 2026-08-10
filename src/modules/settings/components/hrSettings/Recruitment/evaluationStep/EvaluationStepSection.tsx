import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/shared/layout/layout';
import EvaluationStepHeader from '@/modules/settings/components/hrSettings/Recruitment/evaluationStep/EvaluationStepHeader';
import EvaluationStepSearchFilter from '@/modules/settings/components/hrSettings/Recruitment/evaluationStep/EvaluationStepSearchFilter';
import EvaluationStepTable from '@/modules/settings/components/hrSettings/Recruitment/evaluationStep/EvaluationStepTable';
import AddEvaluationStepModal from '@/modules/settings/components/hrSettings/Recruitment/evaluationStep/AddEvaluationStepModal';
import EditEvaluationStepModal from '@/modules/settings/components/hrSettings/Recruitment/evaluationStep/EditEvaluationStepModal';
import DeleteEvaluationStepModal from '@/modules/settings/components/hrSettings/Recruitment/evaluationStep/DeleteEvaluationStepModal';
import {
  useEvaluationSteps,
  useCreateEvaluationStep,
  useUpdateEvaluationStep,
  useDeleteEvaluationStep,
} from '@/modules/hr/services/recruitment/evaluationStep/evaluationStep.queries';
import { useEvaluationTypes } from '@/modules/hr/services/recruitment/evaluationType/evaluationType.queries';
import type { EvaluationStepListDto, EvaluationStepAddDto } from '@/modules/hr/types/recruit/evaluationStep';

interface EvaluationStepSectionProps {
  flowId: string;
  flowName: string;
}

const EvaluationStepSection: React.FC<EvaluationStepSectionProps> = ({ flowId, flowName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluationStepListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<EvaluationStepListDto | null>(null);

  const { data: items = [], isLoading, error } = useEvaluationSteps(flowId);
  const { data: evaluationTypes = [] } = useEvaluationTypes();

  const createMutation = useCreateEvaluationStep({
    onSuccess: () => { showToast.success('Step added successfully'); setIsAddOpen(false); },
    onError: (e) => showToast.error(e.message || 'Failed to add step'),
  });

  const updateMutation = useUpdateEvaluationStep({
    onSuccess: () => { showToast.success('Step updated successfully'); setEditingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to update step'),
  });

  const deleteMutation = useDeleteEvaluationStep(flowId, {
    onSuccess: () => { showToast.success('Step deleted successfully'); setDeletingItem(null); },
    onError: (e) => showToast.error(e.message || 'Failed to delete step'),
  });

  const filtered = items.filter(i =>
    i.stepName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: EvaluationStepAddDto) =>
    createMutation.mutate({ ...data, evaluationFlowId: flowId });

  const handleEdit = (data: EvaluationStepAddDto) => {
    if (!editingItem) return;
    updateMutation.mutate({
      ...data,
      evaluationFlowId: flowId,
      id: editingItem.id,
      rowVersion: editingItem.rowVersion,
    });
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id);
  };

  if (error) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading steps: {error.message}</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      <EvaluationStepHeader flowName={flowName} />
      <EvaluationStepSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddOpen(true)}
      />
      <EvaluationStepTable
        items={filtered}
        isLoading={isLoading}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
      />
      <AddEvaluationStepModal
        isOpen={isAddOpen}
        flowId={flowId}
        evaluationTypes={evaluationTypes}
        isLoading={createMutation.isPending}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
      <EditEvaluationStepModal
        isOpen={!!editingItem}
        item={editingItem}
        evaluationTypes={evaluationTypes}
        isLoading={updateMutation.isPending}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
      />
      <DeleteEvaluationStepModal
        isOpen={!!deletingItem}
        stepName={deletingItem?.stepName ?? ''}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </motion.section>
  );
};

export default EvaluationStepSection;
