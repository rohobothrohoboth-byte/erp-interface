import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import EvaluationTypeHeader from './EvaluationTypeHeader';
import EvaluationTypeSearchFilter from './EvaluationTypeSearchFilter';
import EvaluationTypeTable from './EvaluationTypeTable';
import AddEvaluationTypeModal from './AddEvaluationTypeModal';
import EditEvaluationTypeModal from './EditEvaluationTypeModal';
import DeleteEvaluationTypeModal from './DeleteEvaluationTypeModal';
import type { EvaluationTypeListDto, EvaluationTypeAddDto } from '../../../../../types/hr/evaluationType';

const mockData: EvaluationTypeListDto[] = [
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
];

const EvaluationTypeSection: React.FC = () => {
  const [items, setItems] = useState<EvaluationTypeListDto[]>(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluationTypeListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<EvaluationTypeListDto | null>(null);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: EvaluationTypeAddDto) => {
    const newItem: EvaluationTypeListDto = {
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
    showToast.success('Evaluation type added successfully');
    setIsAddOpen(false);
  };

  const handleEdit = (data: EvaluationTypeAddDto) => {
    if (!editingItem) return;
    setItems(prev => prev.map(i =>
      i.id === editingItem.id ? { ...i, ...data, modifiedAt: new Date().toISOString() } : i
    ));
    showToast.success('Evaluation type updated successfully');
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    showToast.success('Evaluation type deleted successfully');
    setDeletingItem(null);
  };

  const handleToggleActive = (item: EvaluationTypeListDto) => {
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, isActive: !i.isActive } : i
    ));
    showToast.success(`Evaluation type ${item.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <EvaluationTypeHeader />
      <EvaluationTypeSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddOpen(true)}
      />
      <EvaluationTypeTable
        items={filtered}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
        onToggleActive={handleToggleActive}
      />

      <AddEvaluationTypeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
      <EditEvaluationTypeModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
      />
      <DeleteEvaluationTypeModal
        isOpen={!!deletingItem}
        name={deletingItem?.name || ''}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </motion.section>
  );
};

export default EvaluationTypeSection;
