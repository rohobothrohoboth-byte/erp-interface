import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import EvaluationStepHeader from './EvaluationStepHeader';
import EvaluationStepSearchFilter from './EvaluationStepSearchFilter';
import EvaluationStepTable from './EvaluationStepTable';
import AddEvaluationStepModal from './AddEvaluationStepModal';
import EditEvaluationStepModal from './EditEvaluationStepModal';
import DeleteEvaluationStepModal from './DeleteEvaluationStepModal';
import type { EvaluationStepListDto, EvaluationStepAddDto } from '../../../../../types/hr/evaluationStep';
import type { EvaluationTypeListDto } from '../../../../../types/hr/evaluationType';

// Mock evaluation types — replace with API call when ready
const mockEvaluationTypes: EvaluationTypeListDto[] = [
  {
    id: crypto.randomUUID(),
    name: 'Technical Interview',
    maxScore: 100,
    isActive: true,
    isDeleted: false,
    rowVersion: '',
    createdAt: new Date().toISOString(),
    createdAtAm: '',
    modifiedAt: new Date().toISOString(),
    modifiedAtAm: '',
  },
  {
    id: crypto.randomUUID(),
    name: 'HR Interview',
    maxScore: 50,
    isActive: true,
    isDeleted: false,
    rowVersion: '',
    createdAt: new Date().toISOString(),
    createdAtAm: '',
    modifiedAt: new Date().toISOString(),
    modifiedAtAm: '',
  },
  {
    id: crypto.randomUUID(),
    name: 'Practical Assessment',
    maxScore: 80,
    isActive: true,
    isDeleted: false,
    rowVersion: '',
    createdAt: new Date().toISOString(),
    createdAtAm: '',
    modifiedAt: new Date().toISOString(),
    modifiedAtAm: '',
  },
];

interface EvaluationStepSectionProps {
  flowId: string;
  flowName: string;
}

const EvaluationStepSection: React.FC<EvaluationStepSectionProps> = ({ flowId, flowName }) => {
  const [items, setItems] = useState<EvaluationStepListDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluationStepListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<EvaluationStepListDto | null>(null);

  const filtered = items.filter(i =>
    i.stepName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resolveTypeName = (evalTypeId: string) =>
    mockEvaluationTypes.find(t => t.id === evalTypeId)?.name ?? '';

  const handleAdd = (data: EvaluationStepAddDto) => {
    const newItem: EvaluationStepListDto = {
      ...data,
      id: crypto.randomUUID(),
      evalTypeId: data.evalTypeId as ReturnType<typeof crypto.randomUUID>,
      evaluationFlowId: flowId as ReturnType<typeof crypto.randomUUID>,
      evalTypeName: resolveTypeName(data.evalTypeId),
      isDeleted: false,
      rowVersion: '',
      createdAt: new Date().toISOString(),
      createdAtAm: '',
      modifiedAt: new Date().toISOString(),
      modifiedAtAm: '',
    };
    setItems(prev => [...prev, newItem]);
    showToast.success('Step added successfully');
    setIsAddOpen(false);
  };

  const handleEdit = (data: EvaluationStepAddDto) => {
    if (!editingItem) return;
    setItems(prev => prev.map(i =>
      i.id === editingItem.id
        ? {
            ...i,
            ...data,
            evalTypeId: data.evalTypeId as ReturnType<typeof crypto.randomUUID>,
            evaluationFlowId: flowId as ReturnType<typeof crypto.randomUUID>,
            evalTypeName: resolveTypeName(data.evalTypeId),
            modifiedAt: new Date().toISOString(),
          }
        : i
    ));
    showToast.success('Step updated successfully');
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    showToast.success('Step deleted successfully');
    setDeletingItem(null);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <EvaluationStepHeader flowName={flowName} />
      <EvaluationStepSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddOpen(true)}
      />
      <EvaluationStepTable
        items={filtered}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
      />

      <AddEvaluationStepModal
        isOpen={isAddOpen}
        flowId={flowId}
        evaluationTypes={mockEvaluationTypes}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
      <EditEvaluationStepModal
        isOpen={!!editingItem}
        item={editingItem}
        evaluationTypes={mockEvaluationTypes}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
      />
      <DeleteEvaluationStepModal
        isOpen={!!deletingItem}
        stepName={deletingItem?.stepName ?? ''}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </motion.section>
  );
};

export default EvaluationStepSection;
