import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../../../../layout/layout';
import OnboardingTaskHeader from './OnboardingTaskHeader';
import OnboardingTaskSearchFilter from './OnboardingTaskSearchFilter';
import OnboardingTaskTable from './OnboardingTaskTable';
import AddOnboardingTaskModal from './AddOnboardingTaskModal';
import EditOnboardingTaskModal from './EditOnboardingTaskModal';
import DeleteOnboardingTaskModal from './DeleteOnboardingTaskModal';
import type { OnboardingTaskListDto, OnboardingTaskAddDto } from '../../../../../types/hr/recruit/onboardingTask';

const mockData: OnboardingTaskListDto[] = [
  {
    id: crypto.randomUUID(),
    taskName: 'Complete IT Setup',
    description: 'Set up laptop, email, and required software tools.',
    sequenceOrder: 1,
    isDeleted: false,
    rowVersion: '',
    createdAt: new Date().toISOString(),
    createdAtAm: '',
    modifiedAt: new Date().toISOString(),
    modifiedAtAm: '',
  },
  {
    id: crypto.randomUUID(),
    taskName: 'HR Orientation',
    description: 'Attend HR orientation session covering company policies and benefits.',
    sequenceOrder: 2,
    isDeleted: false,
    rowVersion: '',
    createdAt: new Date().toISOString(),
    createdAtAm: '',
    modifiedAt: new Date().toISOString(),
    modifiedAtAm: '',
  },
];

const OnboardingTaskSection: React.FC = () => {
  const [items, setItems] = useState<OnboardingTaskListDto[]>(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OnboardingTaskListDto | null>(null);
  const [deletingItem, setDeletingItem] = useState<OnboardingTaskListDto | null>(null);

  const filtered = items.filter(i =>
    i.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: OnboardingTaskAddDto) => {
    const newItem: OnboardingTaskListDto = {
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
    showToast.success('Onboarding task added successfully');
    setIsAddOpen(false);
  };

  const handleEdit = (data: OnboardingTaskAddDto) => {
    if (!editingItem) return;
    setItems(prev => prev.map(i =>
      i.id === editingItem.id ? { ...i, ...data, modifiedAt: new Date().toISOString() } : i
    ));
    showToast.success('Onboarding task updated successfully');
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    showToast.success('Onboarding task deleted successfully');
    setDeletingItem(null);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 space-y-6 min-h-screen"
    >
      <OnboardingTaskHeader />
      <OnboardingTaskSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={() => setIsAddOpen(true)}
      />
      <OnboardingTaskTable
        items={filtered}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
      />

      <AddOnboardingTaskModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
      <EditOnboardingTaskModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
      />
      <DeleteOnboardingTaskModal
        isOpen={!!deletingItem}
        taskName={deletingItem?.taskName ?? ''}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </motion.section>
  );
};

export default OnboardingTaskSection;
