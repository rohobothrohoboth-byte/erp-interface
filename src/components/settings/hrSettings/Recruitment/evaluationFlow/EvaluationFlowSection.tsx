import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import EvaluationFlowHeader from './EvaluationFlowHeader';
import EvaluationFlowSearchFilter from './EvaluationFlowSearchFilter';
import EvaluationFlowTable from './EvaluationFlowTable';
import AddEvaluationFlowModal from './AddEvaluationFlowModal';
import EditEvaluationFlowModal from './EditEvaluationFlowModal';
import DeleteEvaluationFlowModal from './DeleteEvaluationFlowModal';
import type { EvaluationFlowListDto, EvaluationFlowAddDto } from '../../../../../types/hr/evaluationFlow';

const mockData: EvaluationFlowListDto[] = [
  {
    id: crypto.randomUUID(),
    name: 'Standard Hiring Flow',
    isGlobal: true,
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
    name: 'Technical Track',
    isGlobal: false,
    isActive: true,
    isDeleted: false,
    rowVersion: '',
    createdAt: new Date().toISOString(),
    createdAtAm: '',
    modifiedAt: new Date().toISOString(),
    modifiedAtAm: '',
  },
];

const EvaluationFlowSection: React.FC = () => {
  const [items, setItems] = useState<EvaluationFlowListDto[]>(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluationFlowListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<EvaluationFlowListDto | null>(null);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: EvaluationFlowAddDto) => {
    const newItem: EvaluationFlowListDto = {
      ...data,
      id: crypto.randomUUID(),
      isDeleted: false,
      rowVersion: '',
      createdAt: new Date().toISOString(),
      createdAtAm: '',
      modifiedAt: new Date().toISOString(),
      modifiedAtAm: '',
    };
    setItems(prev => [...prev, newItem]);
    showToast.success('Evaluation flow added successfully');
    setIsAddOpen(false);
  };

  const handleEdit = (data: EvaluationFlowAddDto) => {
    if (!editingItem) return;
    setItems(prev => prev.map(i =>
      i.id === editingItem.id ? { ...i, ...data, modifiedAt: new Date().toISOString() } : i
    ));
    showToast.success('Evaluation flow updated successfully');
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    showToast.success('Evaluation flow deleted successfully');
    setDeletingItem(null);
  };

  const handleToggleActive = (item: EvaluationFlowListDto) => {
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, isActive: !i.isActive } : i
    ));
    showToast.success(`Evaluation flow ${item.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <EvaluationFlowHeader />
      <EvaluationFlowSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddOpen(true)}
      />
      <EvaluationFlowTable
        items={filtered}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
        onToggleActive={handleToggleActive}
      />

      <AddEvaluationFlowModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
      <EditEvaluationFlowModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
      />
      <DeleteEvaluationFlowModal
        isOpen={!!deletingItem}
        name={deletingItem?.name || ''}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </motion.section>
  );
};

export default EvaluationFlowSection;
